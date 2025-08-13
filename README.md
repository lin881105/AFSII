# AFSII

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
# AFSII Deployment Guide

## 1. Set up DuckDNS

Using [Duck DNS](https://www.duckdns.org/domains) for a free domain.

1. Register a DuckDNS account and create a subdomain (e.g., `afsii.duckdns.org`).
2. Install and configure DDNS updates:

   ```bash
   sudo apt update
   sudo apt install curl -y
   mkdir -p ~/duckdns
   cat <<'EOF' > ~/duckdns/duck.sh
   echo url="https://www.duckdns.org/update?domains=afsii&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
   EOF
   chmod +x ~/duckdns/duck.sh
   (crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
   ```

   > Replace `YOUR_TOKEN` with your DuckDNS token.

---

## 2. Install Nginx

```bash
sudo apt install nginx -y
sudo ufw allow 'Nginx Full'
```

---

## 3. Install Let’s Encrypt (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d afsii.duckdns.org
sudo certbot renew --dry-run
```

---

## 4. Configure Nginx Reverse Proxy

Create the config file:

```bash
sudo nano /etc/nginx/sites-available/afsii
```

Paste:

```nginx
server {
    listen 80;
    server_name afsii.duckdns.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name afsii.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/afsii.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/afsii.duckdns.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /AFSII/ {
        proxy_pass http://127.0.0.1:5173/AFSII/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3300/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/afsii /etc/nginx/sites-enabled/afsii
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Configure Vite (allow external domain)

In `vite.config.ts`:

```ts
server: {
  host: true,
  allowedHosts: ['afsii.duckdns.org'],
  proxy: {
    '/api': { target: 'http://localhost:3300', changeOrigin: true }
  }
}
```

---

## 6. Start Backend & Frontend

```bash
npm run server
npm run dev
```

---

## 7. Access Your Site

```
https://afsii.duckdns.org/AFSII/
```

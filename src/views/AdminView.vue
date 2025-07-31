<script setup lang="ts">
import { onMounted } from 'vue'
import { useBiteSessionStore } from '@/stores/biteSession'

const store = useBiteSessionStore()

onMounted(() => {
  store.loadFromLocalStorage()

  window.addEventListener('storage', (event) => {
    if (event.key === 'biteSession') {
      store.loadFromLocalStorage()
    }
  })
})

function reset() {
  store.resetSession()
}

function refresh() {
  store.loadFromLocalStorage()
}
</script>



<template>
  <div class="admin-container">
    <h2>Admin View</h2>
    <div v-if="store.finished">
      <p>User submitted!</p>
      <p>Bite Value: {{ store.biteValue }}</p>
      <div class="visualize-container">
        <div class="image-container">
          <img :src="store.biteImage" alt="Selected" style="max-width: 300px" />
        </div>
      </div>
    </div>
    <div v-else>
      <p>Waiting for user to finish...</p>
    </div>

    <div class="buttons">
      <button class="reset-btn" @click="reset">Reset</button>
      <button class="refresh-btn" @click="refresh">Refresh</button>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  text-align: center;
  margin-top: 4rem;
}

.admin-container {
  text-align: center;
  margin-top: 4rem;
}

.buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.reset-btn,
.refresh-btn {
  padding: 0.8rem 1.6rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.reset-btn {
  background-color: #ff4d4f;
  color: white;
}

.refresh-btn {
  background-color: #1890ff;
  color: white;
}

.reset-btn:hover {
  background-color: #d9363e;
}

.refresh-btn:hover {
  background-color: #1475c3;
}

.visualize-container {
  background: #fcecd4;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}
</style>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const goToUser = () => {
  router.push('/user')
}
const goToAdmin = () => {
  router.push('/admin')
}
</script>

<template>
  <div class="role-select">
    <h2>Please select your role</h2>
    <button @click="goToUser">User</button>
    <button @click="goToAdmin">Administrator</button>
  </div>
</template>

<style scoped>
.role-select {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  margin: 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button:hover {
  background-color: #0056b3;
}
</style>

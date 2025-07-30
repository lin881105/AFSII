<script setup lang="ts">
import { useBiteSessionStore } from '@/stores/biteSession'
const store = useBiteSessionStore()
</script>

<template>
  <div>
    <h2>Admin View</h2>
    <div v-if="store.finished">
      <p>✅ User submitted!</p>
      <p>Bite Value: {{ store.biteValue }}</p>
      <img :src="store.biteImage" alt="Selected" style="max-width: 300px" />
    </div>
    <div v-else>
      <p>🕒 Waiting for user to finish...</p>
    </div>
  </div>
</template>

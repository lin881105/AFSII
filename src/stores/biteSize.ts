import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBiteSizeStore = defineStore('biteSize', () => {
  const biteSize = ref(0.5)
  return { biteSize }
})
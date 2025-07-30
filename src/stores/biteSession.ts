// stores/biteSession.ts
import { defineStore } from 'pinia'

export const useBiteSessionStore = defineStore('biteSession', {
  state: () => ({
    biteValue: 0.0,
    biteImage: '',
    finished: false,
  }),
  actions: {
    submitBite(val: number, img: string) {
      this.biteValue = val
      this.biteImage = img
      this.finished = true
    },
    resetSession() {
      this.biteValue = 0.0
      this.biteImage = ''
      this.finished = false
    }
  },
})

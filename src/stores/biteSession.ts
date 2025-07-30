import { defineStore } from 'pinia'
import { watch } from 'vue'

export const useBiteSessionStore = defineStore('biteSession', {
  state: () => ({
    biteValue: 0.0,
    biteImage: '',
    finished: false,
    count: 0,
  }),
  actions: {
    submitBite(val: number, img: string) {
      this.biteValue = val
      this.biteImage = img
      this.finished = true
      this.count += 1
      localStorage.setItem('biteSession', JSON.stringify(this.$state))
    },
    resetSession() {
      this.biteValue = 0.0
      this.biteImage = ''
      this.finished = false
      this.count = 0
      localStorage.removeItem('biteSession')
    },
    loadFromLocalStorage() {
      const saved = localStorage.getItem('biteSession')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.biteValue = parsed.biteValue
        this.biteImage = parsed.biteImage
        this.finished = parsed.finished
      }
    }
  }
})

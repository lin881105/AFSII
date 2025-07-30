<script setup lang="ts">
import { ref } from 'vue'
import { useBiteSizeStore } from '@/stores/biteSize'
import { useBiteSessionStore } from '@/stores/biteSession'

const store = useBiteSizeStore()
const sessionStore = useBiteSessionStore()

const step = ref(1)
const sliderValue = ref(store.biteSize || 0)
const currentImage = ref(new URL('@/assets/f5.png', import.meta.url).href)
const scoopCount = ref(0)
const pendingBiteValue = ref(0)
const pendingImage = ref('')

const riceLevels = [
  { v: 0.0, src: new URL('@/assets/f0.PNG', import.meta.url).href },
  { v: 0.1, src: new URL('@/assets/f1.PNG', import.meta.url).href },
  { v: 0.2, src: new URL('@/assets/f2.PNG', import.meta.url).href },
  { v: 0.3, src: new URL('@/assets/f3.PNG', import.meta.url).href },
  { v: 0.4, src: new URL('@/assets/f4.PNG', import.meta.url).href },
  { v: 0.5, src: new URL('@/assets/f5.PNG', import.meta.url).href },
  { v: 0.6, src: new URL('@/assets/f6.PNG', import.meta.url).href },
  { v: 0.7, src: new URL('@/assets/f7.PNG', import.meta.url).href },
  { v: 0.8, src: new URL('@/assets/f8.PNG', import.meta.url).href },
  { v: 0.9, src: new URL('@/assets/f9.PNG', import.meta.url).href },
  { v: 1.0, src: new URL('@/assets/f10.PNG', import.meta.url).href }
]

function nextBite() {
  sliderValue.value = store.biteSize
  updateImage(sliderValue.value)
  pendingBiteValue.value = sliderValue.value
  pendingImage.value = currentImage.value
  step.value = 5
}

function confirmBite() {
  scoopCount.value++
  sessionStore.submitBite(pendingBiteValue.value, pendingImage.value)
  step.value = 4
}

function updateImage(val: number) {
  let closest = riceLevels[0]
  let diff = Math.abs(val - closest.v)
  riceLevels.forEach(level => {
    const d = Math.abs(val - level.v)
    if (d < diff) {
      closest = level
      diff = d
    }
  })
  currentImage.value = closest.src
  store.biteSize = val
}

function handleAdjust() {
  sessionStore.resetSession()
  localStorage.setItem('biteSession', JSON.stringify(sessionStore.$state))
  step.value = 1
}
</script>


<template>
  <div class="layout">
    <div class="step-tracker-vertical">
      <div :class="['step', step >= 1 && 'active']">1. Adjust</div>
      <div :class="['step', step >= 2 && 'active']">2. Select Mode</div>
      <div :class="['step', step >= 3 && 'active']">3. Size</div>
      <div :class="['step', step === 4 && 'active']">4. Feeding</div>
    </div>

    <div class="main-content">
      <div v-if="step === 1" class="step-content">
        <h2>Please choose an action</h2>
        <button class="primary large" @click="step = 2">Adjust Bite-size</button>
        <button class="secondary large" @click="step = 3">Use Last Setting</button>
      </div>

      <div v-if="step === 2" class="step-content">
        <h2>Select Interface</h2>
        <button class="secondary large" @click="step = 3">Interactive Interface</button>
        <button class="secondary large">Language Interface</button>
      </div>

      <div v-if="step === 3" class="step-content">
        <h2 class="title">Bite-size Controller</h2>
        <div class="controller-container">
          <div class="image-container">
            <img :src="currentImage" alt="rice" class="rice-image" />
          </div>
          <div class="value-display">{{ sliderValue.toFixed(1) }}</div>
          <div class="slider-container">
            <input
              type="range"
              class="slider"
              min="0"
              max="1"
              step="0.1"
              v-model.number="sliderValue"
              @input="updateImage(sliderValue)"
            />
            <div class="range-labels">
              <span>0.0</span>
              <span>0.5</span>
              <span>1.0</span>
            </div>
          </div>
          <div class="instructions">
            Slide to adjust bite-size (0.0–1.0)
          </div>
        </div>
        <button class="primary large" @click="step = 4">Finish</button>
      </div>

      <div v-if="step === 4" class="scoop-container">
        <h2 class="scoop-result">Feeding...</h2>
        <button class="secondary large" @click="handleAdjust">Adjust</button>
        <button class="finish-btn" @click="nextBite">Next Bite</button>
        <div style="margin-top: 1rem; font-size: 1.1rem; color: #555">
          Bite Count: <strong>{{ scoopCount }}</strong>
        </div>
      </div>
    </div>
  </div>
  <div v-if="step === 5" class="step-content">
    <h2>Confirm this bite?</h2>
    <img :src="pendingImage" alt="preview" class="rice-image" style="max-width: 300px;" />
    <p style="font-size: 1.5rem;">Bite Size: {{ pendingBiteValue.toFixed(1) }}</p>
    <button class="primary large" @click="confirmBite">Confirm</button>
    <button class="secondary large" @click="step = 4">Cancel</button>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
}

.step-tracker-vertical {
  position: fixed;
  top: 0;
  left: 0;
  width: 180px;
  height: 100vh;
  background-color: #f9f9f9;
  border-right: 1px solid #ccc;
  padding: 2rem 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1000;
}

.step {
  padding: 12px;
  border-radius: 10px;
  background-color: #e2e2e2;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

.step.active {
  background-color: #007bff;
  color: white;
}

.main-content {
  margin-left: 200px;
  width: calc(100% - 200px);
}

.step-content,
.scoop-container {
  text-align: center;
  padding: 2rem 2rem 2rem;
}

.controller-container {
  background: #fcecd4;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.rice-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: opacity 0.3s ease;
}

.value-display {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #ffa940, #ff6b3d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.slider-container {
  margin: 30px 0 20px;
}

.slider {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(90deg, #ddd, #bbb);
  outline: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffa940;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 13px;
  color: #555;
}

.instructions {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

button.primary,
button.secondary {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  margin: 12px;
}

button.primary {
  background-color: #007bff;
  color: white;
}

button.secondary {
  background-color: #e2e6ea;
  color: #333;
}

.finish-btn {
  background-color: #e74c3c;
  color: white;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 5rem;
  margin-left: 10px;
}

button.primary:hover {
  background-color: #0056b3;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

button.secondary:hover {
  background-color: #d6d8db;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

button.finish-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
  transition: all 0.2s ease;
}
</style>

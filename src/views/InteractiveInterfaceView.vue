<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBiteSizeStore } from '@/stores/biteSize'
const store = useBiteSizeStore()
const router = useRouter()
const goHome = () => router.push('/')

// Reactive slider value
const sliderValue = ref(0)

// Reactive data for image & label
const currentImage = ref('')
const currentLabel = ref('')
const currentValueText = ref('0.0')


// Image map
const riceLevels = [
  { v: 0.00, src: new URL('@/assets/r0.png', import.meta.url).href },
  { v: 0.20, src: new URL('@/assets/r033.png', import.meta.url).href },
  { v: 0.40, src: new URL('@/assets/r066.png', import.meta.url).href },
  { v: 0.60, src: new URL('@/assets/r1.png', import.meta.url).href },
  { v: 0.80, src: new URL('@/assets/r133.png', import.meta.url).href },
  { v: 1.00, src: new URL('@/assets/r166.png', import.meta.url).href },
//   { v: 1.00, src: new URL('@/assets/r2.png', import.meta.url).href, label: '滿滿米飯' }
]
currentImage.value = riceLevels[0].src
currentValueText.value = riceLevels[0].v.toFixed(1)

// Update image/label when slider changes
watch(sliderValue, (val) => {
  store.biteSize = Number(val) 
  currentValueText.value = store.biteSize.toFixed(1)

  let closest = riceLevels[0]
  let diff = Math.abs(store.biteSize - closest.v)

  riceLevels.forEach(level => {
    const d = Math.abs(store.biteSize - level.v)
    if (d < diff) {
      closest = level
      diff = d
    }
  })

  currentImage.value = closest.src
})
</script>
<template>
  <div class="wrapper">
    <div class="top-bar">
      <h2 class="title">Bite-size Controller</h2>
    </div>

    <div class="container">
      <div class="image-container">
        <img :src="currentImage" :alt="currentLabel" class="rice-image" />
      </div>

      <div class="value-display">{{ currentValueText }}</div>

      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="0"
          max="1"
          step="0.2"
          v-model="sliderValue"
        />
        <div class="range-labels">
          <span>0.0</span>
          <span>0.5</span>
          <span>1.0</span>
        </div>
      </div>

      <div class="instructions">
        Slide to adjust bite-size（0.0–1.0）
      </div>
    </div>

    <!-- Finish button at bottom -->
    <div class="bottom-bar">
      <button class="finish-btn" @click="goHome">Finish</button>
    </div>
  </div>
</template>

<style>
    body {
        font-family: Arial, sans-serif;
        background: #ffffff;
        margin: 0;
        padding: 20px;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .rice-amount-text {
        font-size: 18px;
        color: #7f8c8d;
        margin-bottom: 20px;
    }
    .instructions {
        margin-top: 20px;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
    }
    .title {
    font-size: 26px;
    font-weight: bold;
    color: #2c3e50;
    }
    .container {
    background: #fff5e0;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
    max-width: 500px;
    width: 100%;
    }
    .image-container {
    width: 100%;
    max-width: 300px;
    margin: 0 auto 20px;
    }
    .rice-image {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: opacity 0.3s ease;
    }
    .value-display {
    font-size: 38px;
    font-weight: bold;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #007bff, #0056b3);
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
    background: #007bff;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
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
    .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fafafa;
    min-height: 100vh;
    padding: 40px 20px 20px;
    box-sizing: border-box;
    }
    .top-bar {
    width: 100%;
    max-width: 500px;
    text-align: center;
    margin-bottom: 20px;
    }
    .bottom-bar {
    margin-top: auto;
    padding: 20px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    }
    .finish-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    }
    .finish-btn:hover {
    background-color: #c0392b;
    }
</style>
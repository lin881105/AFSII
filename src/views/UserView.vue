<script setup lang="ts">
import { ref } from 'vue'
import { useBiteSizeStore } from '@/stores/biteSize'
import { useBiteSessionStore } from '@/stores/biteSession'
import axios from 'axios'

const store = useBiteSizeStore()
const sessionStore = useBiteSessionStore()

// flow state
const step = ref(1)
const interfaceMode = ref<'interactive' | 'language' | null>(null)

// bite state
const sliderValue = ref(store.biteSize || 0)
const currentImage = ref(new URL('@/assets/f5.png', import.meta.url).href)
const scoopCount = ref(0)
const pendingBiteValue = ref(0)
const pendingImage = ref('')

// language interface
const instruction = ref('')
const loading = ref(false)
const error = ref('')

// image map (檔名用小寫 .png，請跟 assets 一致)
const riceLevels = [
  { v: 0.0, src: new URL('@/assets/f0.png', import.meta.url).href },
  { v: 0.1, src: new URL('@/assets/f1.png', import.meta.url).href },
  { v: 0.2, src: new URL('@/assets/f2.png', import.meta.url).href },
  { v: 0.3, src: new URL('@/assets/f3.png', import.meta.url).href },
  { v: 0.4, src: new URL('@/assets/f4.png', import.meta.url).href },
  { v: 0.5, src: new URL('@/assets/f5.png', import.meta.url).href },
  { v: 0.6, src: new URL('@/assets/f6.png', import.meta.url).href },
  { v: 0.7, src: new URL('@/assets/f7.png', import.meta.url).href },
  { v: 0.8, src: new URL('@/assets/f8.png', import.meta.url).href },
  { v: 0.9, src: new URL('@/assets/f9.png', import.meta.url).href },
  { v: 1.0, src: new URL('@/assets/f10.png', import.meta.url).href }
]

//recorder
const mediaRecorder = ref<MediaRecorder | null>(null);
const chunks: BlobPart[] = [];
const recStatus = ref<'idle'|'recording'|'uploading'>('idle');

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    chunks.length = 0;

    mediaRecorder.value.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.value.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      await sendToSTT(blob);
    };

    mediaRecorder.value.start();
    recStatus.value = 'recording';
  } catch (e:any) {
    error.value = e.message || 'Microphone permission denied.';
  }
}

function stopRecording() {
  if (mediaRecorder.value && recStatus.value === 'recording') {
    recStatus.value = 'uploading';
    mediaRecorder.value.stop();
  }
}

async function sendToSTT(blob: Blob) {
  try {
    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    const resp = await axios.post('/api/stt', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const text = resp.data?.text || '';
    if (!text) {
      error.value = 'No text recognized.';
      recStatus.value = 'idle';
      return;
    }
    instruction.value = text;
    await handleLanguageAdjust(); // 用你既有的流程
  } catch (e:any) {
    error.value = e.response?.data?.error ?? e.message;
  } finally {
    recStatus.value = 'idle';
  }
}

// 更新圖片與 store
function updateImage(val: number) {
  let closest = riceLevels[0]
  let diff = Math.abs(val - closest.v)
  for (const level of riceLevels) {
    const d = Math.abs(val - level.v)
    if (d < diff) {
      closest = level
      diff = d
    }
  }
  currentImage.value = closest.src
  store.biteSize = val
}

// Start feeding: 先把當前值暫存，進入確認頁 (Step 5)
function nextBite() {
  // 清空 admin 畫面（先重置，再寫回 localStorage 讓另一視窗同步）
  sessionStore.resetSession()
  localStorage.setItem('biteSession', JSON.stringify(sessionStore.$state))

  sliderValue.value = store.biteSize
  updateImage(sliderValue.value)
  pendingBiteValue.value = sliderValue.value
  pendingImage.value = currentImage.value
  step.value = 5
}

// Confirm 後才送到 Admin（這時 admin 才會顯示）
function confirmBite() {
  scoopCount.value++
  sessionStore.submitBite(pendingBiteValue.value, pendingImage.value)
  step.value = 4
}

// 按 Adjust 回到 step2 並清空 admin 畫面
function handleAdjust() {
  sessionStore.resetSession()
  localStorage.setItem('biteSession', JSON.stringify(sessionStore.$state))
  step.value = 2
}

// 從 Step1 直接去餵食頁（不調整）
function goToFeeding() {
  nextBite()
  step.value = 5
}

// 語言介面：把指令丟到 /api/gpt，得到 0.0~1.0 一位小數 → 套用並跳餵食
async function handleLanguageAdjust() {
  if (!instruction.value.trim()) {
    error.value = 'Please enter an instruction.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const resp = await axios.post('/api/gpt', {
      prompt: `Instruction: "${instruction.value}". Return a single number between 0.0–1.0 (one decimal).`,
      biteSize: store.biteSize
    })
    const num = resp.data?.biteSize
    if (typeof num !== 'number' || Number.isNaN(num) || num < 0 || num > 1) {
      throw new Error(`GPT returned invalid number: "${num}"`)
    }
    sliderValue.value = parseFloat(num.toFixed(1))
    updateImage(sliderValue.value)
    store.biteSize = sliderValue.value
    instruction.value = ''
    goToFeeding()
  } catch (err: any) {
    error.value = err.response?.data?.error ?? err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="layout">
    <!-- 左側流程導覽 -->
    <div class="step-tracker-vertical">
      <div :class="['step', step >= 1 && 'active']">1. Adjust</div>
      <div :class="['step', step >= 2 && 'active']">2. Select Mode</div>
      <div :class="['step', step >= 3 && 'active']">3. Size</div>
      <div :class="['step', (step === 4 || step === 5) && 'active']">4. Feeding</div>
    </div>

    <div class="main-content">
      <!-- Step 1 -->
      <div v-if="step === 1" class="step-content">
        <h2>Please choose an action</h2>
        <button class="primary large" @click="step = 2">Adjust Bite-size</button>
        <button class="secondary large" @click="goToFeeding">Go to feeding</button>
      </div>

      <!-- Step 2 -->
      <div v-if="step === 2" class="step-content">
        <h2>Select Interface</h2>
        <button class="secondary large" @click="step = 3; interfaceMode='interactive'">Interactive Interface</button>
        <button class="secondary large" @click="step = 3; interfaceMode='language'">Language Interface</button>
      </div>

      <!-- Step 3：互動式 -->
      <div v-if="step === 3 && interfaceMode === 'interactive'" class="step-content">
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
        <button class="primary large" @click="goToFeeding">Finish</button>
      </div>

      <!-- Step 3：語言介面 -->
      <div v-if="step === 3 && interfaceMode === 'language'" class="language-interface">
        <h2>Language Interface</h2>
        <p>Enter instruction (e.g. “I want a smaller bite”)</p>

        <!-- 錄音按鈕區 -->
        <div style="margin-bottom: 0.75rem;">
          <button
            class="secondary large"
            @click="startRecording"
            :disabled="recStatus==='recording' || recStatus==='uploading'"
          >
            Start Recording
          </button>
          <button
            class="secondary large"
            @click="stopRecording"
            :disabled="recStatus!=='recording'"
            style="margin-left: .5rem;"
          >
            Stop
          </button>
          <span style="margin-left: .75rem; font-size: .95rem; color: #666;">
            Status: {{ recStatus }}
          </span>
        </div>

        <textarea
          v-model="instruction"
          rows="6"
          class="instruction-textarea"
          placeholder="Type your instruction here..."
        ></textarea>

        <button
          class="primary large submit-btn"
          @click="handleLanguageAdjust"
          :disabled="loading || !instruction.trim()"
        >
          {{ loading ? 'Adjusting…' : 'Submit' }}
        </button>

        <div v-if="error" class="error">{{ error }}</div>
      </div>

      <!-- Step 4：餵食中 -->
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

  <!-- Step 5：確認這一口 -->
  <div v-if="step === 5" class="step-content">
    <h2>Confirm this bite?</h2>
    <div class="visualize-container">
      <div class="image-container">
        <img :src="pendingImage" alt="preview" class="rice-image" style="max-width: 300px;" />
      </div>
    </div>
    <p style="font-size: 1.5rem;">Bite Size: {{ pendingBiteValue.toFixed(1) }}</p>
    <button class="primary large" @click="confirmBite">Confirm</button>
    <button class="secondary large" @click="step = 1">Cancel</button>
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
.visualize-container {
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
.slider::-webkit-slider-thumb:hover { transform: scale(1.2); }

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

.instructions { margin-top: 15px; font-size: 14px; color: #666; }

button.primary,
button.secondary {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  margin: 12px;
}
button.primary { background-color: #007bff; color: white; }
button.secondary { background-color: #e2e6ea; color: #333; }

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

.language-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: auto;
}
.instruction-textarea {
  width: 100%;
  min-height: 180px;
  font-size: 1.2rem;
  line-height: 1.4;
  padding: 1rem;
  margin-top: 1rem;
  resize: vertical;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.submit-btn { margin-top: 1rem; }
button.primary.large { font-size: 1.3rem; padding: 0.8rem 2rem; }
.error { color: #dc3545; margin-top: 0.5rem; font-size: 1rem; }
</style>

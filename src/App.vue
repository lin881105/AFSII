<template>
<<<<<<< HEAD
  <header v-if="!isFullPageView" class="app-header">
    <h2>Assitive Feeding System</h2>
    <h2 class="bite-size-display">
      Current Bite-size: <span class="value">{{ store.biteSize.toFixed(1) }} </span> (debug only)
    </h2>
    <div class="button-group">
      <button v-if="!isAdjust" class="primary" @click="AdjustEvent">Adjust Bite-size</button>
      <button v-if="!isAdjust" class="primary" @click="ScoopEvent">Scoop</button>
      <button v-if="isAdjust" class="secondary" @click="goToInteractiveInterface">Interactive Interface</button>
      <button v-if="isAdjust" class="secondary">Language Interface</button>
    </div>
  </header>

  <!-- 🌟 NEW IMAGE CONTAINER -->
  <div v-if="!isFullPageView && isScoop" class="scoop-container">
    <h2 class="scoop-result">Scooping Result</h2>
    <div class="image-container">
      <img src="@/assets/scoop_result.png" alt="scoop-result" class="preview-image" />
    </div>
  </div>

  <div class="bottom-bar">
    <button v-if="!isFullPageView && isScoop" class="finish-btn" @click="NextBite">NextBite</button>
  </div>
  <RouterView />
</template>

<style scoped>
  .app-header {
    background-color: #f8f9fa;
    padding: 2rem 1.5rem;
    border-bottom: 1px solid #ddd;
    text-align: center;
    font-family: 'Segoe UI', sans-serif;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  .bite-size-display {
    font-size: 1rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .bite-size-display .value {
    font-weight: bold;
    color: #007bff;
  }

  .button-group {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  button {
    font-size: 1rem;
    padding: 0.7rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  button.primary {
    background-color: #007bff;
    color: white;
  }

  button.primary:hover {
    background-color: #0056b3;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
  }

  button.secondary {
    background-color: #e2e6ea;
    color: #333;
  }

  button.secondary:hover {
    background-color: #d6d8db;
    box-shadow: 0 0 6px rgba(150, 150, 150, 0.2);
  }
  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2rem auto;
    max-width: 100%;
    height: 280px;
  }

  .preview-image {
    max-height: 100%;
    max-width: 90%;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    object-fit: contain;
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
  .scoop-result{
    font-size: 1.6rem;
    color: #333;
    margin-bottom: 1.2rem;
  }
  .scoop-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 2rem auto;
  }
</style>
=======
  <router-view />
</template>
>>>>>>> origin/1verUI

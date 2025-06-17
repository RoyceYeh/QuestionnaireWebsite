<script setup>
import { ref, onMounted } from 'vue'
import { useQuestionnaireStore } from '@/stores'

const showBanner = ref(false)
const showTitle = ref(false)
const showDesc = ref(false)
const showButton = ref(false)
const store = useQuestionnaireStore()

// 處理重新開始
function handleReset() {
  store.resetQuestionnaire()
}

onMounted(() => {
  // 按順序顯示元素
  setTimeout(() => {
    showBanner.value = true
  }, 300)
  setTimeout(() => {
    showTitle.value = true
  }, 800)
  setTimeout(() => {
    showDesc.value = true
  }, 1200)
  setTimeout(() => {
    showButton.value = true
  }, 1600)
})
</script>

<template>
  <main>
    <div
      class="relative size-full min-h-screen bg-[#161118] dark overflow-x-hidden"
      style="font-family: 'Space Grotesk', 'Noto Sans', sans-serif"
    >
      <div class="@container">
        <Transition name="fade-slide-down">
          <div v-if="showBanner" class="@[480px]:px-4 @[480px]:py-3">
            <div
              class="banner w-full bg-bottom bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-[#161118] pb-[60%] rounded @[768px]:rounded-xl @[768px]:pb-[30%]"
            ></div>
          </div>
        </Transition>
      </div>
      <div class="w-full flex justify-center">
        <div class="max-w-[768px]">
          <Transition name="fade-slide-right">
            <div v-if="showTitle" class="flex justify-center px-4 pb-3 pt-5">
              <h1 class="text-white text-[22px] font-bold leading-tight typewriter">
                CyberPunk 人格測驗
              </h1>
            </div>
          </Transition>

          <Transition name="fade-slide-left">
            <p
              v-if="showDesc"
              class="text-white text-base font-normal text-center leading-normal pb-3 pt-1 px-4"
            >
              立即測驗，看看你在CyberPunk中扮演什麼角色。
            </p>
          </Transition>

          <Transition name="fade-scale">
            <div v-if="showButton" class="flex px-4 py-3">
              <Router-link
                @click="handleReset"
                to="/name"
                class="pulse-button flex min-w-[84px] max-w-[768px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#b319e6] text-white text-base font-bold leading-normal tracking-[0.015em]"
              >
                <span class="truncate">Start</span>
              </Router-link>
            </div>
          </Transition>
        </div>
      </div>
      <div class="h-5 bg-[#161118]"></div>
    </div>
  </main>
</template>

<style scoped>
.banner {
  background-image: url('@/assets/images/banner_m.png');
}

@container (min-width: 768px) {
  .banner {
    background-image: url('@/assets/images/banner_pc.png');
  }
}
/* 打字機效果 */
.typewriter {
  display: inline-block; /* 關鍵修改：改為行內塊元素 */
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #b319e6;
  animation:
    typing 3s steps(40) 0.5s forwards,
    cursor-blink 0.7s infinite;
  width: 0;
  text-align: center; /* 關鍵修改：文字靠左對齊 */
  margin: 0 auto; /* 關鍵修改：移除可能的水平邊距 */
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes cursor-blink {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: #b319e6;
  }
}
/* 初始狀態 */
.fade-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

/* 進入動畫 */
.fade-slide-down-enter-active,
.fade-slide-right-enter-active,
.fade-slide-left-enter-active,
.fade-scale-enter-active {
  transition: all 0.8s ease;
}

/* 按鈕呼吸效果 */
.pulse-button {
  animation: pulse 2s infinite;
  animation-delay: 2.5s;
  box-shadow: 0 0 0 0 rgba(179, 25, 230, 0.7);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(179, 25, 230, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(179, 25, 230, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(179, 25, 230, 0);
  }
}
</style>

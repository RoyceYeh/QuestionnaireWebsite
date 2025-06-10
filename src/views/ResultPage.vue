<script setup>
import { useQuestionnaireStore } from '@/stores'
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const store = useQuestionnaireStore()
const router = useRouter()

const result = computed(() => store.resultType)
const userName = computed(() => store.userName) // 從 store 獲取用戶名稱

// 判斷是否有結果
const hasResult = computed(() => result.value && result.value.id)

// 特質分析動畫相關
const traitsSection = ref(null)
const isTraitsVisible = ref(false)
const animatedTraits = ref({})

// 處理重新開始
function handleTryAgain() {
  store.resetQuestionnaire()
  router.push('/')
}

// 構建圖片路徑
const resultImagePath = computed(() => {
  if (!result.value || !result.value.img) return ''
  return `/src/assets/images/${result.value.img}`
})

// 設置 Intersection Observer
function setupIntersectionObserver() {
  if (!traitsSection.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isTraitsVisible.value) {
          isTraitsVisible.value = true
          startTraitsAnimation()
        }
      })
    },
    {
      threshold: 0.3, // 當 30% 的元素進入視窗時觸發
      rootMargin: '0px 0px -50px 0px', // 稍微提前觸發
    },
  )

  observer.observe(traitsSection.value)
}

// 開始特質動畫
function startTraitsAnimation() {
  if (!result.value || !result.value.traits) return

  // 重置所有特質到 0
  Object.keys(result.value.traits).forEach((trait) => {
    animatedTraits.value[trait] = 0
  })

  // 延遲開始動畫，讓每個特質錯開執行

  Object.entries(result.value.traits).forEach(([trait, targetValue], index) => {
    setTimeout(() => {
      animateTraitBar(trait, targetValue)
    }, index * 200) // 每個特質相隔 200ms 開始動畫
  })
}

// 單個特質條動畫
function animateTraitBar(trait, targetValue) {
  const duration = 1500 // 動畫持續時間 1.5 秒
  const startTime = performance.now()
  const startValue = 0

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用 easeOutCubic 緩動函數
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)

    const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutCubic)
    animatedTraits.value[trait] = currentValue

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

// 確保有結果數據
onMounted(async () => {
  // 初始化 store（重新計算結果）
  store.initializeFromStorage()

  if (!hasResult.value) {
    router.push('/')
    return
  }

  // 等待 DOM 更新
  await nextTick()

  // 設置 intersection observer
  setupIntersectionObserver()
})
</script>

<template>
  <div
    v-if="hasResult"
    class="relative flex size-full flex-col min-h-screen items-center bg-[#161118] dark overflow-x-hidden"
    style="font-family: 'Space Grotesk', 'Noto Sans', sans-serif"
  >
    <div class="max-w-[480px] w-full">
      <!-- 頂部標題區 -->
      <div class="flex items-center bg-[#161118] p-4 pb-2 justify-center">
        <h2 class="text-white text-4xl font-bold leading-tight text-center">結果</h2>
      </div>

      <!-- 結果標題和描述 -->
      <h1 class="text-white text-[22px] font-bold leading-tight px-4 text-center pb-3 pt-2">
        原來{{ userName ? ` ${userName}` : '' }} 你是
        <span :style="{ color: result.color }">{{ result.name }}</span> !
      </h1>
      <p class="text-white text-base font-normal leading-normal pb-5 pt-1 px-4 text-center">
        {{ result.description }}
      </p>

      <!-- 結果圖片 -->
      <div class="flex w-full bg-[#161118] pb-5 items-center justify-center">
        <div class="w-[100%] overflow-hidden bg-[#161118]">
          <img :src="resultImagePath" alt="" />
        </div>
      </div>

      <!-- 特質和分析區 -->
      <div class="px-4 pb-5">
        <!-- 優勢 -->
        <div class="mb-5 bg-[#1E191E] rounded-xl p-4">
          <h3 class="text-lg font-bold text-white mb-3" :style="{ color: result.color }">
            你的優勢
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(strength, index) in result.strengths"
              :key="index"
              class="inline-block px-3 py-1 rounded-full text-sm"
              :style="{
                backgroundColor: `${result.color}30`,
                color: result.color,
                borderColor: result.color,
              }"
            >
              {{ strength }}
            </span>
          </div>
        </div>

        <!-- 挑戰 -->
        <div class="mb-5 bg-[#1E191E] rounded-xl p-4">
          <h3 class="text-lg font-bold text-white mb-3" :style="{ color: result.color }">
            可能的挑戰
          </h3>
          <ul class="space-y-2 text-white">
            <li
              v-for="(challenge, index) in result.challenges"
              :key="index"
              class="flex items-start"
            >
              <span
                class="inline-block w-2 h-2 rounded-full mt-1.5 mr-2"
                :style="{ backgroundColor: result.color }"
              ></span>
              <span>{{ challenge }}</span>
            </li>
          </ul>
        </div>

        <!-- 建議 -->
        <div class="mb-5 bg-[#1E191E] rounded-xl p-4">
          <h3 class="text-lg font-bold text-white mb-3" :style="{ color: result.color }">
            給你的建議
          </h3>
          <p class="text-white">{{ result.advice }}</p>
        </div>

        <!-- 特質分析 - 添加 ref 以便觀察 -->
        <div ref="traitsSection" class="mb-5 bg-[#1E191E] rounded-xl p-4">
          <h3 class="text-lg font-bold text-white mb-3" :style="{ color: result.color }">
            特質分析
          </h3>
          <div class="space-y-4">
            <div v-for="(value, trait) in result.traits" :key="trait" class="mb-2">
              <div class="flex justify-between mb-1">
                <span class="text-white">{{ trait }}</span>
                <span
                  class="text-white transition-all duration-300"
                  :class="{ 'animate-pulse': animatedTraits[trait] !== value }"
                >
                  {{ animatedTraits[trait] || 0 }}%
                </span>
              </div>
              <div class="w-full bg-[#342938] rounded-full h-2.5 overflow-hidden">
                <div
                  class="h-2.5 rounded-full transition-all duration-300 ease-out"
                  :style="{
                    width: `${animatedTraits[trait] || 0}%`,
                    backgroundColor: result.color,
                    boxShadow: isTraitsVisible ? `0 0 8px ${result.color}50` : 'none',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按鈕區域 -->
      <div class="flex justify-center">
        <div class="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch px-4 py-3">
          <button
            @click="handleTryAgain"
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#b319e6] text-white text-sm font-bold leading-normal tracking-[0.015em] w-full hover:bg-[#a018d0] transition-colors duration-200"
          >
            <span class="truncate">Try Again</span>
          </button>
        </div>
      </div>
    </div>
    <div class="h-5 bg-[#161118]"></div>
  </div>
</template>

<style scoped>
/* 為進度條添加自定義動畫 */
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow:
      0 0 15px currentColor,
      0 0 25px currentColor;
  }
}

.trait-bar-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}
</style>

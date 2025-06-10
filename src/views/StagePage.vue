<script setup>
import { useQuestionnaireStore } from '@/stores'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const store = useQuestionnaireStore()

const router = useRouter()
const route = useRoute()

// 獲取路由參數

// 根據路由參數獲取當前階段
const currentStage = computed(() => {
  // 獲取路由參數中的 stageId
  const stageId = route.params.id

  // 如果沒有提供 stageId，則返回第一個階段
  if (!stageId) {
    return store.data.stages[0]
  }

  // 根據 stageId 查找對應的階段
  const foundStage = store.data.stages.find((stage) => stage.id === stageId)

  // 如果找不到對應的階段，則返回第一個階段
  return foundStage || store.data.stages[0]
})

// 獲取當前階段索引
const currentStageIndex = computed(() => {
  if (!currentStage.value) return 0
  return store.data.stages.findIndex((stage) => stage.id === currentStage.value.id)
})

const progressPercentage = computed(() => {
  return ((currentStageIndex.value + 1) / store.data.stages.length) * 100
})

// 判斷是否為最後一個階段
const isLastStage = computed(() => {
  return currentStageIndex.value === store.data.stages.length - 1
})

// 當前選中的選項 ID
const selectedOptionId = ref(null)

function handleOptionClick(optionId) {
  selectedOptionId.value = optionId
}

// 判斷是否可以繼續
const canContinue = computed(() => {
  return selectedOptionId.value !== null
})

// 控制頁面元素動畫
const showContent = ref(false)
const optionsReady = ref(false)
const buttonReady = ref(false)

// 前往下一個階段
function goToNextStage() {
  // 如果沒有選擇選項，則不允許繼續a
  if (!canContinue.value) return

  // 儲存當前選擇的淡出效果
  showContent.value = false

  // 等待淡出完成後再導航
  setTimeout(() => {
    // 保存當前答案
    if (currentStage.value) {
      store.saveAnswer(currentStage.value.question.id, selectedOptionId.value)
    }

    // 判斷是否為最後一個階段
    if (isLastStage.value) {
      // 計算結果
      store.calculateResult()
      // 如果是最後一個階段，可以導航到結果頁面
      router.push('/result')
      return
    }

    // 獲取當前階段索引
    const currentIndex = currentStageIndex.value
    // 獲取下一個階段的 ID
    const nextStageId = store.data.stages[currentIndex + 1].id

    // 導航到下一個階段
    router.push({
      name: 'stage',
      params: { id: nextStageId },
    })
  }, 300) // 與淡出動畫時長匹配
}

// 加載已保存的答案
function loadSavedAnswer() {
  if (currentStage.value) {
    const savedAnswer = store.userAnswers[currentStage.value.question.id]
    if (savedAnswer) {
      selectedOptionId.value = savedAnswer
    } else {
      selectedOptionId.value = null
    }
  }
}

// 監聽路由變化，加載已保存的答案
watch(
  () => route.params.id,
  () => {
    // 加載已保存的答案
    loadSavedAnswer()

    // 設置依次顯示的定時器
    setTimeout(() => {
      showContent.value = true
      setTimeout(() => {
        optionsReady.value = true
        setTimeout(() => {
          buttonReady.value = true
        }, 200)
      }, 200)
    }, 100)
  },
  { immediate: true },
)

// 組件掛載時加載已保存的答案
onMounted(() => {
  loadSavedAnswer()

  // 初始加載時的順序動畫
  setTimeout(() => {
    showContent.value = true
    setTimeout(() => {
      optionsReady.value = true
      setTimeout(() => {
        buttonReady.value = true
      }, 200)
    }, 200)
  }, 100)
})

// 確定下一階段的動畫方向
const moveDirection = ref('right') // 'right' 或 'left'

// 手動處理上一階段導航
function goToPreviousStage() {
  if (currentStageIndex.value <= 0) return

  moveDirection.value = 'left'
  showContent.value = false

  setTimeout(() => {
    const prevStageId = store.data.stages[currentStageIndex.value - 1].id
    router.push({
      name: 'stage',
      params: { id: prevStageId },
    })
  }, 300)
}
</script>

<template>
  <div
    class="relative size-full min-h-screen bg-[#161118] dark overflow-x-hidden"
    style="font-family: 'Space Grotesk', 'Noto Sans', sans-serif"
  >
    <div class="w-full flex justify-center">
      <div class="max-w-[768px] w-full px-4">
        <!-- 加入返回按鈕 -->
        <div class="flex justify-between items-center py-3">
          <button
            v-if="currentStageIndex > 0"
            @click="goToPreviousStage"
            class="cursor-pointer text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div class="flex-1"></div>
        </div>

        <!-- 為整個內容添加過渡效果 -->
        <Transition :name="moveDirection === 'right' ? 'slide-right' : 'slide-left'" mode="out-in">
          <div v-if="showContent" class="question-content">
            <!-- 標題和問題 -->
            <Transition name="fade-down" appear>
              <h1 class="text-white text-[22px] font-bold leading-tight text-left pb-3">
                {{ currentStage.question.text }}
              </h1>
            </Transition>

            <!-- 進度條 -->
            <Transition name="progress-grow" appear>
              <div class="w-full h-1 bg-gray-700 rounded-full mb-8">
                <div
                  class="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
            </Transition>

            <!-- 選項區域 - 根據當前階段顯示選項 -->
            <Transition name="fade-up-group">
              <div class="mb-[20px] py-3" v-if="optionsReady">
                <TransitionGroup name="list-item" tag="div" class="space-y-3">
                  <button
                    v-for="(option, index) in currentStage.question.options"
                    :key="option.id"
                    @click="handleOptionClick(option.id)"
                    :class="
                      selectedOptionId === option.id
                        ? 'border-violet-500 shadow-glow'
                        : 'border-gray-700'
                    "
                    class="mt-4 w-full flex items-center justify-between p-4 cursor-pointer rounded-2xl border bg-[#1E191E] focus:outline-none transition-all duration-200"
                    :style="{ animationDelay: `${index * 0.1}s` }"
                  >
                    <span class="text-white">{{ option.text }}</span>

                    <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                      :class="
                        selectedOptionId === option.id ? 'border-violet-500' : 'border-gray-700'
                      "
                    >
                      <Transition name="scale">
                        <div
                          v-if="selectedOptionId === option.id"
                          class="w-3 h-3 rounded-full bg-violet-500"
                        ></div>
                      </Transition>
                    </div>
                  </button>
                </TransitionGroup>
              </div>
            </Transition>

            <!-- 繼續按鈕 -->
            <Transition name="fade-up">
              <div class="flex py-3" v-if="buttonReady">
                <button
                  @click="goToNextStage"
                  :disabled="!canContinue"
                  :class="
                    canContinue
                      ? 'bg-[#b319e6] hover:bg-[#a018d0] transform hover:-translate-y-1'
                      : 'bg-[#b319e6]/50 cursor-not-allowed'
                  "
                  class="flex min-w-[84px] max-w-[768px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-300"
                >
                  <span class="truncate">{{ isLastStage ? '查看結果' : 'Continue' }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 頁面過渡效果 */
.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-out;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 標題動畫 */
.fade-down-enter-active {
  transition: all 0.4s ease-out;
}

.fade-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

/* 進度條動畫 */
.progress-grow-enter-active {
  transition: all 0.5s ease-out;
}

.progress-grow-enter-from {
  opacity: 0;
  transform: scaleX(0.3);
}

/* 選項組動畫 */
.fade-up-group-enter-active {
  transition: all 0.4s ease-out;
}

.fade-up-group-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 選項列表項動畫 */
.list-item-enter-active {
  transition: all 0.4s ease-out;
  transition-delay: calc(var(--i, 0) * 0.1s);
}

.list-item-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 選中圓點動畫 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease-out;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
}

/* 按鈕動畫 */
.fade-up-enter-active {
  transition: all 0.4s ease-out;
  transition-delay: 0.2s;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 選中選項的發光效果 */
.shadow-glow {
  box-shadow: 0 0 10px rgba(179, 25, 230, 0.4);
}
</style>

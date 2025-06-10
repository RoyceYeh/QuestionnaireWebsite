<script setup>
import { useQuestionnaireStore } from '@/stores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const showBanner = ref(false)
const showTitle = ref(false)
const showDesc = ref(false)
const showButton = ref(false)
const showInput = ref(false)
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
    showInput.value = true
  }, 1000)
  setTimeout(() => {
    showButton.value = true
  }, 1600)
})
const router = useRouter()

const store = useQuestionnaireStore()

const username = ref('')

const isFormSubmitted = ref(false)
const validationError = ref('')

const userNameValid = computed(() => {
  return username.value.trim().length >= 2
})

function handleSubmit() {
  isFormSubmitted.value = true

  if (userNameValid.value) {
    store.setUserName(username.value.trim())
    router.push({ name: 'stage', params: { id: 'exploration' } })
  } else {
    // 顯示錯誤消息
    validationError.value = '請輸入至少 2 個字符的用戶名'

    // 聚焦到輸入框
    document.getElementById('username').focus()
  }
}
</script>

<template>
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
          <h1
            v-if="showTitle"
            class="text-white text-[22px] font-bold leading-tight px-4 text-left pb-3 pt-5"
          >
            你的賽博龐克代號是什麼？
          </h1>
        </Transition>
        <Transition name="fade-slide-left">
          <p v-if="showDesc" class="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
            即刻測驗，看看你在電馭世界的真實身份。
          </p></Transition
        >
        <form class="px-4 py-3" @submit.prevent="handleSubmit">
          <Transition name="fade-slide-right">
            <div v-if="showInput" class="mb-4">
              <input
                class="shadow rounded-xl h-12 appearance-none border w-full py-2 px-3 bg-[#342938] border-none text-white leading-tight focus:outline-none focus:shadow-outline"
                :class="{ 'border border-red-500': isFormSubmitted && !userNameValid }"
                id="username"
                type="text"
                placeholder="Username"
                v-model="username"
                @input="isFormSubmitted = false"
              />
              <p v-if="isFormSubmitted && !userNameValid" class="text-red-500 text-xs italic mt-2">
                {{ validationError }}
              </p>
            </div>
          </Transition>
          <Transition name="fade-scale">
            <div v-if="showButton" class="flex py-3">
              <button
                type="submit"
                :disabled="isFormSubmitted && !userNameValid"
                class="pulse-button flex min-w-[84px] max-w-[768px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 text-white text-base font-bold leading-normal tracking-[0.015em]"
                :class="userNameValid ? 'bg-[#b319e6]' : 'bg-[#b319e6]/50'"
              >
                <span class="truncate">Continue</span>
              </button>
            </div></Transition
          >
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.banner {
  background-image: url('@/assets/images/name_m.png');
}

@container (min-width: 768px) {
  .banner {
    background-image: url('@/assets/images/banner_pc.png');
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

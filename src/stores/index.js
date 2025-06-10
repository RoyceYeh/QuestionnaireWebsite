// stores/questionnaire.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import questionnaireData from '@/assets/data/data.json'

export const useQuestionnaireStore = defineStore(
  'questionnaire',
  () => {
    // 問卷數據
    const data = ref(questionnaireData)

    // 用戶回答
    const userAnswers = ref({})

    // 計算得分
    const scoresByType = ref({
      planner: 0,
      adventurer: 0,
      observer: 0,
      innovator: 0,
    })

    // 保存答案
    function saveAnswer(questionId, optionId) {
      userAnswers.value[questionId] = optionId
    }

    // 計算結果
    function calculateResult() {
      // 重置得分
      Object.keys(scoresByType.value).forEach((key) => {
        scoresByType.value[key] = 0
      })

      // 計算各選項得分
      Object.entries(userAnswers.value).forEach(([questionId, optionId]) => {
        // 找到對應的階段和問題
        const stage = data.value.stages.find((s) => s.question.id === questionId)
        if (!stage) return

        // 找到對應的選項
        const option = stage.question.options.find((o) => o.id === optionId)
        if (!option || !option.points) return

        // 累加分數
        Object.entries(option.points).forEach(([type, points]) => {
          if (scoresByType.value[type] !== undefined) {
            scoresByType.value[type] += points
          }
        })
      })
    }

    // 獲取結果類型
    const resultType = computed(() => {
      // 找出得分最高的類型
      let maxType = null
      let maxScore = -1

      Object.entries(scoresByType.value).forEach(([type, score]) => {
        if (score > maxScore) {
          maxType = type
          maxScore = score
        }
      })

      // 返回對應的結果
      return data.value.personalityTypes.find((t) => t.id === maxType) || null
    })

    // 重置問卷
    function resetQuestionnaire() {
      userAnswers.value = {}
      Object.keys(scoresByType.value).forEach((key) => {
        scoresByType.value[key] = 0
      })
    }

    // 用戶名稱
    const userName = ref('')

    function setUserName(name) {
      console.log('Setting user name:', name)
      userName.value = name
    }

    function initializeFromStorage() {
      // 如果有保存的答案，重新計算結果
      if (Object.keys(userAnswers.value).length > 0) {
        calculateResult()
      }
    }
    return {
      data,
      userAnswers,
      scoresByType,
      resultType,
      userName,
      saveAnswer,
      calculateResult,
      resetQuestionnaire,
      setUserName,
      initializeFromStorage,
    }
  },
  {
    persist: true, // 啟用持久化
    storage: localStorage,
    paths: ['userAnswers', 'scoresByType', 'userName'],
  },
)

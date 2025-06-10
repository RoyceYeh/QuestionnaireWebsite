import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ResultPage from '../views/ResultPage.vue'
import StagePage from '../views/StagePage.vue'
import NamePage from '../views/NamePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { title: '心靈探索之旅' },
    },
    {
      path: '/name',
      name: 'name',
      component: NamePage,
      meta: { title: '開始探索 - 心靈探索之旅' },
    },
    {
      path: '/stage/:id',
      name: 'stage',
      component: StagePage,
      props: true,
      meta: { title: '探索階段 - 心靈探索之旅' },
    },
    {
      path: '/result',
      name: 'result',
      component: ResultPage,
      meta: { title: '探索結果 - 心靈探索之旅' },
    },
    // 添加 catch-all 路由，防止未匹配的路徑
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// 標題更新
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '心靈探索之旅'
  next()
})
export default router

import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import User from '../components/user/user.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/params'
import GoodsList from '@/components/goods/List'
import GoodsAdd from '@/components/goods/Add'
import Order from '@/components/order/order'
import Report from '@/components/report/report'
import show from '@/components/report/show'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
      { path: '/showData', component: show }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数 表示放行
  // next() 放行  next('/login')

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

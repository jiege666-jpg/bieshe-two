import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式
import './assets/css/global.css'

import axios from 'axios'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入NProgress 包对应的css和js
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:5000'
// axios.defaults.withCredentials = true
// 在request 拦截中，展示进度条 NProgress.start（）
axios.interceptors.request.use(config => {
  NProgress.start()
  return config
})
// 配置axios请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
// 在response拦截器中，隐藏进度条
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 添加原型的属性上
Vue.prototype.$http = axios

Vue.component('tree-table', TreeTable)

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function (originVal) {
  originVal = originVal * 1
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

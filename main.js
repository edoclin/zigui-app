import App from './App'
import uView from '@/uni_modules/uview-ui'
import {
	store
} from './@/store/index.js'
Vue.use(uView)


import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
import {
	http
} from './common/http.js'
Vue.prototype.$http = http

const app = new Vue({
    ...App,
    store
})
app.$mount()

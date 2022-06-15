import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import {
	http
} from "../common/http.js"

export const store = new Vuex.Store({
	state: {
		userInfo: uni.getStorageSync('userInfo') || {},
		token: uni.getStorageSync('token') || '',
        userProfile: uni.getStorageSync('userProfile') || {},
        wxData: uni.getStorageSync('') || {},
        appid: 'wxd5a79aff2b14d08d'
	},
	mutations: {
		setUserInfo(state, info) {
			state.userInfo = info
			state.token = state.userInfo.tokenValue
			uni.setStorageSync('userInfo', state.userInfo)
			uni.setStorageSync('token', state.userInfo.tokenValue)
		},
        setWxData(state, wxData) {
        	state.wxData = wxData
        	uni.setStorageSync('wxData', state.wxData)
        },
        setUserProfile(state, profile) {
        	state.userProfile = profile
        	uni.setStorageSync('userProfile', state.userProfile)
        },
		exitLogin(state) {
			state.userInfo = {}
			state.token = ''
			uni.setStorageSync('userInfo', state.userInfo)
			uni.setStorageSync('token', state.userInfo.tokenValue)
		},
	},
	getters: {},
	actions: {
		updateUserInfo({
			commit
		}) {
			http(`/user-wx/user-info/${uni.getStorageSync('wxData').openid}`).then(data => {
				commit('setUserInfo', data)
			})
		},
	}
})

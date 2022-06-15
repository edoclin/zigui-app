let url = 'https://wechat.wuhandonghumap.com/zigui'
// let url = 'http://localhost:8080/zigui'

export const baseUrl = url;

let whiteArr = []

export function http(url, data, method = 'GET') {
    console.log('请求地址', url);
    console.log('请求参数', data);
    let innerUrl = url
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + url,
            data,
            header: {
                'satoken': uni.getStorageSync('token') || ''
            },
            method,
            success: (res) => {
                console.log(res);
                if (res.statusCode == 200) {
                    if (res.data.code == 2000) {
                        resolve(res.data.data)
                    } else if (res.data.code == 5000) {
                        uni.showToast({
                            title: res.data.message,
                            icon: 'none'
                        })
                        reject(res.data.message)
                    } else if (res.data.code == 5100) {
                        let pages = getCurrentPages();
                        var currPage = pages[pages.length - 1]; //当前页面
                        let url = '/' + currPage.route;
                        uni.showToast({
                            title: "登录过期",
                            icon: 'none'
                        })
                        uni.clearStorage()
                        this.$store.commit('setUserInfo', {})
                        this.$store.commit('setUserProfile', {})
                        this.$store.commit('userProfile', {})
                        this.$store.commit('wxData', {})
                        setTimeout(() => {
                            uni.switchTab({
                                url: '/pages/my/my'
                            })
                        }, 2000)

                    }
                } else {
                    uni.showToast({
                        title: "接口请求失败" + res.statusCode,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                uni.showToast({
                    title: '服务器请求异常',
                    icon: 'none'
                })
            },
            complete: () => {

            }
        });
    })
}

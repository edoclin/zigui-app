<template>
    <view class="container">
        <view class="ui-all">
            <view class="avatar" @click="!userProfile.userInfo ? getUserInfo() : true">
                <view class="imgAvatar">
                    <view class="iavatar"
                        :style="'background: url('+userProfile.userInfo.avatarUrl+') no-repeat center/cover #eeeeee;'">
                    </view>
                </view>
                <text v-if="!userProfile.userInfo.avatarUrl" @click="getUserInfo" style="color: black;">授权微信</text>
            </view>
            <view v-if="userInfo.userId">
                <view class="ui-list">
                    <text>昵称</text>
                    <input type="text" :value="userInfo.nickName" :disabled="true" placeholder-class="place" />
                </view>
                <view class="ui-list">
                    <text>手机</text>
                    <input v-if="userInfo.mobile" type="tel" :value="userInfo.mobile" :disabled="true"
                        placeholder-class="place" />
                    <button v-if="!userInfo.mobile" open-type="getPhoneNumber" @getphonenumber="getphonenumber"
                        class="getInfo bun">授权手机号</button>
                </view>
                <view class="ui-list">
                    <text>工号</text>
                    <input type="text" :value="infoForm.workNumber" placeholder-class="place"
                        @input="(event) => {updated = true;infoForm.workNumber = event.detail.value}" />
                </view>
                <view class="ui-list">
                    <text>姓名</text>
                    <input type="text" :value="infoForm.name" placeholder-class="place"
                        @input="(event) => {updated = true;infoForm.name = event.detail.value}" />
                </view>
                <view class="ui-list">
                    <text> 职位</text>
                    <input type="text" :value="infoForm.post" placeholder-class="place"
                        @input="(event) => {updated = true;infoForm.post = event.detail.value}" />
                </view>
                <view style="position: fixed;bottom: 0;width: 90vw;">
                    <button size="mini" style="width: 100%;" @click="updateInfo" v-if="updated">保存修改</button>
                    <button size="mini" type="warn" style="margin-top: 5%;width: 100%;" @click="logout">退出登录</button>
                </view>
            </view>
        </view>

    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    import WXBizDataCrypt from "@/common/WXBizDataCrypt.js";
    export default {
        onLoad() {
            this.infoForm = {
                workNumber: this.userInfo.workNumber,
                post: this.userInfo.post,
                name: this.userInfo.name,
                userId: this.userInfo.userId
            }
        },
        data() {
            return {
                index: 0,
                infoForm: {},
                updated: false
            }
        },
        onPullDownRefresh() {
            const _this = this
            this.$store.dispatch('updateUserInfo').then(() => {
                console.log(_this.userInfo);
               _this.infoForm = {
                   workNumber: _this.userInfo.workNumber,
                   post: _this.userInfo.post,
                   name: _this.userInfo.name,
               } 
            })
        },
        computed: {
            ...mapState(['userInfo', 'userProfile', 'wxData', 'appid'])
        },
        methods: {
            updateInfo() {
                console.log(this.infoForm);
                this.$http('/user-info', this.infoForm, 'PUT').then(data => {
                    uni.showToast({
                        title: "修改成功",
                        duration: 3000
                    })
                    this.updated = false
                    this.$store.dispatch('updateUserInfo')
                })
            },
            logout() {
                this.$http(`/user-wx/logout`)
                this.$http(`/user-wx/check`)
            },
            getUserInfo() {
                const _this = this
                uni.getUserProfile({
                    // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                    desc: '用于完善会员资料',
                    success: (res) => {
                        uni.showToast({
                            title: '已授权',
                            icon: 'none',
                            duration: 2000
                        })
                        _this.$store.commit('setUserProfile', res)
                        uni.login({
                            provider: "weixin",
                            success(res) {
                                _this.$http(`/user/weixin/${res.code}`).then(data => {
                                    if (data.openid) {
                                        _this.$store.commit('setWxData', data)
                                        _this.$http(`/user-wx/user-info/${data.openid}`)
                                            .then(data0 => {
                                                if (!data0) {
                                                    let userWx = {
                                                        ..._this.userProfile
                                                        .userInfo
                                                    }
                                                    userWx.openId = data.openid
                                                    _this.$http(
                                                        `/user-wx/auto-register`,
                                                        userWx, 'POST').then(
                                                        data1 => {
                                                            setTimeout(() => {
                                                                uni.setClipboardData({
                                                                    data: JSON
                                                                        .stringify(
                                                                            data1
                                                                            ),
                                                                    success: function() {
                                                                        uni.showToast({
                                                                            title: "注册成功, 请授权手机号!",
                                                                            icon: 'none',
                                                                            duration: 3000
                                                                        })
                                                                        userWx
                                                                            .userId =
                                                                            data1
                                                                            .userId
                                                                        _this
                                                                            .$store
                                                                            .commit(
                                                                                'setUserInfo',
                                                                                userWx
                                                                                )

                                                                    }
                                                                })
                                                            }, 2500)
                                                        })
                                                } else {
                                                    _this.$store.commit('setUserInfo',
                                                        data0)
                                                }
                                            })
                                    }
                                })
                            }
                        })
                    }
                })

            },
            getphonenumber(e) {
                if (e.detail.iv) {
                    let pc = new WXBizDataCrypt(this.appid, this.wxData.session_key);
                    let data = pc.decryptData(e.detail.encryptedData, e.detail.iv);

                    let userInfo = {
                        ...this.userInfo
                    }
                    userInfo.mobile = data.purePhoneNumber

                    this.$store.commit('setUserInfo', userInfo)
                    uni.showToast({
                        title: '已授权',
                        icon: 'none',
                        duration: 2000
                    })
                    userInfo.openId = this.wxData.openid
                    this.$http(`/user-wx/user-info`, userInfo, 'PUT').then(data => {

                    })
                }
            },
            isPhoneAvailable(poneInput) {
                var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
                if (!myreg.test(poneInput)) {
                    return false;
                } else {
                    return true;
                }
            },
        },
    }
</script>

<style lang="less">
    .container {
        display: block;
    }

    .ui-all {
        padding: 20rpx 40rpx;

        .avatar {
            width: 100%;
            text-align: left;
            padding: 20rpx 0;
            border-bottom: solid 1px #f2f2f2;
            position: relative;

            .imgAvatar {
                width: 140rpx;
                height: 140rpx;
                border-radius: 50%;
                display: inline-block;
                vertical-align: middle;
                overflow: hidden;

                .iavatar {
                    width: 100%;
                    height: 100%;
                    display: block;
                }
            }

            text {
                display: inline-block;
                vertical-align: middle;
                color: #8e8e93;
                font-size: 28rpx;
                margin-left: 40rpx;
            }

            &:after {
                content: ' ';
                width: 20rpx;
                height: 20rpx;
                border-top: solid 1px #030303;
                border-right: solid 1px #030303;
                transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                /* IE 9 */
                -moz-transform: rotate(45deg);
                /* Firefox */
                -webkit-transform: rotate(45deg);
                /* Safari 和 Chrome */
                -o-transform: rotate(45deg);
                position: absolute;
                top: 85rpx;
                right: 0;
            }
        }

        .ui-list {
            width: 100%;
            text-align: left;
            padding: 20rpx 0;
            border-bottom: solid 1px #f2f2f2;
            position: relative;

            text {
                color: #4a4a4a;
                font-size: 28rpx;
                display: inline-block;
                vertical-align: middle;
                min-width: 150rpx;
            }

            input {
                color: #030303;
                font-size: 30rpx;
                display: inline-block;
                vertical-align: middle;
            }

            button {
                color: #030303;
                font-size: 30rpx;
                display: inline-block;
                vertical-align: middle;
                background: none;
                margin: 0;
                padding: 0;

                &::after {
                    display: none;
                }
            }

            picker {
                width: 90%;
                color: #030303;
                font-size: 30rpx;
                display: inline-block;
                vertical-align: middle;
                position: absolute;
                top: 30rpx;
                left: 150rpx;
            }

            textarea {
                color: #030303;
                font-size: 30rpx;
                vertical-align: middle;
                height: 150rpx;
                width: 100%;
                margin-top: 50rpx;
            }

            .place {
                color: #999999;
                font-size: 28rpx;
            }
        }

        .right:after {
            content: ' ';
            width: 20rpx;
            height: 20rpx;
            border-top: solid 1px #030303;
            border-right: solid 1px #030303;
            transform: rotate(45deg);
            -ms-transform: rotate(45deg);
            /* IE 9 */
            -moz-transform: rotate(45deg);
            /* Firefox */
            -webkit-transform: rotate(45deg);
            /* Safari 和 Chrome */
            -o-transform: rotate(45deg);
            position: absolute;
            top: 40rpx;
            right: 0;
        }

        .save {
            background: #030303;
            border: none;
            color: #ffffff;
            margin-top: 40rpx;
            font-size: 28rpx;
        }
    }
</style>

<template>
    <view>
        <map id="map" class="map" style="width: 100%; height: 64vh;display: block;position:fixed;top: 0vh;"
            :latitude="mapParams.latitude" :longitude="mapParams.longitude" :scale="mapParams.zoom" :polyline="polyline"
            :polygons="polygons">
            <button @click="compass.show = !compass.show"
                style="position: fixed; top: 40px;right: 10px; width: 50px;font-size: 10px;">{{compass.show ? '关闭' : '罗盘'}}</button>
            <view style="background-color: #ffffffaa;">
                <u-input placeholder="请输入路线名" v-model="search" @blur="filterRoute">
                    <template slot="suffix">
                        <u-button type="success" text="搜索" size="mini" @click="filterRoute"></u-button>
                    </template>
                </u-input>
            </view>
            <view style="margin: 40rpx 20%;">
                <cover-image v-if="compass.show" src='/static/compass.png'
                    :style="{transform:`rotate(${compass.rotate}deg)`, opacity: 0.7,transition:'transform 0.8s ease-in'}">
                </cover-image>
                <view v-if="compass.show" style="text-align: center;background-color: #ffffffaa;margin: 0% 20%;">
                    <view>{{`方向:${compass.direction.toFixed(0)}°`}}</view>
                    <view>{{`${compass.tagLongitude}:${compass.strLongitude}`}}</view>
                    <view>{{`${compass.tagLatitude}:${compass.strLatitude}`}}</view>
                </view>
            </view>
        </map>
        <div style="height: 36vh;margin-top: 64vh;overflow-y: auto;">
            <u-collapse accordion @open="openRoute" @close="closeCollapse" v-if="!openCollapse">
                <u-collapse-item v-for="(route, index) in data" :key="index" :title="route.routeName"
                    :name="route.routeId">
                </u-collapse-item>
            </u-collapse>
            <u-notice-bar icon=" " speed="50" mode="closable" @close="closeCollapse()" :text="currentRoute.routeName"
                v-if="openCollapse"></u-notice-bar>
            <view v-if="openCollapse" class="route-desc">{{currentRoute.routeDesc}}</view>
            <u-collapse accordion v-if="openCollapse">
                <u-collapse-item v-for="(point, key) in currentRoute.points" :key="key" :title="point.pointName"
                    :name="point.pointId">
                    <text class="u-collapse-content">{{point.pointDesc}}</text>
                    <u-icon slot="value" size="25" name="map" @click="openMap(point)" style="margin-right: 5rpx;">
                    </u-icon>
                    <u-cell-group>
                        <u-cell :title="`文字${!permissions.text ? '(未授权)' : ''}`" :disabled="!permissions.text"
                            :isLink="permissions.text" @click="toResource('text', point)">
                            <u-icon slot="icon" size="25" name="file-text"></u-icon>
                            <view slot="value">
                                <u-icon slot="icon" size="25" name="lock" v-if="!permissions.text"></u-icon>
                            </view>
                        </u-cell>
                        <u-cell :title="`图片${!permissions.image ? '(未授权)' : ''}`" :disabled="!permissions.image"
                            :isLink="permissions.image" @click="toResource('image', point)">
                            <u-icon slot="icon" size="25" name="photo"></u-icon>
                            <view slot="value">
                                <u-icon slot="icon" size="25" name="lock" v-if="!permissions.image"></u-icon>
                            </view>
                        </u-cell>
                        <u-cell :title="`语音${!permissions.audio ? '(未授权)' : ''}`" :disabled="!permissions.audio"
                            :isLink="permissions.audio" @click="toResource('audio', point)">
                            <u-icon slot="icon" size="25" name="volume"></u-icon>
                            <view slot="value">
                                <u-icon slot="icon" size="25" name="lock" v-if="!permissions.audio"></u-icon>
                            </view>
                        </u-cell>
                        <u-cell :title="`视频${!permissions.video ? '(未授权)' : ''}`" :disabled="!permissions.video"
                            :isLink="permissions.video" @click="toResource('video', point)">
                            <u-icon slot="icon" size="25" name="play-right"></u-icon>
                            <view slot="value">
                                <u-icon slot="icon" size="25" name="lock" v-if="!permissions.video"></u-icon>
                            </view>
                        </u-cell>
                    </u-cell-group>
                </u-collapse-item>
            </u-collapse>

        </div>

    </view>
</template>

<script>
    import {
        mapState
    } from 'vuex'
    export default {
        computed: {
            ...mapState(['userInfo'])
        },
        mounted() {
            const _this = this
            this.mapContext = uni.createMapContext("map", this);
        },
        onShow() {
            if (this.userInfo.mobile === undefined || this.userInfo.mobile === null || this.userInfo.mobile === '') {
                uni.showToast({
                    title: "请授权手机号",
                    duration: 2000,
                    icon: 'error'
                })
                setTimeout(() => {
                    uni.switchTab({
                        url: '/pages/my/my'
                    })
                }, 2000)
            }
            this.initData()
        },
        data() {
            return {
                mapContext: null,
                cacheData: [],
                data: [],
                polyline: [],
                showMarkers: [],
                markers: [],
                mapParams: {
                    mainMarkers: [],
                    pointMarkers: [],
                    zoom: 12,
                    latitude: 30.83,
                    longitude: 110.98,
                },
                openCollapse: false,
                polygons: [{
                    strokeColor: "#0000ff66",
                    fillColor: "#ffde8b76",
                    points: [{
                            "longitude": 110.728126,
                            "latitude": 31.160522
                        },
                        {
                            "longitude": 110.726382,
                            "latitude": 31.161156
                        },
                        {
                            "longitude": 110.725044,
                            "latitude": 31.163525
                        },
                        {
                            "longitude": 110.72532,
                            "latitude": 31.165811
                        },
                        {
                            "longitude": 110.727023,
                            "latitude": 31.169083
                        },
                        {
                            "longitude": 110.72978,
                            "latitude": 31.173044
                        },
                        {
                            "longitude": 110.729518,
                            "latitude": 31.173816
                        },
                        {
                            "longitude": 110.728105,
                            "latitude": 31.174311
                        },
                        {
                            "longitude": 110.723473,
                            "latitude": 31.17468
                        },
                        {
                            "longitude": 110.720378,
                            "latitude": 31.176272
                        },
                        {
                            "longitude": 110.717696,
                            "latitude": 31.178404
                        },
                        {
                            "longitude": 110.715118,
                            "latitude": 31.181825
                        },
                        {
                            "longitude": 110.713078,
                            "latitude": 31.183709
                        },
                        {
                            "longitude": 110.711037,
                            "latitude": 31.184138
                        },
                        {
                            "longitude": 110.705281,
                            "latitude": 31.182519
                        },
                        {
                            "longitude": 110.700545,
                            "latitude": 31.180899
                        },
                        {
                            "longitude": 110.695465,
                            "latitude": 31.178404
                        },
                        {
                            "longitude": 110.693266,
                            "latitude": 31.177523
                        },
                        {
                            "longitude": 110.69157,
                            "latitude": 31.175914
                        },
                        {
                            "longitude": 110.690226,
                            "latitude": 31.172857
                        },
                        {
                            "longitude": 110.689929,
                            "latitude": 31.170758
                        },
                        {
                            "longitude": 110.687965,
                            "latitude": 31.169711
                        },
                        {
                            "longitude": 110.683319,
                            "latitude": 31.166511
                        },
                        {
                            "longitude": 110.681058,
                            "latitude": 31.166026
                        },
                        {
                            "longitude": 110.677066,
                            "latitude": 31.168378
                        },
                        {
                            "longitude": 110.674088,
                            "latitude": 31.172312
                        },
                        {
                            "longitude": 110.671648,
                            "latitude": 31.17392
                        },
                        {
                            "longitude": 110.668477,
                            "latitude": 31.175204
                        },
                        {
                            "longitude": 110.667009,
                            "latitude": 31.176559
                        },
                        {
                            "longitude": 110.667167,
                            "latitude": 31.181401
                        },
                        {
                            "longitude": 110.665968,
                            "latitude": 31.182398
                        },
                        {
                            "longitude": 110.662707,
                            "latitude": 31.183224
                        },
                        {
                            "longitude": 110.65862,
                            "latitude": 31.185444
                        },
                        {
                            "longitude": 110.655524,
                            "latitude": 31.185906
                        },
                        {
                            "longitude": 110.65416,
                            "latitude": 31.187355
                        },
                        {
                            "longitude": 110.652333,
                            "latitude": 31.188528
                        },
                        {
                            "longitude": 110.649865,
                            "latitude": 31.188715
                        },
                        {
                            "longitude": 110.647438,
                            "latitude": 31.188269
                        },
                        {
                            "longitude": 110.645329,
                            "latitude": 31.187107
                        },
                        {
                            "longitude": 110.643227,
                            "latitude": 31.186441
                        },
                        {
                            "longitude": 110.638973,
                            "latitude": 31.187619
                        },
                        {
                            "longitude": 110.635864,
                            "latitude": 31.187129
                        },
                        {
                            "longitude": 110.631377,
                            "latitude": 31.184078
                        },
                        {
                            "longitude": 110.628323,
                            "latitude": 31.182822
                        },
                        {
                            "longitude": 110.623105,
                            "latitude": 31.182695
                        },
                        {
                            "longitude": 110.61941,
                            "latitude": 31.18437
                        },
                        {
                            "longitude": 110.614929,
                            "latitude": 31.184854
                        },
                        {
                            "longitude": 110.610655,
                            "latitude": 31.184006
                        },
                        {
                            "longitude": 110.603472,
                            "latitude": 31.180635
                        },
                        {
                            "longitude": 110.599791,
                            "latitude": 31.176944
                        },
                        {
                            "longitude": 110.595731,
                            "latitude": 31.171419
                        },
                        {
                            "longitude": 110.593608,
                            "latitude": 31.167905
                        },
                        {
                            "longitude": 110.593911,
                            "latitude": 31.163277
                        },
                        {
                            "longitude": 110.595896,
                            "latitude": 31.161646
                        },
                        {
                            "longitude": 110.597041,
                            "latitude": 31.159486
                        },
                        {
                            "longitude": 110.597875,
                            "latitude": 31.158913
                        },
                        {
                            "longitude": 110.600363,
                            "latitude": 31.158467
                        },
                        {
                            "longitude": 110.60168,
                            "latitude": 31.156313
                        },
                        {
                            "longitude": 110.603831,
                            "latitude": 31.154148
                        },
                        {
                            "longitude": 110.605471,
                            "latitude": 31.151271
                        },
                        {
                            "longitude": 110.606609,
                            "latitude": 31.147684
                        },
                        {
                            "longitude": 110.608098,
                            "latitude": 31.146246
                        },
                        {
                            "longitude": 110.607491,
                            "latitude": 31.143717
                        },
                        {
                            "longitude": 110.607622,
                            "latitude": 31.142218
                        },
                        {
                            "longitude": 110.607126,
                            "latitude": 31.140014
                        },
                        {
                            "longitude": 110.60514,
                            "latitude": 31.137517
                        },
                        {
                            "longitude": 110.604079,
                            "latitude": 31.135677
                        },
                        {
                            "longitude": 110.603024,
                            "latitude": 31.130761
                        },
                        {
                            "longitude": 110.600956,
                            "latitude": 31.128711
                        },
                        {
                            "longitude": 110.594297,
                            "latitude": 31.125426
                        },
                        {
                            "longitude": 110.584508,
                            "latitude": 31.11761
                        },
                        {
                            "longitude": 110.582682,
                            "latitude": 31.116822
                        },
                        {
                            "longitude": 110.580586,
                            "latitude": 31.116387
                        },
                        {
                            "longitude": 110.578435,
                            "latitude": 31.116883
                        },
                        {
                            "longitude": 110.576243,
                            "latitude": 31.118382
                        },
                        {
                            "longitude": 110.574417,
                            "latitude": 31.119165
                        },
                        {
                            "longitude": 110.57028,
                            "latitude": 31.118459
                        },
                        {
                            "longitude": 110.568709,
                            "latitude": 31.118873
                        },
                        {
                            "longitude": 110.566882,
                            "latitude": 31.11997
                        },
                        {
                            "longitude": 110.564442,
                            "latitude": 31.124092
                        },
                        {
                            "longitude": 110.562939,
                            "latitude": 31.125994
                        },
                        {
                            "longitude": 110.558231,
                            "latitude": 31.129934
                        },
                        {
                            "longitude": 110.551296,
                            "latitude": 31.134619
                        },
                        {
                            "longitude": 110.548787,
                            "latitude": 31.135363
                        },
                        {
                            "longitude": 110.547236,
                            "latitude": 31.13512
                        },
                        {
                            "longitude": 110.542824,
                            "latitude": 31.132756
                        },
                        {
                            "longitude": 110.540156,
                            "latitude": 31.132078
                        },
                        {
                            "longitude": 110.539108,
                            "latitude": 31.131318
                        },
                        {
                            "longitude": 110.538233,
                            "latitude": 31.124335
                        },
                        {
                            "longitude": 110.537282,
                            "latitude": 31.122345
                        },
                        {
                            "longitude": 110.536068,
                            "latitude": 31.120774
                        },
                        {
                            "longitude": 110.531243,
                            "latitude": 31.117335
                        },
                        {
                            "longitude": 110.527355,
                            "latitude": 31.11438
                        },
                        {
                            "longitude": 110.525322,
                            "latitude": 31.111961
                        },
                        {
                            "longitude": 110.522909,
                            "latitude": 31.110698
                        },
                        {
                            "longitude": 110.520365,
                            "latitude": 31.109756
                        },
                        {
                            "longitude": 110.517553,
                            "latitude": 31.107496
                        },
                        {
                            "longitude": 110.515071,
                            "latitude": 31.103808
                        },
                        {
                            "longitude": 110.513644,
                            "latitude": 31.101112
                        },
                        {
                            "longitude": 110.512645,
                            "latitude": 31.097302
                        },
                        {
                            "longitude": 110.507385,
                            "latitude": 31.091706
                        },
                        {
                            "longitude": 110.498258,
                            "latitude": 31.085619
                        },
                        {
                            "longitude": 110.490262,
                            "latitude": 31.085024
                        },
                        {
                            "longitude": 110.48414,
                            "latitude": 31.084864
                        },
                        {
                            "longitude": 110.479074,
                            "latitude": 31.084919
                        },
                        {
                            "longitude": 110.473993,
                            "latitude": 31.08337
                        },
                        {
                            "longitude": 110.465983,
                            "latitude": 31.08139
                        },
                        {
                            "longitude": 110.464349,
                            "latitude": 31.078429
                        },
                        {
                            "longitude": 110.464563,
                            "latitude": 31.074525
                        },
                        {
                            "longitude": 110.466093,
                            "latitude": 31.068779
                        },
                        {
                            "longitude": 110.468417,
                            "latitude": 31.062784
                        },
                        {
                            "longitude": 110.474641,
                            "latitude": 31.049414
                        },
                        {
                            "longitude": 110.477647,
                            "latitude": 31.04675
                        },
                        {
                            "longitude": 110.477695,
                            "latitude": 31.037764
                        },
                        {
                            "longitude": 110.470119,
                            "latitude": 31.034647
                        },
                        {
                            "longitude": 110.459903,
                            "latitude": 31.031712
                        },
                        {
                            "longitude": 110.450831,
                            "latitude": 31.030449
                        },
                        {
                            "longitude": 110.446344,
                            "latitude": 31.03067
                        },
                        {
                            "longitude": 110.443538,
                            "latitude": 31.023442
                        },
                        {
                            "longitude": 110.443538,
                            "latitude": 31.011888
                        },
                        {
                            "longitude": 110.443993,
                            "latitude": 31.005001
                        },
                        {
                            "longitude": 110.442863,
                            "latitude": 30.999278
                        },
                        {
                            "longitude": 110.444855,
                            "latitude": 30.988936
                        },
                        {
                            "longitude": 110.445586,
                            "latitude": 30.982963
                        },
                        {
                            "longitude": 110.444896,
                            "latitude": 30.969566
                        },
                        {
                            "longitude": 110.439802,
                            "latitude": 30.955455
                        },
                        {
                            "longitude": 110.441132,
                            "latitude": 30.952081
                        },
                        {
                            "longitude": 110.440257,
                            "latitude": 30.947504
                        },
                        {
                            "longitude": 110.436479,
                            "latitude": 30.942959
                        },
                        {
                            "longitude": 110.434267,
                            "latitude": 30.937928
                        },
                        {
                            "longitude": 110.432323,
                            "latitude": 30.932671
                        },
                        {
                            "longitude": 110.431571,
                            "latitude": 30.927623
                        },
                        {
                            "longitude": 110.429214,
                            "latitude": 30.923663
                        },
                        {
                            "longitude": 110.428021,
                            "latitude": 30.918648
                        },
                        {
                            "longitude": 110.427511,
                            "latitude": 30.915063
                        },
                        {
                            "longitude": 110.425009,
                            "latitude": 30.913069
                        },
                        {
                            "longitude": 110.424499,
                            "latitude": 30.911633
                        },
                        {
                            "longitude": 110.425491,
                            "latitude": 30.910915
                        },
                        {
                            "longitude": 110.429145,
                            "latitude": 30.910755
                        },
                        {
                            "longitude": 110.430806,
                            "latitude": 30.910175
                        },
                        {
                            "longitude": 110.432771,
                            "latitude": 30.906584
                        },
                        {
                            "longitude": 110.433591,
                            "latitude": 30.903711
                        },
                        {
                            "longitude": 110.433577,
                            "latitude": 30.902131
                        },
                        {
                            "longitude": 110.434404,
                            "latitude": 30.900126
                        },
                        {
                            "longitude": 110.436038,
                            "latitude": 30.897673
                        },
                        {
                            "longitude": 110.440333,
                            "latitude": 30.892645
                        },
                        {
                            "longitude": 110.440981,
                            "latitude": 30.890485
                        },
                        {
                            "longitude": 110.441132,
                            "latitude": 30.887618
                        },
                        {
                            "longitude": 110.4436,
                            "latitude": 30.883882
                        },
                        {
                            "longitude": 110.44309,
                            "latitude": 30.881009
                        },
                        {
                            "longitude": 110.441918,
                            "latitude": 30.879578
                        },
                        {
                            "longitude": 110.439423,
                            "latitude": 30.877876
                        },
                        {
                            "longitude": 110.432102,
                            "latitude": 30.874036
                        },
                        {
                            "longitude": 110.429607,
                            "latitude": 30.872897
                        },
                        {
                            "longitude": 110.42545,
                            "latitude": 30.871621
                        },
                        {
                            "longitude": 110.421245,
                            "latitude": 30.870759
                        },
                        {
                            "longitude": 110.417095,
                            "latitude": 30.873886
                        },
                        {
                            "longitude": 110.413779,
                            "latitude": 30.875655
                        },
                        {
                            "longitude": 110.410057,
                            "latitude": 30.874997
                        },
                        {
                            "longitude": 110.404701,
                            "latitude": 30.872875
                        },
                        {
                            "longitude": 110.397952,
                            "latitude": 30.868609
                        },
                        {
                            "longitude": 110.390486,
                            "latitude": 30.861706
                        },
                        {
                            "longitude": 110.388398,
                            "latitude": 30.858727
                        },
                        {
                            "longitude": 110.38704,
                            "latitude": 30.857207
                        },
                        {
                            "longitude": 110.386626,
                            "latitude": 30.856113
                        },
                        {
                            "longitude": 110.38402,
                            "latitude": 30.855588
                        },
                        {
                            "longitude": 110.38198,
                            "latitude": 30.854234
                        },
                        {
                            "longitude": 110.380843,
                            "latitude": 30.85231
                        },
                        {
                            "longitude": 110.378802,
                            "latitude": 30.851221
                        },
                        {
                            "longitude": 110.376024,
                            "latitude": 30.847092
                        },
                        {
                            "longitude": 110.374211,
                            "latitude": 30.845628
                        },
                        {
                            "longitude": 110.370668,
                            "latitude": 30.844505
                        },
                        {
                            "longitude": 110.368097,
                            "latitude": 30.844616
                        },
                        {
                            "longitude": 110.365849,
                            "latitude": 30.84413
                        },
                        {
                            "longitude": 110.363251,
                            "latitude": 30.842527
                        },
                        {
                            "longitude": 110.362065,
                            "latitude": 30.841482
                        },
                        {
                            "longitude": 110.359128,
                            "latitude": 30.837109
                        },
                        {
                            "longitude": 110.356984,
                            "latitude": 30.833118
                        },
                        {
                            "longitude": 110.35564,
                            "latitude": 30.831835
                        },
                        {
                            "longitude": 110.353717,
                            "latitude": 30.830729
                        },
                        {
                            "longitude": 110.349181,
                            "latitude": 30.828966
                        },
                        {
                            "longitude": 110.343163,
                            "latitude": 30.828175
                        },
                        {
                            "longitude": 110.335994,
                            "latitude": 30.826981
                        },
                        {
                            "longitude": 110.336297,
                            "latitude": 30.825671
                        },
                        {
                            "longitude": 110.337483,
                            "latitude": 30.823404
                        },
                        {
                            "longitude": 110.335711,
                            "latitude": 30.82289
                        },
                        {
                            "longitude": 110.333216,
                            "latitude": 30.821507
                        },
                        {
                            "longitude": 110.332554,
                            "latitude": 30.820424
                        },
                        {
                            "longitude": 110.33263,
                            "latitude": 30.818527
                        },
                        {
                            "longitude": 110.333312,
                            "latitude": 30.814878
                        },
                        {
                            "longitude": 110.332851,
                            "latitude": 30.813413
                        },
                        {
                            "longitude": 110.333588,
                            "latitude": 30.811903
                        },
                        {
                            "longitude": 110.335842,
                            "latitude": 30.808851
                        },
                        {
                            "longitude": 110.339365,
                            "latitude": 30.806301
                        },
                        {
                            "longitude": 110.338221,
                            "latitude": 30.801772
                        },
                        {
                            "longitude": 110.336608,
                            "latitude": 30.797011
                        },
                        {
                            "longitude": 110.333816,
                            "latitude": 30.795064
                        },
                        {
                            "longitude": 110.332148,
                            "latitude": 30.7931
                        },
                        {
                            "longitude": 110.330466,
                            "latitude": 30.790578
                        },
                        {
                            "longitude": 110.328136,
                            "latitude": 30.788156
                        },
                        {
                            "longitude": 110.32493,
                            "latitude": 30.78336
                        },
                        {
                            "longitude": 110.32198,
                            "latitude": 30.776629
                        },
                        {
                            "longitude": 110.318271,
                            "latitude": 30.762196
                        },
                        {
                            "longitude": 110.320629,
                            "latitude": 30.75861
                        },
                        {
                            "longitude": 110.322959,
                            "latitude": 30.756569
                        },
                        {
                            "longitude": 110.326019,
                            "latitude": 30.754522
                        },
                        {
                            "longitude": 110.331375,
                            "latitude": 30.752961
                        },
                        {
                            "longitude": 110.334581,
                            "latitude": 30.752596
                        },
                        {
                            "longitude": 110.339186,
                            "latitude": 30.752557
                        },
                        {
                            "longitude": 110.349436,
                            "latitude": 30.753587
                        },
                        {
                            "longitude": 110.353407,
                            "latitude": 30.754306
                        },
                        {
                            "longitude": 110.356274,
                            "latitude": 30.755246
                        },
                        {
                            "longitude": 110.360424,
                            "latitude": 30.756906
                        },
                        {
                            "longitude": 110.364271,
                            "latitude": 30.761211
                        },
                        {
                            "longitude": 110.3676,
                            "latitude": 30.763933
                        },
                        {
                            "longitude": 110.372605,
                            "latitude": 30.766218
                        },
                        {
                            "longitude": 110.3751,
                            "latitude": 30.76765
                        },
                        {
                            "longitude": 110.377106,
                            "latitude": 30.769791
                        },
                        {
                            "longitude": 110.379112,
                            "latitude": 30.772657
                        },
                        {
                            "longitude": 110.3828,
                            "latitude": 30.778393
                        },
                        {
                            "longitude": 110.384806,
                            "latitude": 30.781823
                        },
                        {
                            "longitude": 110.3909,
                            "latitude": 30.782697
                        },
                        {
                            "longitude": 110.399889,
                            "latitude": 30.783134
                        },
                        {
                            "longitude": 110.411346,
                            "latitude": 30.78299
                        },
                        {
                            "longitude": 110.422355,
                            "latitude": 30.782066
                        },
                        {
                            "longitude": 110.427987,
                            "latitude": 30.778985
                        },
                        {
                            "longitude": 110.433639,
                            "latitude": 30.771633
                        },
                        {
                            "longitude": 110.434818,
                            "latitude": 30.768076
                        },
                        {
                            "longitude": 110.434804,
                            "latitude": 30.76635
                        },
                        {
                            "longitude": 110.435976,
                            "latitude": 30.759778
                        },
                        {
                            "longitude": 110.436969,
                            "latitude": 30.756043
                        },
                        {
                            "longitude": 110.43843,
                            "latitude": 30.751412
                        },
                        {
                            "longitude": 110.440195,
                            "latitude": 30.747771
                        },
                        {
                            "longitude": 110.441325,
                            "latitude": 30.744883
                        },
                        {
                            "longitude": 110.442546,
                            "latitude": 30.743273
                        },
                        {
                            "longitude": 110.445965,
                            "latitude": 30.741043
                        },
                        {
                            "longitude": 110.448377,
                            "latitude": 30.739167
                        },
                        {
                            "longitude": 110.452458,
                            "latitude": 30.732432
                        },
                        {
                            "longitude": 110.454264,
                            "latitude": 30.731087
                        },
                        {
                            "longitude": 110.458297,
                            "latitude": 30.730777
                        },
                        {
                            "longitude": 110.460985,
                            "latitude": 30.730783
                        },
                        {
                            "longitude": 110.466238,
                            "latitude": 30.732487
                        },
                        {
                            "longitude": 110.473807,
                            "latitude": 30.734302
                        },
                        {
                            "longitude": 110.476854,
                            "latitude": 30.735365
                        },
                        {
                            "longitude": 110.481052,
                            "latitude": 30.735564
                        },
                        {
                            "longitude": 110.494646,
                            "latitude": 30.735099
                        },
                        {
                            "longitude": 110.497762,
                            "latitude": 30.735393
                        },
                        {
                            "longitude": 110.502959,
                            "latitude": 30.736189
                        },
                        {
                            "longitude": 110.505765,
                            "latitude": 30.736383
                        },
                        {
                            "longitude": 110.510156,
                            "latitude": 30.735282
                        },
                        {
                            "longitude": 110.512135,
                            "latitude": 30.734977
                        },
                        {
                            "longitude": 110.51452,
                            "latitude": 30.735531
                        },
                        {
                            "longitude": 110.515774,
                            "latitude": 30.736283
                        },
                        {
                            "longitude": 110.51667,
                            "latitude": 30.73614
                        },
                        {
                            "longitude": 110.521434,
                            "latitude": 30.736355
                        },
                        {
                            "longitude": 110.524329,
                            "latitude": 30.737955
                        },
                        {
                            "longitude": 110.529644,
                            "latitude": 30.743444
                        },
                        {
                            "longitude": 110.531767,
                            "latitude": 30.747572
                        },
                        {
                            "longitude": 110.536806,
                            "latitude": 30.752834
                        },
                        {
                            "longitude": 110.541046,
                            "latitude": 30.754892
                        },
                        {
                            "longitude": 110.550586,
                            "latitude": 30.761061
                        },
                        {
                            "longitude": 110.55801,
                            "latitude": 30.764945
                        },
                        {
                            "longitude": 110.562787,
                            "latitude": 30.766998
                        },
                        {
                            "longitude": 110.565972,
                            "latitude": 30.769288
                        },
                        {
                            "longitude": 110.570756,
                            "latitude": 30.770881
                        },
                        {
                            "longitude": 110.574189,
                            "latitude": 30.771567
                        },
                        {
                            "longitude": 110.580834,
                            "latitude": 30.77316
                        },
                        {
                            "longitude": 110.584019,
                            "latitude": 30.773387
                        },
                        {
                            "longitude": 110.586935,
                            "latitude": 30.772458
                        },
                        {
                            "longitude": 110.59012,
                            "latitude": 30.769703
                        },
                        {
                            "longitude": 110.590637,
                            "latitude": 30.763507
                        },
                        {
                            "longitude": 110.591423,
                            "latitude": 30.758682
                        },
                        {
                            "longitude": 110.591154,
                            "latitude": 30.754782
                        },
                        {
                            "longitude": 110.589286,
                            "latitude": 30.751113
                        },
                        {
                            "longitude": 110.587162,
                            "latitude": 30.747672
                        },
                        {
                            "longitude": 110.583688,
                            "latitude": 30.739875
                        },
                        {
                            "longitude": 110.584219,
                            "latitude": 30.737805
                        },
                        {
                            "longitude": 110.586073,
                            "latitude": 30.735736
                        },
                        {
                            "longitude": 110.58739,
                            "latitude": 30.733212
                        },
                        {
                            "longitude": 110.592698,
                            "latitude": 30.727694
                        },
                        {
                            "longitude": 110.595607,
                            "latitude": 30.724252
                        },
                        {
                            "longitude": 110.597185,
                            "latitude": 30.720577
                        },
                        {
                            "longitude": 110.598509,
                            "latitude": 30.715983
                        },
                        {
                            "longitude": 110.598495,
                            "latitude": 30.711854
                        },
                        {
                            "longitude": 110.599019,
                            "latitude": 30.707719
                        },
                        {
                            "longitude": 110.597427,
                            "latitude": 30.701297
                        },
                        {
                            "longitude": 110.597137,
                            "latitude": 30.69487
                        },
                        {
                            "longitude": 110.597399,
                            "latitude": 30.689588
                        },
                        {
                            "longitude": 110.598192,
                            "latitude": 30.684998
                        },
                        {
                            "longitude": 110.60401,
                            "latitude": 30.68224
                        },
                        {
                            "longitude": 110.62631,
                            "latitude": 30.674887
                        },
                        {
                            "longitude": 110.635079,
                            "latitude": 30.673968
                        },
                        {
                            "longitude": 110.644378,
                            "latitude": 30.670756
                        },
                        {
                            "longitude": 110.648355,
                            "latitude": 30.669837
                        },
                        {
                            "longitude": 110.651547,
                            "latitude": 30.667317
                        },
                        {
                            "longitude": 110.653911,
                            "latitude": 30.663645
                        },
                        {
                            "longitude": 110.654711,
                            "latitude": 30.659746
                        },
                        {
                            "longitude": 110.653904,
                            "latitude": 30.655842
                        },
                        {
                            "longitude": 110.654966,
                            "latitude": 30.652169
                        },
                        {
                            "longitude": 110.657613,
                            "latitude": 30.64827
                        },
                        {
                            "longitude": 110.663452,
                            "latitude": 30.64575
                        },
                        {
                            "longitude": 110.672489,
                            "latitude": 30.643916
                        },
                        {
                            "longitude": 110.685242,
                            "latitude": 30.641169
                        },
                        {
                            "longitude": 110.709438,
                            "latitude": 30.637729
                        },
                        {
                            "longitude": 110.719261,
                            "latitude": 30.637269
                        },
                        {
                            "longitude": 110.732545,
                            "latitude": 30.636344
                        },
                        {
                            "longitude": 110.736012,
                            "latitude": 30.637258
                        },
                        {
                            "longitude": 110.740265,
                            "latitude": 30.639778
                        },
                        {
                            "longitude": 110.742126,
                            "latitude": 30.643218
                        },
                        {
                            "longitude": 110.745056,
                            "latitude": 30.649178
                        },
                        {
                            "longitude": 110.747214,
                            "latitude": 30.654684
                        },
                        {
                            "longitude": 110.750681,
                            "latitude": 30.658583
                        },
                        {
                            "longitude": 110.753604,
                            "latitude": 30.659491
                        },
                        {
                            "longitude": 110.757057,
                            "latitude": 30.661098
                        },
                        {
                            "longitude": 110.760235,
                            "latitude": 30.661779
                        },
                        {
                            "longitude": 110.769266,
                            "latitude": 30.661984
                        },
                        {
                            "longitude": 110.774574,
                            "latitude": 30.661973
                        },
                        {
                            "longitude": 110.779868,
                            "latitude": 30.661037
                        },
                        {
                            "longitude": 110.783301,
                            "latitude": 30.659879
                        },
                        {
                            "longitude": 110.786768,
                            "latitude": 30.661247
                        },
                        {
                            "longitude": 110.78916,
                            "latitude": 30.663302
                        },
                        {
                            "longitude": 110.791297,
                            "latitude": 30.666735
                        },
                        {
                            "longitude": 110.793689,
                            "latitude": 30.671553
                        },
                        {
                            "longitude": 110.795323,
                            "latitude": 30.677052
                        },
                        {
                            "longitude": 110.796109,
                            "latitude": 30.68141
                        },
                        {
                            "longitude": 110.795874,
                            "latitude": 30.686459
                        },
                        {
                            "longitude": 110.796695,
                            "latitude": 30.69059
                        },
                        {
                            "longitude": 110.79857,
                            "latitude": 30.694488
                        },
                        {
                            "longitude": 110.80123,
                            "latitude": 30.699066
                        },
                        {
                            "longitude": 110.806008,
                            "latitude": 30.702033
                        },
                        {
                            "longitude": 110.810254,
                            "latitude": 30.70339
                        },
                        {
                            "longitude": 110.811247,
                            "latitude": 30.703506
                        },
                        {
                            "longitude": 110.812694,
                            "latitude": 30.704956
                        },
                        {
                            "longitude": 110.814549,
                            "latitude": 30.708073
                        },
                        {
                            "longitude": 110.816527,
                            "latitude": 30.708715
                        },
                        {
                            "longitude": 110.819084,
                            "latitude": 30.708195
                        },
                        {
                            "longitude": 110.82118,
                            "latitude": 30.707115
                        },
                        {
                            "longitude": 110.824055,
                            "latitude": 30.70474
                        },
                        {
                            "longitude": 110.827784,
                            "latitude": 30.702188
                        },
                        {
                            "longitude": 110.8311,
                            "latitude": 30.698773
                        },
                        {
                            "longitude": 110.833802,
                            "latitude": 30.693275
                        },
                        {
                            "longitude": 110.834305,
                            "latitude": 30.691083
                        },
                        {
                            "longitude": 110.833926,
                            "latitude": 30.688713
                        },
                        {
                            "longitude": 110.835532,
                            "latitude": 30.687279
                        },
                        {
                            "longitude": 110.837648,
                            "latitude": 30.687118
                        },
                        {
                            "longitude": 110.84084,
                            "latitude": 30.6861
                        },
                        {
                            "longitude": 110.842191,
                            "latitude": 30.685014
                        },
                        {
                            "longitude": 110.844163,
                            "latitude": 30.681975
                        },
                        {
                            "longitude": 110.846527,
                            "latitude": 30.679666
                        },
                        {
                            "longitude": 110.846644,
                            "latitude": 30.676919
                        },
                        {
                            "longitude": 110.850629,
                            "latitude": 30.674815
                        },
                        {
                            "longitude": 110.85391,
                            "latitude": 30.674604
                        },
                        {
                            "longitude": 110.856199,
                            "latitude": 30.6761
                        },
                        {
                            "longitude": 110.858301,
                            "latitude": 30.679898
                        },
                        {
                            "longitude": 110.858391,
                            "latitude": 30.68193
                        },
                        {
                            "longitude": 110.856688,
                            "latitude": 30.68652
                        },
                        {
                            "longitude": 110.856612,
                            "latitude": 30.689006
                        },
                        {
                            "longitude": 110.857108,
                            "latitude": 30.691022
                        },
                        {
                            "longitude": 110.859769,
                            "latitude": 30.694449
                        },
                        {
                            "longitude": 110.86323,
                            "latitude": 30.69673
                        },
                        {
                            "longitude": 110.868807,
                            "latitude": 30.698773
                        },
                        {
                            "longitude": 110.87226,
                            "latitude": 30.700594
                        },
                        {
                            "longitude": 110.875721,
                            "latitude": 30.703107
                        },
                        {
                            "longitude": 110.877858,
                            "latitude": 30.707458
                        },
                        {
                            "longitude": 110.877086,
                            "latitude": 30.712512
                        },
                        {
                            "longitude": 110.87712,
                            "latitude": 30.719398
                        },
                        {
                            "longitude": 110.877678,
                            "latitude": 30.724446
                        },
                        {
                            "longitude": 110.878499,
                            "latitude": 30.730179
                        },
                        {
                            "longitude": 110.880112,
                            "latitude": 30.734075
                        },
                        {
                            "longitude": 110.882511,
                            "latitude": 30.736588
                        },
                        {
                            "longitude": 110.88491,
                            "latitude": 30.73842
                        },
                        {
                            "longitude": 110.890486,
                            "latitude": 30.740002
                        },
                        {
                            "longitude": 110.89527,
                            "latitude": 30.740213
                        },
                        {
                            "longitude": 110.898179,
                            "latitude": 30.739515
                        },
                        {
                            "longitude": 110.90164,
                            "latitude": 30.737208
                        },
                        {
                            "longitude": 110.904253,
                            "latitude": 30.731923
                        },
                        {
                            "longitude": 110.906334,
                            "latitude": 30.721584
                        },
                        {
                            "longitude": 110.906713,
                            "latitude": 30.720438
                        },
                        {
                            "longitude": 110.908706,
                            "latitude": 30.718855
                        },
                        {
                            "longitude": 110.909691,
                            "latitude": 30.716907
                        },
                        {
                            "longitude": 110.911242,
                            "latitude": 30.715573
                        },
                        {
                            "longitude": 110.913345,
                            "latitude": 30.714616
                        },
                        {
                            "longitude": 110.912242,
                            "latitude": 30.711427
                        },
                        {
                            "longitude": 110.912228,
                            "latitude": 30.709844
                        },
                        {
                            "longitude": 110.913193,
                            "latitude": 30.707691
                        },
                        {
                            "longitude": 110.915048,
                            "latitude": 30.706279
                        },
                        {
                            "longitude": 110.916199,
                            "latitude": 30.707497
                        },
                        {
                            "longitude": 110.918887,
                            "latitude": 30.711804
                        },
                        {
                            "longitude": 110.92048,
                            "latitude": 30.71482
                        },
                        {
                            "longitude": 110.922672,
                            "latitude": 30.718269
                        },
                        {
                            "longitude": 110.927959,
                            "latitude": 30.723012
                        },
                        {
                            "longitude": 110.932454,
                            "latitude": 30.725032
                        },
                        {
                            "longitude": 110.933577,
                            "latitude": 30.725093
                        },
                        {
                            "longitude": 110.93479,
                            "latitude": 30.723881
                        },
                        {
                            "longitude": 110.937265,
                            "latitude": 30.722093
                        },
                        {
                            "longitude": 110.941208,
                            "latitude": 30.719951
                        },
                        {
                            "longitude": 110.943621,
                            "latitude": 30.719027
                        },
                        {
                            "longitude": 110.951383,
                            "latitude": 30.717007
                        },
                        {
                            "longitude": 110.953796,
                            "latitude": 30.716929
                        },
                        {
                            "longitude": 110.955719,
                            "latitude": 30.71771
                        },
                        {
                            "longitude": 110.957394,
                            "latitude": 30.719531
                        },
                        {
                            "longitude": 110.961075,
                            "latitude": 30.724745
                        },
                        {
                            "longitude": 110.963384,
                            "latitude": 30.729327
                        },
                        {
                            "longitude": 110.964984,
                            "latitude": 30.728984
                        },
                        {
                            "longitude": 110.966548,
                            "latitude": 30.729543
                        },
                        {
                            "longitude": 110.968554,
                            "latitude": 30.735531
                        },
                        {
                            "longitude": 110.968485,
                            "latitude": 30.738276
                        },
                        {
                            "longitude": 110.971325,
                            "latitude": 30.739914
                        },
                        {
                            "longitude": 110.975489,
                            "latitude": 30.741718
                        },
                        {
                            "longitude": 110.978956,
                            "latitude": 30.742924
                        },
                        {
                            "longitude": 110.984857,
                            "latitude": 30.743538
                        },
                        {
                            "longitude": 110.987635,
                            "latitude": 30.74444
                        },
                        {
                            "longitude": 110.992144,
                            "latitude": 30.746543
                        },
                        {
                            "longitude": 110.993226,
                            "latitude": 30.746548
                        },
                        {
                            "longitude": 110.995135,
                            "latitude": 30.750084
                        },
                        {
                            "longitude": 110.996335,
                            "latitude": 30.751545
                        },
                        {
                            "longitude": 110.996852,
                            "latitude": 30.753216
                        },
                        {
                            "longitude": 110.996631,
                            "latitude": 30.755064
                        },
                        {
                            "longitude": 110.99173,
                            "latitude": 30.757504
                        },
                        {
                            "longitude": 110.990048,
                            "latitude": 30.759158
                        },
                        {
                            "longitude": 110.9894,
                            "latitude": 30.761504
                        },
                        {
                            "longitude": 110.989014,
                            "latitude": 30.764342
                        },
                        {
                            "longitude": 110.990103,
                            "latitude": 30.767097
                        },
                        {
                            "longitude": 110.995259,
                            "latitude": 30.772784
                        },
                        {
                            "longitude": 110.998437,
                            "latitude": 30.775644
                        },
                        {
                            "longitude": 111.001567,
                            "latitude": 30.778742
                        },
                        {
                            "longitude": 111.004228,
                            "latitude": 30.781059
                        },
                        {
                            "longitude": 111.006275,
                            "latitude": 30.783172
                        },
                        {
                            "longitude": 111.006799,
                            "latitude": 30.785058
                        },
                        {
                            "longitude": 111.006227,
                            "latitude": 30.787326
                        },
                        {
                            "longitude": 111.00613,
                            "latitude": 30.790318
                        },
                        {
                            "longitude": 111.007605,
                            "latitude": 30.794035
                        },
                        {
                            "longitude": 111.006537,
                            "latitude": 30.795434
                        },
                        {
                            "longitude": 111.003401,
                            "latitude": 30.796679
                        },
                        {
                            "longitude": 111.001401,
                            "latitude": 30.798183
                        },
                        {
                            "longitude": 110.995659,
                            "latitude": 30.800296
                        },
                        {
                            "longitude": 110.991406,
                            "latitude": 30.802474
                        },
                        {
                            "longitude": 110.990682,
                            "latitude": 30.803713
                        },
                        {
                            "longitude": 110.990324,
                            "latitude": 30.812848
                        },
                        {
                            "longitude": 110.989855,
                            "latitude": 30.815763
                        },
                        {
                            "longitude": 110.991234,
                            "latitude": 30.81662
                        },
                        {
                            "longitude": 110.995887,
                            "latitude": 30.814767
                        },
                        {
                            "longitude": 110.998175,
                            "latitude": 30.815176
                        },
                        {
                            "longitude": 110.998492,
                            "latitude": 30.816741
                        },
                        {
                            "longitude": 110.998058,
                            "latitude": 30.817416
                        },
                        {
                            "longitude": 110.995452,
                            "latitude": 30.818428
                        },
                        {
                            "longitude": 110.994605,
                            "latitude": 30.820954
                        },
                        {
                            "longitude": 110.993543,
                            "latitude": 30.822033
                        },
                        {
                            "longitude": 110.99346,
                            "latitude": 30.823083
                        },
                        {
                            "longitude": 110.995907,
                            "latitude": 30.824211
                        },
                        {
                            "longitude": 110.997844,
                            "latitude": 30.823946
                        },
                        {
                            "longitude": 111.000367,
                            "latitude": 30.820938
                        },
                        {
                            "longitude": 111.001588,
                            "latitude": 30.820418
                        },
                        {
                            "longitude": 111.0042,
                            "latitude": 30.821552
                        },
                        {
                            "longitude": 111.005055,
                            "latitude": 30.82315
                        },
                        {
                            "longitude": 111.005455,
                            "latitude": 30.826395
                        },
                        {
                            "longitude": 111.0048,
                            "latitude": 30.830326
                        },
                        {
                            "longitude": 111.001153,
                            "latitude": 30.832753
                        },
                        {
                            "longitude": 110.999409,
                            "latitude": 30.836053
                        },
                        {
                            "longitude": 110.994487,
                            "latitude": 30.841388
                        },
                        {
                            "longitude": 110.992213,
                            "latitude": 30.844793
                        },
                        {
                            "longitude": 110.991041,
                            "latitude": 30.847363
                        },
                        {
                            "longitude": 110.988173,
                            "latitude": 30.851758
                        },
                        {
                            "longitude": 110.985684,
                            "latitude": 30.855113
                        },
                        {
                            "longitude": 110.98119,
                            "latitude": 30.860004
                        },
                        {
                            "longitude": 110.976916,
                            "latitude": 30.863707
                        },
                        {
                            "longitude": 110.972704,
                            "latitude": 30.86631
                        },
                        {
                            "longitude": 110.969885,
                            "latitude": 30.867515
                        },
                        {
                            "longitude": 110.963033,
                            "latitude": 30.869681
                        },
                        {
                            "longitude": 110.953265,
                            "latitude": 30.870847
                        },
                        {
                            "longitude": 110.940574,
                            "latitude": 30.872759
                        },
                        {
                            "longitude": 110.933777,
                            "latitude": 30.875467
                        },
                        {
                            "longitude": 110.928111,
                            "latitude": 30.878489
                        },
                        {
                            "longitude": 110.921851,
                            "latitude": 30.881512
                        },
                        {
                            "longitude": 110.913448,
                            "latitude": 30.884529
                        },
                        {
                            "longitude": 110.907037,
                            "latitude": 30.88612
                        },
                        {
                            "longitude": 110.905342,
                            "latitude": 30.886275
                        },
                        {
                            "longitude": 110.899579,
                            "latitude": 30.885518
                        },
                        {
                            "longitude": 110.893981,
                            "latitude": 30.885142
                        },
                        {
                            "longitude": 110.891955,
                            "latitude": 30.888651
                        },
                        {
                            "longitude": 110.892885,
                            "latitude": 30.898695
                        },
                        {
                            "longitude": 110.89241,
                            "latitude": 30.900855
                        },
                        {
                            "longitude": 110.890617,
                            "latitude": 30.904452
                        },
                        {
                            "longitude": 110.888577,
                            "latitude": 30.90612
                        },
                        {
                            "longitude": 110.887095,
                            "latitude": 30.906346
                        },
                        {
                            "longitude": 110.885888,
                            "latitude": 30.9057
                        },
                        {
                            "longitude": 110.88198,
                            "latitude": 30.905949
                        },
                        {
                            "longitude": 110.877203,
                            "latitude": 30.9077
                        },
                        {
                            "longitude": 110.874666,
                            "latitude": 30.911009
                        },
                        {
                            "longitude": 110.868434,
                            "latitude": 30.914008
                        },
                        {
                            "longitude": 110.866842,
                            "latitude": 30.916008
                        },
                        {
                            "longitude": 110.865684,
                            "latitude": 30.919128
                        },
                        {
                            "longitude": 110.865098,
                            "latitude": 30.922752
                        },
                        {
                            "longitude": 110.865387,
                            "latitude": 30.925872
                        },
                        {
                            "longitude": 110.866104,
                            "latitude": 30.928369
                        },
                        {
                            "longitude": 110.868414,
                            "latitude": 30.930368
                        },
                        {
                            "longitude": 110.872177,
                            "latitude": 30.931616
                        },
                        {
                            "longitude": 110.878209,
                            "latitude": 30.932693
                        },
                        {
                            "longitude": 110.880973,
                            "latitude": 30.933919
                        },
                        {
                            "longitude": 110.882373,
                            "latitude": 30.935371
                        },
                        {
                            "longitude": 110.882931,
                            "latitude": 30.936995
                        },
                        {
                            "longitude": 110.882538,
                            "latitude": 30.939541
                        },
                        {
                            "longitude": 110.88331,
                            "latitude": 30.941606
                        },
                        {
                            "longitude": 110.88229,
                            "latitude": 30.94498
                        },
                        {
                            "longitude": 110.880263,
                            "latitude": 30.948978
                        },
                        {
                            "longitude": 110.874756,
                            "latitude": 30.954599
                        },
                        {
                            "longitude": 110.872288,
                            "latitude": 30.957348
                        },
                        {
                            "longitude": 110.869965,
                            "latitude": 30.960595
                        },
                        {
                            "longitude": 110.868372,
                            "latitude": 30.963968
                        },
                        {
                            "longitude": 110.864367,
                            "latitude": 30.980518
                        },
                        {
                            "longitude": 110.862768,
                            "latitude": 30.984393
                        },
                        {
                            "longitude": 110.86203,
                            "latitude": 30.988417
                        },
                        {
                            "longitude": 110.862575,
                            "latitude": 30.992115
                        },
                        {
                            "longitude": 110.862706,
                            "latitude": 30.995906
                        },
                        {
                            "longitude": 110.859893,
                            "latitude": 30.999632
                        },
                        {
                            "longitude": 110.858425,
                            "latitude": 31.003682
                        },
                        {
                            "longitude": 110.859425,
                            "latitude": 31.00887
                        },
                        {
                            "longitude": 110.859149,
                            "latitude": 31.011309
                        },
                        {
                            "longitude": 110.856771,
                            "latitude": 31.014967
                        },
                        {
                            "longitude": 110.856357,
                            "latitude": 31.017251
                        },
                        {
                            "longitude": 110.85655,
                            "latitude": 31.022852
                        },
                        {
                            "longitude": 110.857508,
                            "latitude": 31.023839
                        },
                        {
                            "longitude": 110.860927,
                            "latitude": 31.025605
                        },
                        {
                            "longitude": 110.864643,
                            "latitude": 31.026802
                        },
                        {
                            "longitude": 110.866511,
                            "latitude": 31.027078
                        },
                        {
                            "longitude": 110.870888,
                            "latitude": 31.026366
                        },
                        {
                            "longitude": 110.875224,
                            "latitude": 31.024871
                        },
                        {
                            "longitude": 110.877051,
                            "latitude": 31.02507
                        },
                        {
                            "longitude": 110.883276,
                            "latitude": 31.027646
                        },
                        {
                            "longitude": 110.887653,
                            "latitude": 31.030791
                        },
                        {
                            "longitude": 110.887867,
                            "latitude": 31.032187
                        },
                        {
                            "longitude": 110.885571,
                            "latitude": 31.034349
                        },
                        {
                            "longitude": 110.885116,
                            "latitude": 31.035491
                        },
                        {
                            "longitude": 110.884972,
                            "latitude": 31.038161
                        },
                        {
                            "longitude": 110.885241,
                            "latitude": 31.041311
                        },
                        {
                            "longitude": 110.886109,
                            "latitude": 31.043275
                        },
                        {
                            "longitude": 110.887701,
                            "latitude": 31.044654
                        },
                        {
                            "longitude": 110.890948,
                            "latitude": 31.045482
                        },
                        {
                            "longitude": 110.896925,
                            "latitude": 31.046281
                        },
                        {
                            "longitude": 110.908981,
                            "latitude": 31.050225
                        },
                        {
                            "longitude": 110.912159,
                            "latitude": 31.051715
                        },
                        {
                            "longitude": 110.917543,
                            "latitude": 31.057247
                        },
                        {
                            "longitude": 110.917681,
                            "latitude": 31.058372
                        },
                        {
                            "longitude": 110.915951,
                            "latitude": 31.060749
                        },
                        {
                            "longitude": 110.914014,
                            "latitude": 31.062409
                        },
                        {
                            "longitude": 110.912635,
                            "latitude": 31.062828
                        },
                        {
                            "longitude": 110.910077,
                            "latitude": 31.062762
                        },
                        {
                            "longitude": 110.906762,
                            "latitude": 31.061753
                        },
                        {
                            "longitude": 110.903108,
                            "latitude": 31.060324
                        },
                        {
                            "longitude": 110.901309,
                            "latitude": 31.060264
                        },
                        {
                            "longitude": 110.899441,
                            "latitude": 31.06151
                        },
                        {
                            "longitude": 110.895856,
                            "latitude": 31.061328
                        },
                        {
                            "longitude": 110.893988,
                            "latitude": 31.062459
                        },
                        {
                            "longitude": 110.892196,
                            "latitude": 31.064598
                        },
                        {
                            "longitude": 110.892051,
                            "latitude": 31.066617
                        },
                        {
                            "longitude": 110.890879,
                            "latitude": 31.070124
                        },
                        {
                            "longitude": 110.889907,
                            "latitude": 31.071608
                        },
                        {
                            "longitude": 110.889714,
                            "latitude": 31.073146
                        },
                        {
                            "longitude": 110.891279,
                            "latitude": 31.07458
                        },
                        {
                            "longitude": 110.893926,
                            "latitude": 31.075567
                        },
                        {
                            "longitude": 110.8984,
                            "latitude": 31.076279
                        },
                        {
                            "longitude": 110.905983,
                            "latitude": 31.077856
                        },
                        {
                            "longitude": 110.908775,
                            "latitude": 31.07876
                        },
                        {
                            "longitude": 110.910788,
                            "latitude": 31.079863
                        },
                        {
                            "longitude": 110.911373,
                            "latitude": 31.080833
                        },
                        {
                            "longitude": 110.911029,
                            "latitude": 31.082675
                        },
                        {
                            "longitude": 110.913648,
                            "latitude": 31.084875
                        },
                        {
                            "longitude": 110.913579,
                            "latitude": 31.086303
                        },
                        {
                            "longitude": 110.912814,
                            "latitude": 31.087549
                        },
                        {
                            "longitude": 110.913414,
                            "latitude": 31.090085
                        },
                        {
                            "longitude": 110.912401,
                            "latitude": 31.090664
                        },
                        {
                            "longitude": 110.909588,
                            "latitude": 31.091436
                        },
                        {
                            "longitude": 110.906121,
                            "latitude": 31.091425
                        },
                        {
                            "longitude": 110.902702,
                            "latitude": 31.090008
                        },
                        {
                            "longitude": 110.900172,
                            "latitude": 31.091618
                        },
                        {
                            "longitude": 110.899317,
                            "latitude": 31.092555
                        },
                        {
                            "longitude": 110.897207,
                            "latitude": 31.093338
                        },
                        {
                            "longitude": 110.895774,
                            "latitude": 31.092561
                        },
                        {
                            "longitude": 110.895787,
                            "latitude": 31.088591
                        },
                        {
                            "longitude": 110.893637,
                            "latitude": 31.087599
                        },
                        {
                            "longitude": 110.887743,
                            "latitude": 31.08756
                        },
                        {
                            "longitude": 110.883731,
                            "latitude": 31.08799
                        },
                        {
                            "longitude": 110.882993,
                            "latitude": 31.088387
                        },
                        {
                            "longitude": 110.879519,
                            "latitude": 31.091569
                        },
                        {
                            "longitude": 110.876644,
                            "latitude": 31.093338
                        },
                        {
                            "longitude": 110.868965,
                            "latitude": 31.094904
                        },
                        {
                            "longitude": 110.864312,
                            "latitude": 31.096244
                        },
                        {
                            "longitude": 110.862913,
                            "latitude": 31.097159
                        },
                        {
                            "longitude": 110.860535,
                            "latitude": 31.100572
                        },
                        {
                            "longitude": 110.858542,
                            "latitude": 31.103879
                        },
                        {
                            "longitude": 110.856812,
                            "latitude": 31.105698
                        },
                        {
                            "longitude": 110.854827,
                            "latitude": 31.106873
                        },
                        {
                            "longitude": 110.849746,
                            "latitude": 31.106768
                        },
                        {
                            "longitude": 110.846534,
                            "latitude": 31.104739
                        },
                        {
                            "longitude": 110.844425,
                            "latitude": 31.103675
                        },
                        {
                            "longitude": 110.841702,
                            "latitude": 31.105274
                        },
                        {
                            "longitude": 110.839468,
                            "latitude": 31.108692
                        },
                        {
                            "longitude": 110.839213,
                            "latitude": 31.110401
                        },
                        {
                            "longitude": 110.837848,
                            "latitude": 31.113713
                        },
                        {
                            "longitude": 110.835615,
                            "latitude": 31.113818
                        },
                        {
                            "longitude": 110.830176,
                            "latitude": 31.111795
                        },
                        {
                            "longitude": 110.828439,
                            "latitude": 31.110197
                        },
                        {
                            "longitude": 110.825351,
                            "latitude": 31.108593
                        },
                        {
                            "longitude": 110.822504,
                            "latitude": 31.108278
                        },
                        {
                            "longitude": 110.820642,
                            "latitude": 31.108598
                        },
                        {
                            "longitude": 110.817664,
                            "latitude": 31.110307
                        },
                        {
                            "longitude": 110.815438,
                            "latitude": 31.111051
                        },
                        {
                            "longitude": 110.813708,
                            "latitude": 31.110307
                        },
                        {
                            "longitude": 110.809751,
                            "latitude": 31.106145
                        },
                        {
                            "longitude": 110.802699,
                            "latitude": 31.102303
                        },
                        {
                            "longitude": 110.796881,
                            "latitude": 31.099739
                        },
                        {
                            "longitude": 110.792173,
                            "latitude": 31.09803
                        },
                        {
                            "longitude": 110.779916,
                            "latitude": 31.094287
                        },
                        {
                            "longitude": 110.774953,
                            "latitude": 31.094281
                        },
                        {
                            "longitude": 110.768873,
                            "latitude": 31.096729
                        },
                        {
                            "longitude": 110.76564,
                            "latitude": 31.099712
                        },
                        {
                            "longitude": 110.765012,
                            "latitude": 31.101955
                        },
                        {
                            "longitude": 110.765137,
                            "latitude": 31.103664
                        },
                        {
                            "longitude": 110.766129,
                            "latitude": 31.104739
                        },
                        {
                            "longitude": 110.766632,
                            "latitude": 31.106332
                        },
                        {
                            "longitude": 110.766626,
                            "latitude": 31.107975
                        },
                        {
                            "longitude": 110.765288,
                            "latitude": 31.10953
                        },
                        {
                            "longitude": 110.762041,
                            "latitude": 31.111084
                        },
                        {
                            "longitude": 110.755148,
                            "latitude": 31.118867
                        },
                        {
                            "longitude": 110.753239,
                            "latitude": 31.120339
                        },
                        {
                            "longitude": 110.751805,
                            "latitude": 31.120256
                        },
                        {
                            "longitude": 110.749137,
                            "latitude": 31.118933
                        },
                        {
                            "longitude": 110.744284,
                            "latitude": 31.115477
                        },
                        {
                            "longitude": 110.73799,
                            "latitude": 31.112506
                        },
                        {
                            "longitude": 110.737315,
                            "latitude": 31.112914
                        },
                        {
                            "longitude": 110.736929,
                            "latitude": 31.11513
                        },
                        {
                            "longitude": 110.73768,
                            "latitude": 31.119892
                        },
                        {
                            "longitude": 110.737487,
                            "latitude": 31.12137
                        },
                        {
                            "longitude": 110.733468,
                            "latitude": 31.12374
                        },
                        {
                            "longitude": 110.731745,
                            "latitude": 31.125867
                        },
                        {
                            "longitude": 110.731635,
                            "latitude": 31.130463
                        },
                        {
                            "longitude": 110.731821,
                            "latitude": 31.131692
                        },
                        {
                            "longitude": 110.732682,
                            "latitude": 31.132354
                        },
                        {
                            "longitude": 110.73584,
                            "latitude": 31.129978
                        },
                        {
                            "longitude": 110.737273,
                            "latitude": 31.129984
                        },
                        {
                            "longitude": 110.739845,
                            "latitude": 31.131797
                        },
                        {
                            "longitude": 110.740375,
                            "latitude": 31.136917
                        },
                        {
                            "longitude": 110.740038,
                            "latitude": 31.139149
                        },
                        {
                            "longitude": 110.743912,
                            "latitude": 31.148549
                        },
                        {
                            "longitude": 110.74467,
                            "latitude": 31.149938
                        },
                        {
                            "longitude": 110.744663,
                            "latitude": 31.151244
                        },
                        {
                            "longitude": 110.743801,
                            "latitude": 31.153613
                        },
                        {
                            "longitude": 110.742278,
                            "latitude": 31.155652
                        },
                        {
                            "longitude": 110.741134,
                            "latitude": 31.156054
                        },
                        {
                            "longitude": 110.7399,
                            "latitude": 31.155646
                        },
                        {
                            "longitude": 110.738004,
                            "latitude": 31.153024
                        },
                        {
                            "longitude": 110.736963,
                            "latitude": 31.152043
                        },
                        {
                            "longitude": 110.735915,
                            "latitude": 31.151877
                        },
                        {
                            "longitude": 110.735247,
                            "latitude": 31.15261
                        },
                        {
                            "longitude": 110.735205,
                            "latitude": 31.153927
                        },
                        {
                            "longitude": 110.726423,
                            "latitude": 31.154638
                        },
                        {
                            "longitude": 110.725513,
                            "latitude": 31.154429
                        },
                        {
                            "longitude": 110.725679,
                            "latitude": 31.15655
                        },
                        {
                            "longitude": 110.726389,
                            "latitude": 31.156643
                        },
                        {
                            "longitude": 110.728126,
                            "latitude": 31.160522
                        }
                    ],
                }],
                compass: {
                    direction: 0,
                    strLongitude: '',
                    strLatitude: '',
                    tagLatitude: "",
                    tagLongitude: "",
                    rotate: 0,
                    show: false,
                },
                currentRoute: {},
                permissions: {},
                search: ''
            }
        },
        async onLoad() {
            const _this = this
            // 定时器获取经纬度
            const updateLocaton = (res) => {
                let temp0 = parseInt(res.longitude)
                let temp1 = parseInt(((res.longitude - Math.trunc(res.longitude)) * 60))
                let _ = ((res.longitude - Math.trunc(res.longitude)) * 60)
                let temp2 = parseInt(((_ - Math.trunc(_)) * 60).toFixed(0))
                _this.compass.strLongitude = temp0 + "°" + temp1 + "'" + temp2 + "\""
                _this.compass.tagLongitude = res.longitude > 0 ? "东经" : "西经"

                temp0 = parseInt(res.latitude)
                temp1 = parseInt(((res.latitude - Math.trunc(res.latitude)) * 60))
                _ = ((res.latitude - Math.trunc(res.latitude)) * 60)
                temp2 = parseInt(((_ - Math.trunc(_)) * 60).toFixed(0))
                _this.compass.strLatitude = temp0 + "°" + temp1 + "'" + temp2 + "\""
                _this.compass.tagLatitude = res.latitude > 0 ? "北纬" : "南纬"
            }
            uni.getLocation({
                type: 'gcj02',
                success: function(res) {
                    updateLocaton(res)
                }
            });
            setInterval(() => {
                uni.getLocation({
                    type: 'gcj02',
                    success: function(res) {
                        updateLocaton(res)
                    }
                });
            }, 1000 * 10 * 60 * 5);
            // 方向角
            uni.onLocationChange((res) => {
                console.log(res);
            })
            uni.onCompassChange((res) => {
                let rotate = 360 - res.direction.toFixed(0)
                _this.compass.rotate = rotate
                _this.compass.direction = res.direction
            });
        },
        methods: {
            filterRoute() {
                if (this.search !== '') {
                    this.data = this.cacheData.filter(item => item.routeName.includes(this.search))
                } else{
                    this.data = this.cacheData
                }
            },
            initData() {
                const _this = this
                this.markers = []
                this.mapParams.mainMarkers = []
                this.$http(`/route/wx`).then(data => {
                    data.forEach(route => {
                        let copy = {
                            ...route.polyline[0]
                        }
                        _this.mapParams.mainMarkers.push({
                            id: _this.mapParams.mainMarkers.length + 1,
                            latitude: copy.latitude,
                            longitude: copy.longitude,
                            iconPath: "/static/location.png",
                            width: 30,
                            height: 30,
                            label: {
                                content: route.routeName,
                                textAlign: 'center',
                                anchorY: -50,
                                color: "#000000",
                                bgColor: "#ffeeffcc"
                            },
                            joinCluster: true,
                        })
                        copy.longitude += 1e-6
                        route.polyline.splice(1, 0, copy)
                        this.polyline.push({
                            points: route.polyline,
                            color: "#a8408baa",
                            width: 3
                        })
                    })
                    this.data = data
                    this.cacheData = data
                    this.openAggator()
                })
            },
            updateClusters(clu) {
                let clusterMarkers = []
                clu.forEach((cluster, index) => {
                    const {
                        center, // 聚合点的经纬度数组  
                        clusterId, // 聚合簇id  
                        markerIds // 已经聚合了的标记点id数组  
                    } = cluster
                    let clusterObj = {
                        clusterId,
                        ...center,
                        width: 50,
                        height: 50,
                        iconPath: `/static/location.png`,
                        joinCluster: true,
                        label: {
                            content: markerIds.length + '',
                            fontSize: 16,
                            color: '#fff',
                            width: 50,
                            height: 50,
                            bgColor: 'transparent',
                            borderRadius: 25,
                            textAlign: 'center',
                            anchorY: -55,
                        }
                    }
                    clusterMarkers.push(clusterObj)
                })
                // 添加聚合簇  
                this.mapContext.addMarkers({
                    markers: clusterMarkers,
                    clear: false, //是否先清空地图上所有的marker  
                })
            },
            openAggator() {
                const _this = this
                this.mapContext.initMarkerCluster({
                    enableDefaultStyle: false,
                    zoomOnClick: true,
                    gridSize: 60,
                    complete(res) {}
                });
                this.mapContext.on("markerClusterCreate", (event) => {
                    this.updateClusters(event.clusters)
                });
                this.mapContext.addMarkers({
                    markers: !this.openCollapse ? this.mapParams.mainMarkers : this.mapParams.pointMarkers,
                    clear: true,
                    complete(res) {}
                })
            },
            openRoute(routeId) {
                const _this = this
                this.openCollapse = true
                let route = this.data.find(item => item.routeId === routeId)
                this.currentRoute = route
                this.mapParams.latitude = route.points[0].latitude
                this.mapParams.longitude = route.points[0].longitude
                this.mapParams.zoom = 16
                _this.mapParams.pointMarkers = []
                this.$http(`/permission/check/${route.routeId}`).then(data => {
                    this.permissions = data
                })
                route.points.forEach(point => {
                    _this.mapParams.pointMarkers.push({
                        id: _this.mapParams.pointMarkers.length + 1,
                        latitude: point.latitude,
                        longitude: point.longitude,
                        iconPath: "/static/location.png",
                        width: 30,
                        height: 30,
                        label: {
                            content: _this.mapParams.pointMarkers.length + 1 + '',
                            textAlign: 'center',
                            anchorY: -27,
                            color: "#ffffff",
                        },
                        callout: {
                            content: point.pointName,
                            textAlign: 'center',
                            color: "#000000",
                            bgColor: "#ffeeffcc",
                            display: "BYCLICK"
                        },
                        // joinCluster: true,
                    })
                })
                this.openAggator()
            },
            closeCollapse() {
                this.openCollapse = false
                this.mapParams.zoom = 12
                this.mapParams.latitude = 30.83
                this.mapParams.longitude = 110.98
                this.openAggator()
            },
            openMap(point) {
                uni.openLocation({
                    latitude: point.latitude,
                    longitude: point.longitude,
                    scale: 18,
                    success: function() {}
                });
            },
            toResource(type, point) {
                console.log(type);
                console.log(point);
                uni.navigateTo({
                    url: `/pages/content/content?type=${type}&id=${point.pointId}`
                })
            }
        }

    }
</script>
<style scoped>
    .slot-image {
        /* #ifndef APP-NVUE */
        display: block;
        /* #endif */
        margin-right: 10px;
        width: 30px;
        height: 30px;
    }

    .route-desc {
        padding: 12px 15px;
        color: $u-content-color;
        font-size: 14px;
        line-height: 18px;
    }
</style>

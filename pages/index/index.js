const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        current: 0,
        audioTime: '00:00',
        voice: '',
        authALter: false,
        list: [],
        swiperCurrent: 0
    },

    state: {
        pageOnShow: false,
        isonPullDownRefresh: true,
        timing: false,
        times: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        let that = this;
        that.state.options = options;
        common.getToken().then((_res) => {//获取token
            common.getPersonInfo().then((info) => {//获取用户信息
                common.authInfo(that, (status) => {//验证授权
                    that.getPartnerList();
                });
            });
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let that = this;
        // 播放
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
            that.setData({
                playing: true
            });
        })

        innerAudioContext.onStop((res) => {
            console.log('监听停止', res);
            that.state.timing = false;
            that.setData({
                playing: false
            });
            clearTimeout(that.state.times);
        })

        // 监听停止
        innerAudioContext.onEnded((res) => {
            console.log('监听结束');
            that.state.timing = false;
            that.setData({
                playing: false
            });
        })

        // 监听错误
        innerAudioContext.onError((res) => {
            that.state.timing = false;
            common.showClickModal('播放失败');
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        let that = this;
        if (!that.state.pageOnShow) return;
        //获取用户信息
        common.getPersonInfo().then((info) => {});
    },

    onHide() {
        innerAudioContext.stop();
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.getPartnerList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        let list = this.data.list;
        let current = this.data.current;
        let path = '/pages/index/index';
        if (list.length > 0) {
            path += '?uid=' + list[current].id;
        }
        return {
            title: '一个最真实的萌伴在线游戏陪玩服务平台',
            path: path
        }
    },

    // 首页事件
    homeEvent(event) {
        let dataset = event.currentTarget.dataset;
        let current = this.data.current;
        let list = this.data.list;
        if (list.length == 0 && dataset.types != 'mine') {
            common.showClickModal('暂无萌伴');
            return;
        }

        if (dataset.types == 'audio') { //播放语音
            if (this.state.timing) return;
            this.state.timing = true;
            this.settime(list[current].audio_times);
            // 播放
            innerAudioContext.src = list[current].audio;
            innerAudioContext.play();
        } else if (dataset.types == 'prev') { //上一个
            if (current == 0) {
                current = list.length - 1;
            } else {
                current = Number(current) - 1;
            }

            if (this.state.timing) {
                clearTimeout(this.state.times);
                innerAudioContext.stop();
            }

            this.setData({
                swiperCurrent: 0,
                current,
                audioTime: this.downTime(list[current].audio_times)
            });
        } else if (dataset.types == 'next') { //下一个
            if (current == (list.length - 1)) {
                current = 0;
            } else {
                current = Number(current) + 1;
            }

            if (this.state.timing) {
                clearTimeout(this.state.times);
                innerAudioContext.stop();
            }

            this.setData({
                swiperCurrent: 0,
                current,
                audioTime: this.downTime(list[current].audio_times)
            });
        } else if (dataset.types == 'sure') { //约
            let current = this.data.current;
            let myInfo = common.getStorage('userInfo');
            if (list[current].id == myInfo.id) {
                common.showClickModal('不支持向自己下单');
                return;
            }
            wx.navigateTo({
                url: '/pages/reservation/reservation?id=' + list[current].id
            });
        } else if (dataset.types == 'mine') { //我的
            wx.navigateTo({
                url: '/pages/mine/mine'
            });
        }
    },

    // 获取用户信息 回调
    userInfoHandler(event) {
        common.userInfoBind(this, event);
    },

    // 倒计时
    settime(countdown) {
        let that = this;
        let audioTime = '';
        audioTime = that.downTime(countdown);

        if (countdown == 0) {
            countdown = that.data.list[that.data.current].audio_times;
            that.state.timing = false;
            audioTime = that.downTime(countdown);
            that.setData({
                audioTime
            })
        } else {
            countdown--;
            that.setData({
                audioTime
            });
            that.state.times = setTimeout(function() {
                that.settime(countdown)
            }, 1000)
        }
    },

    // 时间处理
    downTime(time) {
        let m = parseInt(time / 60);
        let s = time % 60;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;
        return m + ':' + s
    },

    // 获取萌伴列表
    getPartnerList() {
        let that = this;
        let userInfo = common.getStorage('userInfo');
        let url = 'api/partner/getPage';
        let opt = that.state.options;

        // 判断是否携带uid
        if (opt.hasOwnProperty('uid') || userInfo.type == 3) {
            let uid = userInfo.id;
            if (opt.hasOwnProperty('uid')) {//通过分享进入，优先使用分享id
                uid = opt.uid;
            }
            url += '?uid=' + uid;
        }
        util.httpRequest(url).then((res) => {
            that.state.pageOnShow = true;
            wx.stopPullDownRefresh();
            wx.hideLoading();
            if (res.result == 'success') {
                let list = res.results;
                if (res.data) {
                    list.unshift(res.data);
                }
                if (list.length > 0) {
                    that.setData({
                        requestStatus: true,
                        list,
                        current: 0,
                        audioTime: that.downTime(list[0].audio_times)
                    });
                } else {
                    that.setData({
                        requestStatus: true,
                        list,
                        current: 0
                    });
                }
            } else {
                common.showClickModal(res.msg);
            }
        });
    }

})
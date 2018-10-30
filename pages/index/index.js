const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 0,
        audioTime: '00:00',
        voice: '',
        authALter: false,
        list: []
    },

    state: {
        offset: 0,
        limit: 10,
        hasmore: true,
        pageOnShow: false,
        isOnReachBottom: false,
        isonPullDownRefresh: true,
        timing: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.getPartnerList(0);
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                that.getPartnerList(0);
            };
        }
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
        // 监听停止
        innerAudioContext.onEnded((res) => {
            console.log('监听结束');
            console.log(res);
            that.setData({
                playing: false
            });
        })

        // 监听错误
        innerAudioContext.onError((res) => {
            common.showClickModal('播放失败');
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (!this.state.pageOnShow) return;
        this.getPartnerList(0);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.state.isonPullDownRefresh = true;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.state.offset = 0;
        this.getPartnerList(0);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            path: '/pages/index/index'
        }
    },

    // 首页事件
    homeEvent: function(event) {
        let dataset = event.currentTarget.dataset;
        let current = this.data.current;
        let list = this.data.list;

        if (dataset.types == 'audio') { //播放语音
            console.log('语音播放');
            if (this.state.timing) return;
            this.state.timing = true;
            this.settime(list[current].audio_times);
            // 播放
            innerAudioContext.src = list[current].audio;
            innerAudioContext.play();
        } else if (dataset.types == 'prev') { //上一个
            console.log('上一个');
            if (current == 0) {
                common.showClickModal('已经是第一个了');
                return;
            }
            current = Number(current) - 1;
            this.setData({
                current,
                audioTime: this.downTime(list[current].audio_times)
            });
        } else if (dataset.types == 'next') { //下一个
            console.log('下一个');
            if (list.length == 0) return;
            if (current == (list.length - 1)) {
                common.showClickModal('没有更多了');
                return;
            }

            // 查看到只剩两条时，加载更多
            if (current == (list.length - 2) && this.data.hasNext) {
                if (this.state.isonPullDownRefresh) return;
                if (!this.state.isOnReachBottom) return;
                if (!this.state.hasmore) return;
                this.state.offset = this.state.offset + this.state.limit;
                this.getPartnerList(this.state.offset);
                this.state.isOnReachBottom = false;
            }

            current = Number(current) + 1;
            this.setData({
                current,
                audioTime: this.downTime(list[current].audio_times)
            });
        } else if (dataset.types == 'sure') { //约
            console.log('约定');
            let current = this.data.current;
            let myInfo = common.getStorage('userInfo');
            if (list[current].id == myInfo.id) {
                common.showClickModal('无法向自己下单哟');
                return;
            }
            // 授权判断
            common.authInfo(this, (status) => {
                if (status) {
                    wx.navigateTo({
                        url: '/pages/reservation/reservation?id=' + list[current].id
                    });
                }
            });
        } else if (dataset.types == 'mine') { //我的
            console.log('我的');
            wx.navigateTo({
                url: '/pages/mine/mine'
            });
        }
    },

    // 获取用户信息 回调
    userInfoHandler(event) {
        this.setData({
            authALter: false
        });
        common.userInfoBind(this, event);
    },

    //关闭授权弹框
    closeAuth() {
        this.setData({
            authALter: false
        });
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
            setTimeout(function() {
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
    getPartnerList(offset) {
        let that = this;
        let userInfo = common.getStorage('userInfo');
        let url = 'api/partner/getPage?offset=' + offset + '&limit=' + that.state.limit;
        if (userInfo.type == 3) {
            url += '&uid=' + userInfo.id
        }
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                let list = that.data.list;
                let handle = common.dataListHandle(that, res, list, offset);
                if (offset == 0 && userInfo.type == 3) {
                    handle.list.unshift(res.data);
                }
                that.setData({
                    list: handle.list,
                    hasNext: handle.hasNext,
                    audioTime: that.downTime(handle.list[0].audio_times)
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    }

})
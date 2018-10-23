
const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

const innerAudioContext = wx.createInnerAudioContext();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        audioTime: '00:30',
        voice: '',
        authALter: false
    },

    state: {
        timing: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
            that.authInfo();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
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
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    /**
     * 判断是否上传个人信息，没有上传，显示自定义弹框提示
     */
    authInfo() {
        let myInfo = wx.getStorageSync('userInfo');
        if (myInfo.hasOwnProperty("id")) {
            if (!myInfo.avatar_url.original_url && !myInfo.displayname && Number(wx.getStorageSync("authALter")) === 0) {
                wx.setStorageSync("authALter", 1);
                this.setData({
                    authALter: true
                })
            }
        }
    },

    // 首页事件
    homeEvent: function(event) {
        var dataset = event.currentTarget.dataset;

        if (dataset.types == 'audio') {//播放语音
            console.log('语音播放');
            if (this.state.timing) return;
            this.state.timing = true;
            this.settime(30);
            // 播放
            innerAudioContext.src = this.data.voice;
            innerAudioContext.play();

        } else if (dataset.types == 'prev') {//上一个
            console.log('上一个');
        } else if (dataset.types == 'next') {//下一个
            console.log('下一个');
        } else if (dataset.types == 'sure') {//约
            console.log('约定');
            wx.navigateTo({
                url: '/pages/reservation/reservation'
            });
        } else if (dataset.types == 'mine') {//我的
            console.log('我的');
            wx.navigateTo({
                url: '/pages/mine/mine'
            });
        }
    },

    // 获取用户信息 回调
    userInfoHandler(event) {
        console.log(event);
        common.userInfoBind(this, event);
        if (event.detail.userInfo) {
            common.getStorage('userInfo', event.detail.userInfo);
            this.setData({
                authALter: false
            })
        }
    },

    //关闭授权弹框
    closeAuth() {
        this.setData({
            authALter: false
        })
    },

    // 倒计时
    settime: function (countdown) {
        var that = this;
        var m = parseInt(countdown / 60);
        var s = countdown % 60;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;

        if (countdown == 0) {
            countdown = 30;
            that.state.timing = false;
            var m = parseInt(countdown / 60);
            var s = countdown % 60;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            that.setData({
                audioTime: m + ':' + s
            })
        } else {
            countdown--;
            that.setData({
                audioTime: m + ':' + s
            });
            setTimeout(function () {
                that.settime(countdown)
            }, 1000)
        }
    }
})
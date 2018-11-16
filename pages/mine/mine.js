const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selfInfo: '',
        checked: false,
        announcement: ''
    },

    state: {
        pageOnShow: false,
        gonggao_timer: null,
        times: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        that.getInfo();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (!this.state.pageOnShow) return;
        this.getInfo();
    },

    store(patch){
        this.setData(patch);
    },

    // 公告滚动
    announcement(title) {
        let that = this;
        clearTimeout(that.state.times);
        let length = title.length * 16;
        let windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
        let duration = parseInt(((length + (windowWidth - 108)) / 60) * 1000);
        that.animation = wx.createAnimation({
            duration,
            timingFunction: 'linear'
        })
        that.animation.translate(windowWidth - 108).step({
            duration: 100,
            timingFunction: 'step-start'
        });
        that.animation.translate(-length).step();
        that.setData({
            animation: that.animation.export()
        });
        that.state.times = setTimeout(() => {
            that.announcement(title)
        }, duration)
    },

    mineEvent(event) {
        var dataset = event.currentTarget.dataset;
        if (dataset.types == 'switch') {//接单状态
            console.log(event);
            console.log('接单开关');
            this.changeOpen(event);
        } else if (dataset.types == 'apply') {//成为萌伴
            console.log('萌伴');
            wx.navigateTo({
                url: '/pages/apply/apply'
            });
        } else if (dataset.types == 'contact') {//客服
            console.log(event);
        } else if (dataset.types == 'wallet') {//我的钱包
            console.log('钱包');
            wx.navigateTo({
                url: '/pages/wallet/wallet'
            });
        } else if (dataset.types == 'order') {//订单中心
            console.log('订单');
            wx.navigateTo({
                url: '/pages/order/order'
            });
        }
    },


    // 获取账户信息
    getInfo() {
        let that = this;
        let url = 'api/user/getSelf';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                that.state.pageOnShow = true;
                that.announcement(res.results.inform.content);
                that.setData({
                    selfInfo: res.results,
                    checked: res.results.statusId == 1 ? true : false
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 接单状态更改
    changeOpen(event) {
        let that = this;
        let url = 'api/user/open';
        let selfInfo = that.data.selfInfo;
        let data = {
            statusId: event.detail.value ? 1 : 0
        }
        util.httpRequest(url, data, 'POST').then((res) => {
            if (res.result == 'success') {
                selfInfo.statusId = event.detail.value ? 1 : 0;
                that.setData({
                    selfInfo,
                    checked: event.detail.value ? true : false
                });
            } else {
                common.showClickModal(res.msg);
                that.setData({
                    selfInfo,
                    checked: that.data.checked
                });
            }
        });
    }
})
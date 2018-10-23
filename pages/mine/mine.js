// pages/mine/mine.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    state: {
        gonggao_timer: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.marquee();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    store(patch){
        this.setData(patch);
    },
    
    marquee() {
        var that = this;
        var title = '通知内容，走马灯的方式';
        if (that.state.gonggao_timer) {
            clearTimeout(that.state.gonggao_timer);
        }
        let marq = that.data.marquee;
        let windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
        // 根据字体大小计算长度
        let length = (title.length * 16) + 32;
        let gonggao = {
            title
        };
        // 计算动画时间 以每秒60px计算
        let duration = parseInt(((length + windowWidth) / 60) * 1000);
        let animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'step-start'
        });
        animation.translate(windowWidth).step();
        gonggao.animation = animation.export();
        that.store({
            gonggao
        });
        that.state.gonggao_timer = setTimeout(() => {
            let animation1 = wx.createAnimation({
                duration
            });
            animation1.translate(-length).step();
            gonggao.animation = animation1.export();
            that.store({
                gonggao
            });
            that.state.gonggao_timer = setTimeout(() => {
                that.marquee();
            }, duration);
        }, 1000);
    },

    mineEvent(event) {
        var dataset = event.currentTarget.dataset;
        if (dataset.types == 'switch') {//接单状态
            console.log('接单开关');
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
    }
})
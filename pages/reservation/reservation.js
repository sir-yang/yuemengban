// pages/reservation/reservation.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        serverId: 0,
        timeId: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    // 页面事件
    reservationEvent: function(event) {
        var dataset = event.currentTarget.dataset;
        if (dataset.types == 'service') {//服务
            var index = dataset.index;
            var serverId = this.data.serverId;
            if (index == serverId) return;
            this.setData({
                serverId: index
            });
        } else if (dataset.types == 'time') { 
            var index = dataset.index;
            var timeId = this.data.timeId;
            if (index == timeId) return;
            this.setData({
                timeId: index
            });
        } else if (dataset.types == 'img') {//查看图片
            wx.previewImage({
                urls: ["http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg"]
            });
        } else if (dataset.types == 'sure') {//呼叫萌伴
            console.log('呼叫萌伴');
            wx.redirectTo({
                url: '/pages/order/order'
            });
        }
    }
})
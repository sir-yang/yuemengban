
Page({

    /**
     * 页面的初始数据
     */
    data: {

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

    // 首页事件
    homeEvent: function(event) {
        var dataset = event.currentTarget.dataset;

        if (dataset.types == 'audio') {//播放语音
            console.log('语音播放');
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
            // wx.navigateTo({
            //     url: '/pages/mine/mine'
            // });
        }
    }
})
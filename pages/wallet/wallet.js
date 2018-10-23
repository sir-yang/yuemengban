// pages/wallet/wallet.js
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
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    // 提现操作
    wattleEvent:function(event) {
        var dataset = event.currentTarget.dataset;
        if (dataset.types == 'wattle') {
            //全部提现
            console.log('提现');
        }
    }
})
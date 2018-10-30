const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        serverId: 0,
        timeId: 1,
        totalMoney: 0
    },

    state: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.state.options = options;
        this.partnerDetail();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 页面事件
    reservationEvent: function(event) {
        let dataset = event.currentTarget.dataset;
        let details = this.data.details;
        let serverId = this.data.serverId;
        let timeId = this.data.timeId;
        if (dataset.types == 'service') { //服务
            var index = dataset.index;
            if (index == serverId) return;
            let totalMoney = details.times[timeId] * details.trick[index].money;
            this.setData({
                serverId: index,
                totalMoney
            });
        } else if (dataset.types == 'time') {
            var index = dataset.index;
            if (index == timeId) return;
            let totalMoney = details.times[index] * details.trick[serverId].money;
            this.setData({
                timeId: index,
                totalMoney
            });
        } else if (dataset.types == 'img') { //查看图片
            wx.previewImage({
                urls: ["http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg"]
            });
        } else if (dataset.types == 'sure') { //呼叫萌伴
            console.log('呼叫萌伴');
            this.submitOrder();
            // wx.redirectTo({
            //     url: '/pages/order/order'
            // });
        }
    },

    // 萌伴详情
    partnerDetail() {
        let that = this;
        let url = 'api/partner/getPage';
        let data = {
            id: that.state.options.id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                let details = res.results;
                let serverId = that.data.serverId;
                let timeId = that.data.timeId;
                let totalMoney = details.times[timeId] * details.trick[serverId].money;
                that.setData({
                    details,
                    totalMoney
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 下单
    submitOrder() {
        let that = this;
        let url = 'api/order/orderSave';
        let details = that.data.details;
        let serverId = that.data.serverId;
        let timeId = that.data.timeId;
        let data = {
            cuteId: that.state.options.id,
            trickId: details.trick[serverId].id,
            times: timeId
        }
        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        util.httpRequest(url, data, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                wx.showModal({
                    title: '提示',
                    content: '下单成功',
                    showCancel: false,
                    success() {
                        wx.redirectTo({
                            url: '/pages/order/order'
                        });
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})
const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selfInfo: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.getAccountInfo();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },


    // 提现操作
    wattleEvent:function(event) {
        var dataset = event.currentTarget.dataset;
        if (dataset.types == 'wattle') {
            //全部提现
            console.log('提现');
            return;
            this.applyExtracts();
        }
    },

    // 获取账户信息
    getAccountInfo() {
        let that = this;
        let url = 'api/user/getSelf';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                that.setData({
                    selfInfo: res.results
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 申请提现
    applyExtracts() {
        let that = this;
        let url = 'api/account/extracts?uid=' + common.getStorage('userInfo').id;
        util.httpRequest(url).then((res) => {
            if (res.result == 'success') {
                that.getAccountInfo();
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})
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
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            that.getAccountInfo();
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                that.getAccountInfo();
            }
        }
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
        wx.showLoading({
            title: '提现申请中...',
            mask: true
        });
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                wx.showModal({
                    title: '提示',
                    content: res.msg,
                    showCancel: false,
                    confirmColor: '#FEA2C5',
                    success() {
                        that.getAccountInfo();
                    }
                })
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})
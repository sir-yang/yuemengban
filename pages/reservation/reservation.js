const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        requestStatus: false,
        authALter: false,
        serverId: 0,
        timeId: 1,
        totalMoney: 0,
        customer: ''
    },

    state: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.state.options = options;
        let that = this;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });

        if (getCurrentPages().length > 1) {
            common.getServiceInfo().then((data) => {
                that.setData({
                    customer: data
                });
            })
            common.getPersonInfo().then((info) => {//获取用户信息
                common.authInfo(that, (status) => {//验证授权
                    that.partnerDetail();
                });
            });
        } else {
            common.getToken().then((_res) => {//获取token
                common.getServiceInfo().then((data) => {
                    that.setData({
                        customer: data
                    });
                })
                common.getPersonInfo().then((info) => {//获取用户信息
                    common.authInfo(that, (status) => {//验证授权
                        that.partnerDetail();
                    });
                });
            });
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        let that = this;
        return {
            title: '一个最真实的萌妹在线游戏陪玩服务平台',
            path: '/pages/reservation/reservation?id=' + that.state.options.id
        }
    },

    // 页面事件
    reservationEvent(event) {
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
                urls: [this.data.customer.o_bject_img]
            });
        } else if (dataset.types == 'sure') { //呼叫萌伴
            console.log('呼叫萌伴');
            this.submitOrder(event);
        }
    },

    // 获取用户信息 回调
    userInfoHandler(event) {
        common.userInfoBind(this, event);
    },

    //关闭授权弹框
    // closeAuth() {
    //     this.setData({
    //         authALter: false
    //     });
    // },

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
                    requestStatus: true,
                    details,
                    totalMoney
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 下单
    submitOrder(event) {
        let that = this;
        let url = 'api/order/orderSave';
        let details = that.data.details;
        let serverId = that.data.serverId;
        let timeId = that.data.timeId;
        let data = {
            wx_form_id: event.detail.formId,
            cuteId: that.state.options.id,
            trickId: details.trick[serverId].id,
            times: timeId
        }

        // 授权判断
        let pay = true;
        common.authInfo(that, (status) => {
            if (!status) {
                pay = false;
            }
        });
        if (!pay) return;

        wx.showLoading({
            title: '提交中...',
            mask: true
        });
        util.httpRequest(url, data, 'POST').then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                // 调用支付
                that.requestPay(res.results);
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 调用微信支付
    requestPay(vals) {
        wx.requestPayment({
            timeStamp: vals.timeStamp, //时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间
            nonceStr: vals.nonceStr, //随机字符串，长度为32个字符以下。
            package: vals.package, //统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
            signType: vals.signType,
            paySign: vals.paySign, //签名
            success(res) {
                wx.showModal({
                    title: '提示',
                    content: '下单成功，请添加萌萌客服微信',
                    showCancel: false,
                    confirmColor: '#FEA2C5',
                    success() {
                        wx.navigateTo({
                            url: '/pages/order/order'
                        });
                    }
                });
            },
            fail(res) {
                common.showClickModal('支付失败');
            }
        })
    }
})
const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        requestStatus: false
    },

    state: {
        offset: 0,
        limit: 10,
        hasmore: true,
        pageOnShow: false,
        isOnReachBottom: false,
        isonPullDownRefresh: true,
        time: ''
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
        if (getCurrentPages().length > 1) {
            that.getOrderList(0);
        } else {
            common.getToken().then((_res) => {//获取token
                that.getOrderList(0);
            });
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.state.isonPullDownRefresh = true;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.state.offset = 0;
        this.getOrderList(0);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        if (this.state.isonPullDownRefresh) return;
        if (!this.state.isOnReachBottom) return;
        if (!this.state.hasmore) return;
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        this.state.offset = this.state.offset + this.state.limit;
        this.getOrderList(this.state.offset);
        this.state.isOnReachBottom = false;
    },

    // 事件处理
    orderEvent(event) {
        let dataset = event.currentTarget.dataset;
        let formId = event.detail.formId;
        let list = this.data.list;
        let index = dataset.index;
        if (dataset.types == 'receive') {
            this.receiveOrder(index, formId);
        } else if (dataset.types == 'finish') {
            this.finishOrder(index, formId);
        }
    },

    // 订单取消倒计时
    downTime(list) {
        let that = this;
        that.state.time = setInterval(() => {
            list.forEach((res) => {
                let timeDown = common.timeCountDown(that, res.endTime);
                res.minute = timeDown.minute;
                res.second = timeDown.second;

                if (res.status == 1 && Number(timeDown.minute) == 0 && Number(timeDown.second) == 0) {
                    res.status = 4;
                }
            });
            that.setData({
                list
            });
        }, 1000);
    },

    // 获取订单列表
    getOrderList(offset) {
        let that = this;
        clearInterval(that.state.time)
        let url = 'api/order/orderList';
        let data = {
            offset,
            limit: that.state.limit
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                let handle = common.dataListHandle(that, res, that.data.list, offset);
                that.setData({
                    requestStatus: true,
                    list: handle.list,
                    hasNext: handle.hasNext
                });
                that.downTime(handle.list);
            } else {
                common.showClickModal(res.msg);
            }
        });
    },

    // 接单
    receiveOrder(index, formId) {
        let that = this;
        let list = that.data.list;
        let url = 'api/order/receive';
        wx.showLoading({
            title: '处理中...',
            mask: true
        });
        let data = {
            wx_form_id: formId,
            id: list[index].id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                list[index].status = 2;
                clearInterval(that.state.time);
                that.downTime(list);
            } else {
                 common.showClickModal(res.msg);
            }
        });
    },

    // 完成订单
    finishOrder(index, formId) {
        let that = this;
        let list = that.data.list;
        let url = 'api/order/finish';
        wx.showLoading({
            title: '处理中...',
            mask: true
        });
        let data = {
            wx_form_id: formId,
            id: list[index].id
        }
        util.httpRequest(url, data).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                list[index].status = 3;
                clearInterval(that.state.time);
                that.downTime(list);
            } else {
                common.showClickModal(res.msg);
            }
        });
    }


})
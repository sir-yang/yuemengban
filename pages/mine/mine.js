const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selfInfo: '',
        checked: false
    },

    state: {
        gonggao_timer: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getInfo();
    },

    store(patch){
        this.setData(patch);
    },
    
    marquee(title) {
        var that = this;
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
        let duration = parseInt(((length + (windowWidth - 108) ) / 60) * 1000);
        let animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'step-start'
        });
        animation.translate(windowWidth - 108).step();
        gonggao.animation = animation.export();
        that.store({
            gonggao
        });
        that.state.gonggao_timer = setTimeout(() => {
            let animation1 = wx.createAnimation({
                duration
            });
            animation1.translate(-(length - 108)).step();
            gonggao.animation = animation1.export();
            that.store({
                gonggao
            });
            that.state.gonggao_timer = setTimeout(() => {
                that.marquee(that.data.selfInfo.inform.content);
            }, duration);
        }, 1000);
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
                that.marquee(res.results.inform.content);
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
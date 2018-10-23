import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    checkToken: false,
    onLaunch(_options) {
        console.log(_options);
        this.checkToken = true;
        wx.setStorageSync("serverurl", "http://192.168.0.104/");
        wx.setStorageSync("authALter", 0);
    },

    onShow(options) {
        let that = this;
        wx.pro.checkSession().then(() => {
            let token = common.getAccessToken();
            if (!token) {
                console.log('no token');
            } else if (that.checkToken) {
                that.checkToken = false;
            }
            that.refresh(options);
        }).catch((_e) => {
            that.refresh(options);
        });
    },

    // 刷新token
    refresh(_options) {
        let that = this;
        common.getToken().then((_res) => {
            getApp().globalData.tokenUpdated();
        });
    },

    globalData: {
        commonFun: common,
        utilFun: util
    }
});
import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    onLaunch(_options) {
        wx.setStorageSync("serverurl", "https://www.d3zang.com/");
    },

    onShow(options) {
        let that = this;
        wx.getSystemInfo({
            success(res) {
                let SDKVersion = res.SDKVersion;
                if (SDKVersion == '1.0.0' || SDKVersion == '1.0.1' || SDKVersion == undefined) {
                    wx.showModal({
                        title: '提示',
                        content: '当前微信版本过低，请升级至高版本',
                        showCancel: false,
                        confirmColor: '#FEA2C5'
                    });
                }
            }
        });
    },

    globalData: {
        commonFun: common,
        utilFun: util
    }
});
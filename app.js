import 'utils/wx-pro.js';

let util = require('utils/util.js');
let common = require('utils/common.js');

App({
    checkToken: false,
    onLaunch(_options) {
        this.checkToken = true;
        // wx.setStorageSync("serverurl", "http://192.168.0.104/");
        wx.setStorageSync("serverurl", "https://menban.loaderwang.cn/");
    },

    onShow(options) {
        let that = this;
        wx.pro.checkSession().then(() => {
            let token = common.getAccessToken();
            if (!token) {
                console.log('no token');
            } else if (that.checkToken) {
                that.checkToken = false;
                let myInfo = common.getStorage('userInfo');
                if (!myInfo.face && !myInfo.nickName) {
                    return common.getPersonInfo().then(() => {});
                }
            }
            that.refresh(options);
        }).catch((_e) => {
            that.refresh(options);
        });

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

    // 刷新token
    refresh(_options) {
        let that = this;
        common.getToken().then((_res) => {
            common.getPersonInfo().then((info) => {
                getApp().globalData.tokenUpdated();
            });
        });
    },

    globalData: {
        commonFun: common,
        utilFun: util,
        tokenUpdated: null
    }
});
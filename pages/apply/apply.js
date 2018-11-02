const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

const recorderManager = wx.getRecorderManager()

const options = {
    duration: 120000,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'aac',
    frameSize: 50
}

const innerAudioContext = wx.createInnerAudioContext()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        canIUse: wx.canIUse('button.open-type.openSetting'),
        status: 'start',
        voice: '',
        playing: false
    },

    state: {
        audio: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;
        let token = common.getAccessToken();
        if (token) {
            common.getServiceInfo().then((data) => {
                that.setData({
                    customer: data
                });
            })
        } else {
            getApp().globalData.tokenUpdated = function () {
                console.log('update success');
                common.getServiceInfo().then((data) => {
                    that.setData({
                        customer: data
                    });
                })
            }
        }

        // 获取录音权限
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.record']) {
                    wx.authorize({
                        scope: 'scope.record',
                        success() {
                            that.setData({
                                recordAuth: true
                            });
                        },
                        fail() {
                            that.setData({
                                recordAuth: false
                            });
                        }
                    });
                } else {
                    that.setData({
                        recordAuth: true
                    });
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let that = this;
        // 监听录音
        recorderManager.onStart(() => {
            that.animation1 = wx.createAnimation({
                duration: 60000
            });
            that.animation1.rotate(225).step();

            that.animation2 = wx.createAnimation({
                duration: 60000,
                delay: 60000
            });
            that.animation2.rotate(225).step();
            // that.state.duration = 0;
            // that.state.atime = setInterval(() => {
            //     that.state.duration += 1;
            // },1000);

            let voice = that.data.voice;
            let playing = that.data.playing;
            if (voice) { //重新录音
                voice = '';
                playing = false;
            }
            that.setData({
                status: 'end',
                voice,
                playing,
                animation1: that.animation1.export(),
                animation2: that.animation2.export()
            });
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res)
            that.animation1.rotate(45).step({ duration: 0 });
            that.animation2.rotate(45).step({ duration: 0 });
            // clearInterval(that.state.atime);
            // let duration = that.state.duration;
            // if (duration > 0) {
            //     that.animation1.rotate(45 + (duration * 3)).step({ duration: 0 });
            //     that.animation2.rotate(45).step({ duration: 0 });
            // } else if (duration == 60) {
            //     that.animation1.rotate(255).step({ duration: 0 });
            //     that.animation2.rotate(45).step({ duration: 0 });
            // } else if (duration <= 120 && duration > 60) {
            //     that.animation1.rotate(255).step({ duration: 0 });
            //     that.animation2.rotate(45 + ((duration-60)* 3)).step({ duration: 0 });
            // }

            that.state.audio = res.tempFilePath;
            that.setData({
                status: 'start',
                voice: res.tempFilePath,
                animation1: that.animation1.export(),
                animation2: that.animation2.export()
            });
        })
        recorderManager.onFrameRecorded((res) => {
            const { frameBuffer } = res;
            console.log('frameBuffer.byteLength', frameBuffer.byteLength)
        })

        // 播放
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
            that.setData({
                playing: true
            });
        })
        innerAudioContext.onPause((res) => {
            console.log('监听暂停', res);
            that.setData({
                playing: false
            });
        })

        innerAudioContext.onStop((res) => {
            console.log('监听停止', res);
            that.setData({
                playing: false
            });
        })
        // 监听结束
        innerAudioContext.onEnded((res) => {
            console.log('监听结束', res);
            that.setData({
                playing: false
            });
        })
        innerAudioContext.onError((res) => {
            common.showClickModal(res.errMsg);
        })
    },

    // 监听页面显示
    onShow() {
        let that = this;
        common.getPersonInfo().then((info) => {
            that.setData({
                userInfo: info
            });
            if (info.type != 1) {
                that.getDetailInfo(info.id);
            }
        });
    },

    // 监听页面隐藏
    onHide() {
        innerAudioContext.stop();
    },

    /**
     * 生命周期函数--监听页面页面卸载
     */
    onUnload() {
        recorderManager.stop();
        innerAudioContext.stop();
    },

    // 界面事件
    applyEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types == 'pause') { //暂停
            innerAudioContext.pause();
        } else if (dataset.types == 'play') { //播放 
            innerAudioContext.src = that.data.voice;
            innerAudioContext.play();
        } else if (dataset.types == 'record') { //重新录音
            let status = that.data.status;
            if (status == 'start') {
                recorderManager.start(options);
            } else {
                recorderManager.stop();
            }
        } else if (dataset.types == 'apply') { //成为萌伴
            // 判断审核状态
            if (that.data.userInfo.type == 2) return;
            if (that.state.audio) {
                that.applyPartner(event.detail.formId);
            } else {
                common.showClickModal('您还未录入介绍呢');
            }
        } else if (dataset.types == 'image') { //查看大图
            wx.previewImage({
                urls: [that.data.customer.o_bject_img]
            });
        } else if (dataset.types == 'auth') {//授权回调
            if (event.detail.authSetting['scope.record']) {
                that.setData({
                    recordAuth: true
                });
            }
        }
    },

    // 录音动画
    dotAnFun() {
        let i = 1
        let dotAnData = wx.createAnimation({
            duration: 120000,
            transformOrigin: '1px 100px'
        })
        let that = this;
        that.state.dotAnFun = setInterval(function () {
            if (i == 60) {
                clearInterval(that.state.dotAnFun);
            } else {
                dotAnData.rotate(6 * (++i)).step();
                that.setData({
                    dotAnData: dotAnData.export()
                });
            }
        }, 2000);
    },

    // 获取萌伴信息
    getDetailInfo(uid) {
        let that = this;
        let url = 'api/partner/getPage?id=' + uid;
        util.httpRequest(url).then((res) => {
            if (res.result == 'success') {
                that.setData({
                    voice: res.results.audio
                });
            }
        });
    },

    // 调用申请
    applyPartner(formId) {
        let that = this;
        let url ='api/partner/qiNiuToken';
        wx.showLoading({
            title: '请稍后...',
            mask: true
        });
        util.httpRequest(url).then((res) => {
            return wx.pro.uploadFile({
                url: 'https://upload-z2.qiniup.com',
                filePath: that.data.voice,
                name: 'file',
                formData: {
                    token: res.token
                }
            });
        }).then((res) => {
            let key = JSON.parse(res.data).key;
            let saveUrl = 'api/partner/savePartInfo';
            let data = {
                wx_form_id: formId,
                uid: common.getStorage('userInfo').id,
                audio: key
            }
            util.httpRequest(saveUrl, data, 'POST').then((res) => {
                wx.hideLoading();
                common.getPersonInfo().then((info) => {
                    that.setData({
                        userInfo: info
                    });
                });
                common.showClickModal(res.msg);
            });
        });
    },

    // 获取客服信息
    getService() {
        let that = this;
        let url = 'api/user/getService';
        util.httpRequest(url).then((res) => {
            wx.hideLoading();
            if (res.result == 'success') {
                console.log(res.results);
                that.setData({
                    customer: res.results.img
                });
            } else {
                common.showClickModal(res.msg);
            }
        });
    }
})
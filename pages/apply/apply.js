const app = getApp();
let common = app.globalData.commonFun;
let util = app.globalData.utilFun;

const recorderManager = wx.getRecorderManager()

const options = {
    duration: 10000,
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
        dotAnData: {},
        status: 'start',
        voice: '',
        playing: false
    },

    state: {
        audio: '',
        dotAnFun: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let userInfo = common.getStorage('userInfo');
        if (userInfo.type != 1) {
            this.getDetailInfo(userInfo.id);
        }
        this.setData({
            userInfo
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let that = this;
        // 监听录音
        recorderManager.onStart(() => {
            let voice = that.data.voice;
            let playing = that.data.playing;
            if (voice) { //重新录音
                voice = '';
                playing = false;
            }
            that.setData({
                status: 'end',
                voice,
                playing
            });
            console.log('recorder start')
        })
        recorderManager.onPause(() => {
            console.log('recorder pause')
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res)
            that.state.audio = res.tempFilePath;
            clearInterval(that.state.dotAnFun);//停止动画
            that.setData({
                status: 'start',
                voice: res.tempFilePath
            });
        })
        recorderManager.onFrameRecorded((res) => {
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
        // 监听结束
        innerAudioContext.onEnded((res) => {
            console.log('监听结束', res);
            that.setData({
                playing: false
            });
        })
        innerAudioContext.onError((res) => {
            common.showClickModal(res.errMsg);
            console.log(res.errCode)
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        var i = 1　　
        var dotAnData = wx.createAnimation({
            duration: 6000,
            transformOrigin: '1px 100px'
        })
        let that = this;
        that.state.dotAnFun = setInterval(function() {
            if (i == 60) {
                clearInterval(dotAnFun);
            } else {
                dotAnData.rotate(6 * (++i)).step();
                that.setData({　　
                    dotAnData: dotAnData.export()　　
                });
            }　
        }, 1000)
    },

    // 界面事件
    applyEvent(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types == 'pause') { //暂停
            console.log('暂停');
            innerAudioContext.pause();
        } else if (dataset.types == 'play') { //播放
            console.log('播放');
            innerAudioContext.src = this.data.voice;
            innerAudioContext.play();
        } else if (dataset.types == 'record') { //重新录音
            console.log('录音');
            let status = this.data.status;
            if (status == 'start') {
                recorderManager.start(options);
            } else {
                recorderManager.stop();
            }
        } else if (dataset.types == 'apply') { //成为萌伴
            console.log('成为萌伴');
            // 判断审核状态
            if (that.data.userInfo.type == 2) return;
            if (that.state.audio) {
                that.applyPartner(event.detail.formId);
            } else {
                common.showClickModal('您还未录入介绍呢');
            }
        } else if (dataset.types == 'image') { //查看大图
            console.log('查看大图');
            return;
            wx.previewImage({
                urls: []
            });
        }
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
                console.log(res);
                common.showClickModal(res.msg);
            });
        });
    }
})
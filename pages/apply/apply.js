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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        let that = this;
        // 监听录音
        recorderManager.onStart(() => {
            let voice = that.data.voice;
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
            that.setData({
                status: 'start',
                voice: res.tempFilePath
            });
            const {
                tempFilePath
            } = res
        })
        recorderManager.onFrameRecorded((res) => {
            const {
                frameBuffer
            } = res
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
            console.log('监听结束');
            console.log(res);
            that.setData({
                playing: false
            });
        })
        innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var i = 1　　
        var dotAnData = wx.createAnimation({
            duration: 6000,
            transformOrigin: '1px 100px'
        })
        let that = this;
        var dotAnFun = setInterval(function() {
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

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    // 界面事件
    applyEvent: function(event) {
        let that = this;
        let dataset = event.currentTarget.dataset;
        if (dataset.types == 'pause') { //暂停
            console.log('暂停');
            innerAudioContext.pause();
        } else if (dataset.types == 'play') { //播放
            console.log('播放');
            console.log(this.data.voice);
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
            return;
            let url = '';
            wx.uploadFile({
                url,
                filePath: that.data.voice,
                name: 'file',
                header: {
                    'content-type': 'multipart/form-data'
                },
                success(res) {

                }
            })
        } else if (dataset.types == 'image') { //查看大图
            console.log('查看大图');
            return;
            wx.previewImage({
                urls: []
            });
        }
    }


    // 录音

})
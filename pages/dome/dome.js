Page({

    data: {
        text: '这是一条会滚动的文字滚来滚去的文字跑马灯，哈哈哈哈哈哈哈哈',
        marqueePace: 1, //滚动速度
        marqueeDistance: 0, //初始滚动距离
        marquee2_margin: 60,
        size: 14,
        orientation: 'left', //滚动方向
        interval: 20 // 时间间隔
    },

    onShow: function() {
        // 页面显示
        var that = this;
        var length = that.data.text.length * that.data.size; //文字长度
        var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
        that.setData({
            length: length,
            windowWidth: windowWidth,
            marquee2_margin: length < windowWidth ? windowWidth - length : that.data.marquee2_margin //当文字长度小于屏幕长度时，需要增加补白
        });

        // 方法一
        // that.run1(); // 水平一行字滚动完了再按照原来的方向滚动

        // 方法二
        that.marquee();
    },

    run1() {
        var that = this;
        var interval = setInterval(function() {
            if (-that.data.marqueeDistance < that.data.length) {
                that.setData({
                    marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
                });
            } else {
                clearInterval(interval);
                that.setData({
                    marqueeDistance: that.data.windowWidth
                });
                that.run1();
            }
        }, that.data.interval);
    },

    marquee() {
        let that = this;
        let length = that.data.text.length * that.data.size;
        let windowWidth = wx.getSystemInfoSync().windowWidth;
        let interval = (length + windowWidth) / 60 * 1000;
        let animation = wx.createAnimation({
            duration: interval,
            timingFunction: 'linear'
        });
        animation.translate(windowWidth).step({
            duration: 100,
            timingFunction: 'step-start'
        });
        animation.translate(-length).step();
        that.setData({
            animation: animation.export()
        })
        // 再次调用 实现循环
        setTimeout(() => {
            that.marquee();
        }, interval)
    }
})
let util = require('util.js');

//弹框
function showClickModal(title) {
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: title,
        showCancel: false,
        success(_res) { }
    });
}

function showTimeToast(title) {
    wx.showToast({
        title,
        duration: 2000,
        icon: 'none',
        mask: true
    });
}
//倒计时计算
function timeCountDown(that, timestamp) {
    timestamp = util.formatTimeStamp(timestamp);
    let now = Date.parse(new Date());
    let t = timestamp - now;
    if (Number(t) <= 0) {
        clearInterval(that.data.time);
        return {
            hour: '00',
            minute: '00',
            second: '00'
        };
    }
    let leftsecond = parseInt(t / 1000);
    let day = Math.floor(leftsecond / (60 * 60 * 24));
    let hour = Math.floor((leftsecond - (day * 24 * 60 * 60)) / 3600);
    let minute = Math.floor((leftsecond - (day * 24 * 60 * 60) - (hour * 3600)) / 60);
    let second = Math.floor(leftsecond - (day * 24 * 60 * 60) - (hour * 3600) - (minute * 60));
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }
    return {
        day,
        hour,
        minute,
        second
    };
}

//滚动到顶部
function isscrollToPage(that) {
    if (wx.pageScrollTo) {
        wx.pageScrollTo({
            scrollTop: 0
        });
    } else {
        showClickModal('您当前微信版本过低');
    }
}

//滚动到顶部按钮的显示和隐藏
function goTopEvent(that, scrollTop) {
    let isPageScrollTo = false;
    if (wx.pageScrollTo) {
        isPageScrollTo = true;
    } else {
        isPageScrollTo = false;
    }
    if (scrollTop > 300 && !that.data.showGoTop) {
        that.setData({
            showGoTop: true,
            isPageScrollTo
        });
    } else if (scrollTop < 300 && that.data.showGoTop) {
        that.setData({
            showGoTop: false,
            isPageScrollTo
        });
    }
}

// 保存数据事件
function setInfo(key, data) {
    try {
        wx.setStorageSync(key, data);
    } catch (event) {
        console.log(event);
    }
}

// 获取已保存数据
function getInfo(key) {
    try {
        let value = wx.getStorageSync(key);
        if (value) {
            return value;
        }
        return null;
    } catch (event) {
        console.log(event);
    }
    return null;
}


/**
 * 移出token
 */
function removeAccessToken() {
    try {
        wx.removeStorageSync('token');
        wx.removeStorageSync('expire_at');
    } catch (event) {
        console.log(event);
    }
}

/**
 * 获取token
 */
function getAccessToken() {
    let accessToken = getInfo('token');
    if (!accessToken) {
        return null;
    }
    let expireAt = getInfo('expire_at');
    if (expireAt) {
        let now = Date.parse(new Date());
        if (now < expireAt) {
            return accessToken;
        }
    }
    removeAccessToken();
    return null;
}

/**
 * 处理并保存token
 */
function setToken(token) {
    setInfo('token', token.token);
    setInfo('refresh_token', token.fresh_token);
    //提前一半的时间就要刷新
    let now = Date.parse(new Date());
    let expireIn = (token.token_expire * 1000) / 2;
    setInfo('expire_at', now + expireIn);
}
/**
 * 获取token
 */
function getToken() {
    //调用登录接口
    return wx.pro.login({

    }).then((res) => {
        console.log(res.code)
        let wxcode = res.code;
        let values = {
            code: wxcode,
        };
        let url = 'api/login/createToken';
        return util.httpRequest(url, values, 'POST');
    }).then((data) => {
        if (data.result == 'success') {
            setToken(data.results);
            setInfo("hasLoading", true);
        } else {
            console.log(data.msg);
        }
        return data;
    });
}

/**
 * 刷新token
 */
function refreshToken() {
    let values = {
        refreshToken: getInfo('refresh_token')
    };
    let url = '/api/token/refresh';
    return util.httpRequest(url, values, 'POST').then((data) => {
        if (data.err_code == 0) {
            setToken(data.token);
            return data;
        }
        return getToken();
    }).catch((res) => {
        wx.removeStorageSync('refresh_token');
        return res;
    });
}

/**
 * 空对象判断
 * @obj  需要判断的字符串
 */
function nullObj(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

/**
 * 判断是否为空
 * @str  需要判断的字符串
 */
function isNull(str) {
    let regu = '^[ ]+$';
    let re = new RegExp(regu);
    if (!str || str == null || str === '' || str.length === 0 || re.test(str)) {
        return true;
    }
    let reNum = /^[0-9]+.?[0-9]*$/;
    if (!reNum.test(str)) {
        let strValue = str.replace(/\n/g, '');
        if (jsTrim(strValue) == '') {
            return true;
        }
    }
    return false;
}

// 列表接口数据处理
function dataListHandle(that, data, list, offset) {
    wx.stopPullDownRefresh();
    if (data.count > 0) {
        if (offset === 0) {
            list = data.results;
        } else {
            list = list.concat(data.results);
        }
    } else if (offset === 0) {
        list = [];
    }

    let hasNext = true;
    if (data.hasOwnProperty('next')) {
        console.log('count:' + data.count + ';next:' + data.next);
        if (data.next === 0) {
            that.state.hasmore = false;
            hasNext = false;
        } else {
            that.state.hasmore = true;
            hasNext = true;
        }
    } else {
        that.state.hasmore = false;
    }
    that.state.pageOnShow = true;
    that.state.isOnReachBottom = true;
    that.state.isonPullDownRefresh = false;
    that.state.scrolltolower = true;
    wx.hideLoading();
    return {
        list,
        hasNext,
        count: data.count
    };
}

module.exports = {
    timeCountDown,
    goTopEvent,
    setStorage: setInfo,
    getStorage: getInfo,
    getToken,
    showClickModal,
    showTimeToast,
    dataListHandle,
    nullObj,
    isNull
};
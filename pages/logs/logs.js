Page({
    data: {
        markers: [{
            // iconPath: "/images/home-bottonmine.png",
            id: 0,
            latitude: 30.5702,
            longitude: 104.06476,
            width: 30,
            height: 30
        }, {
            // iconPath: "/images/home-bottonmine.png",
            id: 1,
            latitude: 30.700218,
            longitude: 104.063146,
            width: 30,
            height: 30
        }, {
            // iconPath: "/images/home-bottonmine.png",
            id: 2,
            latitude: 30.702143,
            longitude: 104.05021,
            width: 30,
            height: 30
        }, {
            iconPath: "/images/home-bottonmine.png",
            id: 3,
            latitude: 30.700839,
            longitude: 104.036699,
            width: 50,
            height: 50,
            callout: {
                content: 'aa'
            }
        },{
            id: 4,
            latitude: 30.570123,
            longitude: 104.02476,
            width: 50,
            height: 50,
        }],
        polyline: [{
            points: [{
                longitude: 113.3245211,
                latitude: 23.10229
            }, {
                longitude: 113.324520,
                latitude: 23.21229
            }],
            color: "#FF0000DD",
            width: 2,
            dottedLine: true
        }],

        circles: [{
            latitude: 30.5702,
            longitude: 104.06476,
            fillColor: '#a2b2ce88',
            radius: 5000
        }, {
            latitude: 30.700839,
            longitude: 104.036699,
            fillColor: '#a2b2ce88',
            radius: 5000
        }]
    },

    onLoad() {
        let that = this;
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                console.log(res);
                let markers = that.data.markers;
                markers[0].latitude = res.latitude;
                markers[0].longitude = res.longitude;
                that.setData({
                    markers
                });
            }
        });
    },

    regionchange(e) {
        console.log(e)
    },
    markertap(e) {
        console.log(e.markerId)
    },
    controltap(e) {
        console.log(e.controlId)
    },
    mapupdated(e) {
        console.log(1, e);
    }
})
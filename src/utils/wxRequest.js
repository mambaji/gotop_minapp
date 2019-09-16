import wepy from 'wepy';

// const API_SECRET_KEY = 'www.mall.cycle.com'
// const TIMESTAMP = util.getCurrentTime()
// const SIGN = md5.hex_md5((TIMESTAMP + API_SECRET_KEY).toLowerCase())

const wxRequest = (params = {}, url) => {
  let data = params.query || {};
  let res = wepy.request({
    url: url,
    method: params.method || 'GET',
    data: data,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      // 判断如果是接口token过期，则重新调转登录页面
    },
    fail: function (res) { }
  });
  return res;
};


module.exports = {
  wxRequest
}

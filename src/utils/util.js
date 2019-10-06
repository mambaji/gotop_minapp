function timestampToTime (timestamp) {
  var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var s = date.getSeconds();
  return Y + M + D + ' ' + h + ':' + f;
}

function toast (title, onHide, icon = "none") {
  setTimeout(() => {
    wx.showToast({
      title: title,
      icon: icon,
      mask: true,
      duration: 1500
    });
  }, 300);

  // 隐藏结束回调
  if (onHide) {
    setTimeout(() => {
      onHide();
    }, 500);
  }
}

module.exports = {
  timestampToTime,
  toast
}
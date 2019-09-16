const onDrawYAxis = function (ctx, minNum, maxNum, style, xheight, cheight, cwidth) {
  const limit = getLimit(minNum, maxNum)
  const points = []
  const text = []
  const mheight = cheight - 30 - xheight // 去除上下边距的内容高度
  const startX = cwidth
  const startY = cheight - 15 - xheight // 主内容起始位置是cheight - xheight -15（下边距） 的高度
  const endX = cwidth - 5

  for (let i = 0; i < 5; i++) {
    points.push(startY - i * (mheight / 4))
    text.push(minNum + i * limit)
  }
  // 绘制边框
  ctx.beginPath()
  ctx.setFillStyle(style.color)
  ctx.fillRect(0, 0, startX, cheight - xheight)
  ctx.closePath()
  ctx.stroke()
  // 绘制轴上数值线段
  ctx.beginPath()
  ctx.setStrokeStyle('#333')
  ctx.setLineWidth(0.2)
  points.forEach(function (item, index) {
    ctx.moveTo(startX, item)
    ctx.lineTo(endX, item)
  })
  ctx.closePath()
  ctx.stroke()
  // 绘制轴上数值
  ctx.beginPath()
  ctx.setFontSize(12)
  ctx.setFillStyle('#333')
  text.forEach(function (item, index) {
    ctx.fillText(item.toFixed(2), endX - 40, points[index] + 5)
  })
  ctx.closePath()
  ctx.stroke()
  ctx.draw()
  return points
}

const onDrawXAxis = function (ctx, ypoints, kWidth, kNum, xHeight, cHeight, cWidth, wcWidth, period, style, kDatas) {
  console.log('wxWidth=', wcWidth, kNum)
  const xmarginLeft = 15
  const kmarginRight = 5
  const startX = 0  // 横坐标划线起始x位置
  const startY = cHeight - xHeight  //横坐标划线起始y位置
  const endX = cWidth
  const endY = startY
  const limitTimeNum = 2 //一个wcWidth（相对屏幕来说横坐标的大小）要放置多少个横坐标数值
  const spaceKTime = ((wcWidth - xmarginLeft) / (kWidth + kmarginRight) / limitTimeNum).toFixed(0) // 多少根k线绘制一个横坐标数值
  const points = []
  const texts = []
  console.log(kNum / spaceKTime)
  for (let i = 1, j = parseInt(kNum / spaceKTime); i <= j; i++) {
    points.push(xmarginLeft + (kWidth + kmarginRight) * i * spaceKTime - kmarginRight - kWidth / 2)  // k线宽度 * k线数量 - k线右边距 - k线宽度 / 2 ；这样的点正好对准k线的中心
    texts.push(kDatas[i * spaceKTime].day)
  }


  // 绘制边框
  ctx.beginPath()
  ctx.setFillStyle('#f8f9fc')
  ctx.fillRect(0, 0, endX, cHeight - xHeight)
  ctx.closePath()
  ctx.stroke()

  ctx.beginPath()
  ctx.setFillStyle(style.color)
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  points.forEach(function (item, index) {
    ctx.moveTo(item, startY)
    ctx.lineTo(item, endY - 10)
  })
  ctx.closePath()
  ctx.stroke()

  // 绘制轴上数值
  ctx.beginPath()
  ctx.setFontSize(12)
  ctx.setFillStyle('#333')

  texts.forEach(function (item, index) {
    ctx.fillText(item, points[index] - ctx.measureText(item).width / 2, endY + 20)
  })
  ctx.closePath()
  ctx.stroke()

  // 绘制虚线
  ctx.beginPath()
  ctx.setLineDash([5, 10], 5)
  ctx.setStrokeStyle('#999')
  ctx.setLineWidth(0.2)
  ypoints.forEach(function (item, index) {
    ctx.moveTo(startX, item)
    ctx.lineTo(cWidth, item)
  })

  points.forEach(function (item, index) {
    ctx.moveTo(item, startY)
    ctx.lineTo(item, 0)
  })
  ctx.closePath()
  ctx.stroke()
}

const onDrawKLines = function (ctx, cHeight, xHeight, kDatas, min, max) {
  console.log(min, max)
  const yNumpx = (cHeight - xHeight - 30) / (max - min) //1数值 y 占多少 px
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  let highpx = 0
  let lowpx = 0
  for (let i = 0; i < kDatas.length; i++) {
    forDrawKLine(i, ctx, yNumpx, parseFloat(kDatas[i].open), parseFloat(kDatas[i].close), parseFloat(kDatas[i].high), parseFloat(kDatas[i].low), startX, startY, endX, endY, lowpx, highpx, cHeight, xHeight, min, max)
  }
  ctx.draw()
}

const onDrawLineBorder = function (ctx, cHeight, xHeight, min, max, curMsg, i, isScroll = false) {
  const yNumpx = (cHeight - xHeight - 30) / (max - min)
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0
  if (curMsg.open < curMsg.close) {
    startY = cHeight - xHeight - 15 - (curMsg.close - min) * yNumpx
    endY = cHeight - xHeight - 15 - (curMsg.open - min) * yNumpx
  } else if (curMsg.open > curMsg.close) {
    startY = cHeight - xHeight - 15 - (curMsg.open - min) * yNumpx
    endY = cHeight - xHeight - 15 - (curMsg.close - min) * yNumpx
  } else {
    startY = cHeight - xHeight - 15 - (curMsg.open - min) * yNumpx
    endY = cHeight - xHeight - 15 - (curMsg.close - min) * yNumpx
  }
  startX = 15 + (20 + 5) * i
  endX = startX + 20
  // 绘制border
  ctx.beginPath()
  ctx.setStrokeStyle('#333')
  ctx.setLineWidth(2)
  ctx.strokeRect(startX, startY, (endX - startX), (endY - startY))
  ctx.closePath()
  ctx.stroke()

  // 绘制直线
  ctx.beginPath()
  ctx.setStrokeStyle('#333')
  ctx.setLineWidth(0.5)
  ctx.moveTo(startX + 10, cHeight - xHeight)
  ctx.lineTo(startX + 10, 0)
  ctx.closePath()
  ctx.stroke()
  // 绘制时间
  if (!isScroll) {
    const tw = ctx.measureText(curMsg.day).width
    ctx.beginPath()
    ctx.setFillStyle('#333')
    ctx.fillRect(startX + 10 - 12.5 - tw / 2, cHeight - xHeight + 5, tw + 25, 15)
    ctx.closePath()
    ctx.stroke()

    ctx.beginPath()
    ctx.setFontSize(12)
    ctx.setFillStyle('#ffffff')
    ctx.fillText(curMsg.day, startX + 10 - tw / 2, cHeight - xHeight + 17)
    ctx.closePath()
    ctx.stroke()
  }

  ctx.draw()
}

function forDrawKLine (i, ctx, yNumpx, open, close, high, low, startX, startY, endX, endY, lowpx, highpx, cHeight, xHeight, min, max) {
  ctx.beginPath()
  if (open < close) {
    // 上涨
    ctx.setFillStyle('#e64340')
    ctx.setStrokeStyle('#e64340')
    startY = cHeight - xHeight - 15 - (close - min) * yNumpx
    endY = cHeight - xHeight - 15 - (open - min) * yNumpx
  } else if (open > close) {
    // 下跌
    ctx.setFillStyle('#09bb07')
    ctx.setStrokeStyle('#09bb07')
    startY = cHeight - xHeight - 15 - (open - min) * yNumpx
    endY = cHeight - xHeight - 15 - (close - min) * yNumpx
  } else {
    // 平
    ctx.setFillStyle('#666')
    ctx.setStrokeStyle('#666')
    startY = cHeight - xHeight - 15 - (open - min) * yNumpx
    endY = cHeight - xHeight - 15 - (close - min) * yNumpx
  }
  startX = 15 + (20 + 5) * i
  endX = startX + 20
  highpx = cHeight - xHeight - 15 - (high - min) * yNumpx
  lowpx = cHeight - xHeight - 15 - (low - min) * yNumpx
  ctx.fillRect(startX, startY, endX - startX, endY - startY)
  ctx.setLineDash(0)
  ctx.setLineWidth(0.5)
  ctx.moveTo(startX + 10, highpx)
  ctx.lineTo(startX + 10, lowpx)
  ctx.closePath()
  ctx.stroke()
}

function getLimit (min, max) {
  return (max - min) / 4
}

module.exports = {
  onDrawYAxis,
  onDrawXAxis,
  onDrawKLines,
  onDrawLineBorder
}
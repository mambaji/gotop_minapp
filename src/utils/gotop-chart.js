var Basic = {
  OrignDatas: {

  },
  curMsgContainerHeight: 10,
  yAxisWidth: 50,
  xAxisHeight: 20,
  chartPd: 10,
  kLineWidth: 15,
  kLineMarginRight: 10,
  signWidth: 20,
  canvasPaddingLeft: 10,
  signR: 10,
  upColor: '#e64340',
  downColor: '#09bb07',
  buySignBg: '#F99DA0',
  sellSignBg: '#84D0A1',
  volUpColor: 'rgba(38,166,154,0.5)',
  volDownColor: 'rgba(239,83,80,0.5)',
}

function QTChart () {
  this.isDrag = false
  this.MoveStartX = null
  this.MoveEndX = null
  this.MouseDrag
  this.StepPixel = 4
  this.FrameToolIds = [] //frame tool 的ID集
  this.ChartObjArray = []

  this.BindEvents = function () {
  }
  // 窗口初始化
  this.OnSize = function (height, width) {
    //画布大小通过div获取
    Basic.width = width
    Basic.height = height
  }
  // 设置配置
  this.SetOption = function (options) {
    this.Canvas = options.canvas
    this.OptCanvas = options.optCanvas
    this.ChartArray = options.chartArray.sort(sortBy('index'))
    this.CalCHeightRatio()
    var canvasHeight = Basic.height
    var addHeight = 0
    // 计算各个图表在Canvas中的位置坐标
    for (var j in this.ChartArray) {
      Basic.OrignDatas[this.ChartArray[j].name] = this.ChartArray[j].datas
      this.ChartArray[j].cHeight = (canvasHeight - Basic.xAxisHeight) * this.ChartArray[j].cHeightRatio
      this.ChartArray[j].cStartX = 0
      this.ChartArray[j].cStartY = addHeight
      this.ChartArray[j].cEndX = Basic.width
      this.ChartArray[j].cEndY = this.ChartArray[j].cHeight + addHeight
      addHeight += this.ChartArray[j].cHeight
    }
    this.CalSceenKNum()
    this.DataPreIndex = Basic.OrignDatas.kline.length - Math.floor(Basic.ScreenKNum)
    this.DataCurIndex = Basic.OrignDatas.kline.length - 1
    this.SplitDatas(this.DataPreIndex, this.DataCurIndex)
    this.Draw()
  }
  this.AddChart = function (option) {
    option.index = this.ChartArray.length
    Basic.OrignDatas[option.name] = option.datas
    this.ChartArray.push(option)
    this.CalCHeightRatio()
    var canvasHeight = Basic.height
    var addHeight = 0
    for (var j in this.ChartArray) {
      this.ChartArray[j].cHeight = (canvasHeight - Basic.xAxisHeight) * this.ChartArray[j].cHeightRatio
      this.ChartArray[j].cStartX = 0
      this.ChartArray[j].cStartY = addHeight
      this.ChartArray[j].cEndX = Basic.width
      this.ChartArray[j].cEndY = this.ChartArray[j].cHeight + addHeight
      addHeight += this.ChartArray[j].cHeight
    }
    this.DelFrameTool()
    this.CreateFrameTool()
    this.CalSceenKNum()
    this.DataPreIndex = this.DataCurIndex + 1 - Math.floor(Basic.ScreenKNum)
    this.SetUpdate()
  }
  this.RemoveChart = function (option) {
    this.ChartArray.splice(option.index, 1)
    this.CalCHeightRatio()
    var canvasHeight = Basic.height
    var addHeight = 0
    for (var j in this.ChartArray) {
      this.ChartArray[j].cHeight = (canvasHeight - Basic.xAxisHeight) * this.ChartArray[j].cHeightRatio
      this.ChartArray[j].cStartX = 0
      this.ChartArray[j].cStartY = addHeight
      this.ChartArray[j].cEndX = Basic.width
      this.ChartArray[j].cEndY = this.ChartArray[j].cHeight + addHeight
      addHeight += this.ChartArray[j].cHeight
    }
    this.DelFrameTool()
    this.CreateFrameTool()
    this.CalSceenKNum()
    this.DataPreIndex = this.DataCurIndex + 1 - Math.floor(Basic.ScreenKNum)
    this.OptCanvas.clearRect(0, 0, Basic.width, Basic.height)
    this.SetUpdate()
  }
  this.CalCHeightRatio = function () {
    var kratio = 1 / this.ChartArray.length * 2
    var oratio = (1 - kratio) / (this.ChartArray.length - 1)
    for (var i in this.ChartArray) {
      if (this.ChartArray[i].name == 'kline') {
        kratio == 1 ? (this.ChartArray[i]['cHeightRatio'] = 0.7) : (this.ChartArray[i]['cHeightRatio'] = kratio)
        kratio == 2 && (this.ChartArray[i]['cHeightRatio'] = 1)
      } else {
        kratio == 1 ? (this.ChartArray[i]['cHeightRatio'] = 0.3) : (this.ChartArray[i]['cHeightRatio'] = oratio)
      }
    }
  }
  // 客户端窗口改动
  this.SetOnSizeChange = function () {
    var canvasHeight = Basic.height
    var addHeight = 0
    for (var j in this.ChartArray) {
      this.ChartArray[j].cHeight = (canvasHeight - Basic.xAxisHeight) * this.ChartArray[j].cHeightRatio
      this.ChartArray[j].cStartX = 0
      this.ChartArray[j].cStartY = addHeight
      this.ChartArray[j].cEndX = Basic.width
      this.ChartArray[j].cEndY = this.ChartArray[j].cHeight + addHeight
      addHeight += this.ChartArray[j].cHeight
    }
    this.DelFrameTool()
    this.CreateFrameTool()
    this.CalSceenKNum()
    this.DataPreIndex = this.DataCurIndex + 1 - Math.floor(Basic.ScreenKNum)
    // this.DataCurIndex = Basic.OrignDatas.kline.length - 1
    this.SetUpdate()
  }
  // 数据截取
  this.SplitDatas = function (pre, cur) {
    for (var i in this.ChartArray) {
      if (!cur || cur >= Basic.OrignDatas.kline.length - 1) {
        this.ChartArray[i].datas = Basic.OrignDatas[this.ChartArray[i].name].slice(pre)
      } else if (pre >= 0) {
        this.ChartArray[i].datas = Basic.OrignDatas[this.ChartArray[i].name].slice(pre, cur + 1)
      }
    }
  }
  // 计算当前屏幕可容纳多少根k线
  this.CalSceenKNum = function () {
    Basic.ScreenKNum = Math.floor((Basic.width - Basic.yAxisWidth - Basic.canvasPaddingLeft) / (Basic.kLineWidth + Basic.kLineMarginRight))
  }
  // 更新画布
  this.SetUpdate = function () {
    this.SplitDatas(this.DataPreIndex, this.DataCurIndex)
    this.Canvas.clearRect(0, 0, Basic.width, Basic.height)
    // this.OptCanvas.clearRect(0, 0, Basic.width, Basic.height) //这里不能加，不然导致拖动的时候curMsg没有显示
    for (var i in this.ChartArray) {
      switch (this.ChartArray[i].name) {
        case 'kline':
          this.xAxisChart.SetUpdateXAxis(this.ChartArray[i])
          this.ChartArray[i].yRange = this.kLineChart.SetUpdateKLineChart(this.ChartArray[i])
          this.kLineChart.DrawCurBorder(this.OptCanvas, Basic.ScreenKNum)
          break;
        case 'vol':
          this.ChartArray[i].yRange = this.volChart.SetUpdateVol(this.ChartArray[i])
          break;
        case 'macd':
          this.ChartArray[i].yRange = this.macdChart.SetUpdateMACDChart(this.ChartArray[i])
      }
    }
    this.Canvas.draw()
  }
  // 鼠标拖动
  this.OnMouseMove = function (moveStep) {
    var pre = this.DataPreIndex
    var cur = this.DataCurIndex
    moveStep = parseInt(moveStep / 4)
    if (moveStep == 0) return
    var step = Math.abs(moveStep)
    if (moveStep > 0) {
      // 画布向右拖动，数据往左移动
      pre != 0 && (pre -= step, cur -= step)
    } else if (moveStep < 0) {
      // 画布向左拖动，数据往右移动
      cur != Basic.OrignDatas.kline.length - 1 && (cur += step, pre += step)
    }
    this.DataPreIndex = pre
    this.DataCurIndex = cur
    this.SetUpdate()
  }
  // 事件监听
  var _self = this
  this.onTouchMove = function (x, y) {
    // _self.onDrawCursor(x, y)
    if (!this.isDrag) {
      return
    }
    var moveStep = parseInt(x - this.MoveStartX);
    if (Math.abs(moveStep) < 5) return;
    _self.OnMouseMove(moveStep)
    this.MoveStartX = x
    return this.ChartArray[0].datas[Basic.ScreenKNum - 1]
  }
  this.onTouchStart = function (x, y) {
    this.isDrag = true
    this.MoveStartX = x
  }
  this.onTouchEnd = function (x, y) {
    this.isDrag = false
  }

  //判断是单个手指
  this.IsPhoneDragging = function (e) {
    // console.log(e);
    var changed = e.changedTouches.length;
    var touching = e.touches.length;

    return changed == 1 && touching == 1;
  }

  //是否是2个手指操所
  this.IsPhonePinching = function (e) {
    var changed = e.changedTouches.length;
    var touching = e.touches.length;

    return (changed == 1 || changed == 2) && touching == 2;
  }
  // this.OptCanvas.onmousewheel = function (e) {
  //   _self.onKLineScale(e.wheelDelta)
  // }

  // 开始绘制
  this.Draw = function () {
    for (var i in this.ChartArray) {
      switch (this.ChartArray[i].name) {
        case 'kline':
          var xAxisChart = new XAxis(this.Canvas, this.ChartArray[i])
          var kLineChart = new KLinesChart(this.Canvas, this.ChartArray[i])
          this.xAxisChart = xAxisChart
          this.kLineChart = kLineChart
          this.ChartObjArray.push(this.kLineChart)
          this.xAxisChart.Create()
          this.ChartArray[i].yRange = this.kLineChart.Create()
          break;
        case 'vol':
          var volChart = new VolChart(this.Canvas, this.ChartArray[i])
          this.volChart = volChart
          this.ChartObjArray.push(this.volChart)
          this.ChartArray[i].yRange = this.volChart.Create()
          break;
        case 'macd':
          var macdChart = new MACDChart(this.Canvas, this.ChartArray[i])
          this.macdChart = macdChart
          this.ChartObjArray.push(this.macdChart)
          this.ChartArray[i].yRange = this.macdChart.Create()
          break;
      }
    }
    this.Canvas.draw()
  }
  this.onSelectKLine = function (x, y) {
    // 当前光标所处的K线位置
    let kn = Math.ceil(
      (x - Basic.canvasPaddingLeft) /
      (Basic.kLineWidth + Basic.kLineMarginRight)
    )
    if (kn > this.ChartArray[0].datas.length) {
      kn = this.ChartArray[0].datas.length
    } else if (kn <= 0) {
      kn = 1
    }
    this.kLineChart.DrawCurBorder(this.OptCanvas, kn)
    return this.ChartArray[0].datas[kn - 1]
  }
  // 绘制十字 光标
  this.onDrawCursor = function (x, y) {
    // 当前光标所处的K线位置
    let kn = Math.ceil(
      (x - Basic.canvasPaddingLeft) /
      (Basic.kLineWidth + Basic.kLineMarginRight)
    )
    if (kn > this.ChartArray[0].datas.length) {
      kn = this.ChartArray[0].datas.length
    } else if (kn <= 0) {
      kn = 1
    }
    var cursorX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * kn - Basic.kLineMarginRight - Basic.kLineWidth / 2
    let chartConfig = null
    for (let i in this.ChartArray) {
      if (y > this.ChartArray[i].cStartY && y < this.ChartArray[i].cEndY) {
        chartConfig = this.ChartArray[i]
      }
    }
    if (!chartConfig) {
      return
    }
    let unitPxNum = (chartConfig.yRange.maxData - chartConfig.yRange.minData) / (chartConfig.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) // 每单位PX占多大值
    let yNum = ((chartConfig.cEndY - y - Basic.chartPd) * unitPxNum + chartConfig.yRange.minData).toFixed(2)
    if (chartConfig.yRange.isBig) {
      yNum = (yNum / 1000).toFixed(3) + 'k'
    }
    // 绘制虚线
    this.OptCanvas.clearRect(0, 0, Basic.width, Basic.height)
    this.OptCanvas.beginPath()
    this.OptCanvas.setStrokeStyle('#666')
    this.OptCanvas.setLineWidth(1)
    this.OptCanvas.setLineDash([5, 5])
    this.OptCanvas.moveTo(ToFixedPoint(cursorX), 0)
    this.OptCanvas.lineTo(ToFixedPoint(cursorX), ToFixedPoint(Basic.height - Basic.xAxisHeight))

    this.OptCanvas.moveTo(0, ToFixedPoint(y))
    this.OptCanvas.lineTo(ToFixedPoint(Basic.width - Basic.yAxisWidth), ToFixedPoint(y))
    this.OptCanvas.stroke()
    this.OptCanvas.closePath()

    // 绘制X轴的时间标识
    this.OptCanvas.setFontSize(12)
    Basic.curKIndex = kn - 1
    var curKMsg = this.ChartArray[0].datas[kn - 1]
    var tw = this.OptCanvas.measureText(curKMsg.day).width

    this.OptCanvas.setFillStyle('#333')
    this.OptCanvas.fillRect(x - tw / 2 - 10, Basic.height - Basic.xAxisHeight + 5, tw + 20, 15)

    this.OptCanvas.setFillStyle('#fff')
    this.OptCanvas.fillText(curKMsg.day, x - tw / 2, Basic.height - Basic.xAxisHeight + 17)

    var ytw = this.OptCanvas.measureText(yNum).width
    // 绘制Y轴的值标识
    this.OptCanvas.setFillStyle('#333')
    this.OptCanvas.fillRect(Basic.width - Basic.yAxisWidth, y - 10, ytw + 20, 20)

    this.OptCanvas.beginPath()
    this.OptCanvas.setFontSize(12)
    this.OptCanvas.setFillStyle('#fff')
    this.OptCanvas.fillText(yNum, Basic.width - Basic.yAxisWidth + 5, y + 5)
    this.OptCanvas.closePath()

    for (let a in this.ChartArray) {
      if (this.ChartArray[a].datas instanceof Array) {
        let o = {}
        o = this.ChartArray[a].datas[Basic.curKIndex]
        this.ChartArray[a].curMsg = o
      } else if (this.ChartArray[a].datas instanceof Object) {
        let o = {}
        for (let b in this.ChartArray[a].datas) {
          o[b] = (this.ChartArray[a].datas[b][Basic.curKIndex]).toFixed(2)
        }
        this.ChartArray[a].curMsg = o
      }
    }
    this.onDrawCurMsg()
  }
  // 绘制当前光标位置 具体信息
  this.onDrawCurMsg = function () {
    for (let c in this.ChartArray) {
      switch (this.ChartArray[c].name) {
        case 'kline':
          this.kLineChart.DrawCurMsg(this.OptCanvas, this.ChartArray[c])
          break;
        case 'vol':
          this.volChart.DrawCurMsg(this.OptCanvas, this.ChartArray[c])
          break;
        case 'macd':
          this.macdChart.DrawCurMsg(this.OptCanvas, this.ChartArray[c])
          break;
      }
    }
    this.OptCanvas.draw()
  }
  // 图表缩放
  this.onKLineScale = function (type) {
    if (type >= 0) {
      Basic.kLineWidth += 2
      Basic.kLineMarginRight += 1
      Basic.kLineWidth > 40 && (Basic.kLineWidth = 40)
      Basic.kLineMarginRight > 30 && (Basic.kLineMarginRight = 30)
    } else {
      Basic.kLineWidth -= 2
      Basic.kLineMarginRight -= 1
      Basic.kLineWidth < 6 && (Basic.kLineWidth = 6)
      Basic.kLineMarginRight < 2 && (Basic.kLineMarginRight = 2)
    }
    this.CalSceenKNum()
    this.DataPreIndex = this.DataCurIndex + 1 - Math.floor(Basic.ScreenKNum)
    this.SetUpdate()
  }
}


/**
 * @desc K线组件
 * @param {画布} canvas 
 * @param {配置} option 
 */
function KLinesChart (canvas, option) {
  this.Canvas = canvas
  this.Option = option
  this.Datas = option.datas
  this.YNumpx = 0
  this.StartX = 0
  this.StartY = 0
  this.EndX = 0
  this.EndY = 0
  this.YAxisChart
  this.turnStatus = ""
  this.maxLow = {
  }
  this.maxTop = {
  }
  this.drawTopLowPoint = {
  }
  // 创建K线图表
  this.Create = function () {
    this.YAxisChart = new YAxis(this.Canvas, this.Option)
    this.YAxisChart.Create('low', 'high')
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawKLines(i, parseFloat(this.Datas[i].open), parseFloat(this.Datas[i].close), parseFloat(this.Datas[i].high), parseFloat(this.Datas[i].low))
      this.Datas[i].signal && this.Datas[i].signal.type != "" && this.DrawTradeSign(i, this.Datas[i])
      if (this.Datas[i]['status'] != '' && this.Datas[i]['status'] == 'ding') {
        if (this.turnStatus == 'di' || this.turnStatus == '') {
          this.turnStatus == 'di' && this.DrawTopLowLine() // +绘制
          this.maxTop.value = this.Datas[i].high
          this.maxTop.index = i
          this.turnStatus == 'ding'
        } else if (this.turnStatus == 'ding') {
          this.setMaxValue(this.Datas[i].high)
        }
      } else if (this.Datas[i]['status'] != '' && this.Datas[i]['status'] == 'di') {
        if (this.turnStatus == 'ding' || this.turnStatus == '') {
          this.turnStatus == 'ding' && this.DrawTopLowLine() // +绘制
          this.maxLow.value = this.Datas[i].low
          this.maxLow.index = i
          this.turnStatus == 'low'
        } else if (this.turnStatus == 'di') {
          this.setMaxValue(this.Datas[i].low)
        }
      }
    }
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }
  // 绘制当前信息
  this.DrawCurMsg = function (canvas, option) {
    let curMsg = option.curMsg
    let text = option.goodsName + ':' + curMsg.day + " " + '开=' + curMsg.open + ',' + '收=' + curMsg.close + ',' + '高=' + curMsg.high + ',' + '低=' + curMsg.low + ',' + '量=' + curMsg.volume
    canvas.setLineDash([0])
    canvas.setStrokeStyle('#cdcdcd')
    canvas.setFillStyle('#f2faff')
    canvas.strokeRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.fillRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.beginPath()
    canvas.setFontSize(18)
    canvas.setFillStyle("#333")
    canvas.fillText(text, option.cStartX + 40, option.cStartY + 20)
    canvas.closePath()
    canvas.stroke()
  }
  // 绘制K线图
  this.DrawKLines = function (i, open, close, high, low) {
    var startX, startY, endX, endY, lowpx, highpx
    this.Canvas.beginPath()
    if (open < close) {
      // 上涨
      this.Canvas.setFillStyle(Basic.upColor)
      this.Canvas.setStrokeStyle(Basic.upColor)
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (close - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    } else if (open > close) {
      // 下跌
      this.Canvas.setFillStyle(Basic.downColor)
      this.Canvas.setStrokeStyle(Basic.downColor)
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (close - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    } else {
      // 平
      this.Canvas.setFillStyle('#666')
      this.Canvas.setStrokeStyle('#666')
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    }
    startX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i + this.Option.cStartX
    endX = startX + Basic.kLineWidth
    highpx = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (high - this.YAxisChart.MinDatas) * this.YNumpx + this.Option.cStartY + Basic.curMsgContainerHeight
    lowpx = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (low - this.YAxisChart.MinDatas) * this.YNumpx + this.Option.cStartY + Basic.curMsgContainerHeight
    var h = endY - startY
    h < 1 && (h = 1)
    h == 0 && (h = 1)
    this.Canvas.fillRect(ToFixedRect(startX), ToFixedRect(startY), ToFixedRect(endX - startX), ToFixedRect(h))
    // config.basic.mainctx.setLineDash(0)
    this.Canvas.setLineWidth(1)
    this.Canvas.moveTo(ToFixedPoint(startX + Basic.kLineWidth / 2), ToFixedPoint(highpx))
    this.Canvas.lineTo(ToFixedPoint(startX + Basic.kLineWidth / 2), ToFixedPoint(lowpx))
    this.Canvas.stroke()
    this.Canvas.closePath()

  }
  // 绘制K线信号
  this.DrawTradeSign = function (i, curMsg) {
    this.Canvas.beginPath()
    let centerX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i + (Basic.kLineWidth / 2) + this.Option.cStartX
    let centerY = 0
    let r = Basic.signR
    let signType
    if (curMsg.signal.type === 'buy') {
      signType = '买'
      centerY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.low - this.YAxisChart.MinDatas) * this.YNumpx + r + this.Option.cStartY + Basic.curMsgContainerHeight
      this.Canvas.setFillStyle(Basic.buySignBg)
    } else {
      signType = '卖'
      centerY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.high - this.YAxisChart.MinDatas) * this.YNumpx - r + this.Option.cStartY + Basic.curMsgContainerHeight
      this.Canvas.setFillStyle(Basic.sellSignBg)
    }
    this.Canvas.arc(centerX, centerY, r, 0, 2 * Math.PI)
    this.Canvas.fill()

    this.Canvas.beginPath()
    this.Canvas.setFontSize(10)
    this.Canvas.setFillStyle('#fff')
    this.Canvas.fillText(signType, (centerX - r / 2), centerY + r / 2.8)
    this.Canvas.stroke()
    this.Canvas.closePath()

    this.Canvas.beginPath()
    this.Canvas.setFontSize(10)
    this.Canvas.setFillStyle('#333')
    this.Canvas.fillText(curMsg.signal.price, centerX - r, curMsg.signal.type === 'buy' ? centerY + r + 15 : centerY - r - 5)
    this.Canvas.stroke()
    this.Canvas.closePath()
  }

  this.DrawCurBorder = function (optCanvas, kn) {
    var startX, startY, endX, endY, closeY
    var curMsg = this.Datas[kn - 1]
    optCanvas.beginPath()
    if (curMsg.open < curMsg.close) {
      // 上涨
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.close - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    } else if (curMsg.open > curMsg.close) {
      // 下跌
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.close - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    } else {
      // 平
      startY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
      endY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.open - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    }
    startX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * (kn - 1) + this.Option.cStartX
    endX = startX + Basic.kLineWidth
    closeY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (curMsg.close - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    // 绘制虚线
    optCanvas.clearRect(0, 0, Basic.width, Basic.height)

    optCanvas.beginPath()
    optCanvas.setStrokeStyle('#666')
    optCanvas.setLineWidth(1)
    optCanvas.setLineDash([5, 5])
    optCanvas.moveTo(ToFixedPoint(startX + Basic.kLineWidth / 2), 0)
    optCanvas.lineTo(ToFixedPoint(startX + Basic.kLineWidth / 2), ToFixedPoint(Basic.height - Basic.xAxisHeight))

    optCanvas.moveTo(0, ToFixedPoint(closeY))
    optCanvas.lineTo(ToFixedPoint(Basic.width - Basic.yAxisWidth), ToFixedPoint(closeY))
    optCanvas.stroke()
    optCanvas.closePath()

    // 绘制border
    optCanvas.beginPath()
    optCanvas.setStrokeStyle('#333')
    optCanvas.setLineWidth(2)
    optCanvas.setLineDash([0])
    optCanvas.strokeRect(ToFixedPoint(startX), ToFixedPoint(startY), ToFixedPoint((endX - startX)), ToFixedPoint((endY - startY)))
    optCanvas.closePath()
    optCanvas.stroke()

    // 绘制X轴的时间标识
    optCanvas.setFontSize(12)
    Basic.curKIndex = kn - 1
    var tw = optCanvas.measureText(curMsg.day).width

    optCanvas.setFillStyle('#333')
    optCanvas.fillRect(startX + Basic.kLineWidth / 2 - tw / 2 - 10, Basic.height - Basic.xAxisHeight + 5, tw + 20, 15)

    optCanvas.setFillStyle('#fff')
    optCanvas.fillText(curMsg.day, startX + Basic.kLineWidth / 2 - tw / 2, Basic.height - Basic.xAxisHeight + 17)

    var ytw = optCanvas.measureText(curMsg.close).width
    // 绘制Y轴的值标识
    optCanvas.setFillStyle('#333')
    optCanvas.fillRect(Basic.width - Basic.yAxisWidth, closeY - 10, ytw + 20, 20)

    optCanvas.beginPath()
    optCanvas.setFontSize(12)
    optCanvas.setFillStyle('#fff')
    optCanvas.fillText(curMsg.close, Basic.width - Basic.yAxisWidth + 5, closeY + 5)
    optCanvas.closePath()
    optCanvas.stroke()
    optCanvas.draw()
  }

  this.DrawTopLowLine = function () {
    tstartX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * this.drawTopLowPoint.top.index + this.Option.cStartX
    tstartY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (this.drawTopLowPoint.top.value - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    lstartX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * this.drawTopLowPoint.low.index + this.Option.cStartX
    lstartY = this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd - (this.drawTopLowPoint.low.value - this.YAxisChart.MinDatas) * this.YNumpx + Basic.curMsgContainerHeight + this.Option.cStartY
    this.Canvas.beiginPath()
    this.Canvas.setStrokeStyle('#666')
    this.Canvas.setLineWidth(1)
    this.Canvas.moveTo(ToFixedPoint(tstartX), ToFixedPoint(tstartY))
    this.Canvas.lineTo(ToFixedPoint(lstartX), ToFixedPoint(lstartY))
    this.Canvas.stroke()
    this.Canvas.closePath()
  }

  this.setMaxValue = function (i, value) {
    if (this.turnStatus == 'ding') {
      if (value >= this.maxTop.value) {
        this.maxTop.value = value
        this.maxTop.index = i
        this.drawTopLowPoint.top = this.maxTop
      }
    } else if (this.turnStatus == 'di') {
      if (value <= this.maxLow.value) {
        this.maxLow.value = value
        this.maxLow.index = i
        this.drawTopLowPoint.low = this.maxLow
      }
    }
  }
  // 更新K线图表
  this.SetUpdateKLineChart = function (option) {
    this.Option = option
    this.Datas = option.datas
    // this.Canvas.clearRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, option.cEndY - option.cStartY)
    this.YAxisChart.SetUpdateYAxis(this.Option)
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawKLines(i, parseFloat(this.Datas[i].open), parseFloat(this.Datas[i].close), parseFloat(this.Datas[i].high), parseFloat(this.Datas[i].low))
      this.Datas[i].signal && this.Datas[i].signal.type != "" && this.DrawTradeSign(i, this.Datas[i])
    }
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }
}

/**
 * vol 量图组件
 * @param {画布} canvas 
 * @param {配置} option 
 */
function VolChart (canvas, option) {
  this.Canvas = canvas
  this.Option = option
  this.Datas = option.datas
  this.YNumpx = 0
  this.StartX = 0
  this.StartY = 0
  this.EndX = 0
  this.EndY = 0
  this.Create = function () {
    this.YAxisChart = new YAxis(this.Canvas, this.Option)
    this.YAxisChart.Create('volume')
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawVols(i, this.YNumpx, parseFloat(this.Datas[i].volume), parseFloat(this.Datas[i].open), parseFloat(this.Datas[i].close), this.StartX, this.StartY, this.EndX, this.EndY)
    }
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }

  this.DrawVols = function (i, yNumpx, vol, open, close, startX, startY, endX, endY) {
    this.Canvas.beginPath()
    if (open < close) {
      this.Canvas.setFillStyle(Basic.volUpColor)
    } else if (open > close) {
      this.Canvas.setFillStyle(Basic.volDownColor)
    }
    startX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i + this.Option.cStartX - Basic.kLineMarginRight / 2 + 1
    endX = startX + Basic.kLineWidth + Basic.kLineMarginRight - 1
    startY = this.Option.cHeight - ((vol - this.YAxisChart.MinDatas) * yNumpx) - Basic.chartPd + this.Option.cStartY
    endY = this.Option.cEndY - Basic.chartPd
    this.Canvas.fillRect(ToFixedRect(startX), ToFixedRect(startY), ToFixedRect(endX - startX), ToFixedRect(endY - startY))
    this.Canvas.stroke()
    this.Canvas.closePath()
  }

  // 绘制当前信息
  this.DrawCurMsg = function (canvas, option) {
    let curMsg = option.curMsg
    let text = 'Volume  ' + curMsg.volume
    canvas.setLineDash([0])
    canvas.setStrokeStyle('#cdcdcd')
    canvas.setFillStyle('#f2faff')
    canvas.strokeRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.fillRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.beginPath()
    canvas.setFontSize(18)
    canvas.setFillStyle("#333")
    canvas.fillText(text, option.cStartX + 40, option.cStartY + 20)
    canvas.closePath()
    // canvas.stroke()
  }

  this.SetUpdateVol = function (option) {
    this.Option = option
    this.Datas = option.datas
    this.YAxisChart.SetUpdateYAxis(this.Option)
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawVols(i, this.YNumpx, parseFloat(this.Datas[i].volume), parseFloat(this.Datas[i].open), parseFloat(this.Datas[i].close), this.StartX, this.StartY, this.EndX, this.EndY)
    }
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }
}

/**
 * MACD 组件
 * @param {画布} cavnas 
 * @param {配置} option 
 */
function MACDChart (canvas, option) {
  this.Canvas = canvas
  this.Option = option
  this.Datas = option.datas
  this.StartX = 0
  this.StartY = 0
  this.EndX = 0
  this.EndY = 0

  this.Create = function () {
    this.YAxisChart = new YAxis(this.Canvas, this.Option)
    this.YAxisChart.Create('DIFF', 'MACD', 'DEA')
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    let zeroY = null
    if (this.YAxisChart.MinDatas < 0) {
      zeroY = this.Option.cEndY - Math.abs(this.YAxisChart.MinDatas * this.YNumpx) - Basic.chartPd
    }
    this.Option.zeroY = zeroY
    this.DrawMACD()
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }

  this.SetUpdateMACDChart = function (option) {
    this.Option = option
    this.Datas = option.datas
    this.YAxisChart.SetUpdateYAxis(this.Option)
    this.YNumpx = (this.Option.cHeight - Basic.curMsgContainerHeight - Basic.chartPd) / (this.YAxisChart.MaxDatas - this.YAxisChart.MinDatas)
    let zeroY = null
    if (this.YAxisChart.MinDatas < 0) {
      zeroY = this.Option.cEndY - Math.abs(this.YAxisChart.MinDatas * this.YNumpx) - Basic.chartPd
    }
    this.Option.zeroY = zeroY
    this.DrawMACD()
    let range = {
      minData: this.YAxisChart.MinDatas,
      maxData: this.YAxisChart.MaxDatas
    }
    return range
  }

  // 绘制当前信息
  this.DrawCurMsg = function (canvas, option) {
    let curMsg = option.curMsg
    let text = 'MACD  ' + 'DIF:' + curMsg['DIFF'].toFixed(2) + ',DEA:' + curMsg['DEA'].toFixed(2) + ',MACD:' + curMsg['MACD'].toFixed(2)
    canvas.setLineDash([0])
    canvas.setStrokeStyle('#cdcdcd')
    canvas.setFillStyle('#f2faff')
    canvas.strokeRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.fillRect(option.cStartX, option.cStartY, option.cEndX - option.cStartX, Basic.curMsgContainerHeight / 2)
    canvas.beginPath()
    canvas.setFontSize(18)
    canvas.setFillStyle("#333")
    canvas.fillText(text, option.cStartX + 40, option.cStartY + 20)
    canvas.closePath()
    // canvas.stroke()
  }

  this.DrawMACD = function () {
    // 绘制zero线
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle('#333')
    this.Canvas.setLineWidth(1)
    this.Canvas.moveTo(0, this.Option.zeroY)
    this.Canvas.lineTo(this.Option.cEndX - Basic.yAxisWidth, this.Option.zeroY)
    this.Canvas.stroke()
    this.Canvas.closePath()
    // 绘制DIFF 
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle(this.Option.style['DIFF'])
    this.Canvas.setLineWidth(1)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawCurve(i, 'DIFF')
    }
    this.Canvas.stroke()
    this.Canvas.closePath()
    // 绘制DEA
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle(this.Option.style['DEA'])
    this.Canvas.setLineWidth(1)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawCurve(i, 'DEA')
    }
    this.Canvas.stroke()
    this.Canvas.closePath()
    // 绘制MACD
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle(this.Option.style['MACD'])
    this.Canvas.setLineWidth(2)
    for (var i = 0, j = this.Datas.length; i < j; i++) {
      this.DrawVerticalLine(i, 'MACD')
    }
    this.Canvas.stroke()
    this.Canvas.closePath()
  }

  this.DrawCurve = function (i, attrName) {
    this.StartX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i + Basic.kLineWidth / 2 + this.Option.cStartX
    if (parseFloat(this.Datas[i][attrName]) >= 0) {
      this.Option.zeroY != null ? this.StartY = this.Option.zeroY - (parseFloat(this.Datas[i][attrName]) * this.YNumpx) : this.StartY = this.Option.cEndY - (parseFloat(this.Datas[i][attrName]) * yNumpx) - Basic.chartPd
    } else {
      this.StartY = this.Option.zeroY + (Math.abs(parseFloat(this.Datas[i][attrName]) * this.YNumpx))
    }
    if (i === 0) {
      this.Canvas.moveTo(this.StartX, this.StartY)
    }
    this.Canvas.lineTo(this.StartX, this.StartY)
  }

  this.DrawVerticalLine = function (i, attrName) {
    this.StartX = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i + Basic.kLineWidth / 2 + this.Option.cStartX
    if (parseFloat(this.Datas[i][attrName]) >= 0) {
      this.Option.zeroY != null ? this.StartY = this.Option.zeroY - (parseFloat(this.Datas[i][attrName]) * this.YNumpx) : this.StartY = this.Option.cEndY - (parseFloat(this.Datas[i][attrName]) * yNumpx) - Basic.chartPd
    } else {
      this.StartY = this.Option.zeroY + (Math.abs(parseFloat(this.Datas[i][attrName]) * this.YNumpx))
    }
    this.Canvas.moveTo(this.StartX, this.StartY)
    this.Canvas.lineTo(this.StartX, this.Option.zeroY)
  }

}
// Y轴画法
function YAxis (canvas, option) {
  this.Canvas = canvas
  this.StartX = option.cEndX - Basic.yAxisWidth
  this.StartY = option.cStartY + Basic.curMsgContainerHeight
  this.EndX = option.cEndX
  this.EndY = option.cEndY - Basic.chartPd
  this.Datas = option.datas
  this.YPoints = []
  this.YTexts = []
  this.MinDatas
  this.MaxDatas
  this.isBigNum // 判断值是否大于5位数，大于5位数 值 在展示的时候末尾要加上 k

  this.Create = function (...attrs) {
    this.attrs = attrs
    this.SetValueRange()
    this.Draw()
  }

  this.SetValueRange = function () {
    this.YPoints = []
    // 处理两种数据类型
    let datas = this.Datas
    let attrs = this.attrs
    let minArray = []
    let maxArray = []
    let minData, maxData
    if (datas instanceof Array) {
      for (let i in attrs) {
        minData = Math.min.apply(
          Math,
          datas.map(function (o) {
            return (parseFloat(o[attrs[i]]))
          })
        )
        maxData = Math.max.apply(
          Math,
          datas.map(function (o) {
            return (parseFloat(o[attrs[i]]))
          })
        )
        minArray.push(minData)
        maxArray.push(maxData)
      }
      this.MinDatas = Math.min.apply(
        Math, minArray.map(function (o) { return o })
      )
      this.MaxDatas = Math.max.apply(
        Math, maxArray.map(function (o) { return o })
      )
    } else {
      var dataArray = []
      for (var i in datas) {
        for (var j in datas[i]) {
          dataArray.push(datas[i][j])
        }
      }
      this.MinDatas = Math.min.apply(
        Math, dataArray.map(function (o) { return o })
      )
      this.MaxDatas = Math.max.apply(
        Math, dataArray.map(function (o) { return o })
      )
    }

    var fixArray = [1, 0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001]
    // 判断值是否大于等于6位数，是的话 以 k 为单位
    if (((Math.ceil(this.MaxDatas)).toString().length) >= 6) {
      this.isBigNum = true
      this.MinDatas = this.MinDatas / 1000
      this.MaxDatas = this.MaxDatas / 1000
    }
    // 计算最大值和最小值，分别向上取整和向下取整
    var minDataLength = (Math.floor(this.MinDatas)).toString().length
    var maxDataLength = (Math.ceil(this.MaxDatas)).toString().length
    if (minDataLength >= 3) {
      this.MinDatas = Math.floor(this.MinDatas * fixArray[minDataLength - 3]) / fixArray[minDataLength - 3]
    }
    if (maxDataLength >= 3) {
      this.MaxDatas = Math.ceil(this.MaxDatas * fixArray[maxDataLength - 3]) / fixArray[maxDataLength - 3]
    }

    var limit = (this.MaxDatas - this.MinDatas) / 4
    if (minDataLength > 2) {
      limit = Math.ceil(limit)
    }
    var unitPx = (this.EndY - this.StartY) / (this.MaxDatas - this.MinDatas)

    // 添加 YPoints ， 里面包含y值和 y轴上的位置
    for (var a = 0; a <= 4; a++) {
      var value = this.MaxDatas - a * limit > this.MinDatas ? this.MaxDatas - a * limit : this.MinDatas
      var yPosition = this.StartY + (this.MaxDatas - value) * unitPx
      var item = {
        value: value,
        yPosition: yPosition
      }
      this.YPoints.push(item)
    }
  }

  this.Draw = function () {
    // 绘制Y轴
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle('#d5e2e6')
    this.Canvas.setLineWidth(1)
    this.Canvas.moveTo(ToFixedPoint(this.StartX), ToFixedPoint(this.StartY))
    this.Canvas.lineTo(ToFixedPoint(this.StartX), ToFixedPoint(this.EndY))
    this.Canvas.closePath()
    this.Canvas.stroke()

    this.Canvas.beginPath()
    this.Canvas.setFontSize(12)
    this.Canvas.setFillStyle('#d5e2e6')
    for (var i in this.YPoints) {
      this.Canvas.moveTo(ToFixedPoint(this.StartX), ToFixedPoint(this.YPoints[i].yPosition))
      this.Canvas.lineTo(ToFixedPoint(this.StartX + 5), ToFixedPoint(this.YPoints[i].yPosition))
      this.Canvas.fillText((this.YPoints[i].value).toFixed(2), this.StartX + 10, this.YPoints[i].yPosition + 5)
    }
    this.Canvas.closePath()
    this.Canvas.stroke()

    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle('#d5e2e6')
    this.Canvas.setLineWidth(1)
    for (var j in this.YPoints) {
      this.Canvas.moveTo(0, ToFixedPoint(this.YPoints[j].yPosition))
      this.Canvas.lineTo(this.StartX, ToFixedPoint(this.YPoints[j].yPosition))
    }
    this.Canvas.closePath()
    this.Canvas.stroke()
  }

  this.SetUpdateYAxis = function (option) {
    this.StartX = option.cEndX - Basic.yAxisWidth
    this.StartY = option.cStartY + Basic.curMsgContainerHeight
    this.EndX = option.cEndX
    this.EndY = option.cEndY - Basic.chartPd
    this.Datas = option.datas
    this.SetValueRange()
    this.Draw()
  }
}
// X轴画法
function XAxis (canvas, option) {
  this.Canvas = canvas
  this.StartX = 0
  this.StartY = Basic.height - Basic.xAxisHeight
  this.EndX = option.cEndX - Basic.yAxisWidth
  this.EndY = Basic.height
  this.Datas = option.datas
  this.XPoints = []

  this.Create = function () {
    this.SetValueRange()
    this.Draw()
  }

  this.SetValueRange = function () {
    this.XPoints = []
    var spaceTime = parseInt((this.EndX - Basic.canvasPaddingLeft) / (Basic.kLineWidth + Basic.kLineMarginRight) / 2)
    for (let i = 1, j = parseInt(this.Datas.length / spaceTime); i <= j; i++) {
      var item = {}
      item.value = this.Datas[i * spaceTime - 1].day
      item.xPosition = Basic.canvasPaddingLeft + (Basic.kLineWidth + Basic.kLineMarginRight) * i * spaceTime - Basic.kLineMarginRight - Basic.kLineWidth / 2
      this.XPoints.push(item)
    }
  }

  this.Draw = function () {
    // 绘制X轴
    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle('#d5e2e6')
    this.Canvas.setLineWidth(1)
    this.Canvas.moveTo(ToFixedPoint(this.StartX), ToFixedPoint(this.StartY))
    this.Canvas.lineTo(ToFixedPoint(this.EndX), ToFixedPoint(this.StartY))
    this.Canvas.setFontSize(12)
    this.Canvas.setFillStyle('#d5e2e6')
    for (var i = 0, j = this.XPoints.length; i < j; i++) {
      this.Canvas.moveTo(ToFixedPoint(this.XPoints[i].xPosition), ToFixedPoint(this.StartY))
      this.Canvas.lineTo(ToFixedPoint(this.XPoints[i].xPosition), ToFixedPoint(this.StartY + 5))
      this.Canvas.fillText(this.XPoints[i].value, this.XPoints[i].xPosition - this.Canvas.measureText(this.XPoints[i].value).width / 2, this.StartY + 20)
    }
    this.Canvas.stroke()
    this.Canvas.closePath()

    this.Canvas.beginPath()
    this.Canvas.setStrokeStyle('#d5e2e6')
    this.Canvas.setLineWidth(1)
    for (var j in this.XPoints) {
      this.Canvas.moveTo(ToFixedPoint(this.XPoints[j].xPosition), 0)
      this.Canvas.lineTo(ToFixedPoint(this.XPoints[j].xPosition), this.StartY)
    }
    this.Canvas.closePath()
    this.Canvas.stroke()
  }

  this.SetUpdateXAxis = function (option) {
    this.StartX = 0
    this.StartY = Basic.height - Basic.xAxisHeight
    this.EndX = option.cEndX - Basic.yAxisWidth
    this.EndY = Basic.height
    // this.Canvas.clearRect(this.StartX, this.StartY, this.EndX - this.StartX, this.EndY - this.StartY)
    this.Datas = option.datas
    this.SetValueRange()
    this.Draw()
  }
}




QTChart.Init = function () {
  var qtchart = new QTChart()
  return qtchart
}

function GetDevicePixelRatio () {
  if (typeof (window) == 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

function Guid () {
  function S4 () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//修正线段有毛刺
function ToFixedPoint (value) {
  return parseInt(value) + 0.5;
}

function ToFixedRect (value) {
  var rounded;
  return rounded = (0.5 + value) << 0;
}


/**
 * @desc 排序
 * @param {排序的key} field
 */
function sortBy (field) {
  return (x, y) => {
    return x[field] - y[field]
  }
}

function GetMyBrowser () {
  var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf('Opera') > -1
  if (isOpera) {
    return 'Opera'
  }; // 判断是否Opera浏览器
  if (userAgent.indexOf('Firefox') > -1) {
    return 'FF'
  } // 判断是否Firefox浏览器
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome'
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  } // 判断是否Safari浏览器
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    return 'IE'
  }; // 判断是否IE浏览器
}

module.exports = {
  QTChart
}
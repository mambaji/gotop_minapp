import {
  wxRequest
} from '@/utils/wxRequest'
import wepy from 'wepy'

const env = "-dev" //-dev 或者 -online
const hostapi = "https://api.it120.cc/zhuangsongshui"
const commonapi = 'https://api.it120.cc'
// 获取K线数据
const getKLinesApi = (params) => wxRequest(params, 'http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sz002095&scale=60&ma=no&datalen=1023')

export default {
  getKLinesApi
}

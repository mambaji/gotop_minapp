import api from './api'


/**
 * 检查token是否有效
 */
const onGetKLinesApi = async function (params, result) {
  const json = await api.getKLinesApi({
    query: params,
    method: 'get'
  })
  console.log('onGetKLinesApi:', { params, json })
  result(json)
}




module.exports = {
  onGetKLinesApi,

}

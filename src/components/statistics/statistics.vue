<template>
  <div>
    <div id="scroll-board">
      <div id="main" style="width: 600px;height:400px;"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Basic TlpIRUFMVEhXSE9MRVNBTE5aOmNmZGNhMzRlZTA0NzQ3MmU5ZWYyZjQ5MDQwODg4OTRm'
)

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
  Username: 'NZHEALTHWHOLESALNZ',
  Password: 'cfdca34ee047472e9ef2f4904088894f'
}

export default {
  name: 'ScrollBoard',
  data() {
    return {
      date: [],
      data: []
    }
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    drawChart() {
      return new Promise((resolve, reject) => {
        this.reqCin7Service('/SalesOrders?rows=250', requestOptions, 'get')
          .then(result => {
            console.log(result)
            // var base = +new Date(2020, 1, 1)
            // var oneDay = 24 * 3600 * 1000
            // var date = []

            // var data = [Math.random() * 300]
            let newDate = []
            let newTotal = []
            for (var i = 1; i < result.length; i++) {
              var createdDate = new Date(result[i].createdDate)
              newTotal.push(result[i].total)
              newDate.push(createdDate)
            }

            let newCreatedDate = newDate.map(function(value, index, array) {
              var date = new Date(value)
              return [
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
              ].join('/')
            })

            // 基于准备好的dom，初始化echarts实例
            let myChart = this.$echarts.init(document.getElementById('main'))
            // 指定图表的配置项和数据
            let option = {
              tooltip: {
                trigger: 'axis',
                position: function(pt) {
                  return [pt[0], '10%']
                }
              },
              title: {
                left: 'center',
                text: '最近50单订单数据'
              },
              toolbox: {
                feature: {
                  dataZoom: {
                    yAxisIndex: 'none'
                  },
                  restore: {},
                  saveAsImage: {}
                }
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: newCreatedDate
              },
              yAxis: {
                type: 'value',
                boundaryGap: [0, '100%']
              },
              dataZoom: [
                {
                  type: 'inside',
                  start: 0,
                  end: 10
                },
                {
                  start: 0,
                  end: 10,
                  handleIcon:
                    'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                  handleSize: '80%',
                  handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                  }
                }
              ],
              series: [
                {
                  name: 'Sales Order',
                  type: 'line',
                  smooth: true,
                  symbol: 'none',
                  sampling: 'average',
                  itemStyle: {
                    color: 'rgb(255, 70, 131)'
                  },
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      {
                        offset: 0,
                        color: 'rgb(255, 158, 68)'
                      },
                      {
                        offset: 1,
                        color: 'rgb(255, 70, 131)'
                      }
                    ])
                  },
                  data: newTotal
                }
              ]
            }
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option)
            resolve(result)
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    }
  },
  created: function() {}
}
</script>

<style lang="less" scoped>
</style>

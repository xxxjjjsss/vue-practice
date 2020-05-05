<template>
  <div>
    <div id="scroll-board">
      <!-- <div>
        <el-input
          placeholder="请输入页数"
          class="input-with-select"
          v-model="page"
          clearable
        >
          <el-button slot="append" icon="el-icon-search" @click="drawChart"></el-button>
        </el-input>
      </div>-->
      <div id="totalSalesOrder" style="width: 100%;height:400px;"></div>
      <div id="saleByPerson" style="width: 100%;height:400px;"></div>
      <div id="saleDipatch" style="width: 100%;height:400px;"></div>
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
      // 总数居
      totalData: [],
      // 获取的saleperson数据
      salePerson: [],
      // 产品
      products: [],
      // 最终展示名字
      newSalesPerson: [],
      // 最终展示销售量
      newSalesPersonTotal: [],
      // 销售ID名字对应字典
      originSalePerson: {},
      // 长线图日期
      newCreatedDatesString: [],
      newDispatchedDatesString: [],
      newInvoiceDateString: [],
      // 长线图销售额
      newTotal: []
    }
  },
  mounted() {
    this.drawLongChart()
    this.drawBarChart()
  },
  methods: {
    getTotalData() {
      return new Promise((resolve, reject) => {
        let i = 1
        while (i <= 1) {
          try {
            this.reqCin7Service(
              '/SalesOrders?page=' + i + '&rows=250',
              requestOptions,
              'get'
            )
              .then(result => {
                this.totalData = []
                for (var i = 1; i < result.length; i++) {
                  this.totalData.push(result[i])
                  resolve(result)
                }
                let newCreatedDate = []
                let newDispatchedDate = []
                let newInvoiceDate = []
                let newTotal = []
                for (let index = 0; index < this.totalData.length; index++) {
                  const createdDate = this.totalData[index].createdDate
                  const dispatchedDate = this.totalData[index].dispatchedDate
                  const invoiceDate = this.totalData[index].invoiceDate
                  newInvoiceDate.push(invoiceDate)
                  newCreatedDate.push(createdDate)
                  newDispatchedDate.push(dispatchedDate)
                  newTotal.push(this.totalData[index].total)
                }
                this.newInvoiceDateString = newInvoiceDate
                this.newCreatedDatesString = newCreatedDate
                this.newDispatchedDatesString = newDispatchedDate
                this.newTotal = newTotal
              })
              .catch(error => {
                console.log(error.result)
              })
            i += 1
          } catch (error) {
            break
          }
        }
      })
    },
    getData(page, rows, dataType) {
      return new Promise((resolve, reject) => {
        let i = 1
        while (i <= page) {
          try {
            this.reqCin7Service(
              '/' + dataType + '?page=' + i + '&rows=' + rows,
              requestOptions,
              'get'
            )
              .then(result => {
                resolve(result)
                return result
              })
              .catch(error => {
                console.log(error.result)
              })
          } catch (error) {}
          i += 1
        }
      })
    },
    // 获取所有slaeperson的属性储存到salePerson数组
    getPerson() {
      return new Promise((resolve, reject) => {
        this.reqCin7Service('/Users', requestOptions, 'get')
          .then(result => {
            this.salePerson = result
            resolve(result)
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    getProducts() {
      this.getData(1, 20, 'Products')
        .then(result => {
          this.products = result
          console.log(this.products)
        })
        .catch(error => {
          console.log(error.result)
        })
    },
    drawLongChart() {
      this.getData(1, 20, 'SalesOrders').then(result => {
        this.totalData = []
        for (var i = 1; i < result.length; i++) {
          this.totalData.push(result[i])
        }
        let newCreatedDate = []
        let newDispatchedDate = []
        let newInvoiceDate = []
        let newTotal = []
        for (let index = 0; index < this.totalData.length; index++) {
          const createdDate = this.totalData[index].createdDate
          const dispatchedDate = this.totalData[index].dispatchedDate
          const invoiceDate = this.totalData[index].invoiceDate
          newInvoiceDate.push(invoiceDate)
          newCreatedDate.push(createdDate)
          newDispatchedDate.push(dispatchedDate)
          newTotal.push(this.totalData[index].total)
        }
        this.newInvoiceDateString = newInvoiceDate
        this.newCreatedDatesString = newCreatedDate
        this.newDispatchedDatesString = newDispatchedDate
        this.newTotal = newTotal
        // 基于准备好的dom，初始化echarts实例
        let myChart = this.$echarts.init(
          document.getElementById('totalSalesOrder')
        )
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
            text: '最近' + this.totalData.length + '单订单数据'
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
            data: this.newCreatedDatesString
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
              data: this.newTotal
            }
          ]
        }
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option)
      })
    },
    drawBarChart() {
      this.getTotalData().then(() => {
        var salesPersonTotal = [] // 存最终数据结果
        var nameContainer = {} // 针对键name进行归类的容器
        this.totalData.forEach(item => {
          nameContainer[item.salesPersonId] =
            nameContainer[item.salesPersonId] || []

          nameContainer[item.salesPersonId].push(item)
        })

        var salesName = Object.keys(nameContainer)
        salesName.forEach(nameItem => {
          let count = 0
          nameContainer[nameItem].forEach(item => {
            count += item.total
          })
          salesPersonTotal.push({ nameItem, count })
        })
        function Dictionary() {
          this.add = add
          // eslint-disable-next-line no-new-object
          this.datastore = new Object()
          this.find = find
          // this.remove = remove
          this.showAll = showAll
          // this.length = length
          this.count = count
          // this.clear = clear
          // this.sort = sort
        }
        function add(key, value) {
          this.datastore[key] = value
        }
        function showAll() {
          for (var key in this.datastore) {
            console.log(key + '->' + this.datastore[key])
          }
        }
        function count() {
          var n = 0
          // eslint-disable-next-line no-unused-vars
          for (var key in this.datastore) {
            ++n
          }
          return n
        }
        function find(key) {
          return this.datastore[key]
        }
        var originSalePersonDic = new Dictionary()
        // 遍历salePerson数组,提取出名字放到newFirstName,提取出ID放到newSalePersonId
        for (let index = 0; index < this.salePerson.length; index++) {
          let newFirstName = this.salePerson[index].firstName
          let newSalePersonId = this.salePerson[index].id
          originSalePersonDic.add(newSalePersonId, newFirstName)
        }
        this.originSalePerson = originSalePersonDic
        for (let index = 0; index < salesPersonTotal.length; index++) {
          let newItem = salesPersonTotal[index].nameItem
          let newCount = salesPersonTotal[index].count
          this.newSalesPerson.push(this.originSalePerson.find(newItem))
          this.newSalesPersonTotal.push(newCount)
        }

        let pieChart = this.$echarts.init(
          document.getElementById('saleByPerson')
        )
        let PieChartOption = {
          xAxis: {
            type: 'category',
            data: this.newSalesPerson
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: this.newSalesPersonTotal,
              type: 'bar'
            }
          ]
        }
        pieChart.setOption(PieChartOption)
      })
    }
    // drawDelayBarChart() {
    //   this.getTotalData().then(() => {
    //     let myChart = this.$echarts.init(document.getElementById('saleDipatch'))
    //     let option = {
    //       title: {
    //         text: '柱状图动画延迟'
    //       },
    //       legend: {
    //         data: ['bar', 'bar2']
    //       },
    //       toolbox: {
    //         // y: 'bottom',
    //         feature: {
    //           magicType: {
    //             type: ['stack', 'tiled']
    //           },
    //           dataView: {},
    //           saveAsImage: {
    //             pixelRatio: 2
    //           }
    //         }
    //       },
    //       tooltip: {},
    //       xAxis: {
    //         data: this.newCreatedDates,
    //         splitLine: {
    //           show: false
    //         }
    //       },
    //       yAxis: {},
    //       series: [
    //         {
    //           name: 'bar',
    //           type: 'bar',
    //           data: this.newTotal,
    //           animationDelay: function(idx) {
    //             return idx * 10
    //           }
    //         },
    //         {
    //           name: 'bar2',
    //           type: 'bar',
    //           data: data2,
    //           animationDelay: function(idx) {
    //             return idx * 10 + 100
    //           }
    //         }
    //       ],
    //       animationEasing: 'elasticOut',
    //       animationDelayUpdate: function(idx) {
    //         return idx * 5
    //       }
    //     }
    //     myChart.setOption(option)
    //   })
    // }
  },
  created: function() {
    // this.getTotalData()
    this.getPerson()
    this.getProducts()
  }
}
</script>

<style lang="less" scoped>
</style>

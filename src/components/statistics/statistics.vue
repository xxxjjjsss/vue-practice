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
    </div>
  </div>
</template>

<script>
// import echarts from 'echarts'

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
      data: [],
      totalData: [],
      salePerson: [],
      newSalesPerson: [],
      newSalesPersonTotal: [],
      originSalePerson: {},
      newSalePersonId: []

      // page: '',
      // rows: ''
    }
  },
  // mounted() {
  //   this.drawChart()
  // },
  methods: {
    getTotalData() {
      return new Promise((resolve, reject) => {
        let i = 1
        while (i < 20) {
          try {
            this.reqCin7Service(
              '/SalesOrders?page=' + i + '&rows=250',
              requestOptions,
              'get'
            )
              .then(result => {
                for (var i = 1; i < result.length; i++) {
                  this.totalData.push(result[i])
                  resolve(result)
                }
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
    // drawChart() {
    //   this.getTotalData().then(() => {
    //     let newDate = []
    //     let total = []
    //     for (let index = 0; index < this.totalData.length; index++) {
    //       const element = this.totalData[index].createdDate
    //       newDate.push(element)
    //       total.push(this.totalData[index].total)
    //     }

    //     let newCreatedDate = newDate.map(function(value, index, array) {
    //       var date = new Date(value)
    //       return [
    //         date.getFullYear(),
    //         date.getMonth(),
    //         date.getDate(),
    //         date.getHours(),
    //         date.getMinutes()
    //       ].join('/')
    //     })
    //     // 基于准备好的dom，初始化echarts实例
    //     let myChart = this.$echarts.init(
    //       document.getElementById('totalSalesOrder')
    //     )
    //     // 指定图表的配置项和数据
    //     let option = {
    //       tooltip: {
    //         trigger: 'axis',
    //         position: function(pt) {
    //           return [pt[0], '10%']
    //         }
    //       },
    //       title: {
    //         left: 'center',
    //         text: '最近' + this.totalData.length + '单订单数据'
    //       },
    //       toolbox: {
    //         feature: {
    //           dataZoom: {
    //             yAxisIndex: 'none'
    //           },
    //           restore: {},
    //           saveAsImage: {}
    //         }
    //       },
    //       xAxis: {
    //         type: 'category',
    //         boundaryGap: false,
    //         data: newCreatedDate
    //       },
    //       yAxis: {
    //         type: 'value',
    //         boundaryGap: [0, '100%']
    //       },
    //       dataZoom: [
    //         {
    //           type: 'inside',
    //           start: 0,
    //           end: 10
    //         },
    //         {
    //           start: 0,
    //           end: 10,
    //           handleIcon:
    //             'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    //           handleSize: '80%',
    //           handleStyle: {
    //             color: '#fff',
    //             shadowBlur: 3,
    //             shadowColor: 'rgba(0, 0, 0, 0.6)',
    //             shadowOffsetX: 2,
    //             shadowOffsetY: 2
    //           }
    //         }
    //       ],
    //       series: [
    //         {
    //           name: 'Sales Order',
    //           type: 'line',
    //           smooth: true,
    //           symbol: 'none',
    //           sampling: 'average',
    //           itemStyle: {
    //             color: 'rgb(255, 70, 131)'
    //           },
    //           areaStyle: {
    //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    //               {
    //                 offset: 0,
    //                 color: 'rgb(255, 158, 68)'
    //               },
    //               {
    //                 offset: 1,
    //                 color: 'rgb(255, 70, 131)'
    //               }
    //             ])
    //           },
    //           data: total
    //         }
    //       ]
    //     }
    //     // 使用刚指定的配置项和数据显示图表。
    //     myChart.setOption(option)
    //   })
    // },
    drawPieChart() {
      this.getTotalData().then(() => {
        // console.log(this.totalData)
        // let newSalesPerson = []
        // // let total = []
        // for (let index = 0; index < this.totalData.length; index++) {
        //   const element = this.totalData[index].salesPersonId
        //   newSalesPerson.push(element)
        //   // total.push(this.totalData[index].total)
        // }

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
        for (let index = 0; index < this.salePerson.length; index++) {
          let newFirstName = this.salePerson[index].firstName
          let newSalePersonId = this.salePerson[index].id
          this.originSalePerson.push(newSalePersonId, newFirstName)
        }
        for (let index = 0; index < salesPersonTotal.length; index++) {
          let newItem = salesPersonTotal[index].nameItem
          let newCount = salesPersonTotal[index].count
          console.log(this.originSalePerson, newItem)
          // console.log(this.originSalePerson)
          // this.newSalesPerson.push(
          //   this.salePerson[].firstName .indexOf(newItem.toString())
          // )
          this.newSalesPersonTotal.push(newCount)
        }

        // this.newSalesPerson = [
        //   salesPersonTotal[0].name,
        //   salesPersonTotal[1].name,
        //   salesPersonTotal[2].name,
        //   salesPersonTotal[3].name,
        //   salesPersonTotal[4].name,
        //   salesPersonTotal[5].name
        // ]
        // this.newSalesPersonTotal = [
        //   salesPersonTotal[0].total,
        //   salesPersonTotal[1].total,
        //   salesPersonTotal[2].total,
        //   salesPersonTotal[3].total,
        //   salesPersonTotal[4].total,
        //   salesPersonTotal[5].total
        // ]
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
  },
  created: function() {
    this.getTotalData()
    // this.drawChart()
    this.drawPieChart()
    this.getPerson()
  }
}
</script>

<style lang="less" scoped>
</style>

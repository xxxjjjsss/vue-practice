<template>
  <div>
    <div id="scroll-board">
      <div>
        <span>
          <span style="font-size:16px;color:black">输入参数</span>
          <el-input
            placeholder="请输入页数"
            class="input-with-select"
            v-model="inputData.page"
            size="medium"
            clearable
            style="width: 30%"
            min="1"
            max="50"
          ></el-input>
          <el-input
            placeholder="请输每页订单数"
            class="input-with-select"
            v-model="inputData.rows"
            size="medium"
            clearable
            style="width: 30%"
            min="1"
            max="250"
          ></el-input>
          <span
            slot="footer"
            class="dialog-footer"
          >
            <el-button
              size="medium"
              icon="el-icon-search"
              @click="drawAllChart(inputData.page,inputData.rows)"
            ></el-button>
          </span>
        </span>
      </div>
      <div>
        <div
          id="totalSalesOrder"
          style="width:100%;height:400px;"
        ></div>
        <div
          id="saleByPerson"
          style="width:100%;height:400px;"
          @click="drawPieChart"
        ></div>
        <div
          id="saleItemDetal"
          style="width:100%;height:400px;"
        ></div>
      </div>
    </div>
    <!-- <div>
      <el-table :data="saledata" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="name" label="姓名" width="180"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
      </el-table>
    </div>-->
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
  headers: {
    Authorization:
      'Basic TlpIRUFMVEhXSE9MRVNBTE5aOmNmZGNhMzRlZTA0NzQ3MmU5ZWYyZjQ5MDQwODg4OTRm'
  }
}

export default {
  name: 'ScrollBoard',
  data() {
    return {
      saledata: {},
      inputData: { page: '2', rows: '10' },
      // 总数居
      totalData: [],
      // 获取的saleperson数据
      salePerson: [],
      // 产品
      products: [],
      // 最终展示名字
      allSalesPerson: [],
      // 最终展示销售量
      allSalesPersonTotal: [],
      // 最终对应的ID
      allSalesPersonID: [],
      // 销售ID名字对应字典
      originSalePerson: {},
      // 长线图日期
      newCreatedDatesString: [],
      newDispatchedDatesString: [],
      newInvoiceDateString: [],
      // 长线图销售额
      newTotal: [],
      // 所有产品分类
      totalProductCategories: [],
      // 按日期搜索的所有数据
      totalDataByDate: [],
      // 长时间图的起始时间和结束时间
      startDate: '',
      endDate: '',
      // 输入的时间间隔
      dayInterval: '',
      // 点击柱状图获取的ID
      clickId: ''
    }
  },
  mounted() {},
  methods: {
    // 获取数据的基础方法
    getData(page, rows, dataType) {
      return new Promise((resolve, reject) => {
        let i = 1
        let newresult = []
        while (i <= page) {
          try {
            newresult.push(
              this.reqCin7Service(
                '/' + dataType + '?page=' + i.toString() + '&rows=' + rows,
                requestOptions,
                'get'
              )
                .then(result => {
                  return result
                })
                .catch(error => {
                  console.log(error.result)
                })
            )
          } catch (error) {}
          i += 1
        }
        Promise.all(newresult)
          .then(result => {
            resolve(result)
            this.totalData = result.flat()
            return result.flat()
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    // 获取所有slaeperson的属性储存到salePerson数组
    getPerson() {
      return new Promise((resolve, reject) => {
        this.reqCin7Service('/Users?&rows=250', requestOptions, 'get')
          .then(result => {
            this.salePerson = result
            resolve(result)
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    // 获取指定日期内指定ID的所有数据
    getSaleOrdersByDateAndPerson(
      page,
      rows,
      dataType,
      userID,
      startDate,
      endDate
    ) {
      return new Promise((resolve, reject) => {
        let i = 1
        let newresult = []
        // let url
        while (i <= page) {
          try {
            newresult.push(
              this.reqCin7Service(
                '/' +
                  dataType +
                  '?page=' +
                  i +
                  '&rows=' +
                  rows +
                  '&where=salesPersonId=' +
                  userID +
                  " and InvoiceDate>'" +
                  endDate +
                  "' and InvoiceDate<'" +
                  startDate +
                  "'",
                requestOptions,
                'get'
              )
                .then(result => {
                  console.log(result)
                  return result
                })
                .catch(error => {
                  console.log(error.result)
                })
            )
          } catch (error) {}
          i += 1
        }
        Promise.all(newresult)
          .then(result => {
            resolve(result)
            this.totalDataByDate = result.flat()
            return result.flat()
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    getProductsCatergories() {
      return new Promise((resolve, reject) => {
        this.reqCin7Service('/ProductCategories', requestOptions, 'get')
          .then(result => {
            resolve(result)
            return result
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    getProducts(page, rows) {
      this.getData(page, rows, 'Products')
        .then(result => {
          this.products = result
          console.log(this.products)
        })
        .catch(error => {
          console.log(error.result)
        })
    },
    drawAllChart(page, rows) {
      this.drawLongChart(page, rows)
      this.drawBarChart(page, rows)
      // this.drawPieChart()
    },
    drawLongChart(page, rows) {
      this.getData(page, rows, 'SalesOrders').then(result => {
        // this.totalData = []
        // for (var i = 1; i < result.length; i++) {
        //   this.totalData.push(result[i])
        // }
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
        window.addEventListener('resize', function() {
          myChart.resize()
        })
        let that = this
        myChart.on('datazoom', function(params) {
          let endValue = myChart.getOption().dataZoom[1].endValue
          let startValue = myChart.getOption().dataZoom[1].startValue
          that.startDate = option.xAxis.data[startValue]
          that.endDate = option.xAxis.data[endValue]
          let sd = new Date(option.xAxis.data[startValue])
          let ed = new Date(option.xAxis.data[endValue])
          let dayDiff = Math.floor(
            (sd.getTime() - ed.getTime()) / (24 * 3600 * 1000)
          )
          that.dayDiff = dayDiff
        })
      })
    },
    drawBarChart(page, rows) {
      this.getData(page, rows, 'SalesOrders').then(result => {
        this.allSalesPerson = []
        // 最终展示销售量
        this.allSalesPersonTotal = []
        // 最终对应的ID
        var salesPersonTotal = [] // 存最终数据结果
        var nameContainer = {} // 针对键name进行归类的容器
        // 自定义字典方法
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
        // 生成salepersonID数组
        this.totalData.forEach(item => {
          nameContainer[item.salesPersonId] =
            nameContainer[item.salesPersonId] || []
          nameContainer[item.salesPersonId].push(item)
        })
        // 生成saleperson总金额数组
        var salesName = Object.keys(nameContainer)
        salesName.forEach(nameItem => {
          let count = 0
          nameContainer[nameItem].forEach(item => {
            count += item.total
          })
          salesPersonTotal.push({ nameItem, count })
        })
        // 生成salepersonID和名字字典

        var originSalePersonDic = new Dictionary()
        // 遍历salePerson数组,提取出名字放到newFirstName,提取出ID放到newSalePersonId
        for (let index = 0; index < this.salePerson.length; index++) {
          let newFirstName = this.salePerson[index].firstName
          let newSalePersonId = this.salePerson[index].id
          originSalePersonDic.add(newSalePersonId, newFirstName)
        }
        // 字典存到DATA中
        this.originSalePerson = originSalePersonDic

        // 新建sale对应名称和金额的数组
        for (let index = 0; index < salesPersonTotal.length; index++) {
          let newItem = salesPersonTotal[index].nameItem
          let newCount = salesPersonTotal[index].count
          this.allSalesPerson.push(this.originSalePerson.find(newItem))
          this.allSalesPersonTotal.push(newCount)
        }
        // 生成图
        let pieChart = this.$echarts.init(
          document.getElementById('saleByPerson')
        )
        let PieChartOption = {
          xAxis: {
            type: 'category',
            data: this.allSalesPerson
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: this.allSalesPersonTotal,
              type: 'bar'
            }
          ]
        }
        pieChart.setOption(PieChartOption)
        // 获取点击位置
        window.addEventListener('resize', function() {
          pieChart.resize()
        })
        console.log(this.inputData)
        // 返回点击柱的ID
        let that = this
        pieChart.getZr().on('click', function(params) {
          const pointInPixel = [params.offsetX, params.offsetY]
          if (pieChart.containPixel('grid', pointInPixel)) {
            let xIndex = pieChart.convertFromPixel({ seriesIndex: 0 }, [
              params.offsetX,
              params.offsetY
            ])
            // 返回数组ID对应的salespersonID
            that.clickId = salesPersonTotal[xIndex[0]].nameItem
          }
        })
        // 画出指定日期指定sales的饼图
      })
    },
    drawPieChart() {
      // 获取所有的品牌组成二维数组
      this.getProductsCatergories().then(result => {
        let newProductCategorieslist = []
        for (let index = 0; index < result.length; index++) {
          let element = []
          element.push(result[index].name)
          newProductCategorieslist.push(element)
        }
        this.totalProductCategories = newProductCategorieslist
        console.log(this.totalProductCategories)
      })
      let page = this.inputData.page
      let rows = this.inputData.rows
      let userID = this.clickId
      let startDate = this.startDate
      let endDate = this.endDate
      // 获取单个人指定时间内的销售详情
      this.getSaleOrdersByDateAndPerson(
        page,
        rows,
        'SalesOrders',
        userID,
        startDate,
        endDate
      ).then(result => {
        console.log(
          page,
          rows,
          'SalesOrders',
          userID,
          startDate,
          endDate,
          result
        )
      })
      // 获取时间周期
      // 根据时间周期获取salestotal放到二维数组中
      let pieChart = this.$echarts.init(
        document.getElementById('saleItemDetal')
      )
      setTimeout(function() {
        let option = {
          legend: {},
          tooltip: {
            trigger: 'axis',
            showContent: false
          },
          dataset: {
            source: [
              ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
              ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
              ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
              ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
              ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
            ]
          },
          xAxis: { type: 'category' },
          yAxis: { gridIndex: 0 },
          grid: { top: '55%' },
          series: [
            { type: 'line', smooth: true, seriesLayoutBy: 'row' },
            { type: 'line', smooth: true, seriesLayoutBy: 'row' },
            { type: 'line', smooth: true, seriesLayoutBy: 'row' },
            { type: 'line', smooth: true, seriesLayoutBy: 'row' },
            {
              type: 'pie',
              id: 'pie',
              radius: '30%',
              center: ['50%', '25%'],
              label: {
                formatter: '{b}: {@2012} ({d}%)'
              },
              encode: {
                itemName: 'product',
                value: '2012',
                tooltip: '2012'
              }
            }
          ]
        }

        pieChart.on('updateAxisPointer', function(event) {
          var xAxisInfo = event.axesInfo[0]
          if (xAxisInfo) {
            var dimension = xAxisInfo.value + 1
            pieChart.setOption({
              series: {
                id: 'pie',
                label: {
                  formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                },
                encode: {
                  value: dimension,
                  tooltip: dimension
                }
              }
            })
          }
        })

        pieChart.setOption(option)
      })
    }
  },

  computed: {},
  created: function() {
    this.getPerson()
  }
}
</script>

<style lang="less" scoped>
</style>

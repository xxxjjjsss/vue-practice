<template>
  <div id="scroll-board">
    <el-row>
      <el-col :span="12">
        <div class="grid-content bg-purple-dark">
          <div class="block">
            <span class="demonstration"></span>
            <el-date-picker
              v-model="inputDatevalue"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
            ></el-date-picker>
            <el-button size="large" icon="el-icon-search" @click="drawAllChartByDate()"></el-button>
            <el-button size="large" @click="reset">重置</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="sub-title">激活即列出输入建议</div>
        <el-autocomplete
          class="inline-input"
          v-model="searchCategory"
          :fetch-suggestions="querySearch"
          placeholder="请输入内容"
          @select="handleSelect"
          value-key="element"
        ></el-autocomplete>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" style="margin-top:50px">
        <div class="grid-content bg-purple" style="margin:10px">
          <span>
            <span style="font-size:16px;color:black;">输入参数</span>
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
            <span slot="footer" class="dialog-footer">
              <el-button
                size="medium"
                icon="el-icon-search"
                @click="drawAllChart(inputData.page,inputData.rows)"
              ></el-button>
              <el-button size="medium" @click="reset">重置</el-button>
            </span>
          </span>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div class="grid-content bg-purple">
          <div v-show="longChartFlag" id="totalSalesOrder" style="width:100%;height:400px;"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="grid-content bg-purple-light">
          <div
            v-show="barChartFlag"
            id="saleByPerson"
            style="width:100%;height:400px;"
            @click="drawPieChart"
          ></div>
        </div>
      </el-col>
    </el-row>
    <div id="saleItemDetal" v-show="pieChartFlag" style="width:16em;height:400px;"></div>
    <div>
      <el-table
        v-show="tableFlag"
        :data="totalDataByDateAndSales"
        size="small"
        border
        style="width: 100%;"
        @expand-change="rowExpand"
      >
        <el-table-column type="expand" prop>
          <template slot-scope>
            <el-table :data="itemsDetail">
              <el-table-column label="产品ID" prop="productId" />
              <el-table-column label="产品名" prop="name" />
              <el-table-column label="条形码" prop="barcode" />
              <el-table-column label="折扣" prop="discount" />
              <el-table-column label="运输数量" prop="qtyShipped" />
              <el-table-column label="单价" prop="unitPrice" />
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="订单编号" align="left" width="60" />
        <el-table-column prop="company" label="商家名称" />
        <el-table-column prop="createdDate" label="建单时间" min-width="100" />
        <el-table-column prop="productTotal" label="总金额" />
        <el-table-column prop="invoiceDate" label="开单日期" />
        <el-table-column prop="dispatchedDate" label="运输日期" width="100" />
        <el-table-column prop="status" label="订单状态" />
        <el-table-column prop="stage" label="订单阶段" />
        <el-table-column prop="internalComments" label="备注" width="200" />
      </el-table>
      <!--分页组件-->
      <el-pagination
        v-show="paginationFlag"
        :total="paginationData.total"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        :page-sizes="[1, 5, 10, 20]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-size="paginationData.pagesize"
      />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

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
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      inputDatevalue: '',

      pieChartFlag: false,
      paginationFlag: false,
      tableFlag: false,
      longChartFlag: false,
      barChartFlag: false,
      saledata: {},
      inputData: { page: '2', rows: '100' },
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
      // 搜索用的分类
      productCategories: [],
      searchCategory: '',
      // 按日期和sales搜索的所有数据整理
      totalDataByDateAndSalesFlat: [],
      // 按日期和sales搜索的所有数据
      totalDataByDateAndSales: [],
      // 长时间图的起始时间和结束时间
      startDate: '',
      endDate: '',
      // 输入的时间间隔
      dayInterval: '',
      // 点击柱状图获取的ID
      clickId: '',
      // 分页页码
      // 分页行数
      paginationData: {
        pagenum: 1,
        total: 0,
        pagesize: 5
      },
      itemsDetail: []
    }
  },
  mounted() {
    this.totalProductCategories = this.loadAll()
  },
  methods: {
    rowExpand(row, expandeRows) {
      const _this = this
      _this.itemsDetail = row.lineItems
    },
    // 获取数据的基础方法
    getDataByNum(page, rows, dataType) {
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
        this.reqCin7Service(
          '/' +
            dataType +
            '?page=' +
            page +
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
            this.totalDataByDateAndSales = result
            resolve(result)
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    getSaleOrdersByDateAndPersonFlat(
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
            this.paginationData.total = result.length
            return result.flat()
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    },
    // getProductsCatergories() {
    //   return new Promise((resolve, reject) => {
    //     this.reqCin7Service(
    //       '/ProductCategories?page=1&rows=250',
    //       requestOptions,
    //       'get'
    //     )
    //       .then(result => {
    //         this.totalProductCategories = JSON.stringify(result)
    //         resolve(result)
    //         return this.totalProductCategories
    //       })
    //       .catch(error => {
    //         console.log(error.result)
    //       })
    //   })
    // },
    getProducts(page, rows) {
      this.getDataByNum(page, rows, 'Products')
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
      this.longChartFlag = true
      this.barChartFlag = true
    },
    drawLongChart(page, rows) {
      this.getDataByNum(page, rows, 'SalesOrders').then(result => {
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
      this.getDataByNum(page, rows, 'SalesOrders').then(result => {
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
      })
    },
    drawPieChart() {
      // 获取所有的品牌组成二维数组
      // this.getProductsCatergories().then(result => {
      //   let newProductCategorieslist = []
      //   for (let index = 0; index < result.length; index++) {
      //     let element = []
      //     element.push(result[index].name)
      //     newProductCategorieslist.push(element)
      //   }
      //   this.totalProductCategories = newProductCategorieslist
      //   console.log(this.totalProductCategories)
      // })
      let page = this.inputData.page
      let rows = this.inputData.rows
      let userID = this.clickId
      let startDate = this.startDate
      let endDate = this.endDate
      console.log(page, rows, userID, startDate, endDate)
      // 获取单个人指定时间内的销售详情总数
      this.getSaleOrdersByDateAndPersonFlat(
        page,
        rows,
        'SalesOrders',
        userID,
        startDate,
        endDate
      ).then(result => {
        this.totalDataByDateAndSalesFlat = result.flat()
        this.paginationData.total = result.flat().length
        console.log(result.flat())
      })
      // 获取时间周期
      // eslint-disable-next-line no-unused-vars
      let dateInterval = 1
      // 分成多少份
      let start = new Date(startDate) // 开始时间
      let end = new Date(endDate) // 结束时间
      let newStartDate = new Date(start).getTime()
      let newEndDate = new Date(end).getTime()
      let dateDiff = Math.floor(
        (newStartDate - newEndDate) / (24 * 3600 * 1000)
      )

      console.log(dateDiff)
      // 画出指定sales指定日期总表格表格
      this.getSaleOrdersByDateAndPerson(
        this.paginationData.pagenum,
        this.paginationData.pagesize,
        'SalesOrders',
        userID,
        startDate,
        endDate
      ).then(result => {
        // 获取单个人的指定日期内的所有数据整理
        this.totalDataByDateAndSales = result
        // 获取单个人的指定日期内的所有数据
      })
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
      }, 500)
      this.tableFlag = true
      this.paginationFlag = true
      this.pieChartFlag = true
    },
    getTime(time) {
      var date = new Date(time)
      this.year = date.getFullYear()
      this.month = date.getMonth() + 1
      this.date = date.getDate()
      this.hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      this.minute =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      this.second =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
      this.milliSeconds = date.getMilliseconds()
      var currentTime =
        this.year +
        '-' +
        this.month +
        '-' +
        this.date +
        'T' +
        this.hour +
        ':' +
        this.minute +
        ':' +
        this.second +
        'Z'
      return currentTime
    },
    drawAllChartByDate() {
      console.log(this.getTime(this.inputDatevalue[0]))
    },
    handleSizeChange(newSize) {
      this.paginationData.pagesize = newSize
      console.log(this.paginationData.pagenum, this.paginationData.pagesize)
      this.getSaleOrdersByDateAndPerson(
        this.paginationData.pagenum,
        this.paginationData.pagesize,
        'SalesOrders',
        this.clickId,
        this.startDate,
        this.endDate
      )
    },
    handleCurrentChange(newPage) {
      this.paginationData.pagenum = newPage
      console.log(this.paginationData.pagenum, this.paginationData.pagesize)
      this.getSaleOrdersByDateAndPerson(
        this.paginationData.pagenum,
        this.paginationData.pagesize,
        'SalesOrders',
        this.clickId,
        this.startDate,
        this.endDate
      )
    },
    querySearch(queryString, cb) {
      var list = [{}]
      this.reqCin7Service(
        '/ProductCategories?page=1&rows=250',
        requestOptions,
        'get'
      )
        .then(result => {
          let value = 'value'
          let resultList = []
          for (let index = 0; index < result.length; index++) {
            const element = result[index].name
            list.push({ value, element })
            resultList.push(element)
          }
          this.totalProductCategories = resultList
          var searchlist = list
          var results = queryString
            ? searchlist.filter(queryString)
            : searchlist
          console.log(list, results)
          cb(results)
        })
        .catch(error => {
          console.log(error.result)
        })
    },
    // createFilter(queryString) {
    //   return res => {
    //     console.log(queryString)
    //     return (
    //       res.element.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    //     )
    //   }
    // },
    loadAll() {
      let list = []
      let value = 'value'
      this.reqCin7Service(
        '/ProductCategories?page=1&rows=250',
        requestOptions,
        'get'
      )
        .then(result => {
          for (let index = 0; index < result.length; index++) {
            const element = result[index].name
            list.push({ value, element })
          }
        })
        .catch(error => {
          console.log(error.result)
        })
      console.log(list)
      return list
    },
    handleSelect(item) {
      console.log(item)
    },
    // 重置所有数据
    reset() {
      this.pieChartFlag = false
      this.paginationFlag = false
      this.barChartFlag = false
      this.longChartFlag = false
      this.tableFlag = false
      this.inputData.page = 0
      this.inputData.rows = 0
    }
  },

  computed: {},
  created: function() {
    this.getPerson()
    // this.getProductsCatergories()
  }
}
</script>

<style lang="less" scoped>
</style>

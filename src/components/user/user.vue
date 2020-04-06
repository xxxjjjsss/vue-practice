<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">用户列表</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button>添加用户</el-button>
        </el-col>
      </el-row>
      <template>
        <el-table :data="userList" style="width: 100%">
          <el-table-column prop="date_created" label="日期" width="180"></el-table-column>
          <el-table-column prop="username" label="姓名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop label="操作">
            <template slot-scope>
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="is_paying_customer" label="是否消费">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.is_paying_customer" disabled></el-switch>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 100, 250, 500]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="eggtotal"
      ></el-pagination>-->
    </el-card>
  </div>
</template>

<script>
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default
const WooCommerce = new WooCommerceRestApi({
  url: 'https://healthkiwi.co.nz',
  consumerKey: 'ck_d416ab3b13118bb0cfb6e0ae57b63e2df398e748',
  consumerSecret: 'cs_82df873a23d2cdedef4b4e726b96e019787d2419',
  version: 'wc/v3',
  queryStringAuth: true
})

export default {
  data() {
    return {
      subscriberList: [],
      subscribertotal: 0,
      eggList: [],
      eggtotal: 0,
      userList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      }
    }
  },
  methods: {
    async getOrders() {
      WooCommerce.getAsync('products/categories').then(result => {
        console.log(result.toJSON().body)
        this.WooCommerceResult = result.toJSON().body
      })
      const egg = await WooCommerce.getAsync('customers?role=um_egg').then(
        function(result) {
          return JSON.parse(result.toJSON().body)
        }
      )
      console.log(egg)
    },
    async getUserList() {
      var { result: subscriber } = await WooCommerce.get(
        'customers?role=subscriber'
      )
        .then(result => {
          this.subscriberList = subscriber.data
          this.subscribertotal = subscriber.data.length
          console.log(this.subscriberList)
        })
        .catch(error => {
          console.log(error.subscriber.data)
        })
      var subscriberlist = JSON.parse(subscriber.toJSON().body)
      var { result: egg } = await WooCommerce.get('customers?role=um_egg')
        .then(result => {
          this.eggList = result.data
          this.eggtotal = result.data.length
          console.log(this.eggList)
        })
        .catch(error => {
          console.log(error.um_egg.data)
        })
      var egglist = JSON.parse(egg.toJSON().body)
      console.log(subscriberlist.concat(egglist))
    }
  },
  created: function() {
    this.getUserList()
    this.getOrders()
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
</style>

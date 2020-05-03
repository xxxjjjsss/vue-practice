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
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="clear"
          >
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-dropdown @command="handleCommand">
            <el-button type="primary">
              选择角色
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="index"
                v-for="(userRole, index) in userRole"
                :key="index"
              >{{userRole}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="4">
          <el-button @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <template>
        <el-table :data="userList" style="width: 100%">
          <el-table-column prop="date_created" label="日期" width="180"></el-table-column>
          <el-table-column prop="username" label="姓名" width="180"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="role" label="角色"></el-table-column>
          <el-table-column prop="id" label="ID" width="40"></el-table-column>
          <el-table-column prop label="操作" width="240">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialoge(scope.row.id)"
              >修改密码</el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="is_paying_customer" label="是否消费">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.is_paying_customer" disabled></el-switch>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userTotal"
      ></el-pagination>
    </el-card>
    <el-dialog title="请输入用户信息" :visible.sync="dialogVisible" width="50%" @close="addDialogClose">
      <span>
        <el-form :model="addUserForm" :rules="rules" ref="addUserFormRef" label-width="100px">
          <el-form-item label="email" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addUserForm.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="addUserForm.checkPass" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUser">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改用户密码"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editUserDialogClose"
    >
      <el-form
        :model="editUserForm"
        :rules="editUserFormRules"
        ref="editUserFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editUserForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="editUserForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
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
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.addUserForm.checkPass !== '') {
          this.$refs.addUserFormRef.validateField('checkPass')
        }
        callback()
      }
    }

    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addUserForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var editValidatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.editUserForm.checkPass !== '') {
          this.$refs.editUserFormRef.validateField('checkPass')
        }
        callback()
      }
    }

    var editValidatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.editUserForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      userTotal: 0,
      userList: [],
      userRole: [],
      queryInfo: {
        role: 'all',
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      dialogVisible: false,
      rules: {
        email: [
          {
            type: 'email',
            required: true,
            message: '请输入正确的注册邮箱',
            trigger: 'blur'
          }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      addUserForm: {
        email: '',
        username: '',
        password: '',
        checkPass: ''
      },
      editDialogVisible: false,
      editUserForm: { id: '', username: '', password: '', checkPass: '' },
      editUserFormRules: {
        password: [
          { required: true, validator: editValidatePass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, validator: editValidatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getIndex() {
      return new Promise((resolve, reject) => {
        WooCommerce.get('')
          .then(result => {
            resolve(
              result.data.routes['/wc/v3/customers'].endpoints['0'].args.role
                .enum
            )
            this.userRole =
              result.data.routes['/wc/v3/customers'].endpoints[
                '0'
              ].args.role.enum
            console.log(result.data)
          })
          .catch(error => {
            console.log(error.result.data)
          })
      })
    },
    search() {
      return new Promise((resolve, reject) => {
        WooCommerce.get(
          'customers?role=' +
            this.queryInfo.role +
            '&page=' +
            this.queryInfo.pagenum +
            '&per_page=' +
            this.queryInfo.pagesize +
            '&search=' +
            this.queryInfo.query
        )
          .then(result => {
            this.userList = result.data
            this.userTotal = result.data.length
            // console.log(this.queryInfo)
            resolve(result.data)
          })
          .catch(error => {
            console.log(error.result.data)
          })
      })
    },
    getUserList() {
      return new Promise((resolve, reject) => {
        WooCommerce.get(
          'customers?role=' +
            this.queryInfo.role +
            '&page=' +
            this.queryInfo.pagenum +
            '&per_page=' +
            this.queryInfo.pagesize +
            '&search=' +
            this.queryInfo.query
        )
          .then(result => {
            this.userList = result.data
            // console.log(this.queryInfo)
            resolve(result.data)
          })
          .catch(error => {
            console.log(error.result.data)
          })
      })
    },
    getTotalUserList() {
      return new Promise((resolve, reject) => {
        WooCommerce.get(
          'customers?role=' + this.queryInfo.role + '&per_page=100'
        )
          .then(result => {
            this.userTotalList = result.data
            this.userTotal = result.data.length
            resolve(result.data)
          })
          .catch(error => {
            console.log(error.result.data)
          })
      })
    },
    addDialogClose() {
      this.$refs.addUserFormRef.resetFields()
    },
    addUser() {
      this.$refs.addUserFormRef.validate(valid => {
        delete this.addUserForm.checkPass
        let data = this.addUserForm
        console.log(data)
        if (valid) {
          WooCommerce.post('customers', data)
            .then(response => {
              this.$message.success('添加用户成功')
              this.dialogVisible = false
              this.clear()
              // console.log(response.data)
            })
            .catch(error => {
              this.$message.error('添加用户失败')
              console.log(error.response.data)
            })
          console.log(valid)
        } else {
          console.log(valid)
          this.dialogVisible = false
        }
      })
    },
    showEditDialoge(id) {
      console.log(id)
      this.editUserForm.id = id
      WooCommerce.get('customers/' + id)
        .then(response => {
          this.editUserForm.username = response.data.username
          console.log(response.data)
        })
        .catch(error => {
          console.log(error.response.data)
        })
      this.editDialogVisible = true
    },
    editUserDialogClose() {
      this.$refs.editUserFormRef.resetFields()
    },
    editUser() {
      this.$refs.editUserFormRef.validate(valid => {
        let id = this.editUserForm.id
        delete this.editUserForm.checkPass
        delete this.editUserForm.id
        let data = this.editUserForm
        console.log(data)
        if (valid) {
          WooCommerce.put('customers/' + id, data)
            .then(response => {
              this.$message.success('修改密码成功')
              this.editDialogVisible = false
              this.clear()
              console.log(response.data)
            })
            .catch(error => {
              this.$message.error('修改密码失败')
              console.log(error.response.data)
            })
          console.log(valid)
        } else {
          console.log(valid)
          this.editDialogVisible = false
        }
      })
    },
    deleteUser(id) {
      console.log(id)
      this.$confirm('此操作将永久删除该、, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          WooCommerce.delete('customers/' + id, {
            force: true
          })
            .then(response => {
              console.log(response.data)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.clear()
            })
            .catch(error => {
              console.log(error.response.data)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    clear() {
      this.getUserList()
      this.getTotalUserList()
    },
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    handleCommand(command) {
      this.queryInfo.role = this.userRole[command]
      // console.log(this.userRole[command])
      this.getUserList()
      this.getTotalUserList()
    }
  },

  created: function() {
    this.getUserList()
    this.getTotalUserList()
    this.getIndex()
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
</style>

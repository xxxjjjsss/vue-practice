<template>
  <div class="login">
    <div class="login_box">
      <div class="avantar_box">
        <img src="../../assets/img/LOGO1.jpg" alt="avantar" />
      </div>
      <el-form
        :model="login_form"
        :rules="login_rules"
        class="login_form"
        label-width="2rem"
        ref="loginFormRef"
      >
        <!-- prop的名字为什么得和绑定的名字一样 -->
        <el-form-item prop="username" label="用户名">
          <el-input v-model="login_form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="login_form.password" show-password></el-input>
        </el-form-item>
        <el-form-item class="login_btn">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import '../css/global.css'
export default {
  name: 'login',
  data() {
    return {
      login_form: {
        username: 'admin',
        password: 'healthkiwi@2020'
      },
      login_rules: {
        username: [{ required: true, message: '请输用户名', trigger: 'blur' }],
        password: [{ min: 6, message: '长度不少于6位', trigger: 'blur' }]
      }
    }
  },
  methods: {
    onSubmit() {
      console.log('submit!')
    },
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        let { status: res } = await this.reqWooService(
          'token',
          this.login_form,
          'post'
        )
        let result = await this.reqWooService('token', this.login_form, 'post')
        if (res === 200) {
          this.$message.success('登陆成功')
        }
        window.sessionStorage.setItem('token', result.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login {
  background-color: #74c774;
  height: 100%;
}
.login_box {
  width: 10rem;
  height: 8rem;
  background-color: azure;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 5%;

  box-shadow: 0 0 10px #ddd;
  .avantar_box {
    height: 4rem;
    width: 4rem;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 9rem;
    padding-bottom: 1rem;
  }
}
</style>>

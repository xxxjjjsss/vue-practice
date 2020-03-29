<template>
  <div class="home">
    <el-container class="home-container">
      <el-header>
        <div class="home-header">
          <img class="home-logo" src="../../assets/img/LOGO1.jpg" alt="home" />
          <span>后台管理</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="iscollapse ? '64px':'200px'">
          <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#2a562a"
            text-color="#fff"
            active-text-color="#ffd04b"
            unique-opened
            :collapse="iscollapse"
            :collapse-transition="false"
          >
            <div class="toggle-button" @click="toggle">|||</div>
            <el-submenu index="1">
              <template slot="title">
                <span>用户管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="1-1">选项1</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="2">
              <template slot="title">
                <span>权限管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="2-1">选项1</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="3">
              <template slot="title">
                <span>商品管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="31-1">选项1</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="4">
              <template slot="title">
                <span>订单管理</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="4-1">选项1</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
            <el-submenu index="5">
              <template slot="title">
                <span>数据统计</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="1-1">数据统计</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      iscollapse: false
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    handleOpen () {},
    handleClose () {},
    toggle () {
      this.iscollapse = !this.iscollapse
    }
  }
}
</script>

<style lang="less" scoped>
.el-header,
.el-footer {
  background-color: #00933b;
  color: #eee;
  text-align: center;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  font-size: 0.5em;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
  }
  > div > span {
    margin-left: 10px;
  }
}

.el-aside {
  background-color: #2a562a;
  color: #eee;
  text-align: center;
  line-height: 200px;
  .el-menu {
    border-right: 0;
  }
}
.home {
  height: 100%;
}
.home-container {
  height: 100%;
}
.el-main {
  background-color: #fff;
  color: #eee;
  text-align: center;
  line-height: 160px;
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.home-logo {
  width: 70px;
  background-color: #eee;
}
.toggle-button {
  background-color: #1a771a;
  font-size: 0.1rem;
  line-height: 0.5rem;
  letter-spacing: 0.2rem;
  cursor: pointer;
}
</style>

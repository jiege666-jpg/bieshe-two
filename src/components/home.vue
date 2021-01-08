<template>
  <div>
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" alt="摇滚" />
          <span>地铁环境监测系统</span>
        </div>
        <div class="user_box">
          <el-dropdown class="avatar-container" trigger="click">
            <div class="avatar-wrapper">
              <img src="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80" alt="摇滚" />
              <span class="nickName">{{ userInfo.username }}</span>
              <i class="el-icon-caret-bottom" />
            </div>
            <el-dropdown-menu>
              <el-dropdown-item>
                <span style="display: block" @click="showOwner">个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <span style="display: block" @click="UpdatePassword">修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <span style="display: block" @click="loginOut">退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container class="wrap">
        <!-- 测边框 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 测边栏菜单区域 -->
          <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            :collapse="isCollapse"
            :collapse-transition="false"
            :unique-opened="true"
            router
            :default-active="activePath"
          >
            <el-menu-item index="/welcome" @click="saveNavState('/welcome')">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>首页</span>
            </el-menu-item>
            <el-submenu :index="'/' + item.name" v-for="(item, index) in menusList" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconObj[index]"></i>
                <!-- 文本 -->
                <span>{{ item.name }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{ subItem.Cname }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!--右侧内容主体-->
        <router-view class="container"></router-view>
      </el-container>
    </el-container>

    <!-- 修改密码 对话框 -->
    <el-dialog :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 对话框的标题  -->
      <span class="Update_title">修改用户的密码</span>
      <!-- 内容主体部分 -->
      <el-form :model="editPassword" :rules="editPasswordRules" ref="editPasswordRef" label-width="100px">
        <el-form-item label="用户名:">
          <el-input v-model="editPassword.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="旧密码:" prop="password">
          <el-input v-model="editPassword.password"></el-input>
        </el-form-item>
        <el-form-item label="新密码:" prop="newPassword">
          <el-input v-model="editPassword.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码:" prop="checkPassword">
          <el-input v-model="editPassword.checkPassword"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeClosed">取 消</el-button>
        <el-button type="primary" @click="UpdatePasswordFn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  created() {
    const token = window.sessionStorage.getItem('token')
    if (!token) {
      setTimeout(() => {
        this.$message.error('用户登录失败')
        return this.$router.back()
      }, 2000)
    }
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  mounted() {
    this.userInfo = Cookies.get('userInfo') ? JSON.parse(Cookies.get('userInfo')) : {}
    console.log(this.userInfo)
  },
  data() {
    // 新密码校验
    const checkNewPasssword = (rule, value, callback) => {
      const PasswordReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$/
      if (!value) {
        return callback(new Error('密码不能为空'))
      }
      setTimeout(() => {
        if (PasswordReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的密码格式'))
        }
      }, 100)
    }
    // 确认密码校验
    const checkPasssword = (rule, value, callback) => {
      const PasswordReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$/
      if (!value) {
        return callback(new Error('密码不能为空'))
      }
      setTimeout(() => {
        if (PasswordReg.test(value)) {
          if (this.editPassword.newPassword !== value) {
            callback(new Error('两次密码不一致'))
          }
          callback()
        } else {
          callback(new Error('请输入正确的密码格式'))
        }
      }, 100)
    }
    return {
      // 左侧菜单数据
      menusList: [],
      // 用户信息
      userInfo: {},
      iconObj: {
        0: 'iconfont icon-user',
        1: 'iconfont icon-tijikongjian',
        2: 'iconfont icon-shangpin',
        3: 'iconfont icon-danju',
        4: 'iconfont icon-baobiao',
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
      // 是否打开修改对话框
      editDialogVisible: false,
      // 保存修改密码的对象
      editPassword: {
        username: '',
        password: '',
        newPassword: '',
        checkPassword: '',
      },
      // 修改密码的校验
      editPasswordRules: {
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        newPassword: [{ validator: checkNewPasssword, trigger: 'blur' }],
        checkPassword: [{ validator: checkPasssword, trigger: 'blur' }],
      },
    }
  },
  methods: {
    loginOut() {
      // 清除sessionstorage中保存的数据
      window.sessionStorage.clear()
      this.$confirm('此操作将会退出登录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '成功退出登录!',
          })
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      console.log(res)
      if (res.status !== 200) return this.$message.error(res.meta.msg)
      this.menusList = res.data
      console.log(this.menusList)
    },
    // 点击按钮是否折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击连接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    // 点击 修改密码
    UpdatePassword() {
      this.editDialogVisible = true
    },
    // 修改密码
    async UpdatePasswordFn() {
      const res = await this.$http.post('UpdatePassword', this.editPassword)
      if (res.status === 200) {
        this.$message.success('修改成功')
        this.editDialogVisible = false
      } else {
        this.$message.error('修改失败')
      }
    },
    // 关闭对话框事件
    editDialogClosed() {
      this.editDialogVisible = false
    },
    // 打开个人中心
    showOwner() {},
    // 关闭对话框
    changeClosed() {
      this.editPassword = {}
      this.editDialogVisible = false
    },
  },
  watch: {
    userInfo: {
      deep: true,
      handler: function (newV) {
        this.editPassword.username = newV.username
      },
    },
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  position: fixed;
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: inherit;
  background-color: #fff;
  font-size: 20px;
  height: 70px !important;
  width: 100%;
  left: 0;
  top: 0;
  padding: 0 70px 0 32px;
  z-index: 100;
  margin: auto;
  & div {
    height: 100%;
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
      font-size: 20px;
      font-weight: bold;
    }
    img {
      height: 80%;
    }
  }
  .user_box .avatar-wrapper img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .user_box .avatar-wrapper span {
    font-size: 16px;
  }
}

.wrap {
  min-width: 800px;
  min-height: 840px;
  background: url('../assets/pic_bg.webp') no-repeat;
  // background-position-y: 100px;
  background-size: 100% 100%;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding-top: 94px;
  .container {
    width: 81%;
    margin-left: 20px;
  }
}

.el-aside {
  background-color: #333744;
  height: 60%;
  margin: 0 18px 30px 10px;
  border-radius: 8px;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #fff;
  border-radius: 8px;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  color: #ffffff;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.el-dialog span {
  display: block;
  margin: 20px 10px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
</style>

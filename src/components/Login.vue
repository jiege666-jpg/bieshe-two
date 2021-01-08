<template>
  <div class="login-container">
    <div class="login-box" :style="showForm ? 'height:410px': 'height:400px'">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/victory.jpg" alt="logo" />
      </div>
      <!-- 选择登录方式区域 -->
      <div class="loginMethodWrap">
        <el-switch v-model="showForm" active-text="密码登录" inactive-text="邮箱登录"></el-switch>
      </div>
      <!-- 登录表单区域 -->
      <div class="PaLogin" v-if="showForm">
        <el-form
          ref="loginFormRef"
          class="login-form"
          :rules="loginFormRules"
          :model="loginForm"
          label-width="0"
        >
          <!-- 用户名区域 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <!-- 密码区域 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              prefix-icon="iconfont icon-3702mima"
              type="password"
            ></el-input>
          </el-form-item>
          <!-- 验证码区域 -->
          <el-form-item class="login_message" prop="captchas">
            <el-input v-model="loginForm.captchas" prefix-icon="iconfont icon-morentouxiang"></el-input>
            <img
              class="get_verification"
              src="http://localhost:5000/captcha"
              alt="captcha"
              ref="captcha"
              @click="getCaptcha"
            />
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="Login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 邮箱登录表单区域 -->
      <div class="EmLogin" v-else>
        <el-form
          ref="EloginFormRef"
          class="login-form"
          :rules="EloginFormRules"
          :model="loginForm"
          label-width="0"
        >
          <!-- 用户名区域 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <!-- 密码区域 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              prefix-icon="iconfont icon-3702mima"
              type="password"
            ></el-input>
          </el-form-item>

          <!-- 验证码区域 -->
          <el-form-item class="login_message" prop="captchas">
            <el-input v-model="loginForm.captchas" prefix-icon="iconfont icon-morentouxiang"></el-input>
            <img
              class="get_verification"
              src="http://localhost:5000/captcha"
              alt="captcha"
              ref="captcha"
              @click="getCaptcha"
            />
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="Login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  data() {
    // 邮箱验证
    var checkEmail = (rule, value, callback) => {
      const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (!value) {
        return callback(new Error('邮箱不能为空'))
      }
      setTimeout(() => {
        if (mailReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的邮箱格式'))
        }
      }, 100)
    }
    // 验证验证
    var checkCaptcha = (rule, value, callback) => {
      const captchaReg = /[a-zA-Z0-9_-]+/
      if (!value) {
        return callback(new Error('验证码不能为空'))
      }
      setTimeout(() => {
        if (captchaReg.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的验证码格式'))
        }
      }, 100)
    }
    return {
      loginForm: {
        username: '',
        password: '',
        captchas: '',
      },
      // 显示登录页面
      showForm: true,

      // 密码登录验证
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3 到 10个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6 到 15个字符', trigger: 'blur' },
        ],
        captchas: [{ validator: checkCaptcha, trigger: 'blur' }],
      },
      // 邮箱登录验证
      EloginFormRules: {
        // 验证邮箱是否合法
        username: [{ validator: checkEmail, trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6 到 15个字符', trigger: 'blur' },
        ],
        captchas: [{ validator: checkCaptcha, message: '请输入验证码', trigger: 'blur' }],
      },
      // 登录的次数
      count: 0,
    }
  },
  methods: {
    // 重置登录表单
    resetLoginForm() {
      if (this.showForm === true) {
        this.$refs.loginFormRef.resetFields()
      } else {
        this.$refs.EloginFormRef.resetFields()
      }
    },
    // 表单的预验证
    Login() {
      if (this.showForm === true) {
        this.$refs.loginFormRef.validate(async (valid) => {
          if (!valid) return
          const { data: res } = await this.$http.post('login', this.loginForm)
          console.log(res)
          if (res.status === 301) {
            // 重新获取验证码
            this.getCaptcha()
            this.loginForm.captchas = ''
            return this.$message.error(res.msg)
          } else if (res.status !== 200) {
            this.getCaptcha()
            this.loginForm.captchas = ''
            return this.$message.error(res.message)
          } else {
            const userInfo = {
              phone: res.data[0].phone,
              user_id: res.data[0].user_id,
              email: res.data[0].email,
              username: res.data[0].username,
            }
            Cookies.set('userInfo', userInfo)
            this.$message.success('用户登录成功')

            // 把获取到data里的token保存到sessionStorage中
            window.sessionStorage.setItem('token', res.token)
            // 获取当天日期
            const D = this.getTime()
            // 如果不是同一天，则count变为0
            if (D !== window.localStorage.getItem('date')) {
              window.localStorage.setItem('count', 0)
            }
            window.localStorage.setItem('date', D)
            // 每一次登录 count++
            this.count = window.localStorage.getItem('count') || 0
            this.count++
            window.localStorage.setItem('count', this.count)

            // 跳转到后台页面中
            this.$router.push('/home')
          }
        })
      } else {
        this.$refs.EloginFormRef.validate(async (valid) => {
          if (!valid) return
          const { data: res } = await this.$http.post('login', this.loginForm)
          const userInfo = {
            phone: res.data[0].phone,
            user_id: res.data[0].user_id,
            email: res.data[0].email,
            username: res.data[0].username,
          }
          console.log(res)
          if (res.status === 301) {
            // 重新获取验证码
            this.getCaptcha()
            this.loginForm.captchas = ''
            return this.$message.error(res.msg)
          } else if (res.status !== 200) {
            this.getCaptcha()
            this.loginForm.captchas = ''
            return this.$message.error('用户登录失败')
          }

          Cookies.set('userInfo', userInfo)
          // 把获取到data里的token保存到sessionStorage中
          window.sessionStorage.setItem('token', res.token)
          // 跳转到后台页面中
          this.$router.push('/home')
        })
      }
    },
    // 获取时间
    getTime() {
      const t = new Date()
      const y = t.getFullYear()
      const m = t.getMonth() + 1
      const d = t.getDate()
      return (y < 10 ? '0' + y : y) + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d)
    },
    // 点击一次性图片验证码
    getCaptcha() {
      this.$refs.captcha.src = 'http://localhost:5000/captcha?time=' + Date.now()
    },
  },
  mounted() {
    this.getCaptcha()
  },
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  position: relative;
  background-image: url('../assets/timg.jpg');
  background-position: center center;
  .login-box {
    width: 450px;
    background-color: transparent;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
      width: 130px;
      height: 130px;
      // border: 1px solid #eeeeee;
      border-radius: 50%;
      padding: 10px;
      // box-shadow: 0 0 10px #ddd;
      // position: absolute;
      position: relative;
      left: 50%;
      transform: translate(-50%, -50%);
      // background-color: #ffffff;
      img {
        position: absolute;
        widows: 100%;
        height: 100%;
        left: 50%;
        transform: translate(-50%);
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .loginMethodWrap {
      position: absolute;
      top: 30%;
      right: 10%;
      span {
        font-size: 16px;
        font-weight: 600;
      }
    }
    .EmLogin {
      .login_message {
        position: relative;
        .get_verification {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          border: 0;
          color: #ccc;
          font-size: 12px;
          background: transparent;
        }
      }
    }
    .PaLogin {
      .login_message {
        position: relative;
        .get_verification {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          border: 0;
          color: #ccc;
          font-size: 12px;
          background: transparent;
        }
      }
    }
    .login-form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>

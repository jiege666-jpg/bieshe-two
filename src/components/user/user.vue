<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">活动管理</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索与添加区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="users" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="phone"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="status">
          <!--作用域插槽  -->
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.status">已启用</el-tag>
            <el-tag type="danger" v-else>已停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.user_id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.user_id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <span>添加用户</span>
      <!-- 内容主体部分 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" placeholder="请输入密码" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="isCheckPassword">
          <el-input v-model="checkPassword" placeholder="请确认密码" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="addForm.status" placeholder="请选择" disabled>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addForm.role_id" placeholder="请选择">
            <el-option v-for="item in roles" :key="item.role_id" :label="item.role_name" :value="item.role_id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="picture">
          <el-upload class="avatar-uploader" action="http://localhost:5000/manage/img/upload" name="image" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="addForm.mainPic" :src="addForm.mainPic" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <span>修改用户</span>
      <!-- 内容主体部分 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" prop="picture">
          <el-upload class="avatar-uploader" action="http://localhost:5000/manage/img/upload" name="image" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="editForm.mainPic" :src="addForm.mainPic" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed" style="border-raduis: 5px">
      <span>分配角色</span>
      <p>
        当前的用户:
        <span>{{ userinfo.username }}</span>
      </p>
      <p>
        当前的角色:
        <span>{{ userinfo.role_name }}</span>
      </p>
      <p>
        分配的新角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option v-for="item in roleList" :key="item.role_id" :label="item.role_name" :value="item.role_id"></el-option>
        </el-select>
      </p>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  mounted() {
    this.$nextTick(() => {
      this.getRole()
    })
  },
  data() {
    // 验证邮箱的规则
    var checkemail = (rule, value, cb) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机的规则
    var checkephone = (rule, value, cb) => {
      const regPhone = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regPhone.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    // 验证用户名
    var checkeName = (rule, value, cb) => {
      const regName = /[a-zA-Z0-9]+/
      if (regName.test(value)) {
        // 合法的用户名
        return cb()
      }
      cb(new Error('请输入合法的用户名'))
    }
    // 密码比较
    var isCheckPassword = (rule, value, cb) => {
      console.log(this.checkPassword, this.addForm.password)
      if (!String(this.checkPassword) || String(this.checkPassword) === 'null' || String(this.checkPassword) === 'undefined' || String(this.checkPassword) !== this.addForm.password) {
        cb(new Error('两次密码不一致'))
      }
      return cb()
    }

    return {
      // 分页参数
      queryInfo: {
        query: '',
        // 当前第几页
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 10,
      },
      users: [],
      total: 0,
      // 保存角色列表
      roles: [],
      // 状态选择器的选择值
      statusOptions: [
        {
          value: 1,
          label: '已启用',
        },
        { label: '已停用', value: 0 },
      ],
      // 控制添加对话框的显示或隐藏
      addDialogVisible: false,
      // 保存确认密码的数据
      checkPassword: '',
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        phone: '',
        email: '',
        status: 1,
        role_id: 1,
        mainPic: '',
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3到10个字符之间',
            tigger: 'blur',
          },
          { validator: checkeName, trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 10,
            message: '用户名的密码在6到10个字符之间',
            tigger: 'blur',
          },
        ],
        isCheckPassword: [{ validator: isCheckPassword, trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkephone, trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' },
        ],
      },
      // 控制显示修改对话框
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改框的校验规则
      editFormRules: {
        checkephone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkephone, trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' },
        ],
      },
      // 控制分配角色对话框的显示
      setRoleDialogVisible: false,
      // 保存需要被分配角色的用户信息
      userinfo: {},
      // 保存当前角色列表的数据
      roleList: [],
      // 已选中的Id
      selectedRoleId: '',
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.status !== 200) return this.$message.error('获取列表失败')
      // 保存total总页数，users用户列表
      this.users = res.data.users
      this.total = res.data.total
      console.log(res, this.users, this.total)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      console.log(this.queryInfo)
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听Switch 开关的状态
    async userStateChange(userInfo) {
      console.log(typeof userInfo.status)
      const state = userInfo.status ? 1 : 0
      const { data: res } = await this.$http.post(`users/${userInfo.user_id}/state/${state}`)
      if (res.status !== 200) {
        this.userInfo.mg_state = !this.userInfo.mg_state
        return this.$message.erroe('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 关闭对话框时，清空表单数据
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.checkPassword = ''
      this.addForm.role_id = null
      this.addForm.mainPic = ''
    },
    // 点击按钮，添加新用户时进行表单验证
    addUser() {
      this.$refs.addFormRef.validate(async (vaild) => {
        if (!vaild) return this.$message.error('请输入正确的信息')
        // 发起添加用户的网络请求
        const res = await this.$http.post('manage/user/add', this.addForm)
        if (res.status === 301) return this.$message.error(res.message)
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        // 重新获取用户的列表
        this.getUserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      console.log(res)

      if (res.status !== 200) return this.$message.error('查询用户失败')

      this.editForm = res.data[0]
      this.editDialogVisible = true
    },
    // 关闭修改对话框时，清空表单数据
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改用户时进行表单验证
    editUser() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) return this.$message.error('请输入正确的信息')
        // 发起修改用户的网络请求
        const { data: res } = await this.$http.post('manage/user/update', this.editForm)
        if (res.status !== 200) return this.$message.error('更新用户失败')

        this.$message.success('更新用户成功')
        // 关闭提示框
        this.editDialogVisible = false
        // 重新获取用户的列表
        this.getUserList()
      })
    },
    // 根据ID删除对应的用户信息
    async removeUserById(id) {
      // 弹框询问是否删除该用户信息
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => console.log(error))

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const { data: res } = await this.$http.post('manage/user/delete', { user_id: id })

      if (res.status !== 200) return this.$message.error('用户删除失败')

      this.$message.success('用户删除成功')
      this.getUserList()
    },
    // 获取角色列表
    async getRole() {
      const { data: res } = await this.$http.get('roles')
      this.roles = res.data.map((item) => {
        const role = {
          role_id: item.role_id,
          role_name: item.role_name,
        }
        return role
      })
    },
    // 展示分配角色的对话框
    async setRole(userinfo) {
      this.userinfo = userinfo

      // 在展现对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')

      if (res.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.roleList = res.data
      console.log(this.roleList)

      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色!')
      }

      const { data: res } = await this.$http.post(`users/${this.userinfo.user_id}/role`, {
        rid: this.selectedRoleId,
      })
      if (res.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.setRoleDialogVisible = false
    },
    handleAvatarSuccess(res, file) {
      this.addForm.mainPic = URL.createObjectURL(file.raw)
      console.log(this.addForm)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
  },
}
</script>

<style lang="less" scoped>
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.el-dialog p {
  font-size: 14px;
  font-weight: bold;
}
.el-dialog p span {
  display: inline-block;
  margin-left: 20px;
}
.el-dialog span {
  display: block;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>

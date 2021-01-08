<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe @expand-change="open">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item, index) in roleRightList" :key="item.ps_id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag type="danger" closable @close="removeRightById(scope.row, item.ps_id)">{{ item.ps_name }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <el-row :class="[index1 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item1, index1) in item.children" :key="item1.ps_id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item1.ps_id)">{{ item1.ps_name }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item2 in item1.children" :key="item2.ps_id" closable @close="removeRightById(scope.row, item2.ps_id)">{{ item2.ps_name }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列  -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="role_name" width="220px"></el-table-column>
        <el-table-column label="角色描述" prop="role_Desc" width="220px"></el-table-column>
        <el-table-column label="状态" prop="status" width="220px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.status">已启用</el-tag>
            <el-tag type="danger" v-else>已停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.role_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.role_id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetDialogVisible(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <span>修改信息</span>
      <!-- 内容主体部分 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="editForm.role_name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="role_Desc">
          <el-input v-model="editForm.role_Desc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <span>添加角色信息</span>
      <!-- 内容主体部分 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="addForm.role_name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="role_Desc">
          <el-input v-model="addForm.role_Desc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog :visible.sync="SetDialogVisible" width="50%" @close="setRightDialogClosed">
      <span>分配权限</span>
      <!-- 内容主体部分 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="ps_id" default-expand-all :default-checked-keys="defaulKeys" ref="treeRef"></el-tree>
      <!-- 底部区域 -->
      <span slot="footer">
        <el-button @click="SetDialogVisible">取 消</el-button>
        <el-button type="primary" @click="allRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      // 所有角色列表数据
      roleList: [],
      // 保存角色列表权限数据
      roleRightList: [],
      // 显示编辑对话框是否显示
      editDialogVisible: false,
      // 根据ID查询到的角色信息
      editForm: {},
      // 编辑表单规则
      editFormRules: {
        role_name: [{ required: true, message: '角色名不能为空', tigger: 'blur' }],
        role_Desc: [{ required: true, message: '角色描述不能为空', tigger: 'blur' }],
      },
      // 显示添加对话框是否显示
      addDialogVisible: false,
      // 根据ID查询到的角色信息
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      // 编辑表单规则
      addFormRules: {
        role_name: [{ required: true, message: '角色名不能为空', tigger: 'blur' }],
        role_Desc: [{ required: true, message: '角色描述不能为空', tigger: 'blur' }],
      },
      // 分配角色对话框是否显示
      SetDialogVisible: false,
      // 所有权限的数据
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'ps_name',
        children: 'children',
      },
      // 默认勾选中的项
      defaulKeys: [],
      // 保存roleID
      roleId: '',
    }
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.roleList = res.data

      console.log(this.roleList)
    },
    // 获取所有角色列表的权限
    async getRoleRightList() {
      const res = await this.$http.get('roles/rights')
      if (res.status !== 200) this.$message.error('获取角色权限列表失败')
      this.$message.success('获取角色权限列表成功')
      this.roleRightList = res.data
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)

      if (res.status !== 200) {
        return this.$message.error('获取指定的角色列表失败')
      }

      this.editForm = res.data[0]
      console.log(this.editForm)
      this.editDialogVisible = !this.editDialogVisible
    },
    // 关闭编辑对话框
    editDialogClosed() {
      this.editDialogVisible = false
    },
    // 点击确定按钮,编辑信息的表单验证
    editRole() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请输入正确的信息')
        // 发起修改角色信息的请求
        const { data: res } = await this.$http.post(`roles/${this.editForm.role_id}`, {
          role_name: this.editForm.role_name,
          role_Desc: this.editForm.role_Desc,
        })
        console.log(res)
        // 重新获取所有角色列表
        this.getRolesList()
        this.editDialogVisible = !this.editDialogVisible
      })
    },
    // 根据ID删除对应的角色
    async removeRoleById(id) {
      console.log(id)
      // 弹框询问是否删除该角色信息
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => console.log(error))

      if (confirmResult !== 'confirm') {
        return this.$message.error('已经取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${id}`)
      console.log(res)
      if (res.status !== 200) return this.$message.error('角色删除失败')

      this.$message.success('角色删除成功')
      this.getRolesList()
    },
    // 关闭添加角色对话框
    addDialogClosed() {
      this.addDialogVisible = false
    },
    // 点击确定按钮,添加角色的信息的表单验证
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('填写的信息有误')

        // 发送请求添加角色信息请求
        const { data: res } = await this.$http.post('roles', {
          role_name: this.addForm.role_name,
          role_Desc: this.addForm.role_Desc,
          status: 1,
        })
        console.log(res)

        // 刷新页面
        this.getRolesList()
        this.addDialogVisible = false
      })
    },
    // 点击关闭按钮，删除对应角色的权限
    async removeRightById(role, rightId) {
      // 弹框询问是否删除该权限
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((error) => console.log(error))

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.role_id}/rights/${rightId}`)

      if (res.status !== 200) {
        return this.$message.error('删除该权限失败')
      }

      this.$message.success('删除权限成功')
      // 重新渲染角色列表
      this.getRolesList()
      role.children = res.data
    },
    async showSetDialogVisible(role, arr) {
      this.roleId = role.id

      const { data: res } = await this.$http.get('rights/tree')

      if (res.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }

      this.rightList = res.data

      // 递归获取二级节点的id
      this.getLeafKeys(this.rightList, this.defaulKeys)
      this.SetDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有二级权限的id，并保存到defaultkeys数组中
    getLeafKeys(node, arr) {
      console.log(node)
      // 如果当前node节点不包含children属性，则是二级节点
      if (!node.children) {
        return arr.push(node.ps_id)
      }
      node.children.forEach((item) => {
        console.log(item)
        this.getLeafKeys(item, arr)
      })
    },
    setRightDialogClosed() {
      this.defaulKeys = []
    },
    async allRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('更新权限失败')
      }

      this.$message.success('更新列表成功')
      this.SetDialogVisible = false

      // 更新角色列表数据
      this.getRolesList()
    },
    async open(row, expandedRows) {
      this.roleRightList = []
      const { data: res } = await this.$http.get('roles/rights', { params: { ps_ids: row.ps_ids } })
      this.roleRightList = res.data
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.el-dialog span {
  display: block;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>

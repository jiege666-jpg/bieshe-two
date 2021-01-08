<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据管理</el-breadcrumb-item>
      <el-breadcrumb-item>数据列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索与添加区域 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList" @change="value => this.queryInfo.digit=value.length">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col> -->
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="温度/℃" prop="temperature"></el-table-column>
        <el-table-column label="湿度/℃" prop="humidity"></el-table-column>
        <el-table-column label="二氧化碳浓度/g/L" prop="CO2"></el-table-column>
        <el-table-column label="创建时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dataFormat}}</template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        digit: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 获取商品列表的对象
      goodslist: [],
      // 获取商品列表的总数目
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      this.goodslist = res.data

      this.total = res.total

      console.log(this.goodslist, this.total)
    },
    // 改变每页的数量,触发事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 改变页码时，触发此事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击删除按钮 触发事件
    async removeById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该条记录吗, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((error) => error)

      console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const { data: res } = await this.$http.delete(`goods/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }

      this.$message.success('删除成功')
      // 刷新商品列表
      this.getGoodsList()
    },
    // 跳转到商品添加的界面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  },
}
</script>

<style lang="less" scoped>
</style>

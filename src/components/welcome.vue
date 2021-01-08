<template>
  <div class="home">
    <div class="container_wrap">
      <p class="title">今日数据</p>
      <div class="main_content">
        <div class="item" :class="bgColorList[index % 5]" v-for="(item, index) in toDay" :key="index">
          <p class="item__title">{{ item.name }}</p>
          <p class="item__value">{{ item.count }}</p>
        </div>
      </div>
    </div>
    <div class="container_chart">
      <!-- 日期选择器 -->
      <p class="datePicker">
        <span>当月用户分析:</span>
        <el-date-picker v-model="searchTime" type="month" value-format="yyyy-MM" format="yyyy-MM" :picker-options="endDate" @change="dateChange" placeholder="选择月"></el-date-picker>
      </p>
      <!-- 图表 -->
      <div id="myChart"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  data() {
    return {
      bgColorList: [], // 数据背景色
      // 保存传感数据
      date: [],
      Htemp: [],
      Ltemp: [],
      humd: [],
      carbon: [],
      // 今日数据
      toDay: [
        { name: '今日浏览数量', count: 0 },
        { name: '今日最高温度', count: 0 },
        { name: '今日最低温度', count: 0 },
        { name: '今日最高湿度', count: 0 },
        { name: '今日最高CO2浓度', count: 0 },
      ],
      // 搜索时间
      searchTime: '',
      // 禁止选择时间
      endDate: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
      },
      // 折线图echarts初始化选项
      echartsOption: {
        legend: {
          data: ['最高温度', '最低温度', '湿度', '二氧化碳'],
        },
        xAxis: {
          name: '时间',
          nameTextStyle: {
            fontWeight: 600,
            fontSize: 18,
          },
          type: 'category',
          boundaryGap: false,
          data: this.date, // 绑定实时数据数组
        },
        yAxis: {
          name: '数据',
          nameTextStyle: {
            fontWeight: 600,
            fontSize: 18,
          },
          type: 'value',
          min: 0,
          scale: true,
          boundaryGap: ['10%', '10%'],
          axisLabel: {
            interval: 'auto',
            formatter: '{value}℃',
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>{a0}:{c0}℃,<br/>{a1}:{c1}℃,<br/>{a2}:{c2}℃,<br/>{a3}:{c3}g/L',
        },
        series: [
          {
            name: '最高温度',
            type: 'line',
            smooth: true,
            data: this.Htemp, // 绑定实时数据数组
          },
          {
            name: '最低温度',
            type: 'line',
            smooth: true,
            data: this.Ltemp, // 绑定实时数据数组
          },
          {
            name: '湿度',
            type: 'line',
            smooth: true,
            data: this.Ltemp, // 绑定实时数据数组
          },
          {
            name: '二氧化碳',
            type: 'bar',
            smooth: true,
            barMaxWidth: '15%',
            data: this.carbon, // 绑定实时数据数组
          },
        ],
      },
    }
  },
  methods: {
    // 随机处理数据背景颜色
    randomsort(a, b) {
      return Math.random() > 0.5 ? -1 : 1
    },
    // 更改日期
    dateChange(date) {
      this.searchTime = date
      this.Htemp = []
      this.Ltemp = []
      this.humd = []
      this.carbon = []
      this.getIndexMsg()
    },
    // 获取首页统计信息
    async getIndexMsg() {
      const thisMonth = new Date(this.searchTime)
      // 获取当前月份日期
      const xAxisData = this.getDateCount(thisMonth.getFullYear(), thisMonth.getMonth() + 1)
      // 获取温湿度数据，CO2浓度数据
      const { data: res } = await this.$http.post('MonthDate', { searchTime: this.searchTime })
      res.data.unshift({ highTemp: 0, lowTemp: 0, highHum: 0, highCO2: 0 })
      // 遍历数组
      res.data.forEach((item) => {
        this.Htemp.push(item.highTemp)
        this.Ltemp.push(item.lowTemp)
        this.humd.push(item.highHum)
        this.carbon.push(item.highCO2)
      })
      xAxisData.unshift('0')
      this.echartsOption.xAxis.data = xAxisData
      this.echartsOption.series[0].data = this.Htemp
      this.echartsOption.series[1].data = this.Ltemp
      this.echartsOption.series[2].data = this.humd
      this.echartsOption.series[3].data = this.carbon
      this.myChart.setOption(this.echartsOption)
    },
    // 获取指定的月份日期
    getDateCount(y, m) {
      if (!y || !m) return false
      // 获取当前年月
      const d = new Date(y, m, 0)
      // 获取当前的日
      let num = d.getDate()

      // 获取当前日期
      const toDay = this.getToday()
      if (y == toDay.split('-')[0] && m == toDay.split('-')[1]) {
        num = Number(toDay.split('-')[2])
      }

      // 创建指定num长度的数组
      const newArray = new Array(num).fill('').map((item, index) => index + 1)
      return newArray
    },
    // 获取当前的日期
    getToday() {
      const day = new Date()
      const y = day.getFullYear()
      const m = day.getMonth() + 1
      const d = day.getDate()
      return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`
    },
  },
  created() {
    const thisMonth = new Date()
    const bgcolor = ['res__red', 'res__green', 'res__blue', 'res__orange', 'res__purple']
    this.searchTime = `${thisMonth.getFullYear()}-${thisMonth.getMonth() + 1 < 10 ? '0' + (thisMonth.getMonth() + 1) : thisMonth.getMonth() + 1}`
    this.bgColorList = bgcolor.sort(this.randomsort)
  },
  mounted() {
    let H, L, HH, C
    setInterval(async () => {
      const { data: res } = await this.$http.get('goods/show')
      this.toDay.forEach((item) => {
        switch (item.name) {
          case '今日最高温度':
            H = res.data[res.data.length - 1].temperature
            if (H > item.count) {
              item.count = H
            }
            break
          case '今日最低温度':
            L = res.data[res.data.length - 1].temperature
            item.count = item.count === 0 ? res.data[res.data.length - 1].temperature : item.count
            if (L < item.count) {
              item.count = L
            }
            break
          case '今日最高湿度':
            HH = res.data[res.data.length - 1].humidity
            if (HH > item.count) {
              item.count = HH
            }
            break
          case '今日最高CO2浓度':
            C = res.data[res.data.length - 1].CO2
            if (C > item.count) {
              item.count = C
            }
            break
        }
      })
    }, 3000)
    this.toDay.forEach((item) => {
      if (item.name === '今日浏览数量') {
        item.count = window.localStorage.getItem('count') * 1
      }
    })
    // setTimeout(() => {
    //   this.myChart = echarts.init(document.getElementById('myChart'), 'light') // 初始化echarts, theme为light
    //   this.myChart.setOption(this.echartsOption) // echarts设置初始化选项
    //   this.getIndexMsg()
    // }, 4000)
    setTimeout(() => {
      this.myChart = echarts.init(document.getElementById('myChart'), 'light') // 初始化echarts, theme为light
      this.myChart.setOption(this.echartsOption) // echarts设置初始化选项
      this.getIndexMsg()
    }, 4000)
  },
  watch: {
    toDay: {
      deep: true,
      handler: async function (newV) {
        this.toDay = newV
        await this.$http.post('ToDay', this.toDay)
      },
    },
  },
}
</script>

<style lang="less" scoped>
.home {
  width: 83%;
  height: 100%;
  margin-bottom: 20px;
  font-size: 14px;
}
.container_wrap {
  margin: 0 auto 20px;
  margin-left: 20px;
  background: #fff;
  border-radius: 4px;
  padding: 20px 30px;
  font-size: 16px;
  font-weight: bold;
}
.container_chart {
  margin: 0 auto 20px;
  margin-left: 20px;
  background: #fff;
  border-radius: 4px;
  padding: 20px 30px;
  font-size: 16px;
  font-weight: bold;
}
.main_content {
  margin: 20px 0;
  display: flex;
  justify-content: space-around;
  .item {
    padding: 10px 50px;
    color: white;
    font-size: 28px;
    border-radius: 6px;
    min-width: 100px;
    .item__title {
      font-size: 14px;
      font-weight: bold;
      margin-left: -20px;
    }
    .item__value {
      margin: 20px 0;
      text-align: center;
    }
  }
}
#myChart {
  width: 100%;
  height: 500px;
  margin: 0 auto;
  margin-top: 50px;
  text-align: center;
}
.el-input {
  margin-left: 20px;
}

.res__red {
  background-color: #e7505a;
}
.res__blue {
  background-color: #3598dc;
}
.res__green {
  background-color: #26b6bb;
}
.res__orange {
  background-color: #e6a23c;
}
.res__purple {
  background-color: #a14fc5;
}
</style>

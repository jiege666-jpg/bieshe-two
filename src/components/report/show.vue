<template>
  <div class="show_container">
    <div class="container_wrap">
      <div class="show_title">
        <p class="info">实时的数据</p>
        <div class="show_content">
          <div class="item" :class="bgColorList[index % 3]" v-for="(item, index) in toDay" :key="index">
            <p class="item__title">{{ item.name }}</p>
            <p class="item__value">{{ item.count }}</p>
          </div>
        </div>
      </div>
    </div>
    <div id="myChart"></div>
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'DynamicLineChart',
  data() {
    return {
      // 数据背景色
      bgColorList: [],
      // 实时数据数组
      date: [],
      // 保存时间
      time: [],
      temperature: [],
      humidity: [],
      CO2: [],
      // 折线图echarts初始化选项
      echartsOption: {
        legend: {
          data: ['温度', '湿度', '二氧化碳'],
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
          scale: true,
          boundaryGap: ['15%', '15%'],
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
            name: '温度',
            type: 'line',
            smooth: true,
            data: this.temperature, // 绑定实时数据数组
          },
          {
            name: '湿度',
            type: 'line',
            smooth: true,
            data: this.humidity, // 绑定实时数据数组
          },
          {
            name: '二氧化碳',
            type: 'line',
            smooth: true,
            data: this.humidity, // 绑定实时数据数组
          },
        ],
      },
      // 实时数据
      toDay: [
        { name: '当前温度', count: 0 },
        { name: '当前湿度', count: 0 },
        { name: '当前CO2浓度', count: 0 },
      ],
    }
  },
  mounted() {
    this.myChart = echarts.init(document.getElementById('myChart'), 'light') // 初始化echarts, theme为light
    this.myChart.setOption(this.echartsOption) // echarts设置初始化选项
    setInterval(this.addData, 3000) // 每三秒更新实时数据到折线图
  },
  created() {
    const bgcolor = ['res__red', 'res__green', 'res__blue']
    this.bgColorList = bgcolor.sort(this.randomsort)
  },
  methods: {
    // 获取当前时间
    getTime: function () {
      var ts = arguments[0] || 0
      var t, h, i, s
      t = ts ? new Date(ts * 1000) : new Date()
      h = t.getHours()
      i = t.getMinutes()
      s = t.getSeconds()
      // 定义时间格式
      return (h < 10 ? '0' + h : h) + ':' + (i < 10 ? '0' + i : i) + ':' + (s < 10 ? '0' + s : s)
    },
    // 添加实时数据
    addData: async function () {
      // 从接口获取数据并添加到数组
      const { data: res } = await this.$http.get('/goods/show')
      this.time.push(new Date().getMinutes())
      this.date.push(this.getTime(Math.round(new Date().getTime() / 1000)))
      if (this.time[this.time.length - 1] - this.time[0] > 0) {
        // 清空date数组第一项
        this.time.shift()
        this.date.shift()
      }
      res.data.forEach((item) => {
        this.temperature.push(item.temperature)
        this.humidity.push(item.humidity)
        this.CO2.push(item.CO2)
      })
      this.toDay[0].count = this.temperature[this.temperature.length - 1]
      this.toDay[1].count = this.humidity[this.humidity.length - 1]
      this.toDay[2].count = this.CO2[this.CO2.length - 1]
      // 重新将数组赋值给echarts选项
      this.echartsOption.xAxis.data = this.date
      this.echartsOption.series[0].data = this.temperature
      this.echartsOption.series[1].data = this.humidity
      this.echartsOption.series[2].data = this.CO2
      this.myChart.setOption(this.echartsOption)
    },
    // 随机处理数据背景颜色
    randomsort(a, b) {
      return Math.random() > 0.5 ? -1 : 1
    },
  },
}
</script>

<style lang="less" scoped>
.show_container {
  .container_wrap {
    background-color: #fff;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
    .show_title {
      .info {
        font-size: 20px;
        font-weight: bold;
      }
      .show_content {
        display: flex;
        text-align: center;
        justify-content: space-around;
        .item {
          padding: 10px 50px;
          font-size: 20px;
          border-radius: 6px;
          color: #fff;
          p.item__title {
            font-size: 16px;
            font-weight: bold;
          }
          p.item__value {
          }
        }
      }
    }
  }
}
#myChart {
  width: 100%;
  height: 450px;
  padding: 20px 0px;
  margin: 0 auto;
  background-color: #fff;
  text-align: center;
  border-radius: 6px;
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
</style>

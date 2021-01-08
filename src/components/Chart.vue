<template>
  <div :id="id" :style="style"></div>
</template>

<script>
export default {
  name: 'Chart',

  data() {
    return {
      chart: '', // echarts实例
    }
  },

  props: {
    // 父组件需要传递的参数：id，width，height，option

    id: {
      type: String,
    },

    width: {
      type: String,

      default: '100%',
    },

    height: {
      type: String,
      default: '600px',
    },

    option: {
      type: Object,

      // Object类型的prop值一定要用函数return出来，不然会报错。原理和data是一样的，

      // 使用闭包保证一个vue实例拥有自己的一份props

      default() {
        return {
          title: {
            text: '活动参与量',
            x: 'center',
            y: 'top',
            textAlign: 'center',
          },
          tooltip: {},
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
          yAxis: {
            type: 'value',
            minInterval: 10,
          },
          series: [
            {
              data: [820, 932, 901, 934, 1290, 1330, 1320],
              type: 'line',
            },
          ],
        }
      },
    },
  },

  computed: {
    style() {
      return {
        height: this.height,
        width: this.width,
      }
    },
  },

  mounted() {
    // this.init();
    this.$util.loadJs('https://cdn.bootcdn.net/ajax/libs/echarts/4.8.0/echarts.min.js', () => {
      this.init()
    })
  },

  methods: {
    init() {
      // this.chart = this.$echarts.init(document.getElementById(this.id));
      this.chart = window.echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.option)
      window.addEventListener('resize', this.chart.resize)
    },
  },
  watch: {
    option: {
      handler(n, o) {
        if (this.chart.setOption) {
          this.chart.setOption(n)
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

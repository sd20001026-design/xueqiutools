<template>
  <div class="chart-container">
    <div ref="chartRef" :style="{ width: '100%', height: '400px' }"></div>

    <!-- 正确率趋势评语 -->
    <div v-if="correctRateTrendComment" class="chart-comment-card">
      <div class="comment-text">📈{{ correctRateTrendComment }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: number[]
  labels: number[]
  title: string
  selectedIndex?: number
  correctRateTrendComment?: string
}

const emit = defineEmits<{
  'update:selectedIndex': [index: number]
}>()

const props = withDefaults(defineProps<Props>(), {
  selectedIndex: -1
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  // 格式化横坐标标签：第0讲为"课前测"，其他为"第X讲"
  const formatLabel = (label: number) => {
    return label === 0 ? '课前测' : `第${label}讲`
  }

  // 计算用户正确率的最小值，用于设置Y轴起点
  const validRates = props.data.filter(rate => rate > 0)
  const minCorrectRate = validRates.length > 0 ? Math.min(...validRates) : 0
  const yAxisMin = minCorrectRate > 0 ? Math.floor(minCorrectRate * 100) / 100 : 0

  const option = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#667eea',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        let result = `${params[0].name}<br/>`
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value}${param.seriesName.includes('正确率') ? '%' : ''}<br/>`
        })
        return result
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '12%',
      top: '16%',
      containLabel: true,
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderColor: 'transparent'
    },
    xAxis: {
      type: 'category',
      data: props.labels.map(formatLabel),
      axisLabel: {
        interval: 0,
        rotate: props.labels.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '正确率 (%)',
      min: yAxisMin,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      name: '📊 学生正确率',
      type: 'line',
      data: props.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: (params: any) => {
        return params.dataIndex === props.selectedIndex ? 14 : 10
      },
      lineStyle: {
        color: '#667eea',
        width: 3,
        shadowColor: 'rgba(102, 126, 234, 0.3)',
        shadowBlur: 4
      },
      itemStyle: {
        color: (params: any) => {
          return params.dataIndex === props.selectedIndex ? '#F56C6C' : '#667eea'
        },
        borderWidth: 2,
        borderColor: '#fff',
        shadowBlur: 6,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => {
          return `${params.value.toFixed(0)}%`
        },
        fontSize: 11,
        color: '#333',
        fontWeight: 'bold'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(102, 126, 234, 0.1)'
          }, {
            offset: 1, color: 'rgba(102, 126, 234, 0.05)'
          }]
        }
      },
      emphasis: {
        focus: 'series'
      },
      markPoint: props.selectedIndex >= 0 ? {
        data: [{
          coord: [formatLabel(props.labels[props.selectedIndex]), props.data[props.selectedIndex]],
          symbol: 'pin',
          symbolSize: 50,
          itemStyle: {
            color: '#F56C6C'
          },
          label: {
            show: true,
            formatter: `{c}%`,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          }
        }]
      } : undefined,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    }]
  }

  chartInstance.setOption(option)

  // 添加点击事件
  chartInstance.on('click', (params: any) => {
    if (params.seriesType === 'line') {
      emit('update:selectedIndex', params.dataIndex)
    }
  })
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch([() => props.data, () => props.labels, () => props.title, () => props.selectedIndex], async () => {
  await nextTick()
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
}

/* 正确率趋势评语样式 */
.chart-comment-card {
  margin: 12px 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.comment-text {
  font-size: 14px;
  color: white;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .trend-legend {
    gap: 16px;
  }

  .legend-item {
    font-size: 12px;
  }

  .legend-color {
    width: 10px;
    height: 10px;
  }

  .chart-comment-card {
    margin: 10px 0;
    padding: 10px 12px;
  }

  .comment-text {
    font-size: 13px;
  }
}
</style>

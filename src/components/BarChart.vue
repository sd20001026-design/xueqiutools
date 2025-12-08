<template>
  <div class="chart-container">
    <div ref="chartRef" :style="{ width: '100%', height: '400px' }"></div>

    <!-- 错误次数统计评语 -->
    <div v-if="errorCountComment" class="chart-comment-card">
      <div class="comment-text">🎯{{ errorCountComment }}</div>
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
  errorCountComment?: string
  userName?: string
}

const props = withDefaults(defineProps<Props>(), {
  average: undefined
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

  const series = [{
    name: '我的错误次数',
    type: 'bar',
    data: props.data,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: '#F56C6C'
        }, {
          offset: 1, color: '#F78989'
        }]
      },
      borderRadius: [4, 4, 0, 0],
      shadowColor: 'rgba(245, 108, 108, 0.3)',
      shadowBlur: 4
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 8,
        shadowColor: 'rgba(245, 108, 108, 0.5)'
      }
    },
    label: {
      show: true,
      position: 'top',
      color: '#F56C6C',
      fontWeight: 'bold',
      fontSize: 12
    },
    barGap: '10%',
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }]

  // 生成标题，如果有学员名称则在标题后添加
  const displayTitle = props.userName ? `${props.title}（${props.userName}）` : props.title

  const option = {
    title: {
      text: displayTitle,
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
          result += `${param.seriesName}: ${param.value}<br/>`
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
      name: '错误次数',
      min: 0,
      axisLabel: {
        formatter: '{value}'
      }
    },
    series
  }

  chartInstance.setOption(option)
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch([() => props.data, () => props.labels, () => props.title, () => props.average, () => props.userName], async () => {
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

/* 错误次数统计评语样式 */
.chart-comment-card {
  margin: 12px 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
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

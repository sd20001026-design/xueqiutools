<template>
  <div class="time-display">
    <div class="time-header">
      <h3>学习时长详情</h3>
      <div class="time-summary">
        <div class="time-item">
          <span class="time-label">平均时长:</span>
          <span class="time-value">{{ formatTime(averageTime) }}</span>
        </div>
        <div class="time-item">
          <span class="time-label">已学讲数:</span>
          <span class="time-value">{{ participatedCourses.length }}讲</span>
        </div>
      </div>
    </div>

    <div class="time-table-section">
      <h4>各课程学习时长</h4>
      <div class="time-table">
        <div class="table-header">
          <div class="table-cell header-cell">课程</div>
          <div class="table-cell header-cell">学习时长</div>
          <div class="table-cell header-cell">进度 / 状态</div>
        </div>
        <div
          v-for="course in courseTimeData"
          :key="course.unit"
          class="table-row"
        >
          <div class="table-cell">{{ course.label }}</div>
          <div class="table-cell">{{ course.time }}</div>
          <div class="table-cell status-cell">
            <div
              class="status-pill"
              :class="course.statusClass"
            >
              <span class="status-dot"></span>
              <span class="status-text">{{ course.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCourseSettingsStore } from '@/stores/courseSettings'

interface Props {
  times: number[]
  unitSequences: number[]
  encouragement: string
}

const props = defineProps<Props>()
const courseSettingsStore = useCourseSettingsStore()

// 格式化横坐标标签：第0讲为"课前测"，其他为"第X讲"
const formatLabel = (unitSequence: number): string => {
  return unitSequence === 0 ? '课前测' : `第${unitSequence}讲`
}

// 计算表格数据
const courseTimeData = computed(() => {
  return props.unitSequences.map((unit, index) => {
    const time = props.times[index] || 0
    const timeFormatted = time === 0 ? '未学习' : formatTimeForTrend(time)

    const course = courseSettingsStore.getCourse(unit)
    const label = course?.courseName || formatLabel(unit)

    let status = '未学习'
    let statusClass = 'status-not-done'

    if (time > 0) {
      status = '已完成'
      statusClass = 'status-done'
    }

    return {
      unit,
      label,
      time: timeFormatted,
      status,
      statusClass
    }
  })
})

// 计算参与的课程数量
const participatedCourses = computed(() => {
  return props.times.filter(time => time > 0)
})

const totalTime = computed(() => {
  return props.times.reduce((sum, time) => sum + time, 0)
})

const averageTime = computed(() => {
  return props.times.length > 0 ? totalTime.value / props.times.length : 0
})

const formatTime = (seconds: number): string => {
  // 处理无效值
  if (!seconds || seconds < 0) return '0小时 0分 0秒'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${hours}小时 ${minutes}分 ${remainingSeconds}秒`
}

// 趋势图时长格式化（仅显示分钟和秒）
const formatTimeForTrend = (seconds: number): string => {
  // 处理无效值
  if (!seconds || seconds < 0) return '0分0秒'

  const totalMinutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${totalMinutes}分${remainingSeconds}秒`
}
</script>

<style scoped>
.time-table-section {
  margin-top: 20px;
}

.time-table-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.time-table {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.header-cell {
  font-weight: 600;
  color: #303133;
  background-color: #fafafa;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.status-text {
  white-space: nowrap;
}

.status-done {
  background-color: #f0f9ff;
  color: #409eff;
  border-color: #d9ecff;
}

.status-not-done {
  background-color: #f4f4f5;
  color: #909399;
  border-color: #d3d4d6;
}

.time-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.time-item {
  text-align: center;
  padding: 6px;
  background: #f5f7fa;
  border-radius: 6px;
}

.time-label {
  display: block;
  font-size: 11px;
  color: #909399;
  margin-bottom: 3px;
}

.time-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .time-table-section {
    margin-top: 15px;
  }

  .table-cell {
    padding: 8px 12px;
    font-size: 13px;
  }

  .status-pill {
    padding: 4px 10px;
    font-size: 11px;
  }

  .time-summary {
    gap: 8px;
  }

  .time-item {
    padding: 5px;
  }

  .time-label {
    font-size: 10px;
  }

  .time-value {
    font-size: 13px;
  }
}
</style>
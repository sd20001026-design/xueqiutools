<template>
  <div class="course-progress">
    <h4 class="progress-title">课程进度</h4>
    <div class="course-icons-container">
      <div
        v-for="icon in courseIcons"
        :key="icon.unitSequence"
        class="course-icon-item"
        :class="{ 'completed': icon.completed, 'not-completed': !icon.completed }"
        :title="icon.tooltip"
      >
        <div class="course-icon-number">{{ icon.unitSequence }}</div>
        <div class="course-icon-name">{{ icon.courseName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLearningDataStore } from '@/stores/learningData'
import { useCourseSettingsStore } from '@/stores/courseSettings'

interface Props {
  participationData?: {
    courseCount: number
    avgCorrectRate: number
    avgTime: number
    participatedCourses: any[]
  } | null
}

const props = defineProps<Props>()
const store = useLearningDataStore()
const courseSettingsStore = useCourseSettingsStore()

// 计算课程图标
const courseIcons = computed(() => {
  if (!props.participationData) return []

  const { participatedCourses } = props.participationData
  const completedUnitSequences = new Set(
    participatedCourses
      .filter(course => course.first_cost_seconds > 0)
      .map(course => course.unit_sequence)
  )

  const coursesToShow = courseSettingsStore.courses.filter(course => course.unitSequence >= 1)

  return coursesToShow.map(course => {
    const completed = completedUnitSequences.has(course.unitSequence)
    const courseData = participatedCourses.find(c => c.unit_sequence === course.unitSequence)
    
    let tooltip = `第${course.unitSequence}讲`
    if (course.courseName && course.courseName !== `第${course.unitSequence}讲`) {
      tooltip = course.courseName
    }
    if (course.knowledgePoint) {
      tooltip += ` - ${course.knowledgePoint}`
    }
    if (completed && courseData) {
      tooltip += `\n已完成 - 正确率: ${(courseData.answer_right_rate * 100).toFixed(1)}%`
    } else {
      tooltip += '\n未完成'
    }

    return {
      unitSequence: course.unitSequence,
      courseName: course.courseName || `第${course.unitSequence}讲`,
      completed,
      tooltip
    }
  })
})
</script>

<style scoped>
.course-progress {
  margin-top: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  flex-shrink: 0;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.course-icons-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-icon-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 50px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.course-icon-item.completed {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border-color: #67c23a;
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.course-icon-item.not-completed {
  background: #f5f7fa;
  border-color: #dcdfe6;
  color: #909399;
  opacity: 0.6;
}

.course-icon-item:hover {
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.course-icon-number {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  margin-right: 12px;
  min-width: 24px;
  text-align: center;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.course-icon-item.not-completed .course-icon-number {
  background: rgba(0, 0, 0, 0.05);
}

.course-icon-name {
  font-size: 14px;
  text-align: left;
  line-height: 1.4;
  flex: 1;
  word-break: break-word;
  white-space: normal;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-progress {
    padding: 12px;
  }

  .course-icon-item {
    min-height: 45px;
    padding: 6px 10px;
  }

  .course-icon-number {
    font-size: 11px;
    margin-right: 10px;
    min-width: 20px;
    padding: 3px 5px;
  }

  .course-icon-name {
    font-size: 13px;
  }
}
</style>

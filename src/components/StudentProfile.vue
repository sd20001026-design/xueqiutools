<template>
  <div class="student-profile">
    <h3 class="profile-title">学生档案</h3>
    <div class="profile-content">
      <div class="profile-item">
        <div class="profile-label">姓名</div>
        <div class="profile-value">{{ props.userName || '未知' }}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">年级</div>
        <div class="profile-value">{{ formatGrade(props.packageGrade) }}</div>
      </div>
      <div class="profile-item">
        <div class="profile-label">辅导老师</div>
        <div class="profile-value">{{ props.counselorName || '未分配' }}</div>
      </div>
    </div>

    <!-- 激励评语 -->
    <div class="encouragement-card">
      <div class="encouragement-text">{{ encouragement }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLearningDataStore } from '@/stores/learningData'
interface Props {
  userName?: string
  packageGrade?: string
  counselorName?: string
  participationData?: {
    courseCount: number
    avgCorrectRate: number
    avgTime: number
    participatedCourses: any[]
  } | null
}

const props = defineProps<Props>()
const store = useLearningDataStore()

// 生成激励评语
const generateEncouragement = (
  courseCount: number,
  avgCorrectRate: number,
  avgTime: number,
  classAvgCorrectRate: number,
  classAvgTime: number
) => {
  // 计算各维度得分
  const participationScore = Math.min(courseCount / 6 * 100, 100) // 最多6讲

  const correctRateRatio = avgCorrectRate / classAvgCorrectRate
  const correctRateScore = correctRateRatio > 1.1 ? 100 :
                          correctRateRatio > 0.9 ? 80 :
                          correctRateRatio > 0.7 ? 60 : 40

  const timeRatio = avgTime / classAvgTime
  const efficiencyScore = timeRatio < 0.9 ? 100 :
                         timeRatio < 1.1 ? 80 :
                         timeRatio < 1.3 ? 60 : 40

  const totalScore = (participationScore * 0.2 +
                     correctRateScore * 0.4 +
                     efficiencyScore * 0.3)

  // 根据总分生成评语
  if (totalScore >= 85) return "🎉 表现卓越！你是最棒的！"
  if (totalScore >= 75) return "👍 表现优秀，继续保持！"
  if (totalScore >= 65) return "💪 表现良好，再接再厉！"
  if (totalScore >= 55) return "📈 进步明显，继续努力！"
  if (totalScore >= 45) return "🌱 正在进步，坚持就是胜利！"
  return "🌟 每一个努力都很重要，继续加油！"
}

// 计算激励评语
const encouragement = computed(() => {
  if (!props.participationData) {
    return "还没有参与课程学习，快去开启你的学习之旅吧！"
  }

  const { courseCount, avgCorrectRate, avgTime, participatedCourses } = props.participationData

  // 计算班级平均（基于实际参与的课程），处理边界情况
  let classAvgCorrectRate = avgCorrectRate // 默认使用用户平均值
  let classAvgTime = avgTime // 默认使用用户平均值

  if (store.classStats.averageCorrectRateByUnit.length > 0) {
    const validClassRates = participatedCourses
      .map(course => store.classStats.averageCorrectRateByUnit[course.unit_sequence])
      .filter(rate => rate > 0)

    if (validClassRates.length > 0) {
      classAvgCorrectRate = validClassRates.reduce((sum, rate) => sum + rate, 0) / validClassRates.length
    }
  }

  if (store.classStats.averageTimeByUnit.length > 0) {
    const validClassTimes = participatedCourses
      .map(course => store.classStats.averageTimeByUnit[course.unit_sequence])
      .filter(time => time > 0)

    if (validClassTimes.length > 0) {
      classAvgTime = validClassTimes.reduce((sum, time) => sum + time, 0) / validClassTimes.length
    }
  }

  // 确保基准值不为0
  const safeClassAvgCorrectRate = classAvgCorrectRate > 0 ? classAvgCorrectRate : avgCorrectRate
  const safeClassAvgTime = classAvgTime > 0 ? classAvgTime : avgTime

  return generateEncouragement(courseCount, avgCorrectRate, avgTime, safeClassAvgCorrectRate, safeClassAvgTime)
})

const formatGrade = (grade?: string): string => {
  if (!grade) return '未知'

  const gradeMap: Record<string, string> = {
    'one': '一年级',
    'two': '二年级',
    'three': '三年级',
    'four': '四年级',
    'five': '五年级',
    'six': '六年级'
  }

  return gradeMap[grade.toLowerCase()] || grade
}

</script>

<style scoped>
.student-profile {
  padding: 0;
}

.profile-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding: 0 15px;
  padding-top: 15px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 15px 15px 15px;
}

.profile-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.profile-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  width: 60px;
  flex-shrink: 0;
}

.profile-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-title {
    font-size: 15px;
    margin-bottom: 10px;
    padding: 0 15px;
    padding-top: 15px;
  }

  .profile-content {
    gap: 6px;
    padding: 0 15px 15px 15px;
  }

  .profile-item {
    padding: 6px 10px;
  }

  .profile-label {
    width: 55px;
    font-size: 12px;
  }

  .profile-value {
    font-size: 13px;
  }

  .encouragement-card {
    margin-top: 10px;
    padding: 10px 12px;
  }

  .encouragement-text {
    font-size: 13px;
  }
}

.encouragement-card {
  margin-top: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.encouragement-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .encouragement-section {
    padding: 6px 10px;
    margin-top: 6px;
  }

  .encouragement-text {
    font-size: 11px;
  }
}
</style>

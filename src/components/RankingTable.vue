<template>
  <div class="ranking-table">
    <div class="ranking-header">
      <h3>正确率排名 <span class="ranking-note">(按全部课程平均正确率排序)</span></h3>
      <div class="lecture-selector">
        <label>选择讲次:</label>
        <select v-model="selectedLectureValue" @change="handleLectureChange">
          <option v-for="lecture in availableLectures" :key="lecture.value" :value="lecture.value">
            {{ lecture.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="ranking-info">
      <p>当前班级共有{{ totalParticipants }}名学员参与了学习，所选讲次共有{{ currentLectureParticipants }}名学员完成学习</p>
    </div>

    <div class="table-container">
      <table class="ranking-table-content">
        <thead>
          <tr>
            <th>名次</th>
            <th>名称</th>
            <th>学号</th>
            <th>全部课程平均正确率</th>
            <th v-if="showSelectedLectureColumn">所选课程正确率</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in rankingData"
            :key="student.userId"
            :class="{ 'current-user': student.isCurrentUser }"
          >
            <td class="rank-cell">{{ student.rank }}</td>
            <td class="name-cell">{{ formatName(student.name, student.isCurrentUser) }}</td>
            <td class="id-cell">{{ student.userId }}</td>
            <td class="rate-cell">{{ formatRate(student.overallAvgRate) }}</td>
            <td v-if="showSelectedLectureColumn" class="rate-cell">{{ formatRate(student.currentRate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 排名评语 -->
    <div v-if="rankingComment" class="ranking-comment-card">
      <div class="comment-text">{{ rankingComment }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface StudentRanking {
  userId: string
  name: string
  rank: number
  overallAvgRate: number
  currentRate: number
  isCurrentUser: boolean
}

interface LectureOption {
  value: number
  label: string
}

interface Props {
  rankingData: StudentRanking[]
  totalParticipants: number
  currentLectureParticipants: number
  selectedLecture: number
  availableLectures: LectureOption[]
}

const emit = defineEmits<{
  'update:selectedLecture': [lecture: number]
}>()

const props = defineProps<Props>()

const selectedLectureValue = ref(props.selectedLecture)

const handleLectureChange = () => {
  emit('update:selectedLecture', selectedLectureValue.value)
}

// 监听props变化，更新本地状态
watch(() => props.selectedLecture, (newValue) => {
  selectedLectureValue.value = newValue
})

const formatRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}

const formatName = (name: string, isCurrentUser: boolean): string => {
  if (isCurrentUser) {
    return name
  }
  // 对于非当前用户，只显示第一个字，其余用x代替
  if (name.length <= 1) {
    return name
  }
  return name.charAt(0) + 'x'.repeat(name.length - 1)
}

// 是否显示所选课程正确率列
const showSelectedLectureColumn = computed(() => {
  return props.selectedLecture > 0
})

// 计算排名评语
const rankingComment = computed(() => {
  const currentUser = props.rankingData.find(student => student.isCurrentUser)
  if (!currentUser || props.totalParticipants === 0) {
    return ''
  }

  const rank = currentUser.rank
  const totalParticipants = props.totalParticipants
  const studentName = currentUser.name
  const percentage = (rank / totalParticipants) * 100

  // 排名前20%
  if (percentage <= 20) {
    return `非常优秀！${studentName}同学在本次班级（共${totalParticipants}人）中高居第${rank}名。宝贝总能将复杂问题拆解清晰、步步推进，并主动攻克丰富的拓展题型，这种扎实的解题思路和举一反三的能力，正是领先的关键！`
  }

  // 排名20%-50%
  if (percentage <= 50) {
    return `稳步前进！${studentName}同学在班级（共${totalParticipants}人）中位列第${rank}名，已超越半数同学。课程中逐步引导的解题思路和丰富的练习，让孩子收获了扎实的知识与良好的思维习惯，请继续保持！`
  }

  // 排名50%后
  return `为${studentName}同学的坚持点赞！学习是一场探索，重要的是保持兴趣与勇气。宝贝展现的专注和闯关决心已是成功的开始，继续加油！相信在未来的学习之旅中会有更大的突破！`
})
</script>

<style scoped>
.ranking-table {
  margin-bottom: 20px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ranking-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.ranking-note {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
  margin-left: 8px;
}

.lecture-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lecture-selector label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.lecture-selector select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  min-width: 80px;
}

.lecture-selector select:focus {
  outline: none;
  border-color: #409eff;
}

.ranking-info {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
}

.ranking-info p {
  margin: 0;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.table-container {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.ranking-table-content {
  width: 100%;
  border-collapse: collapse;
}

.ranking-table-content th,
.ranking-table-content td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.ranking-table-content th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #ebeef5;
}

.ranking-table-content tbody tr:last-child td {
  border-bottom: none;
}

.rank-cell {
  width: 60px;
  text-align: center;
  font-weight: 600;
  color: #409eff;
}

.name-cell {
  width: 120px;
  font-weight: 500;
}

.id-cell {
  width: 100px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.rate-cell {
  width: 140px;
  text-align: center;
  font-weight: 500;
}

.current-user {
  background-color: #fdf6ec;
  border-left: 3px solid #e6a23c;
}

.current-user .name-cell,
.current-user .id-cell {
  font-weight: 600;
  color: #e6a23c;
}

/* 排名评语样式 */
.ranking-comment-card {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.comment-text {
  font-size: 14px;
  color: white;
  font-weight: 500;
  line-height: 1.6;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ranking-table-content th,
  .ranking-table-content td {
    padding: 8px 12px;
    font-size: 13px;
  }

  .rank-cell {
    width: 50px;
  }

  .name-cell {
    width: 100px;
  }

  .id-cell {
    width: 80px;
    font-size: 12px;
  }

  .rate-cell {
    width: 120px;
  }

  .ranking-info {
    padding: 10px;
  }

  .ranking-info p {
    font-size: 13px;
  }

  .ranking-comment-card {
    margin-top: 12px;
    padding: 10px 12px;
  }

  .comment-text {
    font-size: 13px;
  }
}
</style>

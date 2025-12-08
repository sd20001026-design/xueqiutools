<template>
  <div class="home-view">
    <div class="home-container">
      <!-- 文件上传区域 -->
    <div class="upload-section">
      <el-card class="upload-card">
        <template #header>
          <div class="upload-header">
            <span>数据文件上传</span>
            <el-button
              v-if="store.rawData.length > 0"
              type="primary"
              @click="clearData"
            >
              重新上传
            </el-button>
          </div>
        </template>

        <div v-if="store.rawData.length === 0" class="upload-area">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            drag
            :action="''"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            accept=".xlsx,.xls"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将Excel文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                请上传包含学习数据的Excel文件，支持.xlsx和.xls格式
              </div>
            </template>
          </el-upload>
        </div>

        <div v-else class="data-info">
          <el-alert
            title="数据加载成功"
            :description="`共加载 ${store.rawData.length} 条学习记录，${userList.length} 个用户`"
            type="success"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>
    </div>

    <!-- 用户选择区域 -->
    <div v-if="store.rawData.length > 0" class="selection-section">
      <el-card>
        <template #header>
          <span>用户选择</span>
        </template>
        <div class="selection-form">
          <div class="selection-item">
            <div class="selection-label">用户</div>
            <el-select
              v-model="selectedUserId"
              placeholder="请选择要查看的用户（支持按姓名或ID搜索）"
              style="width: 320px"
              filterable
              clearable
              @change="handleUserChange"
              @clear="handleClearUser"
            >
              <el-option
                v-for="user in userList"
                :key="user.userId"
                :label="`${user.userName || '未知用户'} (${user.userId})`"
                :value="user.userId"
              />
            </el-select>
            <div class="selection-tip">💡 支持姓名或ID搜索，模糊匹配</div>
          </div>
          <div class="selection-item">
            <div class="selection-label">课程信息</div>
            <el-select
              v-model="selectedCourseTemplate"
              placeholder="请选择课程信息组"
              style="width: 320px"
              clearable
              @change="handleCourseTemplateChange"
              @clear="() => { selectedCourseTemplate = 'default'; handleCourseTemplateChange('default') }"
            >
              <el-option
                v-for="template in courseTemplates"
                :key="template.value"
                :label="template.label"
                :value="template.value"
              />
            </el-select>
            <div class="selection-tip">未选择时按默认讲次名称展示</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表展示区域 -->
    <div v-if="selectedUserData.length > 0" class="charts-section">
      <!-- 第一行：学生档案+勋章（整行横向排列） -->
      <div class="chart-row profile-row">
        <div class="chart-col-full">
          <el-card class="profile-medal-card">
            <div class="profile-medal-container">
              <div class="profile-info-section">
                <StudentProfile
                  :user-name="store.selectedUser?.userName"
                  :package-grade="getSelectedUserData()?.package_grade"
                  :counselor-name="getSelectedUserData()?.counselor_name"
                  :participation-data="getUserParticipationData()"
                />
              </div>
              <div class="medal-display-section">
                <MedalDisplay :medals="store.medals" />
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 第二行：学习时长详情 / 正确率趋势 / 错误次数统计 -->
      <div class="chart-row chart-row-three">
        <div class="chart-col chart-col-time">
          <el-card class="fill-card">
            <TimeDisplay
              :times="store.chartData.times"
              :unit-sequences="store.chartData.unitSequence"
              :encouragement="store.encouragement"
              :study-duration-comment="store.studyDurationComment"
              :user-name="store.selectedUser?.userName"
            />
          </el-card>
        </div>
        <div class="chart-col chart-col-rate">
          <el-card class="fill-card">
            <LineChart
              :data="store.chartData.correctRates"
              :labels="store.chartData.unitSequence"
              :class-averages="store.classStats.averageCorrectRateByUnit"
              title="课程正确率趋势"
              :selected-index="selectedIndex"
              :correct-rate-trend-comment="store.correctRateTrendComment"
              :user-name="store.selectedUser?.userName"
              @update:selected-index="selectedIndex = $event"
            />
          </el-card>
        </div>
        <div class="chart-col chart-col-error">
          <el-card class="fill-card">
            <BarChart
              :data="store.chartData.errorCounts"
              :labels="store.chartData.unitSequence"
              :class-averages="store.classStats.averageErrorCountByUnit"
              title="作答错误次数统计"
              :error-count-comment="store.errorCountComment"
              :user-name="store.selectedUser?.userName"
            />
          </el-card>
        </div>
      </div>

      <!-- 第三行：正确率排名表 -->
      <div class="chart-row">
        <div class="chart-col-full">
          <el-card>
            <RankingTable
              :ranking-data="store.rankingData"
              :total-participants="store.totalParticipants"
              :current-lecture-participants="store.currentLectureParticipants"
              :selected-lecture="store.selectedLectureForRanking"
              :available-lectures="store.availableLectures"
              @update:selected-lecture="store.selectedLectureForRanking = $event"
            />
          </el-card>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="store.rawData.length > 0 && selectedUserData.length === 0" class="empty-state">
      <el-empty description="请选择用户查看学习数据分析">
        <el-button type="primary" @click="scrollToSelection">选择用户</el-button>
      </el-empty>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useLearningDataStore } from '@/stores/learningData'
import { useCourseSettingsStore } from '@/stores/courseSettings'
import { parseExcelFile, getUserList } from '@/utils/excelParser'

// 时长格式解析函数
const parseTimeString = (timeStr: string | number): number => {
  if (typeof timeStr === 'number') {
    return Math.floor(timeStr)
  }

  if (typeof timeStr !== 'string') {
    return 0
  }

  // 匹配格式：X小时X分X秒
  const match = timeStr.match(/(\d+)小时\s*(\d+)分\s*(\d+)秒/)
  if (match) {
    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0
    return hours * 3600 + minutes * 60 + seconds
  }

  // 如果无法匹配，尝试直接转换为数字
  const numValue = parseFloat(timeStr.replace(/[^\d.]/g, ''))
  return isNaN(numValue) ? 0 : Math.floor(numValue)
}
import TimeDisplay from '@/components/TimeDisplay.vue'
import LineChart from '@/components/LineChart.vue'
import BarChart from '@/components/BarChart.vue'
import MedalDisplay from '@/components/MedalDisplay.vue'
import StudentProfile from '@/components/StudentProfile.vue'
import RankingTable from '@/components/RankingTable.vue'

const store = useLearningDataStore()
const courseSettingsStore = useCourseSettingsStore()
const uploadRef = ref()
const fileList = ref([])
const selectedUserId = ref('')
const selectedIndex = ref(-1)
const selectedCourseTemplate = ref('default')

const createCoursesFromNames = (names: string[]) => {
  return names.map((name, index) => ({
    unitSequence: index,
    courseName: name,
    knowledgePoint: ''
  }))
}

const courseTemplates = [
  {
    value: 'default',
    label: '默认（按讲次显示）',
    courses: createCoursesFromNames(['课前测', '第1讲', '第2讲', '第3讲', '第4讲', '第5讲'])
  },
  {
    value: 'grade1',
    label: '一年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '应用题——比多比少初步',
      '应用题——比多比少进阶',
      '逻辑推理——顺序',
      '逻辑推理——不等',
      '逻辑推理——相等'
    ])
  },
  {
    value: 'grade1-popup',
    label: '一年级（弹窗）',
    courses: createCoursesFromNames([
      '课前诊断',
      '空间想象——正方体计数',
      '空间想象——数数看不见',
      '逻辑推理——顺序',
      '逻辑推理——不等',
      '逻辑推理——相等'
    ])
  },
  {
    value: 'grade2',
    label: '二年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '应用题——复杂的排队问题初步',
      '应用题——复杂的排队问题进阶',
      '应用题——还原倒推',
      '数感——横式数字谜初步',
      '数感——横式数字谜进阶'
    ])
  },
  {
    value: 'grade3',
    label: '三年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '应用题——年龄问题初步',
      '应用题——年龄问题进阶',
      '转化思想—巧求最短路线',
      '计算——巧填算符',
      '计算——巧解整数计算'
    ])
  },
  {
    value: 'grade4',
    label: '四年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '盈亏问题',
      '生活中的计数原理',
      '图形中的计数原理',
      '长方形中的倍数关系',
      '数形结合'
    ])
  },
  {
    value: 'grade5',
    label: '五年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '基础行程问题',
      '环形路线问题',
      '火车行程问题',
      '小数乘除法巧算',
      '小数提取公因数'
    ])
  },
  {
    value: 'grade6',
    label: '六年级',
    courses: createCoursesFromNames([
      '课前诊断',
      '间隔发车问题',
      '特殊法比较分数大小',
      '操作与规律',
      '不定方程',
      '短除模型'
    ])
  }
]

// 计算用户列表
const userList = computed(() => {
  return getUserList(store.rawData)
})

// 计算选中用户的数据
const selectedUserData = computed(() => {
  return store.userData
})


// 清除用户选择
const handleClearUser = () => {
  selectedUserId.value = ''
  store.setSelectedUser(null)
  selectedCourseTemplate.value = 'default'
  handleCourseTemplateChange('default')
}

// 获取选中用户的数据（用于学生档案）
const getSelectedUserData = () => {
  if (!store.selectedUser || store.userData.length === 0) return null
  return store.userData[0] // userData已经是过滤后的选中用户数据
}

// 获取用户实际参与的课程数据（用于激励评语）
const getUserParticipationData = () => {
  if (!store.selectedUser || store.userData.length === 0) return null

  // 筛选实际参与的课程（时长>0）
  const participatedCourses = store.userData.filter(item => {
    const timeValue = typeof item.first_cost_seconds === 'string'
      ? parseTimeString(item.first_cost_seconds)
      : item.first_cost_seconds
    return timeValue > 0
  })

  if (participatedCourses.length === 0) return null

  // 计算平均表现指标
  const avgCorrectRate = participatedCourses.reduce((sum, item) =>
    sum + item.answer_right_rate, 0) / participatedCourses.length

  const avgTime = participatedCourses.reduce((sum, item) => {
    const timeValue = typeof item.first_cost_seconds === 'string'
      ? parseTimeString(item.first_cost_seconds)
      : item.first_cost_seconds
    return sum + timeValue
  }, 0) / participatedCourses.length

  return {
    courseCount: participatedCourses.length,
    avgCorrectRate,
    avgTime,
    participatedCourses
  }
}


// 处理文件变化
const handleFileChange = async (file: any) => {
  if (!file.raw) return

  try {
    const data = await parseExcelFile(file.raw)
    store.setRawData(data)
    ElMessage.success('数据加载成功！')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '文件解析失败')
    uploadRef.value?.clearFiles()
  }
}

// 处理文件移除
const handleFileRemove = () => {
  store.setRawData([])
  store.setSelectedUser(null)
  selectedUserId.value = ''
  fileList.value = []
}

// 处理用户选择变化
const handleUserChange = (userId: string) => {
  const user = userList.value.find(u => u.userId === userId)
  if (user) {
    store.setSelectedUser({
      userId: user.userId,
      userName: user.userName
    })
  }
}

// 处理课程信息模板选择
const handleCourseTemplateChange = (templateValue: string) => {
  const template = courseTemplates.find(item => item.value === templateValue)
  if (!template) return

  if (template.value === 'default') {
    courseSettingsStore.resetToDefault()
  } else {
    courseSettingsStore.updateCourses(template.courses)
  }
}

// 清除数据
const clearData = async () => {
  try {
    await ElMessageBox.confirm('确定要重新上传数据吗？当前数据将被清除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    handleFileRemove()
    ElMessage.success('数据已清除，请重新上传文件')
  } catch {
    // 用户取消操作
  }
}

// 滚动到用户选择区域
const scrollToSelection = () => {
  const selectionElement = document.querySelector('.selection-section')
  if (selectionElement) {
    selectionElement.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.home-container {
  width: 100%;
  max-width: 1400px;
  padding: 0 20px;
}

.upload-section,
.selection-section {
  margin-bottom: 20px;
}

.upload-card {
  text-align: center;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-area {
  padding: 40px 20px;
}

.data-info {
  text-align: left;
}

.selection-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: flex-end;
}

.selection-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selection-label {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
}

.selection-tip {
  font-size: 12px;
  color: #909399;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  align-items: stretch;
}

.profile-row {
  grid-template-columns: 1fr;
}

.chart-row-three {
  grid-template-columns: 1.2fr 1.4fr 1.2fr;
}

.chart-col {
  min-height: 0; /* 防止flex子项溢出 */
}

.chart-col-full {
  grid-column: 1 / -1;
}

.profile-medal-card {
  padding: 0;
}

.profile-medal-container {
  display: flex;
  flex-direction: row;
  height: 100%;
  gap: 16px;
}

.profile-info-section {
  flex: 1;
  min-width: 0;
}

.medal-display-section {
  flex: 1;
  min-height: 0;
}

.fill-card,
.fill-card .el-card__body {
  height: 100%;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home-container {
    padding: 0 15px;
  }
  .chart-row {
    grid-template-columns: 1fr;
  }

  .selection-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-col,
  .chart-col-full {
    grid-column: 1;
  }

  .profile-medal-container {
    flex-direction: column;
    gap: 12px;
  }

  .profile-info-section,
  .medal-display-section {
    flex: none;
  }
}

@media (max-width: 768px) {
  .home-view {
    padding: 10px;
  }

  .home-container {
    padding: 0 10px;
  }

  .upload-area {
    padding: 20px 10px;
  }

  .charts-section {
    gap: 15px;
  }

  .chart-row {
    gap: 15px;
  }
}
</style>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserLearningData, ClassStats, Medal, ChartData, UserSelection } from '@/types'

export const useLearningDataStore = defineStore('learningData', () => {
  // 原始数据
  const rawData = ref<UserLearningData[]>([])
  const classStats = ref<ClassStats>({
    averageTime: 0,
    averageErrorCount: 0,
    averageCorrectRate: 0,
    averageTimeByUnit: [],
    averageErrorCountByUnit: [],
    averageCorrectRateByUnit: []
  })

  // 当前选择的用户
  const selectedUser = ref<UserSelection | null>(null)

  // 排名表选择的讲次
  const selectedLectureForRanking = ref<number>(0)

  // 计算用户数据
  const userData = computed(() => {
    if (!selectedUser.value) return []
    return rawData.value.filter(item => item.user_id === selectedUser.value!.userId)
  })

  // 计算图表数据
  const chartData = computed((): ChartData => {
    const data = userData.value
    // 按照unit_sequence排序（0-5讲）
    const sortedData = [...data].sort((a, b) => a.unit_sequence - b.unit_sequence)

    return {
      unitSequence: sortedData.map(item => item.unit_sequence),
      correctRates: sortedData.map(item => item.answer_right_rate * 100), // 转换为百分比
      errorCounts: sortedData.map(item => item.first_finish_answer_step_fail_cnt),
      times: sortedData.map(item => item.first_cost_seconds)
    }
  })

  // 计算勋章数据
  const medals = computed((): Medal[] => {
    const data = userData.value
    if (data.length === 0) return []

    // 勋章1: 学习进步徽章 - 与课前测(D0)相比正确率更高的课程数
    const d0Data = data.find(item => item.unit_sequence === 0)
    const d0CorrectRate = d0Data ? d0Data.answer_right_rate : 0

    const improvedLessons = data.filter(item =>
      item.unit_sequence >= 1 && item.unit_sequence <= 5 &&
      item.first_cost_seconds > 0 &&
      item.answer_right_rate > d0CorrectRate
    ).length

    const medal1: Medal = {
      id: 1,
      name: '学习进步徽章',
      icon: '📈',
      description: `共有${improvedLessons}节课比课前测进步`,
      stars: Math.min(improvedLessons, 5),
      maxStars: 5
    }

    // 勋章2: 坚持小达人 - 第一讲到第五讲实际完成作答的课数
    const completedLessons = data.filter(item =>
      item.unit_sequence >= 1 && item.unit_sequence <= 5 &&
      item.first_cost_seconds > 0
    ).length
    const medal2: Medal = {
      id: 2,
      name: '坚持小达人',
      icon: '🎖️',
      description: `共有${completedLessons}节课完成作答`,
      stars: Math.min(completedLessons, 5),
      maxStars: 5
    }

    // 勋章3: 时间小飞侠 - 第一讲到第五讲实际参与且比对应课程班级平均时长短的课数
    const fasterLessons = data.filter(item =>
      item.unit_sequence >= 1 && item.unit_sequence <= 5 &&
      item.first_cost_seconds > 0 &&
      item.first_cost_seconds < classStats.value.averageTimeByUnit[item.unit_sequence]
    ).length
    const medal3: Medal = {
      id: 3,
      name: '时间小飞侠',
      icon: '⚡',
      description: `共有${fasterLessons}节课比对应课程平均用时更短`,
      stars: Math.min(fasterLessons, 5),
      maxStars: 5
    }

    // 勋章4: 满分冲刺星 - 第一讲到第五讲实际参与且正确率大于50%的课数
    const highScoreLessons = data.filter(item =>
      item.unit_sequence >= 1 && item.unit_sequence <= 5 &&
      item.first_cost_seconds > 0 &&
      item.answer_right_rate >= 0.5
    ).length
    const medal4: Medal = {
      id: 4,
      name: '满分冲刺星',
      icon: '🏅',
      description: `共有${highScoreLessons}节课正确率 ≥ 50%`,
      stars: Math.min(highScoreLessons, 5),
      maxStars: 5
    }

    return [medal1, medal2, medal3, medal4]
  })

  // 学习时长评语
  const studyDurationComment = computed(() => {
    return '一节课20分钟，短时高效，每天练出效果！'
  })

  // 课程正确率趋势评语
  const correctRateTrendComment = computed(() => {
    const data = userData.value
    if (data.length === 0) return ''

    // 获取课前测数据（unit_sequence = 0）
    const preTestData = data.find(item => item.unit_sequence === 0)
    const preTestRate = preTestData ? preTestData.answer_right_rate : 0

    // 获取最新的课程数据（unit_sequence最大的那个）
    const latestLessonData = [...data]
      .filter(item => item.unit_sequence >= 1 && item.first_cost_seconds > 0)
      .sort((a, b) => b.unit_sequence - a.unit_sequence)[0]

    if (!latestLessonData) return ''

    const latestRate = latestLessonData.answer_right_rate
    const lessonNumber = latestLessonData.unit_sequence

    // 规则1：最新一节课的正确率 > 课前测
    if (latestRate > preTestRate) {
      const improvement = Math.round((latestRate - preTestRate) * 100)
      return `太棒了！对比课前测（正确率${Math.round(preTestRate * 100)}%），宝贝在第${lessonNumber}课的正确率已提升至${Math.round(latestRate * 100)}%，${improvement}个百分点跨越清晰展现了进步！`
    }

    // 规则2：最新课正确率 < 课前测
    if (latestRate < preTestRate) {
      return `值得点赞！从课前到第${lessonNumber}节课的全程学习，宝贝展现了出色的坚持与思考习惯。面对不断升级的挑战仍兴趣盎然，这份专注力是未来突破的最大潜力。`
    }

    // 规则3：正确率节节攀升
    const sortedLessons = [...data]
      .filter(item => item.unit_sequence >= 1 && item.first_cost_seconds > 0)
      .sort((a, b) => a.unit_sequence - b.unit_sequence)

    if (sortedLessons.length >= 2) {
      let isClimbing = true
      for (let i = 1; i < sortedLessons.length; i++) {
        if (sortedLessons[i].answer_right_rate <= sortedLessons[i - 1].answer_right_rate) {
          isClimbing = false
          break
        }
      }

      if (isClimbing) {
        const firstRate = Math.round(sortedLessons[0].answer_right_rate * 100)
        const lastRate = Math.round(sortedLessons[sortedLessons.length - 1].answer_right_rate * 100)
        return `完美的阶梯式成长！课程设计的每一步挑战，孩子都步步为营，正确率从${firstRate}%一路稳定升至${lastRate}%。这正是科学学习路径与孩子努力同频共振的证明。`
      }
    }

    // 默认情况
    return `宝贝正在努力学习中，继续加油哦！`
  })

  // 作答错误次数统计评语
  const errorCountComment = computed(() => {
    const data = userData.value
    if (data.length === 0) return ''

    // 获取课前测数据（unit_sequence = 0）
    const preTestData = data.find(item => item.unit_sequence === 0)
    const preTestErrors = preTestData ? preTestData.first_finish_answer_step_fail_cnt : 0

    // 获取最新的课程数据
    const latestLessonData = [...data]
      .filter(item => item.unit_sequence >= 1 && item.first_cost_seconds > 0)
      .sort((a, b) => b.unit_sequence - a.unit_sequence)[0]

    if (!latestLessonData) return ''

    const latestErrors = latestLessonData.first_finish_answer_step_fail_cnt

    // 规则1：最新课错误次数低于课前测
    if (latestErrors < preTestErrors) {
      return '错题日益减少，可见知识掌握越发扎实牢固！'
    }

    // 规则2: 最新课错误次数高于课前测
    if (latestErrors > preTestErrors) {
      return '继续加油！多练习可以减少错误，提高准确性！'
    }

    // 错误次数相等的情况
    return '保持良好状态，继续巩固知识！'
  })

  // 计算激励评价
  const encouragement = computed(() => {
    const data = userData.value
    if (data.length === 0) return '请选择用户查看数据'

    const totalTime = data.reduce((sum, item) => sum + item.first_cost_seconds, 0)
    const averageTime = totalTime / data.length
    const classAverage = classStats.value.averageTime

    if (averageTime < classAverage * 0.8) {
      return '太棒了！你比班级平均用时少20%以上，效率超高！'
    } else if (averageTime < classAverage) {
      return '不错哦！你比班级平均用时更快，效率很高！'
    } else if (averageTime < classAverage * 1.2) {
      return '继续加油！你和班级平均水平相当，还有进步空间！'
    } else {
      return '加油哦！多练习可以提高效率，相信你能做得更好！'
    }
  })

  // 计算参与学习的总学员数（D1-D5有学习记录的用户）
  const totalParticipants = computed(() => {
    const userIds = new Set<string>()
    rawData.value.forEach(item => {
      if (item.unit_sequence >= 1 && item.unit_sequence <= 5 && item.first_cost_seconds > 0) {
        userIds.add(item.user_id)
      }
    })
    return userIds.size
  })

  // 计算选择讲次的完成数
  const currentLectureParticipants = computed(() => {
    const participants = rawData.value.filter(item =>
      item.unit_sequence === selectedLectureForRanking.value && item.first_cost_seconds > 0
    )
    return new Set(participants.map(item => item.user_id)).size
  })

  // 计算正确率排名数据
  const rankingData = computed(() => {
    if (rawData.value.length === 0) return []

    // 获取所有参与学习的用户（D1-D5有学习记录的用户）
    const activeUserIds = new Set<string>()
    rawData.value.forEach(item => {
      if (item.unit_sequence >= 1 && item.unit_sequence <= 5 && item.first_cost_seconds > 0) {
        activeUserIds.add(item.user_id)
      }
    })

    // 计算每个用户的平均正确率
    const userStats = Array.from(activeUserIds).map(userId => {
      const userData = rawData.value.filter(item => item.user_id === userId)
      const userInfo = userData.find(item => item.real_name) // 获取用户信息

      // 计算整体平均正确率（所有参与的课程）
      const participatedCourses = userData.filter(item => item.first_cost_seconds > 0)
      const overallAvgRate = participatedCourses.length > 0
        ? participatedCourses.reduce((sum, item) => sum + item.answer_right_rate, 0) / participatedCourses.length
        : 0

      // 计算选择讲次的正确率
      const selectedLectureData = userData.find(item => item.unit_sequence === selectedLectureForRanking.value)
      const selectedLectureRate = selectedLectureData ? selectedLectureData.answer_right_rate : 0

      return {
        userId,
        name: userInfo?.real_name || `用户${userId}`,
        overallAvgRate,
        currentRate: selectedLectureRate,
        isCurrentUser: selectedUser.value ? userId === selectedUser.value.userId : false
      }
    })

    // 按全部课程平均正确率排序（降序）
    userStats.sort((a, b) => b.overallAvgRate - a.overallAvgRate)

    // 添加排名
    userStats.forEach((user, index) => {
      user.rank = index + 1
    })

    // 如果有当前用户，优先显示当前用户及其前后各5位
    if (selectedUser.value) {
      const currentUserIndex = userStats.findIndex(user => user.isCurrentUser)
      if (currentUserIndex !== -1) {
        const startIndex = Math.max(0, currentUserIndex - 5)
        const endIndex = Math.min(userStats.length - 1, currentUserIndex + 5)
        return userStats.slice(startIndex, endIndex + 1)
      }
    }

    // 如果没有当前用户或找不到当前用户，返回前11位
    return userStats.slice(0, 11)
  })

  // 可选择的讲次列表
  const availableLectures = computed(() => {
    const lectures = new Set<number>()
    rawData.value.forEach(item => {
      if (item.unit_sequence >= 1 && item.unit_sequence <= 5) {
        lectures.add(item.unit_sequence)
      }
    })

    const lectureList = Array.from(lectures).sort((a, b) => a - b).map(unit => ({
      value: unit,
      label: unit === 0 ? '课前测' : `第${unit}讲`
    }))

    return lectureList
  })

  // 设置数据
  const setRawData = (data: UserLearningData[]) => {
    rawData.value = data
    calculateClassStats()
  }

  // 计算班级统计数据
  const calculateClassStats = () => {
    if (rawData.value.length === 0) return

    // 计算全局平均值
    const totalTime = rawData.value.reduce((sum, item) => sum + item.first_cost_seconds, 0)
    const totalErrorCount = rawData.value.reduce((sum, item) => sum + item.first_finish_answer_step_fail_cnt, 0)
    const totalCorrectRate = rawData.value.reduce((sum, item) => sum + item.answer_right_rate, 0)

    // 按讲次分组计算平均值
    const unitMap = new Map<number, {
      times: number[]
      errorCounts: number[]
      correctRates: number[]
    }>()

    // 初始化所有讲次的映射
    rawData.value.forEach(item => {
      if (!unitMap.has(item.unit_sequence)) {
        unitMap.set(item.unit_sequence, {
          times: [],
          errorCounts: [],
          correctRates: []
        })
      }
    })

    // 收集每个讲次的数据
    rawData.value.forEach(item => {
      const unitData = unitMap.get(item.unit_sequence)!
      unitData.times.push(item.first_cost_seconds)
      unitData.errorCounts.push(item.first_finish_answer_step_fail_cnt)
      unitData.correctRates.push(item.answer_right_rate)
    })

    // 计算每个讲次的平均值
    const sortedUnits = Array.from(unitMap.keys()).sort((a, b) => a - b)
    const averageTimeByUnit: number[] = []
    const averageErrorCountByUnit: number[] = []
    const averageCorrectRateByUnit: number[] = []

    sortedUnits.forEach(unit => {
      const unitData = unitMap.get(unit)!

      // 计算时长平均值，过滤掉0值（未作答）
      const validTimes = unitData.times.filter(time => time > 0)
      const averageTime = validTimes.length > 0
        ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
        : 0

      // 计算错误次数平均值，保留0值（表示完全正确）
      const averageErrorCount = unitData.errorCounts.length > 0
        ? unitData.errorCounts.reduce((sum, count) => sum + count, 0) / unitData.errorCounts.length
        : 0

      // 计算正确率平均值，过滤掉0值（未作答）
      const validCorrectRates = unitData.correctRates.filter(rate => rate > 0)
      const averageCorrectRate = validCorrectRates.length > 0
        ? validCorrectRates.reduce((sum, rate) => sum + rate, 0) / validCorrectRates.length
        : 0

      averageTimeByUnit.push(averageTime)
      averageErrorCountByUnit.push(averageErrorCount)
      averageCorrectRateByUnit.push(averageCorrectRate)
    })

    classStats.value = {
      averageTime: totalTime / rawData.value.length,
      averageErrorCount: totalErrorCount / rawData.value.length,
      averageCorrectRate: totalCorrectRate / rawData.value.length,
      averageTimeByUnit,
      averageErrorCountByUnit,
      averageCorrectRateByUnit
    }
  }

  // 设置选择的用户
  const setSelectedUser = (user: UserSelection | null) => {
    selectedUser.value = user
  }

  return {
    rawData,
    classStats,
    selectedUser,
    userData,
    chartData,
    medals,
    studyDurationComment,
    correctRateTrendComment,
    errorCountComment,
    encouragement,
    totalParticipants,
    currentLectureParticipants,
    rankingData,
    availableLectures,
    selectedLectureForRanking,
    setRawData,
    setSelectedUser
  }
})

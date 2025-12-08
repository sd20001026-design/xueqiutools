// 用户学习数据接口
export interface UserLearningData {
  user_id: string
  unit_sequence: number // 讲次序号 (0表示课前测)
  answer_right_rate: number // 正确率 (0-1之间)
  first_cost_seconds: number // 学习时长(秒)
  first_finish_answer_step_fail_cnt: number // 错误次数
  real_name?: string // 真实姓名
  package_grade?: string // 年级
  counselor_name?: string // 辅导老师姓名
}

// 班级统计数据
export interface ClassStats {
  averageTime: number // 班级平均时长（全局）
  averageErrorCount: number // 班级平均错误次数（全局）
  averageCorrectRate: number // 班级平均正确率（全局）
  averageTimeByUnit: number[] // 按讲次的平均时长
  averageErrorCountByUnit: number[] // 按讲次的平均错误次数
  averageCorrectRateByUnit: number[] // 按讲次的平均正确率
}

// 勋章类型
export interface Medal {
  id: number
  name: string
  icon: string
  description: string
  stars: number
  maxStars: number
}

// 图表数据接口
export interface ChartData {
  unitSequence: number[]
  correctRates: number[]
  errorCounts: number[]
  times: number[]
}

// 用户选择接口
export interface UserSelection {
  userId: string
  userName?: string
}

// 课程设置
export interface CourseSetting {
  unitSequence: number
  courseName: string
  knowledgePoint: string
}

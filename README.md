# 学习数据分析工具

一个轻量化的学习数据分析工具，专注于展示学生的学习时长、正确率和错误次数，提供直观的激励评价和勋章系统。

## 功能特性

### 📊 数据可视化
- **作答时长展示**: 显示作答时长统计和趋势变化
- **正确率折线图**: 展示各讲次正确率趋势（支持点击选择）
- **错误次数柱状图**: 展示错误次数统计和班级对比

### 🏆 激励系统
- **个性化评价**: 根据学习表现提供鼓励话语
- **勋章系统**: 4种勋章，每种可积累星星
  - 🌈 成长起步徽章: 完成课前测
  - 🎖️ 坚持小达人: 完成3讲以上课程
  - ⚡ 时间小飞侠: 比班级平均用时更短
  - 🏅 满分冲刺星: 正确率达到50%以上

### 📱 响应式设计
- 支持桌面端和移动端
- 图表自适应容器大小
- 友好的用户界面

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **UI组件库**: Element Plus
- **图表库**: ECharts
- **状态管理**: Pinia
- **构建工具**: Vite
- **语言**: TypeScript

## 数据格式要求

Excel文件需包含以下字段，所有图表的横坐标都按照第0讲至第5讲的顺序排列，第0讲显示为"课前测"。

### 必需字段
- `user_id`: 用户ID
- `unit_sequence`: 讲次序号 (0表示课前测，1-5表示第1-5讲)
- `answer_right_rate`: 正确率 (0-1之间)
- `first_finish_stage_cost_seconds`: 作答时长
  - 支持数字格式（秒数）
  - 支持字符串格式：`X小时X分X秒`（如：`2小时15分30秒`）
- `first_finish_answer_step_fail_cnt`: 错误次数

### 可选字段
- `real_name`: 真实姓名
- `package_grade`: 年级
- `counselor_name`: 辅导老师姓名

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 使用说明

1. **上传数据**: 点击或拖拽Excel文件到上传区域
2. **选择用户**: 从下拉列表中选择要分析的用户
3. **查看分析**: 系统将自动展示学习时长、正确率趋势、错误次数统计和获得的勋章

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── TimeDisplay.vue  # 时长展示组件
│   ├── LineChart.vue    # 折线图组件
│   ├── BarChart.vue     # 柱状图组件
│   └── MedalDisplay.vue # 勋章展示组件
├── stores/             # 状态管理
│   └── learningData.ts # 学习数据store
├── utils/              # 工具函数
│   └── excelParser.ts  # Excel解析工具
├── types/              # TypeScript类型定义
│   └── index.ts        # 类型定义
├── views/              # 页面组件
│   └── HomeView.vue    # 主页面
├── router/             # 路由配置
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

## 验收标准

### ✅ 功能验收
- 正确解析Excel数据
- 准确展示学习时长和激励评价
- 正确率折线图正常显示
- 错误次数柱状图正常展示
- 勋章系统按规则正确发放

### ✅ 性能验收
- 图表渲染流畅
- 大数据量处理正常
- 页面响应速度合理

### ✅ 用户体验验收
- 界面简洁直观
- 操作流程清晰
- 移动端适配良好
# xueqiutools
# xueqiutools
# xueqiutools
# xueqiutools

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CourseSetting } from '@/types'

const STORAGE_KEY = 'course-settings'

// 默认课程设置
const defaultCourses: CourseSetting[] = [
  { unitSequence: 0, courseName: '课前测', knowledgePoint: '' },
  { unitSequence: 1, courseName: '第1讲', knowledgePoint: '' },
  { unitSequence: 2, courseName: '第2讲', knowledgePoint: '' },
  { unitSequence: 3, courseName: '第3讲', knowledgePoint: '' },
  { unitSequence: 4, courseName: '第4讲', knowledgePoint: '' },
  { unitSequence: 5, courseName: '第5讲', knowledgePoint: '' }
]

// 从localStorage加载设置
const loadSettings = (): CourseSetting[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 确保有6个课程设置（含课前测）
      const courses: CourseSetting[] = []
      for (let i = 0; i <= 5; i++) {
        const existing = parsed.find((c: CourseSetting) => c.unitSequence === i)
        const defaultName = i === 0 ? '课前测' : `第${i}讲`
        courses.push(existing || { unitSequence: i, courseName: defaultName, knowledgePoint: '' })
      }
      return courses
    }
  } catch (error) {
    console.error('Failed to load course settings:', error)
  }
  return defaultCourses
}

// 保存设置到localStorage
const saveSettings = (courses: CourseSetting[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
  } catch (error) {
    console.error('Failed to save course settings:', error)
  }
}

export const useCourseSettingsStore = defineStore('courseSettings', () => {
  const courses = ref<CourseSetting[]>(loadSettings())

  // 更新课程设置
  const updateCourse = (unitSequence: number, courseName: string, knowledgePoint: string) => {
    const index = courses.value.findIndex(c => c.unitSequence === unitSequence)
    if (index !== -1) {
      courses.value[index] = { unitSequence, courseName, knowledgePoint }
    } else {
      courses.value.push({ unitSequence, courseName, knowledgePoint })
    }
    saveSettings(courses.value)
  }

  // 批量更新课程设置
  const updateCourses = (newCourses: CourseSetting[]) => {
    courses.value = newCourses
    saveSettings(courses.value)
  }

  // 获取指定讲次的课程设置
  const getCourse = (unitSequence: number): CourseSetting | undefined => {
    return courses.value.find(c => c.unitSequence === unitSequence)
  }

  // 重置为默认设置
  const resetToDefault = () => {
    courses.value = defaultCourses
    saveSettings(courses.value)
  }

  return {
    courses,
    updateCourse,
    updateCourses,
    getCourse,
    resetToDefault
  }
})

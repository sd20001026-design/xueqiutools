import * as XLSX from 'xlsx'
import type { UserLearningData } from '@/types'

// 解析时长格式：X小时X分X秒 -> 秒数
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

// 解析Excel文件
export const parseExcelFile = async (file: File): Promise<UserLearningData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // 假设数据在第一个工作表
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ''
        }) as any[][]

        if (jsonData.length < 2) {
          reject(new Error('Excel文件没有足够的数据行'))
          return
        }

        // 获取表头
        const headers = jsonData[0] as string[]

        // 验证必需的字段
        const requiredFields = [
          'user_id',
          'unit_sequence',
          'answer_right_rate',
          'first_cost_seconds',
          'first_finish_answer_step_fail_cnt'
        ]

        const missingFields = requiredFields.filter(field => !headers.includes(field))
        if (missingFields.length > 0) {
          reject(new Error(`缺少必需字段: ${missingFields.join(', ')}`))
          return
        }

        // 转换数据
        const result: UserLearningData[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          const record: any = {}

          headers.forEach((header, index) => {
            const value = row[index]
            if (header === 'answer_right_rate') {
              // 确保正确率是0-1之间
              record[header] = typeof value === 'number' ? Math.max(0, Math.min(1, value)) : 0
            } else if (header === 'unit_sequence') {
              // 确保数字字段是整数
              record[header] = typeof value === 'number' ? Math.floor(value) : 0
            } else if (header === 'first_cost_seconds') {
              // 解析时长格式：支持数字或"X小时X分X秒"格式
              record[header] = parseTimeString(value)
            } else if (header === 'first_finish_answer_step_fail_cnt') {
              // 确保数字字段是整数
              record[header] = typeof value === 'number' ? Math.floor(value) : 0
            } else {
              record[header] = value
            }
          })

          result.push(record as UserLearningData)
        }

        resolve(result)
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    reader.readAsArrayBuffer(file)
  })
}

// 获取所有用户列表
export const getUserList = (data: UserLearningData[]): { userId: string; userName?: string }[] => {
  const userMap = new Map<string, string>()

  data.forEach(item => {
    if (!userMap.has(item.user_id)) {
      userMap.set(item.user_id, item.real_name || `用户${item.user_id}`)
    }
  })

  return Array.from(userMap.entries()).map(([userId, userName]) => ({
    userId,
    userName
  }))
}


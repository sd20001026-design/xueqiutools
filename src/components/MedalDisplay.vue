<template>
  <div class="medal-container">
    <h3 class="medal-title">学习勋章</h3>
    <div class="medal-grid">
      <div
        v-for="medal in medals"
        :key="medal.id"
        class="medal-item"
        :class="{ 'medal-earned': medal.stars > 0 }"
      >
        <div class="medal-icon">
          {{ medal.icon }}
        </div>
        <div class="medal-content">
          <h4 class="medal-name">{{ medal.name }}</h4>
          <p class="medal-description">{{ medal.description }}</p>
          <div class="medal-stars">
            <span
              v-for="i in medal.maxStars"
              :key="i"
              class="star"
              :class="{ 'star-earned': i <= medal.stars }"
            >
              {{ i <= medal.stars ? '⭐' : '☆' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Medal } from '@/types'

interface Props {
  medals: Medal[]
}

defineProps<Props>()
</script>

<style scoped>
.medal-container {
  padding: 0 15px 15px 15px;
  margin-top: 0;
}

.medal-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
  padding-top: 15px;
}

.medal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.medal-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.medal-item.medal-earned {
  background-color: #f0f9ff;
  border-color: #409eff;
}

.medal-icon {
  font-size: 20px;
  margin-right: 8px;
  flex-shrink: 0;
}

.medal-content {
  flex: 1;
}

.medal-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #303133;
}

.medal-description {
  font-size: 12px;
  color: #606266;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.medal-stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.star.star-earned {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .medal-title {
    font-size: 15px;
    padding-top: 15px;
  }

  .medal-container {
    padding: 0 15px 15px 15px;
  }

  .medal-grid {
    gap: 6px;
  }

  .medal-item {
    padding: 6px 10px;
  }

  .medal-icon {
    font-size: 18px;
    margin-right: 6px;
  }

  .medal-name {
    font-size: 13px;
  }

  .medal-description {
    font-size: 11px;
  }

  .star {
    font-size: 11px;
  }
}
</style>

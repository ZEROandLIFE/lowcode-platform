<template>
  <div class="material-panel">
    <div class="panel-header">
      <h4>组件库</h4>
      <span class="panel-subtitle">拖拽到网格中</span>
    </div>
    
    <a-tabs v-model:activeKey="activeKey" class="material-tabs">
      <a-tab-pane v-for="category in categories" :key="category.key" :tab="category.label">
        <div class="material-list">
          <div
            v-for="material in getMaterialsByCategory(category.key)"
            :key="material.type"
            class="material-item"
            :class="`span-${material.defaultProps.span}`"
            draggable="true"
            @dragstart="handleDragStart(material, $event)"
            @click="handleClick(material)"
          >
            <div class="material-icon">{{ material.icon }}</div>
            <div class="material-info">
              <div class="material-name">{{ material.name }}</div>
              <div class="material-size">
                <span class="size-badge">{{ material.defaultProps.span }}格</span>
                <span class="material-desc">{{ material.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDesignerStore } from '@/stores/designer';
import type { ComponentMaterial } from '@/types';

const store = useDesignerStore();
const activeKey = ref('basic');

const categories = [
  { key: 'basic', label: '基础' },
  { key: 'form', label: '表单' },
  { key: 'advanced', label: '高级' }
];

function getMaterialsByCategory(category: string): ComponentMaterial[] {
  return store.state.materials.filter(m => m.category === category);
}

function handleDragStart(material: ComponentMaterial, e: DragEvent) {
  store.setDragging(true);
  e.dataTransfer?.setData('application/json', JSON.stringify(material));
  e.dataTransfer!.effectAllowed = 'copy';
}

function handleClick(material: ComponentMaterial) {
  // 点击添加到第一个可用位置
  store.addComponent(material);
}
</script>

<style scoped lang="less">
.material-panel {
  width: 280px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    
    h4 {
      margin: 0;
      font-size: 16px;
    }
    
    .panel-subtitle {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .material-tabs {
    flex: 1;
    
    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }

  .material-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .material-item {
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background: rgba(24, 144, 255, 0.02);
    }

    // 根据尺寸显示不同颜色标识
    &.span-4 {
      border-left: 3px solid #52c41a;
    }
    
    &.span-6 {
      border-left: 3px solid #faad14;
    }
    
    &.span-12 {
      border-left: 3px solid #f5222d;
    }

    .material-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .material-info {
      flex: 1;
      min-width: 0;
    }

    .material-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .material-size {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .size-badge {
        font-size: 11px;
        padding: 2px 6px;
        background: #e6f7ff;
        color: #1890ff;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .material-desc {
        font-size: 12px;
        color: #8c8c8c;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
<template>
  <div class="material-panel">
    <a-tabs v-model:activeKey="activeKey" tabPosition="left" class="material-tabs">
      <a-tab-pane v-for="category in categories" :key="category.key" :tab="category.label">
        <div class="material-list">
          <div
            v-for="material in getMaterialsByCategory(category.key)"
            :key="material.type"
            class="material-item"
            draggable="true"
            @dragstart="handleDragStart(material, $event)"
            @click="handleClick(material)"
          >
            <div class="material-icon">{{ material.icon }}</div>
            <div class="material-name">{{ material.name }}</div>
            <div class="material-desc">{{ material.description }}</div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref} from 'vue';  // 添加 computed
import { useDesignerStore } from '@/stores/designer';
import type { ComponentMaterial } from '@/types';

const store = useDesignerStore();
const activeKey = ref('basic');

const categories = [
  { key: 'basic', label: '基础' },
  { key: 'form', label: '表单' },
  { key: 'layout', label: '布局' },
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
  // 修复：使用 computed 获取 selectedMaterial 来判断 isContainer
  const currentSelected = store.selectedComponent;
  const parentId = currentSelected && store.selectedMaterial?.isContainer 
    ? currentSelected.id 
    : undefined;
  store.addComponent(material, parentId);
}
</script>

<style scoped lang="less">
.material-panel {
  width: 400px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;

  .material-tabs {
    height: 100%;
  }

  .material-list {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .material-item {
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .material-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .material-name {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
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
</style>
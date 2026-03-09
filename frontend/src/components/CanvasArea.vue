<template>
  <div 
    class="canvas-area"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div 
      class="canvas-container"
      :style="canvasStyle"
    >
      <CanvasRenderer 
        v-for="component in store.state.schema.components"
        :key="component.id"
        :schema="component"
        :depth="0"
      />
      
      <div 
        v-if="store.state.schema.components.length === 0" 
        class="empty-placeholder"
      >
        <InboxOutlined style="font-size: 48px; color: #d9d9d9;" />
        <p>从左侧拖拽组件到此处</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { useDesignerStore } from '@/stores/designer';
import CanvasRenderer from './CanvasRenderer.vue';
import type { ComponentMaterial } from '@/types';

const store = useDesignerStore();

const canvasStyle = computed(() => ({
  background: store.state.schema.settings?.background || '#f0f2f5',
  padding: store.state.schema.settings?.padding || '24px',
  minHeight: '100%'
}));

function handleDrop(e: DragEvent) {
  e.preventDefault();
  store.setDragging(false);
  
  const data = e.dataTransfer?.getData('application/json');
  if (!data) return;
  
  try {
    const material: ComponentMaterial = JSON.parse(data);
    store.addComponent(material);
  } catch (err) {
    console.error('Invalid drop data:', err);
  }
}
</script>

<style scoped lang="less">
.canvas-area {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: #e8e8e8;

  .canvas-container {
    max-width: 1000px;
    margin: 0 auto;
    min-height: 800px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: relative;
  }

  .empty-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #8c8c8c;
    
    p {
      margin-top: 16px;
    }
  }
}
</style>
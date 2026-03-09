<template>
  <div 
    class="canvas-area"
    @dragover.prevent
    @drop="handleDrop"
  >
    <div 
      class="canvas-container"
      :style="containerStyle"
    >
      <!-- 网格背景 -->
      <div 
        v-if="store.state.showGrid" 
        class="grid-background"
        :style="gridBackgroundStyle"
      >
        <div 
          v-for="rowIndex in displayRows" 
          :key="`row-${rowIndex}`"
          class="grid-row"
        >
          <div 
            v-for="colIndex in 12" 
            :key="`cell-${rowIndex}-${colIndex}`"
            class="grid-cell"
            :class="{
              'is-occupied': isCellOccupied(rowIndex - 1, colIndex - 1),
              'is-highlighted': isHighlighted(rowIndex - 1, colIndex - 1),
            }"
            @click="handleCellClick(rowIndex - 1, colIndex - 1)"
            @dragover.prevent="handleCellDragOver(rowIndex - 1, colIndex - 1)"
            @drop.prevent="handleCellDrop(rowIndex - 1, colIndex - 1, $event)"
          >
            <span class="grid-coord">
              {{ rowIndex - 1 }},{{ colIndex - 1 }}
            </span>
          </div>
        </div>
      </div>

      <!-- 组件渲染层 -->
      <div class="components-layer">
        <CanvasRenderer 
          v-for="component in store.state.schema.components"
          :key="component.id"
          :schema="component"
        />
      </div>
      
      <!-- 空状态 -->
      <div 
        v-if="store.state.schema.components.length === 0" 
        class="empty-placeholder"
      >
        <InboxOutlined style="font-size: 48px; color: #d9d9d9;" />
        <p>从左侧拖拽组件到网格上</p>
        <p class="grid-hint">点击任意格子放置组件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { useDesignerStore } from '@/stores/designer';
import CanvasRenderer from './CanvasRenderer.vue';
import type { ComponentMaterial } from '@/types';
import { message } from 'ant-design-vue';
import type { CSSProperties } from 'vue';

const store = useDesignerStore();
const dragOverCell = ref<{ row: number; col: number } | null>(null);
const draggingMaterial = ref<ComponentMaterial | null>(null);

const GRID_SIZE = 60; // 固定格子大小
const TOTAL_COLS = 12;
const GAP = 0; // 间隙为0，格子紧密排列

// 容器样式 - 固定宽度为12格
const containerStyle = computed((): CSSProperties => ({
  width: `${TOTAL_COLS * GRID_SIZE}px`,
  minHeight: '800px',
  background: store.state.schema.settings?.background || '#f0f2f5',
  padding: store.state.schema.settings?.padding || '24px',
  position: 'relative',
  margin: '0 auto',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

// 网格背景样式
const gridBackgroundStyle = computed((): CSSProperties => ({
  position: 'absolute',
  top: '24px', // 与 padding 一致
  left: '24px',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1,
}));

// 计算需要显示的行数
const displayRows = computed(() => {
  const maxRow = Math.max(
    ...store.state.schema.components.map(c => 
      (c.gridPosition?.row || 0) + 1
    ),
    15 // 至少显示15行
  );
  return maxRow + 5; // 多显示5行
});

// 检查格子是否被占用
function isCellOccupied(row: number, col: number): boolean {
  for (const comp of store.state.schema.components) {
    const span = comp.props.span || 4;
    const compRow = comp.gridPosition?.row ?? -1;
    const compCol = comp.gridPosition?.col ?? -1;
    
    // 检查这个格子是否被该组件占用
    if (compRow === row && col >= compCol && col < compCol + span) {
      return true;
    }
  }
  return false;
}

// 检查格子是否高亮（拖拽时）
function isHighlighted(row: number, col: number): boolean {
  if (!dragOverCell.value || !draggingMaterial.value) return false;
  
  const span = draggingMaterial.value.defaultProps.span || 4;
  const startCol = dragOverCell.value.col;
  const startRow = dragOverCell.value.row;
  
  return (
    startRow === row &&
    col >= startCol &&
    col < startCol + span &&
    col < TOTAL_COLS
  );
}

function handleCellClick(row: number, col: number) {
  store.selectComponent(null);
}

function handleCellDragOver(row: number, col: number) {
  dragOverCell.value = { row, col };
  const data = (event as DragEvent).dataTransfer?.getData('application/json');
  if (data) {
    try {
      draggingMaterial.value = JSON.parse(data);
    } catch (e) {
      draggingMaterial.value = null;
    }
  }
}

function handleCellDrop(row: number, col: number, e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  
  const data = e.dataTransfer?.getData('application/json');
  const dragId = e.dataTransfer?.getData('dragId');
  
  // 从物料面板拖拽新组件
  if (data) {
    try {
      const material: ComponentMaterial = JSON.parse(data);
      const span = material.defaultProps.span || 4;
      
      // 检查是否能放下
      if (col + span > TOTAL_COLS) {
        message.error(`超出网格边界，需要${span}格，但从第${col+1}列开始只剩${TOTAL_COLS-col}格`);
        return;
      }
      
      // 检查是否被占用
      let occupied = false;
      for (let c = col; c < col + span; c++) {
        if (isCellOccupied(row, c)) {
          occupied = true;
          break;
        }
      }
      
      if (occupied) {
        message.error('该位置已被占用');
        return;
      }
      
      store.addComponent(material, { row, col });
      message.success(`添加 ${material.name} 成功`);
    } catch (err) {
      console.error('Invalid drop data:', err);
    }
  } else if (dragId) {
    // 移动已有组件
    const comp = store.state.schema.components.find(c => c.id === dragId);
    if (!comp) return;
    
    const span = comp.props.span || 4;
    
    if (col + span > TOTAL_COLS) {
      message.error(`超出网格边界，组件宽度为${span}格`);
      return;
    }
    
    // 检查是否被占用（排除自己）
    let occupied = false;
    for (let c = col; c < col + span; c++) {
      const existingComp = findComponentAt(row, c);
      if (existingComp && existingComp.id !== dragId) {
        occupied = true;
        break;
      }
    }
    
    if (occupied) {
      message.error('该位置已被占用');
    } else {
      const success = store.moveComponent(dragId, row, col);
      if (success) {
        message.success('移动成功');
      }
    }
  }
  
  // 重置拖拽状态
  dragOverCell.value = null;
  draggingMaterial.value = null;
  store.setDragging(false);
}

// 查找指定位置的组件
function findComponentAt(row: number, col: number) {
  for (const comp of store.state.schema.components) {
    const span = comp.props.span || 4;
    const compRow = comp.gridPosition?.row ?? -1;
    const compCol = comp.gridPosition?.col ?? -1;
    
    if (compRow === row && col >= compCol && col < compCol + span) {
      return comp;
    }
  }
  return null;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  store.setDragging(false);
  dragOverCell.value = null;
  
  const data = e.dataTransfer?.getData('application/json');
  if (!data) return;
  
  try {
    const material: ComponentMaterial = JSON.parse(data);
    // 自动寻找可用位置
    store.addComponent(material);
    message.success(`添加 ${material.name} 成功`);
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
  display: flex;
  justify-content: center;

  .canvas-container {
    position: relative;
    background: #fff;
    overflow: visible;
    min-width:800px;
  }

  .grid-background {
    .grid-row {
      display: flex;
      
      .grid-cell {
        width: 60px;
        height: 60px;
        border: 1px solid rgba(24, 144, 255, 0.15);
        background: rgba(24, 144, 255, 0.02);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
        box-sizing: border-box;
        
        &:hover {
          background: rgba(24, 144, 255, 0.1);
          border-color: #1890ff;
        }
        
        &.is-occupied {
          background: rgba(255, 77, 79, 0.05);
          border-color: rgba(255, 77, 79, 0.2);
        }
        
        &.is-highlighted {
          background: rgba(82, 196, 26, 0.2);
          border-color: #52c41a;
        }
        
        .grid-coord {
          font-size: 10px;
          color: rgba(24, 144, 255, 0.4);
          pointer-events: none;
          user-select: none;
        }
      }
    }
  }

  .components-layer {
    position: absolute;
    top: 24px; // 与网格对齐
    left: 24px;
    z-index: 2;
    pointer-events: none;
    width: 720px; // 12 * 60
    height: 100%;
    
    :deep(.renderer-wrapper) {
      pointer-events: auto;
    }
  }

  .empty-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #8c8c8c;
    z-index: 3;
    pointer-events: none;
    
    p {
      margin-top: 16px;
    }
    
    .grid-hint {
      font-size: 12px;
      color: #bfbfbf;
    }
  }
}
</style>
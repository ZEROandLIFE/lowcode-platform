<template>
  <div 
    class="renderer-wrapper"
    :class="{ 
      selected: isSelected,
      'is-container': material?.isContainer,
    }"
    :style="wrapperStyle"
    @click.stop="handleClick"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- 组件标签 -->
    <div class="component-badge" v-if="isSelected">
      {{ material?.name }} ({{ span }}格)
    </div>

    <!-- 组件内容 -->
    <div class="component-content">
      <!-- 按钮组件 -->
      <div v-if="schema.type === 'Button'" class="component-inner">
        <a-button
          :type="schema.props.type"
          :size="schema.props.size"
          :danger="schema.props.danger"
          :disabled="schema.props.disabled"
          :block="true"
          class="renderer-button"
        >
          {{ schema.props.text }}
        </a-button>
      </div>

      <!-- 文本组件 -->
      <div v-else-if="schema.type === 'Text'" 
        class="component-inner text-inner"
        :style="textStyle"
      >
        {{ schema.props.content }}
      </div>

      <!-- 图片组件 -->
      <div v-else-if="schema.type === 'Image'" class="component-inner">
        <img
          :src="schema.props.src"
          :alt="schema.props.alt"
          class="renderer-image"
          :style="imageStyle"
        />
      </div>

      <!-- 输入框组件 -->
      <div v-else-if="schema.type === 'Input'" class="component-inner">
        <a-input
          :placeholder="schema.props.placeholder"
          :disabled="schema.props.disabled"
          class="renderer-input"
        />
      </div>

      <!-- 下拉选择组件 -->
      <div v-else-if="schema.type === 'Select'" class="component-inner">
        <a-select
          :placeholder="schema.props.placeholder"
          class="renderer-select"
        >
          <a-select-option 
            v-for="(opt, idx) in schema.props.options" 
            :key="idx" 
            :value="opt"
          >
            {{ opt }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 卡片组件 -->
      <div v-else-if="schema.type === 'Card'" class="component-inner">
        <a-card
          :title="schema.props.title"
          :bordered="schema.props.bordered"
          :hoverable="schema.props.hoverable"
          class="renderer-card"
        >
          <div v-if="schema.children?.length" class="card-children">
            <CanvasRenderer 
              v-for="child in schema.children"
              :key="child.id"
              :schema="child"
            />
          </div>
          <div v-else class="card-placeholder">
            拖拽组件到卡片内
          </div>
        </a-card>
      </div>

      <!-- 表格组件 -->
      <div v-else-if="schema.type === 'Table'" class="component-inner">
        <a-table
          :bordered="schema.props.bordered"
          :pagination="schema.props.pagination"
          :dataSource="[
            { key: '1', name: '示例数据1', age: 32 },
            { key: '2', name: '示例数据2', age: 28 },
          ]"
          :columns="[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '年龄', dataIndex: 'age', key: 'age' },
          ]"
          class="renderer-table"
          size="small"
        />
      </div>
    </div>

    <!-- 选中时的操作按钮 -->
    <div v-if="isSelected" class="component-actions">
      <a-button type="primary" danger size="small" @click.stop="handleDelete">
        <DeleteOutlined />
      </a-button>
    </div>

    <!-- 网格位置信息 -->
    <div class="grid-info" v-if="schema.gridPosition">
      行{{ schema.gridPosition.row }} 列{{ schema.gridPosition.col }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { useDesignerStore } from '@/stores/designer';
import type { ComponentSchema } from '@/types';
import type { CSSProperties } from 'vue';

const props = defineProps<{
  schema: ComponentSchema;
}>();

const store = useDesignerStore();
const GRID_SIZE = 60; // 固定格子大小

const material = computed(() => 
  store.state.materials.find(m => m.type === props.schema.type)
);

const isSelected = computed(() => store.state.selectedId === props.schema.id);

// 获取组件占用的格子数
const span = computed(() => props.schema.props.span || 4);

// 计算组件样式 - 基于网格坐标，支持高度设置
const wrapperStyle = computed((): CSSProperties => {
  const pos = props.schema.gridPosition || { row: 0, col: 0 };
  const span = props.schema.props.span || 4;
  const rowSpan = props.schema.props.rowSpan || 1; // 新增：高度占几行
  
  return {
    position: 'absolute',
    left: (pos.col * GRID_SIZE) + 'px',
    top: (pos.row * GRID_SIZE) + 'px',
    width: (span * GRID_SIZE - 4) + 'px',
    height: (rowSpan * GRID_SIZE - 4) + 'px', // 根据rowSpan计算高度
    margin: '2px',
    border: isSelected.value ? '2px solid #1890ff' : '2px solid transparent',
    borderRadius: '4px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    zIndex: isSelected.value ? 10 : 1,
    background: '#fff',
  };
});

// 文本样式
const textStyle = computed((): CSSProperties => ({
  fontSize: props.schema.props.fontSize || '14px',
  color: props.schema.props.color || '#000000',
  textAlign: props.schema.props.align || 'left',
  fontWeight: props.schema.props.fontWeight || 'normal',
  padding: '0 12px',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

// 图片样式
const imageStyle = computed((): CSSProperties => ({
  width: '100%',
  height: '100%',
  objectFit: props.schema.props.objectFit || 'cover',
  borderRadius: '4px',
}));

function handleClick() {
  store.selectComponent(props.schema.id);
}

function handleDelete() {
  store.removeComponent(props.schema.id);
}

function handleDragStart(e: DragEvent) {
  e.stopPropagation();
  store.setDragging(true);
  e.dataTransfer?.setData('dragId', props.schema.id);
  e.dataTransfer!.effectAllowed = 'move';
}

function handleDragEnd() {
  store.setDragging(false);
}
</script>

<style scoped lang="less">
.renderer-wrapper {
  position: absolute;
  cursor: move;
  user-select: none;
  display: flex;
  flex-direction: column;

  &.selected {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.3);
    z-index: 10;
  }

  .component-badge {
    position: absolute;
    top: -22px;
    left: 0;
    background: #1890ff;
    color: #fff;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;
    z-index: 11;
    pointer-events: none;
    white-space: nowrap;
  }

  .component-actions {
    position: absolute;
    top: -22px;
    right: 0;
    z-index: 11;
    display: none;
  }

  &.selected .component-actions {
    display: block;
  }

  .grid-info {
    position: absolute;
    bottom: -20px;
    right: 0;
    font-size: 10px;
    color: #8c8c8c;
    background: rgba(255,255,255,0.9);
    padding: 2px 6px;
    border-radius: 2px;
    z-index: 11;
    pointer-events: none;
  }

  .component-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .component-inner {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .renderer-button {
    :deep(.ant-btn) {
      width: 100%;
      height: 100%;
    }
  }

  .renderer-input {
    :deep(.ant-input) {
      width: 100%;
    }
  }

  .renderer-select {
    width: 100%;
    
    :deep(.ant-select-selector) {
      width: 100% !important;
    }
  }

  .renderer-card {
    width: 100%;
    height: 100%;
    
    :deep(.ant-card-body) {
      padding: 12px;
      height: calc(100% - 46px);
      overflow: auto;
    }
  }

  .renderer-table {
    width: 100%;
    height: 100%;
    
    :deep(.ant-table) {
      font-size: 12px;
    }
  }

  .text-inner {
    box-sizing: border-box;
  }

  .renderer-image {
    display: block;
  }

  .card-children {
    min-height: 30px;
    position: relative;
  }

  .card-placeholder {
    text-align: center;
    padding: 12px;
    color: #bfbfbf;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    font-size: 12px;
  }
}
</style>
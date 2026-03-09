<template>
  <div 
    class="preview-wrapper"
    :style="wrapperStyle"
  >
    <!-- 按钮组件 -->
    <div v-if="schema.type === 'Button'" class="preview-inner">
      <a-button
        :type="schema.props.type"
        :size="schema.props.size"
        :danger="schema.props.danger"
        :disabled="schema.props.disabled"
        :block="true"
        class="preview-button"
      >
        {{ schema.props.text }}
      </a-button>
    </div>

    <!-- 文本组件 -->
    <div v-else-if="schema.type === 'Text'" 
      class="preview-inner preview-text"
      :style="textStyle"
    >
      {{ schema.props.content }}
    </div>

    <!-- 图片组件 -->
    <div v-else-if="schema.type === 'Image'" class="preview-inner">
      <img
        :src="schema.props.src"
        :alt="schema.props.alt"
        class="preview-image"
        :style="imageStyle"
      />
    </div>

    <!-- 输入框组件 -->
    <div v-else-if="schema.type === 'Input'" class="preview-inner">
      <a-input
        :placeholder="schema.props.placeholder"
        :disabled="schema.props.disabled"
        class="preview-input"
      />
    </div>

    <!-- 下拉选择组件 -->
    <div v-else-if="schema.type === 'Select'" class="preview-inner">
      <a-select
        :placeholder="schema.props.placeholder"
        class="preview-select"
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
    <div v-else-if="schema.type === 'Card'" class="preview-inner">
      <a-card
        :title="schema.props.title"
        :bordered="schema.props.bordered"
        :hoverable="schema.props.hoverable"
        class="preview-card"
      >
        <div v-if="schema.children?.length" class="card-children">
          <PreviewRenderer 
            v-for="child in schema.children"
            :key="child.id"
            :schema="child"
          />
        </div>
      </a-card>
    </div>

    <!-- 表格组件 -->
    <div v-else-if="schema.type === 'Table'" class="preview-inner">
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
        class="preview-table"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentSchema } from '@/types';
import type { CSSProperties } from 'vue';

const props = defineProps<{
  schema: ComponentSchema;
}>();

const GRID_SIZE = 60; // 固定格子大小

// 获取组件占用的格子数
const span = computed(() => props.schema.props.span || 4);

// 计算组件样式 - 基于网格坐标，支持高度设置
const wrapperStyle = computed((): CSSProperties => {
  const pos = props.schema.gridPosition || { row: 0, col: 0 };
  const span = props.schema.props.span || 4;
  const rowSpan = props.schema.props.rowSpan || 1; // 获取高度
  
  return {
    position: 'absolute',
    left: (pos.col * GRID_SIZE) + 'px',
    top: (pos.row * GRID_SIZE) + 'px',
    width: (span * GRID_SIZE - 4) + 'px',
    height: (rowSpan * GRID_SIZE - 4) + 'px', // 使用rowSpan计算高度
    margin: '2px',
    boxSizing: 'border-box',
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
</script>

<style scoped>
.preview-wrapper {
  position: absolute;
}

.preview-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.preview-button {
  width: 100%;
  height: 100%;
}

.preview-button :deep(.ant-btn) {
  width: 100%;
  height: 100%;
}

.preview-input {
  width: 100%;
}

.preview-input :deep(.ant-input) {
  width: 100%;
}

.preview-select {
  width: 100%;
}

.preview-select :deep(.ant-select-selector) {
  width: 100% !important;
}

.preview-card {
  width: 100%;
  height: 100%;
}

.preview-card :deep(.ant-card-body) {
  padding: 12px;
  height: calc(100% - 46px);
  overflow: auto;
}

.preview-table {
  width: 100%;
  height: 100%;
}

.preview-table :deep(.ant-table) {
  font-size: 12px;
}

.preview-text {
  box-sizing: border-box;
}

.preview-image {
  display: block;
}

.card-children {
  min-height: 30px;
  position: relative;
}
</style>
<template>
  <div
    class="renderer-wrapper"
    :class="{
      selected: isSelected,
      'is-container': material?.isContainer,
      dragging: isDragging,
    }"
    :style="wrapperStyle"
    @click.stop="handleClick"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop.stop="handleDrop"
  >
    <!-- 组件标签 -->
    <div class="component-badge" v-if="isSelected">
      {{ material?.name }}
    </div>

    <!-- 实际组件渲染 -->
    <component
      :is="getComponent(schema.type)"
      v-bind="componentProps"
      :style="componentStyle"
    >
      <!-- 容器组件递归渲染子组件 -->
      <template v-if="material?.isContainer && schema.children">
        <CanvasRenderer
          v-for="child in schema.children"
          :key="child.id"
          :schema="child"
          :depth="depth + 1"
        />
        <div v-if="schema.children.length === 0" class="container-placeholder">
          拖拽组件到此处
        </div>
      </template>
    </component>

    <!-- 选中时的操作按钮 -->
    <div v-if="isSelected" class="component-actions">
      <a-button type="primary" danger size="small" @click.stop="handleDelete">
        <DeleteOutlined />
      </a-button>
    </div>

    <!-- 拖拽指示器 -->
    <div
      v-if="dropIndicator.show"
      class="drop-indicator"
      :class="dropIndicator.position"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { DeleteOutlined } from "@ant-design/icons-vue";
  import { Button, Input, Card, Select } from "ant-design-vue";
  import { useDesignerStore } from "@/stores/designer";
  import type { ComponentSchema } from "@/types";

  const props = defineProps<{
    schema: ComponentSchema;
    depth: number;
  }>();

  const store = useDesignerStore();
  const isDragging = ref(false);
  const dropIndicator = ref({
    show: false,
    position: "before" as "before" | "after" | "inside",
  });

  const material = computed(() =>
    store.state.materials.find((m) => m.type === props.schema.type)
  );

  const isSelected = computed(() => store.state.selectedId === props.schema.id);

  // 修复：使用 CSSProperties 类型
  const wrapperStyle = computed(
    (): Record<string, string> => ({
      position: "relative",
      border: isSelected.value ? "2px solid #1890ff" : "2px solid transparent",
      marginBottom: "8px",
      padding: "4px",
      borderRadius: "4px",
      ...(props.schema.style || {}),
    })
  );

  const componentProps = computed(() => {
    const { style, children, ...rest } = props.schema.props;
    return {
      ...rest,
      style: props.schema.style,
    };
  });

  const componentStyle = computed(() => ({
    pointerEvents: "none" as const,
    ...props.schema.style,
  }));

  // 组件映射表
  const componentMap: Record<string, any> = {
    Button,
    Input,
    Select: Select,
    Card,
    Container: "div",
    Text: "div",
    Image: "img",
    Grid: "div",
  };

  function getComponent(type: string) {
    return componentMap[type] || "div";
  }

  function handleClick() {
    store.selectComponent(props.schema.id);
  }

  function handleDelete() {
    store.removeComponent(props.schema.id);
  }

  function handleDragStart(e: DragEvent) {
    isDragging.value = true;
    e.dataTransfer?.setData("dragId", props.schema.id);
    e.dataTransfer!.effectAllowed = "move";
  }

  function handleDrop(e: DragEvent) {
    e.stopPropagation();

    const dragId = e.dataTransfer?.getData("dragId");
    if (!dragId || dragId === props.schema.id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const position =
      relativeY < rect.height / 3
        ? "before"
        : relativeY > (rect.height * 2) / 3
        ? "after"
        : "inside";
    if (position === "inside" && !material.value?.isContainer) {
      return;
    }

    store.moveComponent(dragId, props.schema.id, position);
    dropIndicator.value.show = false;
  }
</script>

<style scoped lang="less">
  .renderer-wrapper {
    position: relative;
    transition: all 0.2s;

    &.selected {
      background: rgba(24, 144, 255, 0.05);
    }

    &.is-container {
      min-height: 60px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px dashed #d9d9d9;
      padding: 16px;
    }

    &:hover:not(.selected) {
      border-color: #d9d9d9;
    }

    .component-badge {
      position: absolute;
      top: -12px;
      left: 8px;
      background: #1890ff;
      color: #fff;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 4px;
      z-index: 10;
    }

    .component-actions {
      position: absolute;
      top: -12px;
      right: 8px;
      z-index: 10;
      display: none;
    }

    &.selected .component-actions {
      display: block;
    }

    .container-placeholder {
      text-align: center;
      padding: 24px;
      color: #bfbfbf;
      border: 2px dashed #d9d9d9;
      border-radius: 4px;
    }

    .drop-indicator {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: #1890ff;
      z-index: 20;

      &.before {
        top: -2px;
      }
      &.after {
        bottom: -2px;
      }
      &.inside {
        top: 50%;
        transform: translateY(-50%);
        height: 100%;
        background: rgba(24, 144, 255, 0.1);
        border: 2px dashed #1890ff;
      }
    }
  }
</style>

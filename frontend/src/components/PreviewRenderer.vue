<template>
  <component
    :is="getComponent(schema.type)"
    v-bind="componentProps"
    :style="schema.style"
  >
    <!-- 递归渲染子组件 -->
    <template v-if="schema.children?.length">
      <PreviewRenderer 
        v-for="child in schema.children"
        :key="child.id"
        :schema="child"
      />
    </template>
    
    <!-- 文本内容 -->
    <template v-else-if="schema.type === 'Text'">
      {{ schema.props.content }}
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Button, Input, Select, Card } from 'ant-design-vue';
import type { ComponentSchema } from '@/types';

const props = defineProps<{
  schema: ComponentSchema;
}>();

const componentMap: Record<string, any> = {
  Button,
  Input,
  Select,
  Card,
  Container: 'div',
  Text: 'div',
  Image: 'img',
  Grid: 'div'
};

function getComponent(type: string) {
  return componentMap[type] || 'div';
}

const componentProps = computed(() => {
  const { style, children, content, ...rest } = props.schema.props;
  
  // 特殊处理图片
  if (props.schema.type === 'Image') {
    return {
      src: rest.src,
      alt: rest.alt,
      style: {
        width: rest.width,
        height: rest.height,
        objectFit: rest.objectFit,
        borderRadius: rest.borderRadius,
        ...props.schema.style
      }
    };
  }

  return rest;
});
</script>
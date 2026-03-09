<template>
  <div class="preview-page" :style="pageStyle">
    <div class="preview-container" :style="containerStyle">
      <PreviewRenderer 
        v-for="component in sortedComponents"
        :key="component.id"
        :schema="component"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { pageApi } from '@/api';
import type { PageData } from '@/types';
import PreviewRenderer from '@/components/PreviewRenderer.vue';

const route = useRoute();
const pageData = ref<PageData | null>(null);
const GRID_SIZE = 60;
const TOTAL_COLS = 12;

onMounted(async () => {
  const res = await pageApi.getById(route.params.id as string);
  if (res.success) {
    pageData.value = res.data;
  }
});

const pageStyle = computed(() => ({
  minHeight: '100vh',
  background: pageData.value?.schema?.settings?.background || '#f0f2f5',
  padding: pageData.value?.schema?.settings?.padding || '24px',
}));

const containerStyle = computed(() => {
  const components = pageData.value?.schema?.components || [];
  const maxRow = Math.max(
    ...components.map(c => (c.gridPosition?.row || 0) + 1),
    10
  );
  
  return {
    maxWidth: `${TOTAL_COLS * GRID_SIZE + 48}px`,
    margin: '0 auto',
    minHeight: `${maxRow * GRID_SIZE + 48}px`,
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative' as const,
    padding: '24px',
  };
});

// 按行排序的组件
const sortedComponents = computed(() => {
  if (!pageData.value?.schema?.components) return [];
  return [...pageData.value.schema.components].sort((a, b) => {
    const rowA = a.gridPosition?.row || 0;
    const rowB = b.gridPosition?.row || 0;
    if (rowA !== rowB) return rowA - rowB;
    const colA = a.gridPosition?.col || 0;
    const colB = b.gridPosition?.col || 0;
    return colA - colB;
  });
});
</script>

<style scoped>
.preview-page {
  position: relative;
  padding: 24px;
}

.preview-container {
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>
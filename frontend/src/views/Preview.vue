<template>
  <div class="preview-page" :style="pageStyle">
    <PreviewRenderer 
      v-for="component in pageData?.schema?.components || []"
      :key="component.id"
      :schema="component"
    />
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

onMounted(async () => {
  const res = await pageApi.getById(route.params.id as string);
  if (res.success) {
    pageData.value = res.data;
  }
});

const pageStyle = computed(() => ({
  minHeight: '100vh',
  background: pageData.value?.schema?.settings?.background || '#f0f2f5',
  padding: pageData.value?.schema?.settings?.padding || '24px'
}));
</script>

<style scoped>
.preview-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
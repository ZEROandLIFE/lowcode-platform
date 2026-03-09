<template>
  <div class="designer">
    <!-- 顶部工具栏 -->
    <DesignerToolbar />

    <div class="designer-body">
      <!-- 左侧物料面板 -->
      <MaterialPanel />

      <!-- 中间画布 -->
      <CanvasArea />

      <!-- 右侧属性面板 -->
      <PropsPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDesignerStore } from '@/stores/designer';
import DesignerToolbar from '@/components/DesignerToolbar.vue';
import MaterialPanel from '@/components/MaterialPanel.vue';
import CanvasArea from '@/components/CanvasArea.vue';
import PropsPanel from '@/components/PropsPanel.vue';

const route = useRoute();
const store = useDesignerStore();

onMounted(async () => {
  await store.loadMaterials();
  
  const pageId = route.params.id as string;
  if (pageId) {
    await store.loadPage(pageId);
  } else {
    // 初始化空页面历史记录
    store.saveHistory();
  }
});
</script>

<style scoped lang="less">
.designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;

  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
}
</style>
<template>
  <div class="toolbar">
    <div class="left">
      <a-button type="text" @click="goHome">
        <HomeOutlined /> 返回
      </a-button>
      <a-divider type="vertical" />
      <a-input 
        v-model:value="store.state.pageName" 
        class="page-name-input"
        placeholder="页面名称"
      />
    </div>

    <div class="center">
      <a-space>
        <a-button :disabled="!store.canUndo" @click="store.undo">
          <UndoOutlined /> 撤销
        </a-button>
        <a-button :disabled="!store.canRedo" @click="store.redo">
          <RedoOutlined /> 重做
        </a-button>
        <a-divider type="vertical" />
        <a-button 
          @click="store.toggleGrid"
          :type="store.state.showGrid ? 'primary' : 'default'"
        >
          <BorderOuterOutlined /> 
          {{ store.state.showGrid ? '隐藏网格' : '显示网格' }}
        </a-button>
        <a-button @click="showSettings = true">
          <SettingOutlined /> 页面设置
        </a-button>
      </a-space>
    </div>

    <div class="right">
      <a-space>
        <a-button @click="preview">
          <EyeOutlined /> 预览
        </a-button>
        <a-button type="primary" :loading="saving" @click="handleSave">
          <SaveOutlined /> 保存
        </a-button>
        <a-button type="primary" danger @click="handlePublish">
          <CloudUploadOutlined /> 发布
        </a-button>
      </a-space>
    </div>

    <!-- 页面设置弹窗 -->
    <a-modal
      v-model:open="showSettings"
      title="页面设置"
      @ok="applySettings"
    >
      <a-form :model="settingsForm" layout="vertical">
        <a-form-item label="页面标题">
          <a-input v-model:value="settingsForm.title" />
        </a-form-item>
        <a-form-item label="背景颜色">
          <input type="color" v-model="settingsForm.background" style="width: 100%; height: 32px;" />
        </a-form-item>
        <a-form-item label="内边距">
          <a-input v-model:value="settingsForm.padding" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  HomeOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  EyeOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  BorderOuterOutlined
} from '@ant-design/icons-vue';
import { useDesignerStore } from '@/stores/designer';
import { pageApi } from '@/api'; 

const router = useRouter();
const store = useDesignerStore();
const saving = ref(false);
const showSettings = ref(false);

const settingsForm = computed({
  get: () => ({
    title: store.state.schema.settings?.title || '',
    background: store.state.schema.settings?.background || '#f0f2f5',
    padding: store.state.schema.settings?.padding || '24px'
  }),
  set: () => {}
});

function goHome() {
  router.push('/');
}

function preview() {
  if (store.state.pageId) {
    window.open(`/preview/${store.state.pageId}`, '_blank');
  } else {
    message.warning('请先保存页面');
  }
}

async function handleSave() {
  saving.value = true;
  await store.savePage();
  saving.value = false;
  message.success('保存成功');
}

async function handlePublish() {
  if (!store.state.pageId) {
    message.warning('请先保存页面');
    return;
  }
  const res = await pageApi.publish(store.state.pageId);
  if (res.success) {
    message.success('发布成功');
  }
}

function applySettings() {
  store.updatePageSettings(settingsForm.value);
  showSettings.value = false;
  message.success('设置已应用');
}
</script>

<style scoped lang="less">
.toolbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  .left, .right {
    display: flex;
    align-items: center;
  }

  .page-name-input {
    width: 200px;
    font-weight: 500;
  }
}
</style>
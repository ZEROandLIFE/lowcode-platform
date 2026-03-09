<template>
  <div class="home">
    <a-page-header title="低代码平台" sub-title="快速构建页面">
      <template #extra>
        <a-button type="primary" @click="createNewPage">
          <template #icon><PlusOutlined /></template>
          新建页面
        </a-button>
      </template>
    </a-page-header>

    <div class="content">
      <a-row :gutter="[16, 16]">
        <a-col :span="6" v-for="page in pages" :key="page.id">
          <a-card 
            :title="page.name" 
            hoverable
            class="page-card"
          >
            <template #cover>
              <div class="page-preview" :style="{ background: page.schema?.settings?.background || '#f0f2f5' }">
                <div class="preview-content">
                  <FileOutlined style="font-size: 48px; color: #d9d9d9;" />
                </div>
              </div>
            </template>
            
            <a-card-meta>
              <template #description>
                <div class="meta-info">
                  <span>更新于: {{ formatDate(page.updatedAt) }}</span>
                  <a-tag v-if="page.isPublished" color="green">已发布</a-tag>
                  <a-tag v-else>未发布</a-tag>
                </div>
              </template>
            </a-card-meta>

            <template #actions>
              <EditOutlined @click="editPage(page.id)" />
              <EyeOutlined @click="previewPage(page.id)" />
              <CopyOutlined @click="duplicatePage(page)" />
              <DeleteOutlined @click="deletePage(page.id)" />
            </template>
          </a-card>
        </a-col>
      </a-row>

      <a-empty v-if="pages.length === 0" description="暂无页面，点击右上角新建" />
    </div>

    <!-- 新建页面弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      title="新建页面"
      @ok="confirmCreate"
      @cancel="modalVisible = false"
    >
      <a-form :model="newPageForm" layout="vertical">
        <a-form-item label="页面名称" required>
          <a-input v-model:value="newPageForm.name" placeholder="请输入页面名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined, 
  CopyOutlined, 
  DeleteOutlined,
  FileOutlined 
} from '@ant-design/icons-vue';
import { pageApi } from '@/api';
import type { PageData } from '@/types';

const router = useRouter();
const pages = ref<PageData[]>([]);
const modalVisible = ref(false);
const newPageForm = ref({ name: '' });

onMounted(loadPages);

async function loadPages() {
  const res = await pageApi.getList();
  if (res.success) {
    pages.value = res.data;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN');
}

function createNewPage() {
  newPageForm.value.name = '';
  modalVisible.value = true;
}

async function confirmCreate() {
  if (!newPageForm.value.name.trim()) {
    message.error('请输入页面名称');
    return;
  }
  
  const res = await pageApi.create(newPageForm.value.name);
  if (res.success) {
    message.success('创建成功');
    modalVisible.value = false;
    router.push(`/designer/${res.data.id}`);
  }
}

function editPage(id: string) {
  router.push(`/designer/${id}`);
}

function previewPage(id: string) {
  window.open(`/preview/${id}`, '_blank');
}

async function duplicatePage(page: PageData) {
  const res = await pageApi.duplicate(page.id, `${page.name} - 副本`);
  if (res.success) {
    message.success('复制成功');
    loadPages();
  }
}

async function deletePage(id: string) {
  const res = await pageApi.delete(id);
  if (res.success) {
    message.success('删除成功');
    loadPages();
  }
}
</script>

<style scoped lang="less">
.home {
  min-height: 100vh;
  background: #f0f2f5;

  .content {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-card {
    .page-preview {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .preview-content {
        text-align: center;
        
        p {
          margin-top: 8px;
          color: #8c8c8c;
        }
      }
    }

    .meta-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}
</style>
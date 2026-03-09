<template>
  <div class="props-panel">
    <div v-if="!store.selectedComponent" class="empty-state">
      <p>请在画布中选择组件</p>
    </div>
    
    <template v-else>
      <div class="panel-header">
        <h4>{{ store.selectedMaterial?.name }}</h4>
        <span class="component-id">{{ store.selectedComponent.id }}</span>
      </div>

      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="props" tab="属性">
          <div class="props-form">
            <div 
              v-for="config in store.selectedMaterial?.propsConfig" 
              :key="config.key"
              class="prop-item"
            >
              <label>{{ config.label }}</label>
              
              <!-- 字符串输入 -->
              <a-input
                v-if="config.type === 'string'"
                :value="store.selectedComponent.props[config.key]"
                @change="(e: any) => updateProp(config.key, e.target.value)"
              />
              
              <!-- 文本域 -->
              <a-textarea
                v-else-if="config.type === 'textarea'"
                :value="store.selectedComponent.props[config.key]"
                @change="(e: any) => updateProp(config.key, e.target.value)"
                :rows="3"
              />
              
              <!-- 数字输入 -->
              <a-input-number
                v-else-if="config.type === 'number'"
                :value="store.selectedComponent.props[config.key]"
                @change="(val: number) => updateProp(config.key, val)"
                style="width: 100%"
              />
              
              <!-- 布尔值 -->
              <a-switch
                v-else-if="config.type === 'boolean'"
                :checked="store.selectedComponent.props[config.key]"
                @change="(val: boolean) => updateProp(config.key, val)"
              />
              
              <!-- 选择器 -->
              <a-select
                v-else-if="config.type === 'select'"
                :value="store.selectedComponent.props[config.key]"
                @change="(val: string) => updateProp(config.key, val)"
                style="width: 100%"
              >
                <a-select-option 
                  v-for="opt in config.options" 
                  :key="opt" 
                  :value="opt"
                >
                  {{ opt }}
                </a-select-option>
              </a-select>
              
              <!-- 颜色选择 -->
              <input
                v-else-if="config.type === 'color'"
                type="color"
                :value="store.selectedComponent.props[config.key]"
                @input="(e: any) => updateProp(config.key, e.target.value)"
                style="width: 100%; height: 32px;"
              />
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="style" tab="样式">
          <div class="props-form">
            <div class="prop-item">
              <label>宽度</label>
              <a-input
                :value="store.selectedComponent.style?.width"
                @change="(e: any) => updateStyle('width', e.target.value)"
                placeholder="如: 100%, 200px"
              />
            </div>
            <div class="prop-item">
              <label>高度</label>
              <a-input
                :value="store.selectedComponent.style?.height"
                @change="(e: any) => updateStyle('height', e.target.value)"
                placeholder="如: auto, 100px"
              />
            </div>
            <div class="prop-item">
              <label>外边距</label>
              <a-input
                :value="store.selectedComponent.style?.margin"
                @change="(e: any) => updateStyle('margin', e.target.value)"
                placeholder="如: 10px, 10px 20px"
              />
            </div>
            <div class="prop-item">
              <label>内边距</label>
              <a-input
                :value="store.selectedComponent.style?.padding"
                @change="(e: any) => updateStyle('padding', e.target.value)"
                placeholder="如: 10px"
              />
            </div>
            <div class="prop-item">
              <label>背景色</label>
              <input
                type="color"
                :value="store.selectedComponent.style?.backgroundColor || '#ffffff'"
                @input="(e: any) => updateStyle('backgroundColor', e.target.value)"
                style="width: 100%; height: 32px;"
              />
            </div>
            <div class="prop-item">
              <label>文字颜色</label>
              <input
                type="color"
                :value="store.selectedComponent.style?.color || '#000000'"
                @input="(e: any) => updateStyle('color', e.target.value)"
                style="width: 100%; height: 32px;"
              />
            </div>
            <div class="prop-item">
              <label>圆角</label>
              <a-input
                :value="store.selectedComponent.style?.borderRadius"
                @change="(e: any) => updateStyle('borderRadius', e.target.value)"
                placeholder="如: 4px, 50%"
              />
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDesignerStore } from '@/stores/designer';

const store = useDesignerStore();
const activeKey = ref('props');

function updateProp(key: string, value: any) {
  if (store.selectedComponent) {
    store.updateComponentProps(store.selectedComponent.id, { [key]: value });
  }
}

function updateStyle(key: string, value: string) {
  if (store.selectedComponent) {
    store.updateComponentStyle(store.selectedComponent.id, { [key]: value });
  }
}
</script>

<style scoped lang="less">
.props-panel {
  width: 300px;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  overflow-y: auto;
  padding: 16px;

  .empty-state {
    text-align: center;
    color: #8c8c8c;
    padding: 48px 0;
  }

  .panel-header {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    h4 {
      margin: 0;
      font-size: 16px;
    }

    .component-id {
      font-size: 12px;
      color: #8c8c8c;
      font-family: monospace;
    }
  }

  .props-form {
    .prop-item {
      margin-bottom: 16px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        color: #262626;
        font-weight: 500;
      }
    }
  }
}
</style>
<template>
  <div class="props-panel">
    <div v-if="!store.selectedComponent" class="empty-state">
      <a-empty description="请在画布中选择组件" />
    </div>
    
    <template v-else>
      <div class="panel-header">
        <div class="header-main">
          <h4>{{ store.selectedMaterial?.name }}</h4>
          <a-tag size="small">{{ store.selectedComponent.type }}</a-tag>
        </div>
        <span class="component-id">ID: {{ store.selectedComponent.id }}</span>
      </div>

      <a-tabs v-model:activeKey="activeTab" class="props-tabs">
        <!-- 基础属性 -->
        <a-tab-pane key="basic" tab="基础">
          <div class="props-form">
            <!-- 组件宽度 -->
            <div class="prop-item">
              <label>组件宽度 (占据列数)</label>
              <a-radio-group 
                :value="store.selectedComponent.props.span?.toString()"
                @change="(e: any) => updateSpan(parseInt(e.target.value))"
                class="span-radio-group"
              >
                <a-radio-button value="4">
                  <div class="radio-content">
                    <span class="radio-icon">▬</span>
                    <span>小 (4格)</span>
                  </div>
                </a-radio-button>
                <a-radio-button value="6">
                  <div class="radio-content">
                    <span class="radio-icon">▬▬</span>
                    <span>中 (6格)</span>
                  </div>
                </a-radio-button>
                <a-radio-button value="12">
                  <div class="radio-content">
                    <span class="radio-icon">▬▬▬</span>
                    <span>大 (12格)</span>
                  </div>
                </a-radio-button>
              </a-radio-group>
              <div class="size-hint">宽度: {{ (store.selectedComponent.props.span || 4) * 60 }}px</div>
            </div>

            <!-- 组件高度 -->
            <div class="prop-item">
              <label>组件高度 (占据行数)</label>
              <a-radio-group 
                :value="(store.selectedComponent.props.rowSpan || 1).toString()"
                @change="(e: any) => updateRowSpan(parseInt(e.target.value))"
                class="span-radio-group"
              >
                <a-radio-button value="1">
                  <div class="radio-content">
                    <span class="radio-icon">▮</span>
                    <span>1行 (60px)</span>
                  </div>
                </a-radio-button>
                <a-radio-button value="2">
                  <div class="radio-content">
                    <span class="radio-icon">▮▮</span>
                    <span>2行 (120px)</span>
                  </div>
                </a-radio-button>
                <a-radio-button value="3">
                  <div class="radio-content">
                    <span class="radio-icon">▮▮▮</span>
                    <span>3行 (180px)</span>
                  </div>
                </a-radio-button>
                <a-radio-button value="4">
                  <div class="radio-content">
                    <span class="radio-icon">▮▮▮▮</span>
                    <span>4行 (240px)</span>
                  </div>
                </a-radio-button>
              </a-radio-group>
              <div class="size-hint">高度: {{ (store.selectedComponent.props.rowSpan || 1) * 60 }}px</div>
            </div>

            <!-- 网格位置 -->
            <div class="prop-item" v-if="store.selectedComponent.gridPosition">
              <label>网格位置</label>
              <div class="position-inputs">
                <a-input-number
                  :value="store.selectedComponent.gridPosition.row"
                  @change="(val: number) => updatePosition(val, store.selectedComponent!.gridPosition!.col)"
                  :min="0"
                  addon-before="行"
                  style="width: 48%"
                />
                <a-input-number
                  :value="store.selectedComponent.gridPosition.col"
                  @change="(val: number) => updatePosition(store.selectedComponent!.gridPosition!.row, val)"
                  :min="0"
                  :max="11"
                  addon-before="列"
                  style="width: 48%"
                />
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 组件特有属性 -->
        <a-tab-pane key="props" tab="属性">
          <div class="props-form">
            <!-- 按钮特有属性 -->
            <template v-if="store.selectedComponent.type === 'Button'">
              <div class="prop-item">
                <label>按钮文本</label>
                <a-input
                  :value="store.selectedComponent.props.text"
                  @change="(e: any) => updateProp('text', e.target.value)"
                  placeholder="请输入按钮文本"
                />
              </div>

              <div class="prop-item">
                <label>按钮类型</label>
                <a-select
                  :value="store.selectedComponent.props.type"
                  @change="(val: string) => updateProp('type', val)"
                  style="width: 100%"
                >
                  <a-select-option value="default">默认</a-select-option>
                  <a-select-option value="primary">主要</a-select-option>
                  <a-select-option value="dashed">虚线</a-select-option>
                  <a-select-option value="link">链接</a-select-option>
                  <a-select-option value="text">文本</a-select-option>
                </a-select>
              </div>

              <div class="prop-item">
                <label>尺寸</label>
                <a-radio-group 
                  :value="store.selectedComponent.props.size"
                  @change="(e: any) => updateProp('size', e.target.value)"
                >
                  <a-radio-button value="small">小</a-radio-button>
                  <a-radio-button value="middle">中</a-radio-button>
                  <a-radio-button value="large">大</a-radio-button>
                </a-radio-group>
              </div>

              <div class="prop-item inline">
                <label>危险样式</label>
                <a-switch
                  :checked="store.selectedComponent.props.danger"
                  @change="(val: boolean) => updateProp('danger', val)"
                />
              </div>

              <div class="prop-item inline">
                <label>禁用状态</label>
                <a-switch
                  :checked="store.selectedComponent.props.disabled"
                  @change="(val: boolean) => updateProp('disabled', val)"
                />
              </div>
            </template>

            <!-- 文本特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Text'">
              <div class="prop-item">
                <label>文本内容</label>
                <a-textarea
                  :value="store.selectedComponent.props.content"
                  @change="(e: any) => updateProp('content', e.target.value)"
                  :rows="3"
                  placeholder="请输入文本内容"
                />
              </div>

              <div class="prop-item">
                <label>字体大小</label>
                <a-select
                  :value="store.selectedComponent.props.fontSize"
                  @change="(val: string) => updateProp('fontSize', val)"
                  style="width: 100%"
                >
                  <a-select-option value="12px">12px</a-select-option>
                  <a-select-option value="14px">14px</a-select-option>
                  <a-select-option value="16px">16px</a-select-option>
                  <a-select-option value="18px">18px</a-select-option>
                  <a-select-option value="20px">20px</a-select-option>
                  <a-select-option value="24px">24px</a-select-option>
                </a-select>
              </div>

              <div class="prop-item">
                <label>对齐方式</label>
                <a-radio-group 
                  :value="store.selectedComponent.props.align"
                  @change="(e: any) => updateProp('align', e.target.value)"
                >
                  <a-radio-button value="left">左对齐</a-radio-button>
                  <a-radio-button value="center">居中</a-radio-button>
                  <a-radio-button value="right">右对齐</a-radio-button>
                </a-radio-group>
              </div>

              <div class="prop-item inline">
                <label>加粗</label>
                <a-switch
                  :checked="store.selectedComponent.props.fontWeight === 'bold'"
                  @change="(val: boolean) => updateProp('fontWeight', val ? 'bold' : 'normal')"
                />
              </div>
            </template>

            <!-- 图片特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Image'">
              <div class="prop-item">
                <label>图片地址</label>
                <a-input
                  :value="store.selectedComponent.props.src"
                  @change="(e: any) => updateProp('src', e.target.value)"
                  placeholder="请输入图片URL"
                />
              </div>

              <div class="prop-item">
                <label>替代文本</label>
                <a-input
                  :value="store.selectedComponent.props.alt"
                  @change="(e: any) => updateProp('alt', e.target.value)"
                  placeholder="图片加载失败时显示"
                />
              </div>

              <div class="prop-item">
                <label>填充模式</label>
                <a-radio-group 
                  :value="store.selectedComponent.props.objectFit || 'cover'"
                  @change="(e: any) => updateProp('objectFit', e.target.value)"
                >
                  <a-radio-button value="cover">覆盖</a-radio-button>
                  <a-radio-button value="contain">包含</a-radio-button>
                  <a-radio-button value="fill">填充</a-radio-button>
                </a-radio-group>
              </div>
            </template>

            <!-- 输入框特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Input'">
              <div class="prop-item">
                <label>占位符</label>
                <a-input
                  :value="store.selectedComponent.props.placeholder"
                  @change="(e: any) => updateProp('placeholder', e.target.value)"
                  placeholder="请输入占位符"
                />
              </div>

              <div class="prop-item inline">
                <label>禁用状态</label>
                <a-switch
                  :checked="store.selectedComponent.props.disabled"
                  @change="(val: boolean) => updateProp('disabled', val)"
                />
              </div>
            </template>

            <!-- 下拉选择特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Select'">
              <div class="prop-item">
                <label>占位符</label>
                <a-input
                  :value="store.selectedComponent.props.placeholder"
                  @change="(e: any) => updateProp('placeholder', e.target.value)"
                  placeholder="请选择..."
                />
              </div>

              <div class="prop-item">
                <label>选项配置</label>
                <div class="options-list">
                  <div 
                    v-for="(opt, idx) in selectOptions" 
                    :key="idx"
                    class="option-item"
                  >
                    <a-input
                      :value="opt"
                      @change="(e: any) => updateOption(idx, e.target.value)"
                      size="small"
                      placeholder="选项文本"
                    >
                      <template #addonAfter>
                        <DeleteOutlined @click="removeOption(idx)" class="delete-icon" />
                      </template>
                    </a-input>
                  </div>
                  <a-button type="dashed" block size="small" @click="addOption">
                    <PlusOutlined /> 添加选项
                  </a-button>
                </div>
              </div>

              <div class="prop-item inline">
                <label>多选模式</label>
                <a-switch
                  :checked="store.selectedComponent.props.mode === 'multiple'"
                  @change="(val: boolean) => updateProp('mode', val ? 'multiple' : undefined)"
                />
              </div>

              <div class="prop-item inline">
                <label>禁用状态</label>
                <a-switch
                  :checked="store.selectedComponent.props.disabled"
                  @change="(val: boolean) => updateProp('disabled', val)"
                />
              </div>
            </template>

            <!-- 卡片特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Card'">
              <div class="prop-item">
                <label>卡片标题</label>
                <a-input
                  :value="store.selectedComponent.props.title"
                  @change="(e: any) => updateProp('title', e.target.value)"
                  placeholder="请输入标题"
                />
              </div>

              <div class="prop-item inline">
                <label>显示边框</label>
                <a-switch
                  :checked="store.selectedComponent.props.bordered !== false"
                  @change="(val: boolean) => updateProp('bordered', val)"
                />
              </div>

              <div class="prop-item inline">
                <label>悬浮效果</label>
                <a-switch
                  :checked="store.selectedComponent.props.hoverable"
                  @change="(val: boolean) => updateProp('hoverable', val)"
                />
              </div>
            </template>

            <!-- 表格特有属性 -->
            <template v-else-if="store.selectedComponent.type === 'Table'">
              <div class="prop-item">
                <label>列配置</label>
                <div class="columns-list">
                  <div 
                    v-for="(col, idx) in tableColumns" 
                    :key="idx"
                    class="column-item"
                  >
                    <div class="column-header">
                      <span>列 {{ idx + 1 }}</span>
                      <DeleteOutlined @click="removeColumn(idx)" class="delete-icon" />
                    </div>
                    <div class="column-fields">
                      <a-input
                        :value="col.title"
                        @change="(e: any) => updateColumn(idx, 'title', e.target.value)"
                        size="small"
                        placeholder="列标题"
                      />
                      <a-input
                        :value="col.dataIndex"
                        @change="(e: any) => updateColumn(idx, 'dataIndex', e.target.value)"
                        size="small"
                        placeholder="数据字段"
                      />
                    </div>
                  </div>
                  <a-button type="dashed" block size="small" @click="addColumn">
                    <PlusOutlined /> 添加列
                  </a-button>
                </div>
              </div>

              <div class="prop-item inline">
                <label>显示边框</label>
                <a-switch
                  :checked="store.selectedComponent.props.bordered !== false"
                  @change="(val: boolean) => updateProp('bordered', val)"
                />
              </div>

              <div class="prop-item inline">
                <label>显示分页</label>
                <a-switch
                  :checked="store.selectedComponent.props.pagination"
                  @change="(val: boolean) => updateProp('pagination', val)"
                />
              </div>
            </template>

            <!-- 删除按钮 -->
            <div class="prop-item" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0;">
              <a-button danger block @click="handleDelete">
                <DeleteOutlined /> 删除组件
              </a-button>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  DeleteOutlined, 
  PlusOutlined
} from '@ant-design/icons-vue';
import { useDesignerStore } from '@/stores/designer';

const store = useDesignerStore();
const activeTab = ref('basic');

// 下拉选项计算属性
const selectOptions = computed({
  get: () => store.selectedComponent?.props.options || [],
  set: (val: string[]) => updateProp('options', val)
});

// 表格列计算属性
const tableColumns = computed({
  get: () => store.selectedComponent?.props.columns || [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' }
  ],
  set: (val: any[]) => updateProp('columns', val)
});

// 更新宽度
function updateSpan(value: number) {
  const comp = store.selectedComponent;
  if (!comp) return;
  
  const currentCol = comp.gridPosition?.col || 0;
  
  if (currentCol + value > 12) {
    message.warning('当前位置无法容纳此宽度，将自动调整位置');
  }
  
  store.updateComponentProps(comp.id, { span: value });
  message.success(`宽度已调整为 ${value} 格`);
}

// 更新高度（行数）
function updateRowSpan(value: number) {
  const comp = store.selectedComponent;
  if (!comp) return;
  
  store.updateComponentProps(comp.id, { rowSpan: value });
  message.success(`高度已调整为 ${value} 行`);
}

// 更新位置
function updatePosition(row: number, col: number) {
  if (!store.selectedComponent) return;
  
  const success = store.moveComponent(store.selectedComponent.id, row, col);
  if (!success) {
    message.error('该位置已被占用或超出边界');
  }
}

// 更新属性
function updateProp(key: string, value: any) {
  if (store.selectedComponent) {
    store.updateComponentProps(store.selectedComponent.id, { [key]: value });
  }
}

// 下拉选项操作
function addOption() {
  const current = [...selectOptions.value];
  current.push(`选项${current.length + 1}`);
  selectOptions.value = current;
  message.success('选项已添加');
}

function removeOption(index: number) {
  const current = [...selectOptions.value];
  if (current.length <= 1) {
    message.warning('至少保留一个选项');
    return;
  }
  current.splice(index, 1);
  selectOptions.value = current;
  message.success('选项已删除');
}

function updateOption(index: number, value: string) {
  const current = [...selectOptions.value];
  current[index] = value;
  selectOptions.value = current;
}

// 表格列操作
function addColumn() {
  const current = [...tableColumns.value];
  current.push({
    title: `列${current.length + 1}`,
    dataIndex: `field${current.length + 1}`,
    key: `field${current.length + 1}`
  });
  tableColumns.value = current;
  message.success('列已添加');
}

function removeColumn(index: number) {
  const current = [...tableColumns.value];
  if (current.length <= 1) {
    message.warning('至少保留一列');
    return;
  }
  current.splice(index, 1);
  tableColumns.value = current;
  message.success('列已删除');
}

function updateColumn(index: number, key: string, value: any) {
  const current = [...tableColumns.value];
  current[index] = { ...current[index], [key]: value };
  tableColumns.value = current;
}

// 删除组件
function handleDelete() {
  if (store.selectedComponent) {
    store.removeComponent(store.selectedComponent.id);
    message.success('组件已删除');
  }
}
</script>

<style scoped lang="less">
.props-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  height: 100%;

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;

    .header-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .component-id {
      font-size: 11px;
      color: #8c8c8c;
      font-family: monospace;
      display: block;
      word-break: break-all;
    }
  }

  .props-tabs {
    flex: 1;
    overflow: hidden;

    :deep(.ant-tabs-content) {
      height: calc(100% - 46px);
      overflow-y: auto;
    }

    :deep(.ant-tabs-tabpane) {
      padding: 0 16px 16px;
    }
  }

  .props-form {
    .prop-item {
      margin-bottom: 20px;

      label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        color: #262626;
        font-weight: 500;
      }

      &.inline {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        label {
          margin-bottom: 0;
        }
      }

      .size-hint {
        margin-top: 8px;
        font-size: 12px;
        color: #8c8c8c;
        background: #f5f5f5;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .position-inputs {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }

      .options-list, .columns-list {
        .option-item {
          margin-bottom: 8px;
          
          .delete-icon {
            color: #ff4d4f;
            cursor: pointer;
            
            &:hover {
              color: #ff7875;
            }
          }
        }

        .column-item {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 12px;

          .column-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;
            color: #666;
            font-weight: 500;

            .delete-icon {
              color: #ff4d4f;
              cursor: pointer;
              
              &:hover {
                color: #ff7875;
              }
            }
          }

          .column-fields {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
        }
      }
    }

    .span-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      :deep(.ant-radio-button-wrapper) {
        height: auto;
        padding: 12px;
        text-align: center;
        
        .radio-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          
          .radio-icon {
            font-size: 20px;
            color: #1890ff;
            line-height: 1;
          }
          
          span:last-child {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }
  }
}
</style>
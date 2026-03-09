import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import type {
  DesignerState,
  ComponentSchema,
  ComponentMaterial,
  PageSchema,
} from "@/types";
import { pageApi, materialApi } from "@/api";

export const useDesignerStore = defineStore("designer", () => {
  // State
  const state = ref<DesignerState>({
    pageId: null,
    pageName: "未命名页面",
    schema: {
      version: "1.0",
      components: [],
      settings: {
        background: "#f0f2f5",
        padding: "24px",
      },
    },
    selectedId: null,
    materials: [],
    history: [],
    historyIndex: -1,
    isDragging: false,
  });

  // Getters
  const selectedComponent = computed(() => {
    return findComponentById(
      state.value.schema.components,
      state.value.selectedId
    );
  });

  const selectedMaterial = computed(() => {
    if (!selectedComponent.value) return null;
    return state.value.materials.find(
      (m) => m.type === selectedComponent.value?.type
    );
  });

  const canUndo = computed(() => state.value.historyIndex > 0);
  const canRedo = computed(
    () => state.value.historyIndex < state.value.history.length - 1
  );

  // Actions
  function findComponentById(
    components: ComponentSchema[],
    id: string | null
  ): ComponentSchema | null {
    if (!id) return null;

    for (const component of components) {
      if (component.id === id) return component;
      if (component.children) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function findParent(
    components: ComponentSchema[],
    childId: string
  ): ComponentSchema[] | null {
    for (const component of components) {
      if (component.children?.some((c) => c.id === childId)) {
        return component.children;
      }
      if (component.children) {
        const found = findParent(component.children, childId);
        if (found) return found;
      }
    }
    return null;
  }

  function saveHistory() {
    // 删除当前索引之后的历史
    state.value.history = state.value.history.slice(
      0,
      state.value.historyIndex + 1
    );
    state.value.history.push(JSON.parse(JSON.stringify(state.value.schema)));
    state.value.historyIndex++;

    // 限制历史记录长度
    if (state.value.history.length > 50) {
      state.value.history.shift();
      state.value.historyIndex--;
    }
  }

  function undo() {
    if (canUndo.value) {
      state.value.historyIndex--;
      state.value.schema = JSON.parse(
        JSON.stringify(state.value.history[state.value.historyIndex])
      );
    }
  }

  function redo() {
    if (canRedo.value) {
      state.value.historyIndex++;
      state.value.schema = JSON.parse(
        JSON.stringify(state.value.history[state.value.historyIndex])
      );
    }
  }

  function addComponent(material: ComponentMaterial, parentId?: string) {
    const newComponent: ComponentSchema = {
      id: `${material.type}_${uuidv4().slice(0, 8)}`,
      type: material.type,
      props: { ...material.defaultProps },
      children: material.isContainer ? [] : undefined,
      parentId,
    };

    if (parentId) {
      const parent = findComponentById(state.value.schema.components, parentId);
      if (parent && parent.children) {
        parent.children.push(newComponent);
      }
    } else {
      state.value.schema.components.push(newComponent);
    }

    saveHistory();
    state.value.selectedId = newComponent.id;
  }

  function removeComponent(id: string) {
    const removeFromArray = (arr: ComponentSchema[]): boolean => {
      const index = arr.findIndex((c) => c.id === id);
      if (index > -1) {
        arr.splice(index, 1);
        return true;
      }
      for (const comp of arr) {
        if (comp.children && removeFromArray(comp.children)) {
          return true;
        }
      }
      return false;
    };

    if (removeFromArray(state.value.schema.components)) {
      if (state.value.selectedId === id) {
        state.value.selectedId = null;
      }
      saveHistory();
    }
  }

  function updateComponentProps(id: string, props: Record<string, any>) {
    const comp = findComponentById(state.value.schema.components, id);
    if (comp) {
      comp.props = { ...comp.props, ...props };
      saveHistory();
    }
  }

  function updateComponentStyle(id: string, style: Record<string, string>) {
    const comp = findComponentById(state.value.schema.components, id);
    if (comp) {
      comp.style = { ...comp.style, ...style };
      saveHistory();
    }
  }

  function moveComponent(
    dragId: string,
    dropId: string,
    position: "before" | "after" | "inside"
  ) {
    // 实现组件拖拽排序逻辑
    const dragComp = findComponentById(state.value.schema.components, dragId);
    if (!dragComp) return;

    // 从原位置移除
    const removeFromArray = (arr: ComponentSchema[]): boolean => {
      const index = arr.findIndex((c) => c.id === dragId);
      if (index > -1) {
        arr.splice(index, 1);
        return true;
      }
      for (const comp of arr) {
        if (comp.children && removeFromArray(comp.children)) {
          return true;
        }
      }
      return false;
    };

    removeFromArray(state.value.schema.components);

    // 插入到新位置
    if (position === "inside") {
      const dropComp = findComponentById(state.value.schema.components, dropId);
      if (dropComp && dropComp.children) {
        dropComp.children.push(dragComp);
      }
    } else {
      const targetArray =
        findParent(state.value.schema.components, dropId) ||
        state.value.schema.components;
      const dropIndex = targetArray.findIndex((c) => c.id === dropId);
      const insertIndex = position === "before" ? dropIndex : dropIndex + 1;
      targetArray.splice(insertIndex, 0, dragComp);
    }

    saveHistory();
  }

  function selectComponent(id: string | null) {
    state.value.selectedId = id;
  }

  function setDragging(isDragging: boolean) {
    state.value.isDragging = isDragging;
  }

  async function loadPage(id: string) {
    const res = await pageApi.getById(id);
    if (res.success && res.data) {
      state.value.pageId = res.data.id;
      state.value.pageName = res.data.name;
      // 确保 schema 有默认值
      state.value.schema = res.data.schema || {
        version: "1.0",
        components: [],
        settings: {
          background: "#f0f2f5",
          padding: "24px",
        },
      };
      state.value.history = [JSON.parse(JSON.stringify(state.value.schema))];
      state.value.historyIndex = 0;
    } else {
      // 如果加载失败，重置状态
      state.value.pageId = null;
      state.value.pageName = "未命名页面";
      state.value.schema = {
        version: "1.0",
        components: [],
        settings: {
          background: "#f0f2f5",
          padding: "24px",
        },
      };
      state.value.history = [];
      state.value.historyIndex = -1;
    }
  }

  async function savePage() {
    if (!state.value.pageId) {
      const res = await pageApi.create(state.value.pageName);
      if (res.success) {
        state.value.pageId = res.data.id;
      }
    }

    if (state.value.pageId) {
      await pageApi.update(state.value.pageId, {
        name: state.value.pageName,
        schema: state.value.schema,
      });
    }
  }

  async function loadMaterials() {
    const res = await materialApi.getAll();
    if (res.success) {
      state.value.materials = res.data;
    }
  }

  function updatePageSettings(settings: Partial<PageSchema["settings"]>) {
    state.value.schema.settings = {
      ...state.value.schema.settings,
      ...settings,
    };
    saveHistory();
  }

  return {
    state,
    selectedComponent,
    selectedMaterial,
    canUndo,
    canRedo,
    addComponent,
    removeComponent,
    updateComponentProps,
    updateComponentStyle,
    moveComponent,
    selectComponent,
    setDragging,
    undo,
    redo,
    loadPage,
    savePage,
    loadMaterials,
    updatePageSettings,
    findComponentById,
    saveHistory,
  };
});

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

// 固定12列
const TOTAL_COLS = 12;

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
        gridSize: 60, // 每个格子60px
      },
    },
    selectedId: null,
    materials: [],
    history: [],
    historyIndex: -1,
    isDragging: false,
    gridSize: 60,
    showGrid: true,
    cols: TOTAL_COLS,
  });

  // Getters
  const selectedComponent = computed(() => {
    return state.value.schema.components.find(
      (c) => c.id === state.value.selectedId
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

  // 计算占用矩阵 - 用于碰撞检测
  const occupiedMatrix = computed(() => {
    const matrix: boolean[][] = [];
    const maxRows = 50; // 预分配50行

    // 初始化矩阵
    for (let r = 0; r < maxRows; r++) {
      matrix[r] = new Array(TOTAL_COLS).fill(false);
    }

    // 标记已占用的格子
    state.value.schema.components.forEach((comp) => {
      const span = comp.props.span || 4;
      const row = comp.gridPosition?.row || 0;
      const col = comp.gridPosition?.col || 0;

      for (let c = col; c < Math.min(col + span, TOTAL_COLS); c++) {
        if (matrix[row]) {
          matrix[row][c] = true;
        }
      }
    });

    return matrix;
  });

  // 检查位置是否可用（更新版，支持高度检查）
  function isPositionAvailable(
    row: number,
    col: number,
    span: number,
    rowSpan: number = 1,
    excludeId?: string
  ): boolean {
    // 检查是否超出边界
    if (col < 0 || col + span > TOTAL_COLS) return false;
    if (row < 0) return false;

    // 检查是否有冲突（检查所有占用的格子）
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + span; c++) {
        const compAtPos = findComponentAt(r, c);
        if (compAtPos && compAtPos.id !== excludeId) {
          return false;
        }
      }
    }

    return true;
  }
  // 查找指定位置的组件（更新版，考虑高度）
  function findComponentAt(row: number, col: number): ComponentSchema | null {
    for (const comp of state.value.schema.components) {
      const span = comp.props.span || 4;
      const compRowSpan = comp.props.rowSpan || 1;
      const compRow = comp.gridPosition?.row ?? -1;
      const compCol = comp.gridPosition?.col ?? -1;

      // 检查这个格子是否被该组件占用（考虑高度）
      if (
        row >= compRow &&
        row < compRow + compRowSpan &&
        col >= compCol &&
        col < compCol + span
      ) {
        return comp;
      }
    }
    return null;
  }

  // 查找第一个可用位置（更新版，考虑高度）
  function findFirstAvailablePosition(
    span: number,
    rowSpan: number = 1
  ): {
    row: number;
    col: number;
  } {
    const maxRows = 50;

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col <= TOTAL_COLS - span; col++) {
        if (isPositionAvailable(row, col, span, rowSpan)) {
          return { row, col };
        }
      }
    }

    // 如果没找到，放在最后一行
    return { row: maxRows, col: 0 };
  }
  // Actions
  function saveHistory() {
    state.value.history = state.value.history.slice(
      0,
      state.value.historyIndex + 1
    );
    state.value.history.push(JSON.parse(JSON.stringify(state.value.schema)));
    state.value.historyIndex++;

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

  // 添加组件（更新版，传递rowSpan）
  function addComponent(
    material: ComponentMaterial,
    position?: { row: number; col: number }
  ) {
    const span = material.defaultProps.span || 4;
    const rowSpan = material.defaultProps.rowSpan || 1;

    // 确定位置
    let finalPosition: { row: number; col: number };

    if (position) {
      // 检查指定位置是否可用
      if (isPositionAvailable(position.row, position.col, span, rowSpan)) {
        finalPosition = position;
      } else {
        // 如果不可用，找第一个可用位置
        finalPosition = findFirstAvailablePosition(span, rowSpan);
      }
    } else {
      // 自动找位置
      finalPosition = findFirstAvailablePosition(span, rowSpan);
    }

    const newComponent: ComponentSchema = {
      id: `${material.type}_${uuidv4().slice(0, 8)}`,
      type: material.type,
      props: { ...material.defaultProps },
      children: material.isContainer ? [] : undefined,
      gridPosition: finalPosition,
    };

    state.value.schema.components.push(newComponent);
    saveHistory();
    state.value.selectedId = newComponent.id;

    return newComponent;
  }

  function removeComponent(id: string) {
    const index = state.value.schema.components.findIndex((c) => c.id === id);
    if (index > -1) {
      state.value.schema.components.splice(index, 1);
      if (state.value.selectedId === id) {
        state.value.selectedId = null;
      }
      saveHistory();
    }
  }

  // 更新组件属性（更新版，处理rowSpan变化和碰撞检测）
  function updateComponentProps(id: string, props: Record<string, any>) {
    const comp = state.value.schema.components.find((c) => c.id === id);
    if (!comp) return;

    // 如果修改了 span，需要检查新位置是否可用
    if (props.span && props.span !== comp.props.span) {
      const oldSpan = comp.props.span || 4;
      const newSpan = props.span;
      const row = comp.gridPosition?.row || 0;
      const col = comp.gridPosition?.col || 0;
      const rowSpan = comp.props.rowSpan || 1;

      // 如果新span放不下，调整位置
      if (col + newSpan > TOTAL_COLS) {
        // 尝试找新的位置
        const newPos = findFirstAvailablePosition(newSpan, rowSpan);
        comp.gridPosition = newPos;
      } else if (!isPositionAvailable(row, col, newSpan, rowSpan, id)) {
        // 如果当前位置被其他组件占用，找新位置
        const newPos = findFirstAvailablePosition(newSpan, rowSpan);
        comp.gridPosition = newPos;
      }
    }

    // 如果修改了 rowSpan，需要检查碰撞
    if (props.rowSpan && props.rowSpan !== comp.props.rowSpan) {
      const span = comp.props.span || 4;
      const newRowSpan = props.rowSpan;
      const row = comp.gridPosition?.row || 0;
      const col = comp.gridPosition?.col || 0;

      if (!isPositionAvailable(row, col, span, newRowSpan, id)) {
        // 如果当前位置放不下，找新位置
        const newPos = findFirstAvailablePosition(span, newRowSpan);
        comp.gridPosition = newPos;
      }
    }

    comp.props = { ...comp.props, ...props };
    saveHistory();
  }

  // 移动组件（更新版，考虑高度）
  function moveComponent(id: string, newRow: number, newCol: number): boolean {
    const comp = state.value.schema.components.find((c) => c.id === id);
    if (!comp) return false;

    const span = comp.props.span || 4;
    const rowSpan = comp.props.rowSpan || 1;

    // 检查新位置是否可用
    if (!isPositionAvailable(newRow, newCol, span, rowSpan, id)) {
      return false;
    }

    comp.gridPosition = { row: newRow, col: newCol };
    saveHistory();
    return true;
  }

  function selectComponent(id: string | null) {
    state.value.selectedId = id;
  }

  function setDragging(isDragging: boolean) {
    state.value.isDragging = isDragging;
  }

  function toggleGrid() {
    state.value.showGrid = !state.value.showGrid;
  }

  async function loadPage(id: string) {
    const res = await pageApi.getById(id);
    if (res.success && res.data) {
      state.value.pageId = res.data.id;
      state.value.pageName = res.data.name;
      state.value.schema = res.data.schema || {
        version: "1.0",
        components: [],
        settings: {
          background: "#f0f2f5",
          padding: "24px",
          gridSize: 60,
        },
      };
      state.value.history = [JSON.parse(JSON.stringify(state.value.schema))];
      state.value.historyIndex = 0;
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
    occupiedMatrix,
    isPositionAvailable,
    findComponentAt,
    findFirstAvailablePosition,
    addComponent,
    removeComponent,
    updateComponentProps,
    moveComponent,
    selectComponent,
    setDragging,
    undo,
    redo,
    loadPage,
    savePage,
    loadMaterials,
    updatePageSettings,
    toggleGrid,
    saveHistory,
  };
});

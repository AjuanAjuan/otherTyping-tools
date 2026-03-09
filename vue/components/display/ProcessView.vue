<template>
  <div class="ProcessView process-view-container relative" ref="containerRef">
    <!-- 流程画布容器 -->
    <div class="process-canvas" ref="canvasRef" @wheel.prevent="handleMouseWheel" @mousedown="handleMouseDown"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp" @dblclick.prevent></div>

    <!-- 控制按钮组 -->
    <div class="control-buttons absolute top-4 right-4 flex flex-col gap-2 z-10" v-if="toolbar">
      <ElButtonGroup>
        <el-button circle @click="zoomIn" :disabled="zoomLevel >= maxZoom" tooltip="放大">
          <icon icon="ep:zoom-in" :size="16" />
        </el-button>
        <el-button circle @click="zoomOut" :disabled="zoomLevel <= minZoom" tooltip="缩小">
          <icon icon="ep:zoom-out" :size="16" />
        </el-button>
        <el-button circle @click="resetZoom" tooltip="重置视图">
          <icon icon="ep:aim" :size="16" />
        </el-button>
        <!-- <el-button size="small" circle @click="refreshProcess" tooltip="刷新内容">
          <icon icon="ep:refresh" :size="14" />
        </el-button> -->
      </ElButtonGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import BpmnViewer from 'bpmn-js/lib/Viewer';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { ElButton, ElButtonGroup } from 'element-plus';
import Icon from '../Icon/src/Icon.vue';
import { Element } from 'bpmn-js/lib/model/Types';

// 定义组件的Props
interface Props {
  // BPMN文件内容
  modelValue: string;
  // 已完成任务列表，用于区分显示节点
  finishTasks?: string[];
  // 当前用户的活动任务列表，用于高亮活动节点
  activeTasks?: string[];
  // 是否显示工具
  toolbar?: Boolean,
}

const { modelValue, finishTasks, activeTasks, toolbar = false } = defineProps<Props>();

// 组件的Refs
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLDivElement>();

// 缩放相关状态
const viewer = ref<BpmnViewer | null>(null);
const zoomLevel = ref(1.0);
const minZoom = 0.5;
const maxZoom = 2.0;
const zoomStep = 0.1;

// 拖放相关状态
const isDragging = ref(false);
const lastPosition = ref({ x: 0, y: 0 });

// 初始化BPMN视图
const initViewer = async () => {
  if (!canvasRef.value) return;

  // 销毁已存在的视图
  if (viewer.value) {
    viewer.value.destroy();
  }

  // 创建新的BPMN视图实例
  viewer.value = new BpmnViewer({
    container: canvasRef.value,
    width: '100%',
    height: '100%',
    additionalModules: []
  });

  try {
    // 导入BPMN内容
    const { warnings } = await viewer.value.importXML(modelValue);

    if (warnings.length) {
      console.warn('BPMN导入警告:', warnings);
    }

    // 适配视图
    fitToView();

    // 高亮活动节点
    highlightActiveNodes();

  } catch (err) {
    console.error('BPMN导入失败:', err);
  }
};

// 适配视图到容器
const fitToView = () => {
  if (viewer.value) {
    // @ts-ignore
    viewer.value.get('canvas').zoom('fit-viewport', 'auto');
    // 重置缩放级别
    zoomLevel.value = 1.0;
  }
};

// 放大视图
const zoomIn = () => {
  if (zoomLevel.value >= maxZoom) return;

  zoomLevel.value += zoomStep;
  applyZoom();
};

// 缩小视图
const zoomOut = () => {
  if (zoomLevel.value <= minZoom) return;

  zoomLevel.value -= zoomStep;
  applyZoom();
};

// 重置缩放
const resetZoom = () => {
  fitToView();
};

// 应用缩放
const applyZoom = () => {
  if (viewer.value) {
    // @ts-ignore
    viewer.value.get('canvas').zoom(zoomLevel.value);
  }
};

// // 刷新流程
// const refreshProcess = () => {
//   initViewer();
// };

// 高亮活动节点
const highlightActiveNodes = () => {
  if (!viewer.value) return;
  // @ts-ignore
  const canvas = viewer.value.get<Element>('canvas');
  // @ts-ignore
  const elementRegistry = viewer.value.get<Element>('elementRegistry');

  // 清除所有高亮
  Object.values(elementRegistry.getAll()).forEach((element: Element) => {
    canvas.removeMarker(element.id, 'highlight-active');
    canvas.removeMarker(element.id, 'finish-active');
  });

  // 标记已完成节点
  finishTasks?.forEach(taskId => {
    const element = elementRegistry.get(taskId);
    if (element) {
      canvas.addMarker(element.id, 'finish-active');
    }
  });

  // 为活动节点添加高亮
  activeTasks?.forEach(taskId => {
    const element = elementRegistry.get(taskId);
    if (element) {
      canvas.addMarker(element.id, 'highlight-active');
    }
  });

};

// 处理鼠标滚轮缩放
const handleMouseWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }
};

// 处理鼠标按下事件 - 开始拖动
const handleMouseDown = (e: MouseEvent) => {
  // 只有鼠标左键点击才触发拖动
  if (e.button !== 0) return;

  // // 如果点击的是流程元素，不触发拖动（允许选择元素）
  // if (e.target instanceof SVGElement || e.target.closest('.djs-element')) {
  //   return;
  // }

  isDragging.value = true;
  lastPosition.value = { x: e.clientX, y: e.clientY };

  // 更改鼠标样式
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grabbing';
  }
};

// 处理鼠标移动事件 - 执行拖动
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !viewer.value) return;

  const deltaX = e.clientX - lastPosition.value.x;
  const deltaY = e.clientY - lastPosition.value.y;

  // 更新最后位置
  lastPosition.value = { x: e.clientX, y: e.clientY };

  // 获取画布并平移
  // @ts-ignore
  const canvas = viewer.value.get<Element>('canvas');
  const viewbox = canvas.viewbox();

  canvas.viewbox({
    x: viewbox.x - deltaX / zoomLevel.value,
    y: viewbox.y - deltaY / zoomLevel.value,
    width: viewbox.width,
    height: viewbox.height
  });
};

// 处理鼠标释放事件 - 结束拖动
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;

    // 恢复鼠标样式
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'grab';
    }
  }
};

// 监听BPMN内容变化
watch(
  () => modelValue,
  () => {
    initViewer();
  }
);

// 监听用户任务变化，更新高亮
watch(
  () => activeTasks,
  () => {
    highlightActiveNodes();
  },
  { deep: true }
);

// 监听用户任务变化，更新高亮
watch(
  () => finishTasks,
  () => {
    highlightActiveNodes();
  },
  { deep: true }
);


// 组件挂载时初始化
onMounted(async () => {
  await nextTick();
  if (modelValue) {
    initViewer();
  }
});

// 组件卸载时清理
onUnmounted(() => {
  if (viewer.value) {
    // viewer.value.destroy();
    // viewer.value = null;
  }
});
</script>

<style scoped>
.process-view-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.process-canvas {
  width: 100%;
  height: 100%;
  border-width: 1px;
  /* padding: 1rem; */
  /* background-color: #f9f9f9;*/
  /* background-image:
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px; */
  background-color: #fcfcfc;
  background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+) repeat !important;

}

.control-buttons {
  padding: 8px;
  /* background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); */
}

/* 高亮样式 */

/* :deep(.highlight-active .djs-visual) {
  stroke: #a08800 !important;
  stroke-width: 0.5px !important;
} */
@keyframes processing-dash-highlight-active {
  0% {
    stroke-dashoffset: 100%;
  }

  100% {
    stroke-dashoffset: 0;
  }

}


:deep(.highlight-active rect) {
  stroke: #a08800 !important;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 5px, 15px;
  animation: processing-dash-highlight-active 24s linear infinite;
}


:deep(.highlight-active marker path) {
  fill: #a08800 !important;
}

:deep(.highlight-active path) {
  /* fill: #4099ff !important; */
  stroke: #a08800 !important;
}

:deep(.highlight-active circle) {
  stroke: #a08800 !important;
}

/* 
:deep(.finish-active .djs-visual) {
  border: #4099ff !important;
  stroke: #4099ff !important;
  stroke-width: 0.5px !important;
} */

:deep(.finish-active rect) {
  stroke: #4099ff !important;
}


:deep(.finish-active marker path) {
  fill: #4099ff !important;
}

:deep(.finish-active path) {
  /* fill: #4099ff !important; */
  stroke: #4099ff !important;
}

:deep(.finish-active circle) {
  stroke: #4099ff !important;
}


:deep(.bjs-powered-by) {
  display: none;
}
</style>

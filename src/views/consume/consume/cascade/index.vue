<template>

  <!-- 对话框 -->
  <el-dialog :title="cascadeTitle" v-model="cascadeOpen" width="95%" append-to-body class="customDialogCss">

    <el-tabs v-loading="loading" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="上级商品" name="parentGoods">
        <ParentGoodsForm ref="parentGoodsFormRef" />
      </el-tab-pane>
      <el-tab-pane label="下级商品" name="childrenGoods">
        <ChildrenGoodsForm ref="childrenGoodsFormRef" />
      </el-tab-pane>
      <el-tab-pane label="寿命/成本" name="useTimeDetail">
        <UseTimeDetailForm ref="useTimeDetailFormRef" />
      </el-tab-pane>
      <el-tab-pane label="关联图" name="treeStat">
        <TreeStatForm ref="treeStatFormRef" />
      </el-tab-pane>
    </el-tabs>

  </el-dialog>

</template>

<script setup name="ConsumeCascade">
  import { getConsume } from "@/api/consume/consume";
  import ParentGoodsForm from './parentGoods.vue'
  import ChildrenGoodsForm from './childrenGoods.vue'
  import UseTimeDetailForm from './useTimeDetail.vue'
  import TreeStatForm from './treeStat.vue'

  const { proxy } = getCurrentInstance();

  const parentGoodsFormRef = ref();
  const childrenGoodsFormRef = ref();
  const useTimeDetailFormRef = ref();
  const treeStatFormRef = ref();

  //可执行时间段
  const cascadeTitle = ref('消费关联');
  const cascadeOpen = ref(false);

  const activeName = ref('parentGoods');
  const loading = ref(false);

  const data = reactive({
    matchLogInfo: {}
  });
  const { matchLogInfo } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openCascade = async (consumeId) => {
    cascadeOpen.value = true;
    resetForm();
    proxy.$nextTick(()=>{
      parentGoodsFormRef.value.openForm(consumeId);
      childrenGoodsFormRef.value.openForm(consumeId);
      useTimeDetailFormRef.value.openForm(consumeId);
      treeStatFormRef.value.openForm(consumeId);
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openCascade });

  // 表单重置
  function resetForm() {

  }

  function handleClick(tab, event) {
    //console.log(tab, event);
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
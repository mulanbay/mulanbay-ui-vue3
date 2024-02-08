<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="450px" append-to-body>
    <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          style="width: 240px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" icon="refresh" @click="handleRefresh" v-hasPermi="['sport:exercise:refreshMaxStat']">刷新</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="RefreshExerciseMaxStat">
  import { refreshExerciseMaxStat } from "@/api/sport/exercise";
  import { getSportTree } from "@/api/sport/sport";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('刷新最佳统计');
  const open = ref(false);
  const formRef = ref();
  const sportOptions = ref([]);
  const loading = ref(false);

  const data = reactive({
    queryParams: {},
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (sportId) => {
    open.value = true;
    loadSportTree();
    if (sportId != null) {
      queryParams.value.sportId = sportId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 加载树 */
  function loadSportTree() {
    getSportTree(false).then(response => {
      sportOptions.value = response;
    });
  }

  /** 查询详情 */
  function handleRefresh() {
    if(queryParams.value.sportId==null){
      proxy.$modal.msgError("请选择运动类型");
      return;
    }
    let para = {
      sportId: queryParams.value.sportId
    }
    proxy.$modal.loading("数据处理中，请稍候！");
    refreshExerciseMaxStat(para).then(response => {
      proxy.$modal.msgSuccess("刷新成功");
      proxy.$modal.closeLoading();
      open.value = false;
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
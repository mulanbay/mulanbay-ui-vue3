<template>

  <!-- 详情对话框 -->
  <el-dialog :title="infoTitle" v-model="infoOpen" width="680px" append-to-body>

    <el-divider content-position="center">处理器信息</el-divider>
    <el-descriptions class="margin-top" :column="1" border v-loading="infoLoading">
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            处理器名称
          </div>
        </template>
        {{ handlerName}}
      </el-descriptions-item>
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <ChatLineRound />
            </el-icon>
            类名
          </div>
        </template>
        {{ className}}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">详情列表</el-divider>
    <el-table :data="detailList" v-loading="infoLoading">
      <el-table-column label="键" prop="key" align="center">
        <template #default="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" prop="value" align="center">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
    </el-table>

  </el-dialog>

</template>

<script setup name="HandlerInfo">
  import { getHandlerInfo } from "@/api/system/handler";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const infoTitle = ref('处理器详情');
  const infoOpen = ref(false);
  const infoLoading = ref(false);

  const detailList = ref([]);
  const className = ref();
  const handlerName = ref();

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openInfo = async (cs) => {
    infoOpen.value = true;
    className.value = cs;
    loadData();
  }


  // 提供 open 方法，用于打开弹窗
  defineExpose({ openInfo });

  /** 加载数据 */
  function loadData() {
    resetForm();
    infoLoading.value = true;
    getHandlerInfo(className.value).then(response => {
      infoLoading.value = false;
      handlerName.value = response.handlerName;
      detailList.value = response.details;
    });
  }

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 表单重置
  function resetForm() {
    handlerName.value = '';
    detailList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
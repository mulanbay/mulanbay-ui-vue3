<template>

  <!-- 详情对话框 -->
  <el-dialog :title="methodTitle" v-model="methodOpen" width="680px" append-to-body>

    <el-divider content-position="center">处理器信息</el-divider>
    <el-descriptions class="margin-top" :column="1" border v-loading="methodLoading">
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
    <el-table :data="methodList" v-loading="methodLoading">
      <el-table-column label="名称" prop="key" align="center">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="方法" prop="value" align="center">
        <template #default="scope">
          <span>{{ scope.row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="value" align="center">
        <template #default="scope">
          <span class="link-type" @click="sendCmd(scope.row)">
            <el-icon>
              <Tools />
            </el-icon>
          </span>
        </template>
      </el-table-column>
    </el-table>

  </el-dialog>

</template>

<script setup name="Handlermethod">
  import { getMethodList, invokeHandlerMethod } from "@/api/system/handler";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const methodTitle = ref('命令处理');
  const methodOpen = ref(false);
  const methodLoading = ref(false);

  const methodList = ref([]);
  const className = ref();
  const handlerName = ref();

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openMethod = async (cs) => {
    methodOpen.value = true;
    className.value = cs;
    loadData();
  }


  // 提供 open 方法，用于打开弹窗
  defineExpose({ openMethod });

  /** 加载数据 */
  function loadData() {
    resetForm();
    methodLoading.value = true;
    getMethodList(className.value).then(response => {
      methodLoading.value = false;
      methodList.value = response;
    });
  }

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 表单重置
  function resetForm() {
    handlerName.value = '';
    methodList.value = [];
  }

  /** 发送命令 */
  function sendCmd(row) {
    proxy.$confirm('是否确认要操作["' + row.name + '"]?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      let data = {
        className: className.value,
        method: row.method
      }
      return invokeHandlerMethod(data);
    }).then(() => {
      proxy.$modal.msgSuccess("操作成功");
    }).catch(function() {});
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
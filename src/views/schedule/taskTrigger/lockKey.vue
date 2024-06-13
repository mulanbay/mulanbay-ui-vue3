<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="lockKeyTitle" v-model="lockKeyOpen" width="600px" append-to-body >

    <el-divider content-position="center">新任务锁列表</el-divider>
    <el-table :data="newKeysList" v-loading="lockKeyLoading">
      <el-table-column label="KEY" prop="key" align="center">
        <template #default="scope">
          <span>{{ scope.row }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="value" align="center" width="80">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['schedule:taskTrigger:deleteLockKey']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-divider content-position="center">重做任务锁列表</el-divider>
    <el-table :data="redoKeysList" v-loading="lockKeyLoading">
      <el-table-column label="KEY" prop="key" align="center" >
        <template #default="scope">
          <span>{{ scope.row }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="value" align="center" width="80">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['schedule:taskTrigger:deleteLockKey']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="refresh" @click="loadData" v-hasPermi="['schedule:taskTrigger:lockKey']">刷新</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="TaskTriggerLockKey">
  import { getLockKeys,deleteLockKey } from "@/api/schedule/taskTrigger";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const lockKeyTitle = ref('锁详情');
  const lockKeyOpen = ref(false);
  const lockKeyLoading = ref(false);

  const newKeysList = ref([]);
  const redoKeysList = ref([]);
  const formTriggerId = ref();

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (triggerId) => {
    lockKeyOpen.value = true;
    formTriggerId.value = triggerId;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    lockKeyLoading.value = true;
    getLockKeys(formTriggerId.value).then(response => {
      lockKeyLoading.value = false;
      lockKeyTitle.value = '['+response.taskTrigger.triggerName+']锁详情';
      if(!proxy.isEmpty(response.newKeys)){
        newKeysList.value = response.newKeys;
      }
      if(!proxy.isEmpty(response.redoKeys)){
        redoKeysList.value = response.redoKeys;
      }
    });
  }

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    newKeysList.value = [];
    redoKeysList.value = [];
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    proxy.$confirm('是否确认删除"' + row + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      let data={
        key: row
      }
      return deleteLockKey(data);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      loadData();
    }).catch(function() {});
  }
  
  /** 初始化 **/
  onMounted(() => {

  })
</script>
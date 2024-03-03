<template>
  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="500px" append-to-body >
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="手动锁定" name="manualLock">
        <ManualLockForm @success="closeForm" />
      </el-tab-pane>
      <el-tab-pane label="自动锁定" name="autoLock">
        <AutoLockForm ref="autoLockFormRef" @success="closeForm" />
      </el-tab-pane>
    </el-tabs>

  </el-dialog>

</template>

<script setup name="SystemLock">
  import ManualLockForm from './manualLock.vue'
  import AutoLockForm from './autoLock.vue'
  
  const { proxy } = getCurrentInstance();
  const autoLockFormRef = ref();

  const title = ref('系统锁定');
  const open = ref(false);

  const activeName = ref('manualLock');
  
  /** 打开弹窗 */
  const openForm = async () => {
    open.value = true;
    proxy.$nextTick(()=>{
      autoLockFormRef.value.refreshData();
    });
  }
  
  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  // 关闭
  function closeForm() {
    open.value= false;
  }

  function handleClick(tab, event) {
    //console.log(tab, event);
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
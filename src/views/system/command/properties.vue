<template>

  <!-- 详情对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body class="customDialogCss">
    <!--列表数据-->
    <el-table
      v-loading="loading" 
      :data="dataList"
      row-key="key">
      <el-table-column label="配置项" prop="key" min-width="140" :show-overflow-tooltip="true" sortable="custom" >
        <template #default="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置值" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.source }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    
  </el-dialog>

</template>

<script setup name="SystemProperties">
  import { getProperties } from "@/api/system/system";

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //可执行时间段
  const title = ref('系统配置项');
  const open = ref(false);
  const loading = ref(false);
  const dataList = ref([]);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    open.value = true;
    dataList.value = [];
    loading.value = true;
    getProperties().then(response => {
      loading.value = false;
      dataList.value = response;
      
    });
  }
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<template>

  <!-- 详情对话框 -->
  <el-dialog :title="cacheInfoTitle" v-model="cacheInfoOpen" width="680px" append-to-body class="customDialogCss">
    
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['system:cache:myList']">刷新数据</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="delete" @click="handleClear" v-hasPermi="['system:cache:clearMe']">清空所有</el-button>
      </el-col>
      <el-col :span="1.5">
      <el-button type="danger" icon="CircleClose" @click="cacheInfoOpen=false">关闭窗口</el-button>
      </el-col>
    </el-row>
    
    <el-divider content-position="center">我的缓存列表</el-divider>
    <el-table :data="cacheList" v-loading="cacheInfoLoading">
      <el-table-column label="KEY" prop="key" align="center" >
        <template #default="scope">
          <span>{{ scope.row.cacheKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" prop="key" align="center" width="160">
        <template #default="scope">
          <span>{{ formatValue(scope.row.cacheValue) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" prop="key" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.expire<0" style="color: red;">{{ formatExpire(scope.row.expire) }}</span>
          <span v-else>{{ formatExpire(scope.row.expire) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="op" align="center" width="80">
        <template #default="scope">
          <el-button
            link
            type="danger" 
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:cache:deleteCacheKey']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

  </el-dialog>

</template>

<script setup name="MyCacheList">
  import { deleteCacheKey,getMyCacheList,clearMe } from "@/api/system/cache";
  import { formatSeconds } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const cacheInfoTitle = ref('我的缓存详情');
  const cacheInfoOpen = ref(false);
  const cacheInfoLoading = ref(false);

  const cacheList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    cacheInfoOpen.value = true;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    cacheInfoLoading.value = true;
    getMyCacheList().then(response => {
      cacheInfoLoading.value = false;
      cacheList.value = response;
    });
  }
  
  /** 值格式化 */
  function formatValue(v){
    if(proxy.isEmpty(v)){
      return '';
    }else if(v instanceof Object){
      return 'Object';
    }else{
      return v;
    }
  }
  
  /** 超时时间格式化 */
  function formatExpire(v){
    if(proxy.isEmpty(v)){
      return '';
    }else if(v<0){
      return v+'(永久)';
    }else{
      if(v<1000){
        return v+'毫秒';
      }else{
        return formatSeconds(v/1000);
      }
    }
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const key = row.cacheKey;
    proxy.$confirm('是否确认删除"' + key + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteCacheKey(key);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      refresh();
    }).catch(function() {});
  }
  
/** 清除所有按钮操作 */
  function handleClear() {
    proxy.$confirm('是否确认要清除我的所有缓存?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return clearMe();
    }).then(() => {
      proxy.$modal.msgSuccess("清除成功");
      refresh();
    }).catch(function() {});
  }
  
  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    cacheList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
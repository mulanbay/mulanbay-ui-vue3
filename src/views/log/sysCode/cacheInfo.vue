<template>

  <!-- 详情对话框 -->
  <el-dialog :title="cacheInfoTitle" v-model="cacheInfoOpen" width="580px" append-to-body >
    <el-divider content-position="center"> 代码{{ code}}缓存中信息</el-divider>
    <el-descriptions class="margin-top" :column="1" border v-loading="cacheInfoLoading">
      <el-descriptions-item width="180px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            缓冲区计数
          </div>
        </template>
        {{ cacheData.batchCounts}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <HomeFilled />
            </el-icon>
            限流计数
          </div>
        </template>
        {{ cacheData.limitCounts}}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">用户消息限流列表</el-divider>
    <el-table :data="userLimitList" v-loading="cacheInfoLoading">
      <el-table-column label="KEY" prop="key" align="center" >
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" prop="value" align="center" >
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="op" align="center" width="80">
        <template #default="scope">
          <el-button
            link
            type="danger" 
            icon="delete"
            @click="handleDeleteLimit(scope.row)"
            v-hasPermi="['system:cache:deleteCacheKey']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['log:sysCode:cacheInfo']">刷新</el-button>
      <el-button type="danger" icon="CircleClose" @click="cacheInfoOpen=false">关闭</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="SysLogCacheInfo">
  import { cacheInfo } from "@/api/log/sysCode";
  import { deleteCacheKey } from "@/api/system/cache";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const cacheInfoTitle = ref('缓存中详情');
  const cacheInfoOpen = ref(false);
  const cacheInfoLoading = ref(false);

  const cacheData = ref();
  const code = ref();
  const userLimitList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (c) => {
    cacheInfoOpen.value = true;
    code.value = c;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    cacheInfoLoading.value = true;
    cacheInfo(code.value).then(response => {
      cacheInfoLoading.value = false;
      cacheData.value = response;
      userLimitList.value = response.userLimitList;
    });
  }
  
  /** 删除按钮操作 */
  function handleDeleteLimit(row) {
    const key = row.name;
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
  

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    cacheData.value = {};
    userLimitList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
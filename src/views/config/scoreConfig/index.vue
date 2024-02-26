<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="850px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 120px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:scoreConfig:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['config:scoreConfig:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="scoreConfigList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="configId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.configId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.configName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="极限值" align="center" >
        <template #default="scope">
          <span>{{ scope.row.limitValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="比较类型" align="center" >
        <template #default="scope">
          <span>{{ scope.row.compareTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单项满分" align="center" >
        <template #default="scope">
          <span>{{ scope.row.maxScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.status=='ENABLE'">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['config:scoreConfig:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
      
  </el-dialog>

  <!-- 表单 -->
  <ScoreConfigForm ref="formRef" @success="getList" />

</template>

<script setup name="ScoreConfig">
  import { fetchList,deleteScoreConfig } from "@/api/config/scoreConfig";
  import ScoreConfigForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('评分组配置');
  const open = ref(false);
  const formRef = ref();
  
  const scoreConfigList = ref([]);
  // 遮罩层
  const loading = ref(true);
  // 选中数组
  const ids = ref([]);
  // 非单个禁用
  const single = ref(true);
  // 非多个禁用
  const multiple = ref(true);
  // 总条数
  const total = ref(0);

  const data = reactive({
    queryParams: {
      page:1,
      pageSize:10
    },
    rules: {
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (groupId) => {
    open.value = true;
    resetForm();
    queryParams.value.groupId=groupId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    proxy.resetForm("queryRef");
  }
  
  /** 新增按钮操作 */
  function handleCreate() {
    if(queryParams.value.groupId==null){
      proxy.$modal.msgError("没有组号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.groupId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.configId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        scoreConfigList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.configId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteScoreConfig(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.configId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  

  /** 初始化 **/
  onMounted(() => {

  })
</script>
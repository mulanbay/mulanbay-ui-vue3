<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="父级" prop="fid">
        <el-input
          v-model="queryParams.fid"
          disabled
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" disabled style="width: 120px" placeholder="类型">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="refresh" @click="handleQuery" v-hasPermi="['report:statBindConfig:list']">刷新</el-button>
        <el-button type="success" icon="plus" @click="handleCreate" v-hasPermi="['report:statBindConfig:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="detailList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="configId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.configId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.configName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="80" >
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" align="center" width="80" >
        <template #default="scope">
          <span>{{ scope.row.sourceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级联类型" align="center" >
        <template #default="scope">
          <span>{{ scope.row.casCadeTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定用户" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.bindUser==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="树形数据" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.tree==true">
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
            v-hasPermi="['report:statBindConfig:delete']">删除
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
  <StatBindConfigForm ref="formRef" @success="getList" />

</template>

<script setup name="StatBindConfig">
  import { fetchList,deleteStatBindConfig } from "@/api/report/bind/statBindConfig";
  import StatBindConfigForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('绑定值条件');
  const open = ref(false);
  const formRef = ref();
  
  const detailList = ref([]);
  const typeOptions = ref([]);

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
  const showData = async (fid,type) => {
    open.value = true;
    resetForm();
    queryParams.value.fid=fid;
    queryParams.value.type=type;
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
    if(queryParams.value.fid==null||queryParams.value.type==null){
      proxy.$modal.msgError("无外键信息绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.fid,queryParams.value.type);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.configId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null,null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        detailList.value = response.rows;
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
      return deleteStatBindConfig(deleteIds);
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
    proxy.getEnumDict('StatBussType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
  })
</script>
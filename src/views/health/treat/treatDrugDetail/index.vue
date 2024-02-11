<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="700px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="用药日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['health:treat:treatDrugDetail:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="detailList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="detailId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.detailId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时辰" align="center" >
        <template #default="scope">
          <span>{{ getHourDesc(scope.row.occurTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药量" align="center">
        <template #default="scope">
          <span v-if="scope.row.ec==null">
          </span>
          <span v-else-if="scope.row.ec!=scope.row.drug.ec" style="color: red;">
           {{ row.ec+row.eu}}
          </span>
          <span v-else style="color: green;">
           {{ scope.row.ec+scope.row.eu}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['health:treat:treatDrugDetail:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatDrugDetail:delete']">删除
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
  <TreatDrugDetailForm ref="formRef" @success="getList" />

</template>

<script setup name="TreatDrugDetail">
  import { fetchList,deleteTreatDrugDetail } from "@/api/health/treat/treatDrugDetail";
  import { formatDays,getHourDesc } from "@/utils/datetime";
  import TreatDrugDetailForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用药明细');
  const open = ref(false);
  const formRef = ref();
  
  const detailList = ref([]);
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

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const data = reactive({
    queryParams: {
      page:1,
      pageSize:10
    },
    rules: {
      drugId: [
        { required: false, message: "运动类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (drugId) => {
    open.value = true;
    resetForm();
    queryParams.value.drugId=drugId;
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
    if(queryParams.value.drugId==null){
      proxy.$modal.msgError("没有看病记录编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.drugId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.detailId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        detailList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.detailId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTreatDrugDetail(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.detailId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  

  /** 初始化 **/
  onMounted(() => {

  })
</script>
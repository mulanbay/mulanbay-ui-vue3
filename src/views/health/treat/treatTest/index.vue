<template>
  <div class="app-container">
    <!-- 刷新对话框 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="检验日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.tags !=null" label="疾病标签" prop="tags">
        <el-input v-model="queryParams.tags" style="width: 240px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="分析结果" prop="result">
        <el-select
          v-model="queryParams.result"
          filterable
          clearable
          default-first-option
          style="width: 240px">
          <el-option
            v-for="dict in resultOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treatTest:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" v-if="queryParams.operationId!=null" @click="handleCreate" v-hasPermi="['health:treat:treatTest:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="testList" @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="testId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.testId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检测项" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="只看该检查项" placement="top">
            <span class="link-type" @click="handleFiterName(scope.row)">
              <el-icon color="red"><Filter /></el-icon>
            </span>
          </el-tooltip>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.name }}</span>&nbsp;
        </template>
      </el-table-column>
      <el-table-column label="手术/检查项目" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.operation.operationName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="检查结果" min-width="140px" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分析结果" align="center">
        <template #default="scope">
          <span v-if="scope.row.result == 'LOWER'">
            <span style="color:purple">{{ scope.row.resultName }}</span>
          </span>
          <span v-else-if="scope.row.result == 'NORMAL'">
            <span style="color:green">{{ scope.row.resultName }}</span>
          </span>
          <span v-else-if="scope.row.result == 'HIGHER'">
            <span style="color:red">{{ scope.row.resultName }}</span>
          </span>
          <span v-else-if="scope.row.result == 'DISEASE'">
            <span style="color:red">{{ scope.row.resultName }}</span>
          </span>
          <span v-else>
            <span>--</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="参考范围" align="center" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatScope(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="100" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleStat(scope.row)"><el-icon>
              <Histogram />
            </el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="医院" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.operation.treat.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采样时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.testTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类/试验方法" align="center" width="140">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.operation.treat.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官" align="center">
        <template #default="scope">
          <span>{{ scope.row.operation.treat.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['health:treat:treatTest:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treatTest:delete']">删除
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

    <!-- 表单 -->
    <TreatTestForm ref="formRef" @success="getList" />
    
    <!-- 统计 -->
    <TreatTestStat ref="statRef" />
    
  </div>
</template>

<script setup name="TreatTest">
  import { fetchList, deleteTreatTest } from "@/api/health/treat/treatTest";
  import { formatDays, getHourDesc } from "@/utils/datetime";
  import TreatTestForm from './form.vue'
  import TreatTestStat from './stat.vue'

  const { proxy } = getCurrentInstance();

  const formRef = ref();
  const statRef = ref();

  const testList = ref([]);
  // 遮罩层
  const loading = ref(false);
  // 选中数组
  const ids = ref([]);
  // 非单个禁用
  const single = ref(true);
  // 非多个禁用
  const multiple = ref(true);
  // 总条数
  const total = ref(0);
  const resultOptions = ref([]);
  //从父级页面过来
  const fp = ref(false);
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (operationId) => {
    resetForm();
    queryParams.value.operationId = operationId;
    fp.value = true;
    handleQuery();
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

  /** 过滤名称操作 */
  function handleFiterName(row) {
    queryParams.value.name = row.name;
    handleQuery();
  }

  /** 检查范围 */
  function formatScope(row) {
    if (row.minValue != null) {
      return row.minValue + '~' + row.maxValue + (row.unit == null ? '' : row.unit);
    } else if (row.referScope != null) {
      return row.referScope;
    } else {
      return '--';
    }
  }

  /** 检验项目操作 */
  function handleStat(row) {
    statRef.value.showData(row.name);
  }

  /** 新增按钮操作 */
  function handleCreate() {
    if (queryParams.value.operationId == null) {
      proxy.$modal.msgError("没有看病记录编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create', queryParams.value.operationId);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.testId || ids.value.join(",");
    formRef.value.openForm(id, 'edit', null);
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        testList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.testId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTreatTest(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.testId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }


  /** 初始化 **/
  onMounted(() => {
    proxy.$nextTick(()=>{
      if (fp.value == false) {
        getList();
      }
    });
    proxy.getEnumDict('TreatTestResult', 'FIELD', false).then(response => {
      resultOptions.value = response;
    });
  })
</script>
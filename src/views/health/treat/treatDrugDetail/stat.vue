<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body class="customDialogCss">
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item label="名称检索" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
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
        <el-form-item label="合并药名" prop="mergeSameName">
          <el-switch v-model="queryParams.mergeSameName" @change="handleQuery"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:stat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--列表数据-->
      <el-table v-loading="loading" :data="dataList">
        <el-table-column label="ID" prop="id" v-if="false==queryParams.mergeSameName" sortable="custom" align="center" width="80">
          <template #default="scope">
            <span>{{ scope.row.drugId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="药品名" min-width="180px" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.drugName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="看病时间" v-if="false==queryParams.mergeSameName" align="center" width="120px">
          <template #default="scope">
            <span>{{ scope.row.treatDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总次数" align="center">
          <template #default="scope">
            <span>{{ scope.row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用药天数" align="center">
          <template #default="scope">
            <span>{{ scope.row.days }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用药周数" align="center">
          <template #default="scope">
            <span>{{ formatStar(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="第一次用药时间" align="center" width="170px">
          <template #default="scope">
            <span>{{ scope.row.minTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后一次用药时间" align="center" width="170px">
          <template #default="scope">
            <span>{{ scope.row.maxTime }}</span>
          </template>
        </el-table-column>
      </el-table>

    </div>
  </el-dialog>

</template>

<script setup name="TreatDrugDetailStat">
  import { getTreatDrugDetailStat } from "@/api/health/treat/treatDrugDetail";
  import { formatDays, dateDiff } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  const title = ref('手术统计');
  const open = ref(false);
  const formRef = ref();
  const loading = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const dataList = ref([]);

  const data = reactive({
    queryParams: {
      page: 0,
      name: undefined,
      mergeSameName: true
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (startDate,endDate) => {
    open.value = true;
    title.value = '用药统计';
    if(startDate!=null&&endDate!=null){
      dateRange.value = [startDate,endDate];
    }
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 用药周数 */
  function formatStar(row) {
    let weeks = Math.round(row.days / 7);
    return weeks;
  }

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

  /** 列表 */
  function getList() {
    loading.value = true;
    getTreatDrugDetailStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        dataList.value = response;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {})
</script>
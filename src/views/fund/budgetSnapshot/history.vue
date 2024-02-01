<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="选择预算" prop="budgetId">
        <el-tree-select
          v-model="queryParams.budgetId"
          style="width: 240px"
          clearable
          :data="budgetOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择预算"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="流水日期" style="width: 308px">
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
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:budgetSnapshot:history']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

    <el-divider content-position="center">
      <span class="table-title">
        <svg-icon icon-class="budget" />
        明细
      </span>
    </el-divider>

    <!-- 列表 -->
    <SnapshotList ref="snapshotListRef" />

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script setup name="BudgetSnapshotHistory">
  import { getBudgetStat, fetchList } from "@/api/fund/budgetSnapshot";
  import { getBudgetTree } from "@/api/fund/budget";
  import { deepClone, getQueryObject } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createMixLineBarChartOption } from "@/utils/mulanbay_echarts";
  import SnapshotList from './list.vue'

  const { proxy } = getCurrentInstance();
  const snapshotListRef = ref();
  // 总条数
  const total = ref(0);
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  const height = ref('400px');

  const budgetOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      budgetId: undefined,
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    getBudgetTree(false, true).then(
      response => {
        budgetOptions.value = response;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.page = 1;
    initChart();
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 列表 */
  function getList() {
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        snapshotListRef.value.showData(response.rows);
        total.value = response.total;
      }
    );
  }

  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    const paraData = {
      budgetId: queryParams.value.budgetId
    };
    getBudgetStat(proxy.addDateRange(paraData, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        response.smooth = true;
        response.serieTypes = ['line', 'bar'];
        response.s2Size = 2;
        let option = createMixLineBarChartOption(response);;
        createChart(option, statChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    let qb = getQueryObject(null);
    if (qb.budgetId != null) {
      //parseInt解决默认无法选中问题
      queryParams.value.budgetId = parseInt(qb.budgetId);
      initChart();
      getList();
    }
    loadOptions();
  })
</script>
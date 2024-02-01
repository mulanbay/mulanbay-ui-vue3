<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="预算周期" prop="statPeriod">
        <el-select
          v-model="queryParams.statPeriod"
          placeholder="预算周期"
          clearable
          style="width: 160px">
          <el-option
            v-for="dict in statPeriodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
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
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:budgetLog:biasStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BudgetLogBiasStat">
  import { getBudgetLogBiasStat } from "@/api/fund/budgetLog";
  import * as echarts from 'echarts';
  import { createChart, createMixLineBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const statPeriodOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      statPeriod:undefined
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('BUDGET_STAT_PERIOD', false).then(response => {
      statPeriodOptions.value = response;
    });
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    initChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    initChart();
  }

  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getBudgetLogBiasStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        response.serieTypes = ['line', 'line'];
        response.smooth = true;
        let option = createMixLineBarChartOption(response);;
        createChart(option, statChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
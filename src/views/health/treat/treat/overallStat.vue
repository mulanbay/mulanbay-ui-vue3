<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="看病日期" style="width: 308px">
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
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分类" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分类"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段类型"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.feeField"
          v-if="queryParams.groupType=='TOTAL_PRICE'"
          placeholder="统计字段"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="dict in feeFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treat:overallStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="overallStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="TreatOverallStat">
  import { getTreatOverallStat, getTreatCateTree } from "@/api/health/treat/treat";
  import * as echarts from 'echarts';
  import { createChart, createHeatMapChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const overallStatChart = ref(null);
  //echarts实例
  let overallStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateGroupTypeOptions = ref([]);
  const groupFieldOptions = ref([]);
  const groupTypeOptions = ref([]);
  const feeFieldOptions = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      dateGroupType:'MONTH',
      groupField:'confirm_disease',
      groupType:'COUNT',
      feeField:'total_fee'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('CHART_OVERALL_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
    proxy.getDictItemTree('TREAT_ANALYSE_GROUP_FIELD', false).then(response => {
      groupFieldOptions.value = response;
    });
    proxy.getDictItemTree('TREAT_DATE_STAT_FIELD', false).then(response => {
      feeFieldOptions.value = response;
    });
    proxy.getDictItemTree('TREAT_ANALYSE_GROUP_TYPE', false).then(response => {
      groupTypeOptions.value = response;
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
    getTreatOverallStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createHeatMapChartOption(response, echarts);
        createChart(option, overallStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    overallStatChartIns = echarts.init(overallStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="睡眠日期" style="width: 308px">
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
      <el-form-item label="X轴数据" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="X轴数据"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Y轴数据" prop="valueType">
        <el-select
          v-model="queryParams.valueType"
          placeholder="Y轴数据"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in valueTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Y图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          style="width: 120px"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:body:sleep:analyseStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="SleepAnalyseStat">
  import { getSleepAnalyseStat } from "@/api/health/body/sleep";
  import * as echarts from 'echarts';
  import { createChart, createScatterChartOption, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const groupTypeOptions = ref([]);
  const valueTypeOptions = ref([]);
  const chartTypeOptions = ref([
    {
      id: 'SCATTER',
      text: '散点图'
    },
    {
      id: 'PIE',
      text: '饼图'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      groupType:'DAY',
      valueType:'DURATION',
      chartType: 'SCATTER'
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 下拉框加载 */
  proxy.getDictItemTree('SLEEP_STAT_GROUP_FIELD', false).then(response => {
    groupTypeOptions.value = response;
  });
  function loadOptions() {
    proxy.getEnumDict('SleepStatType', 'FIELD', false).then(response => {
      valueTypeOptions.value = response;
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
    getSleepAnalyseStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const chartType = queryParams.value.chartType;
        if(chartType=='PIE'){
          option = createPieChartOption(response);
        }else{
          option = createScatterChartOption(response);
        }
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
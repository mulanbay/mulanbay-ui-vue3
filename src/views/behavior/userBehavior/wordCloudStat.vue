<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="起止日期" style="width: 308px">
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
      <el-form-item label="业务类型" prop="bussType">
        <el-select v-model="queryParams.bussType" clearable style="width: 230px" placeholder="请选择">
          <el-option
            v-for="dict in bussTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="忽略短语" prop="ignoreShort">
        <el-switch v-model="queryParams.ignoreShort" @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experience:wordCloudStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="wordCloudStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="UserBehaviorWordCloudStat">
  import { getUserBehaviorWordCloudStat } from "@/api/behavior/userBehavior";
  import * as echarts from 'echarts';
  import { createChart, createWorldCloudChartOption } from "@/utils/mulanbay_echarts";
  import 'echarts-wordcloud';

  const { proxy } = getCurrentInstance();
  //图形实例
  const wordCloudStatChart = ref(null);
  //echarts实例
  let wordCloudStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const bussTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      ignoreShort: true
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
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
    getUserBehaviorWordCloudStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createWorldCloudChartOption(response);
        createChart(option, wordCloudStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    wordCloudStatChartIns = echarts.init(wordCloudStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
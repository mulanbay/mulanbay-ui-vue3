<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="阅读日期" style="width: 308px">
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
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分组" prop="valueType">
        <el-select
          v-model="queryParams.valueType"
          placeholder="统计分组"
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
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['read:book:overallStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="overallStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BookOverallStat">
  import { getBookOverallStat } from "@/api/read/book";
  import * as echarts from 'echarts';
  import { createChart, createHeatMapChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const overallStatChart = ref(null);
  //echarts实例
  let overallStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateGroupTypeOptions = ref([]);
  const valueTypeOptions = ref([
    {
      id: 'COUNT',
      text: '本数'
    },
    {
      id: 'DURATION',
      text: '阅读时间'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      dateGroupType:'MONTH',
      valueType: 'COUNT'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('CHART_OVERALL_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
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
    getBookOverallStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createHeatMapChartOption(response,echarts);
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
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="练习日期" style="width: 308px">
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
      <el-form-item label="选择乐器" prop="instrumentId">
        <el-tree-select
          v-model="queryParams.instrumentId"
          style="width: 240px"
          clearable
          :data="instrumentOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择乐器"
          :check-strictly="false" />
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
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序方式" prop="chartOrderType">
        <el-select
          v-model="queryParams.chartOrderType"
          placeholder="排序方式"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in chartOrderTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPractice:timeStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="timeStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="MusicPracticeTimeStat">
  import { getMusicPracticeTimeStat } from "@/api/music/musicPractice";
  import { getInstrumentTree } from "@/api/music/instrument";
  import { getTuneTree } from "@/api/music/musicPracticeDetail";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const timeStatChart = ref(null);
  //echarts实例
  let timeStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const instrumentOptions = ref([]);
  const chartTypeOptions = ref([
    {
      id: 'PIE',
      text: '饼图'
    },
    {
      id: 'BAR',
      text: '柱状图'
    }
  ]);
  const dateGroupTypeOptions = ref([]);
  const chartOrderTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      chartType: 'PIE',
      dateGroupType: 'HOUR',
      chartOrderType: 'Y'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    getInstrumentTree().then(
      response => {
        instrumentOptions.value = response;
      }
    );
    proxy.getDictItemTree('CHART_TIME_STAT_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
    proxy.getDictItemTree('CHART_TIME_STAT_ORDER_TYPE', false).then(response => {
      chartOrderTypeOptions.value = response;
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
    getMusicPracticeTimeStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        if (queryParams.value.chartType == 'PIE') {
          option = createPieChartOption(response);
        } else {
          option = createBarChartOption(response);
        }
        createChart(option, timeStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    timeStatChartIns = echarts.init(timeStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
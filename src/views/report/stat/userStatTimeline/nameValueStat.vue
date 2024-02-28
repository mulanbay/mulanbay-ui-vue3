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
      <el-form-item label="选择统计项" prop="statId">
        <el-tree-select
          v-model="queryParams.statId"
          style="width: 240px"
          :data="userStatOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择模版"
          :check-strictly="false"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:stat:userStatTimeline:nameValueStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="dateStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="UserStatTimelinNameValueStat">
  import { getUserStatTimelineNameValueStat } from "@/api/report/stat/userStatTimeline";
  import { getUserStatTree } from "@/api/report/stat/userStat";
  import * as echarts from 'echarts';
  import { createChart,createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const userStatOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {

    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    getUserStatTree().then(
      response => {
        userStatOptions.value = response;
      }
    );
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
    getUserStatTimelineNameValueStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createPieChartOption(response);
        createChart(option, dateStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    dateStatChartIns = echarts.init(dateStatChart.value, "macarons");
    loadOptions();
  })
</script>
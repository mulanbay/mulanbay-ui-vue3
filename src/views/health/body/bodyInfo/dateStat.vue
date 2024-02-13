<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="采集日期" style="width: 308px">
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
          style="width: 240px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder=""
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="补全日期" prop="completeDate">
        <el-switch v-model="queryParams.completeDate" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:body:bodyInfo:dateStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="dateStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BodyInfoDateStat">
  import { getBodyInfoDateStat } from "@/api/health/body/bodyInfo";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createLineChartOption, createCalanderChartOption, createScatterChartOption, createMixLineBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateGroupTypeOptions = ref([]);
  const chartTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      dateGroupType:'DAY',
      completeDate:true,
      chartType:'MIX_LINE_BAR'
    }
  });

  const { queryParams } = toRefs(data);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  /** 更多查询条件处理 */
  function handleMoreCdn() {
    if (moreCdn.value == true) {
      moreCdn.value = false;
      cdnTitle.value = '更多';
    } else {
      moreCdn.value = true;
      cdnTitle.value = '取消';
    }
  }
  
  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('BODY_INFO_CHART_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
    proxy.getDictItemTree('DATE_STAT_CHART_TYPE', false).then(response => {
      chartTypeOptions.value = response;
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
    getBodyInfoDateStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const dateGroupType = queryParams.value.dateGroupType;
        switch (dateGroupType) {
          case 'DAYCALENDAR':
            //日历图
            option = createCalanderChartOption(response);
            break;
          case 'HOURMINUTE':
            //散点图
            option = createScatterChartOption(response);
            break;
          default:
            option = createMixLineBarChartOption(response);
        }
        createChart(option, dateStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    dateStatChartIns = echarts.init(dateStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
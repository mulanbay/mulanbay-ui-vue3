<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="起止日期">
        <el-select
          v-model="queryParams.dateQueryType"
          placeholder="日期类型"
          collapse-tags
          style="width: 140px"
        >
          <el-option
            v-for="dict in dateQueryTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item label="分组类型" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="分组类型"
          collapse-tags
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
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          collapse-tags
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
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['dream:dream:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="DreamStat">
  import { getDreamStat } from "@/api/dream/dream";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption, createBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateQueryTypeOptions = ref([]);
  const groupTypeOptions = ref([
    {
      id: 'STATUS',
      text: '状态'
    },
    {
      id: 'DIFFICULTY',
      text: '困难程度'
    },
    {
      id: 'IMPORTANT',
      text: '重要程度'
    }
  ]);
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

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      groupType:'STATUS',
      dateQueryType:'expect_date',
      chartType:'PIE'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('DREAM_DATE_STAT_TYPE', false).then(response => {
      dateQueryTypeOptions.value = response;
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
    getDreamStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let chartType = queryParams.value.chartType;
        let option = null;
        if(chartType=='PIE'){
          option = createPieChartOption(response);
        }else{
          option = createBarChartOption(response);
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
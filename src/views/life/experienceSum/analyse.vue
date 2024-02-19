<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="选择年份">
        <el-date-picker
          v-model="queryParams.startYear"
          type="year"
          format="YYYY"
          value-format="YYYY"
          placeholder="开始年份">
        </el-date-picker>
        <el-date-picker
          v-model="queryParams.endYear"
          type="year"
          format="YYYY"
          value-format="YYYY"
          placeholder="结束年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experienceSum:analyse']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    
    <el-row :gutter="32">
      <el-col :span="24" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="shadowChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="pieChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!--图表数据-->
    

  </div>
</template>

<script setup name="ExperienceSumAnalyse">
  import { analyseExperienceSum } from "@/api/life/experienceSum";
  import * as echarts from 'echarts';
  import { createChart, createShadowChartOption,createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const shadowChart = ref(null);
  //echarts实例
  let shadowChartIns = ref(null);
  //图形实例
  const pieChart = ref(null);
  //echarts实例
  let pieChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const data = reactive({
    queryParams: {

    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {

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
    analyseExperienceSum(queryParams.value).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let shadowOption = createShadowChartOption(response.chartShadowData);
        let pieOption = createPieChartOption(response.chartPieData);
        createChart(shadowOption, shadowChartIns);
        createChart(pieOption, pieChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    shadowChartIns = echarts.init(shadowChart.value, "macarons");
    pieChartIns = echarts.init(pieChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
<template>
  
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
          <div>
            <el-form :model="queryParams" ref="queryForm" :inline="true">
              <el-form-item label="选取计划" prop="userPlanId">
               <el-tree-select
                 v-model="queryParams.planId"
                 style="width: 300px"
                 :data="userPlanOptions"
                 :props="{ value: 'id', label: 'text', children: 'children' }"
                 value-key="id"
                 placeholder="选择计划"
                 :check-strictly="false"/>
              </el-form-item>
              <el-form-item label="报告日期" style="width: 308px">
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
                <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:plan:planReport:stat']">统计</el-button>
                <el-button icon="refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
      </el-col>
  
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="countStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
  
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="valueStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
  
      <el-col :span="24" class="card-box">
        <el-card>
          <div>
            <el-descriptions class="margin-top" title="统计信息" :column="2" border>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Grid /></el-icon>
                    次数平均值
                  </div>
                </template>
                <div class="cell">{{ statData.avgCountValue }}次</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><HomeFilled /></el-icon>
                    统计值平均值
                  </div>
                </template>
                <div class="cell">{{ statData.avgValue }}{{ statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Grid /></el-icon>
                    次数最小值
                  </div>
                </template>
                <div class="cell">{{ statData.minCountValue }}次</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><HomeFilled /></el-icon>
                    统计值最小值
                  </div>
                </template>
                <div class="cell">{{ statData.minValue }}{{ statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><Grid /></el-icon>
                    次数最大值
                  </div>
                </template>
                <div class="cell">{{ statData.maxCountValue }}次</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template #label>
                  <div class="cell-item">
                    <el-icon><HomeFilled /></el-icon>
                    统计值最大值
                  </div>
                </template>
                <div class="cell">{{ statData.maxValue }}{{ statData.unit }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
  
    </el-row>
  </div>

</template>

<script setup name="PlanReoortStat">
  import { getPlanReportStat,getPlanReportAvgStat } from "@/api/report/plan/planReport";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import { getPercent } from "@/utils/mulanbay";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const countStatChart = ref(null);
  //echarts实例
  let countStatChartIns = ref(null);
  //图形实例
  const valueStatChart = ref(null);
  //echarts实例
  let valueStatChartIns = ref(null);
  
  const height = ref('395px');
  const userPlanOptions = ref([]);
  const countUnit = ref('次');
  const valueUnit = ref('次');
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref();

  const data = reactive({
    statData:{
      
    },
    queryParams: {
      
    },
    rules: {}
  });

  const { statData,queryParams, rules } = toRefs(data);

  /** 用户统计变化 */
  function handleUserPlanChange(planId) {
    handleQuery();
  }
  
  function loadOptions(){
    getUserPlanTree().then(response => {
      userPlanOptions.value = response;
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

  // 表单重置
  function resetForm() {
    queryParams.value = {
      planId: undefined
    };
    proxy.resetForm("queryRef");
  }
  
  function initChart(){
    initCountChart();
    initValueChart();
    initAvgData();
  }

  /** 图表 */
  function initCountChart() {
    var acQueryParams = deepClone(proxy.addDateRange(queryParams.value, dateRange.value));
    acQueryParams.groupField = 'count_value_result';
    getPlanReportStat(acQueryParams).then(response => {
      response.title = '计划报告结果分析(次数)'
      let option = createPieChartOption(response);
      createChart(option, countStatChartIns);
    });
  }
  
  /** 图表 */
  function initValueChart() {
    var acQueryParams = deepClone(proxy.addDateRange(queryParams.value, dateRange.value));
    acQueryParams.groupField = 'value_result';
    getPlanReportStat(acQueryParams).then(response => {
      response.title = '计划报告结果分析(统计值)'
      let option = createPieChartOption(response);
      createChart(option, valueStatChartIns);
    });
  }
  
  /** 平均值 */
  function initAvgData(){
    statData.value={};
    getPlanReportAvgStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      if(response==null){
        return;
      }
      statData.value=response;
      if(response.plan!=null){
        statData.value.unit = response.plan.unit;
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    countStatChartIns = echarts.init(countStatChart.value, "macarons");
    valueStatChartIns = echarts.init(valueStatChart.value, "macarons");
    loadOptions();
  })
</script>
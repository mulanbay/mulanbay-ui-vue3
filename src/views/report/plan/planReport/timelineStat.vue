<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="计划类型" prop="planType">
        <el-radio-group v-model="queryParams.planType" @change="getUserPlanOptionsTree">
          <el-radio label="YEAR">年</el-radio>
          <el-radio label="MONTH">月</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选取计划" prop="userPlanId">
       <el-tree-select
         v-model="queryParams.planId"
         style="width: 240px"
         :data="userPlanOptions"
         :props="{ value: 'id', label: 'text', children: 'children' }"
         value-key="id"
         placeholder="选择计划"
         :check-strictly="false"/>
      </el-form-item>
      <el-form-item v-if="queryParams.planType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="YYYY"
          placeholder="选择年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.planType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="YYYYMM"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="计划预测" prop="predict">
        <el-switch v-model="queryParams.predict"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:plan:planReport:timelineStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="refresh" @click="handleReStat" v-hasPermi="['report:plan:planReport:reStatTimeline']">重新统计</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="dateStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="PlanReportTimelineStat">
  import { getPlanReportTimelineStat,reStatPlanReportTimeline } from  "@/api/report/plan/planReport";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import * as echarts from 'echarts';
  import { createChart,createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const userPlanOptions = ref([]);
  
  const data = reactive({
    queryParams: {
      planType:'MONTH',
      predict:false
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 下拉框加载 */
  function loadOptions() {
    getUserPlanOptionsTree(queryParams.value.planType);
  }
  
  /** 用户计划树 */
  function getUserPlanOptionsTree(planType){
    queryParams.value.planId = null;
    let para ={
      planType:planType
    }
    getUserPlanTree(para).then(
      response => {
        userPlanOptions.value = response;
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
  
  /** 重新统计按钮操作 */
  function handleReStat(){
    let para={
      planType:queryParams.value.planType,
      planId:queryParams.value.planId
    }
    if(queryParams.value.planType=='YEAR'){
      para.bussKey=queryParams.value.year;
    }else{
      para.bussKey=queryParams.value.yearMonth;
    }
    proxy.$confirm('是否确认重新统计"' + para.bussKey + '"的数据?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      proxy.$modal.loading("正在统计数据，请稍候！");
      return reStatPlanReportTimeline(para);
    }).then(() => {
      proxy.$modal.msgSuccess("重新统计成功");
      proxy.$modal.closeLoading();
      initChart();
    }).catch(function() {});
  }

  function initChart() {
    let para={
      planType:queryParams.value.planType,
      planId:queryParams.value.planId,
      predict:queryParams.value.predict
    }
    if(queryParams.value.planType=='YEAR'){
      para.bussKey=queryParams.value.year;
    }else{
      para.bussKey=queryParams.value.yearMonth;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    getPlanReportTimelineStat(para).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);;
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
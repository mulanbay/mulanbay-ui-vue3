<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
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
      <el-form-item label="报告结果" v-show="moreCdn==true">
        <el-select
          v-model="queryParams.countValueStatResults"
          style="width: 120px"
          clearable
          placeholder="次数">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.valueStatResults"
          style="width: 120px"
          clearable
          placeholder="值">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="过滤全零数据" v-show="moreCdn==true" prop="minValue">
        <el-switch v-model="queryParams.minValue" active-value="0" inactive-value="null" ></el-switch>
      </el-form-item>
      <el-form-item label="数据类型" v-show="moreCdn==true" prop="original" >
        <el-radio-group v-model="queryParams.original">
          <el-radio :label="true">原始数据</el-radio>
          <el-radio :label="false">百分比</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:plan:planReport:dateStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="dateStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="PlanReportDateStat">
  import { getPlanReportDateStat } from  "@/api/report/plan/planReport";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import * as echarts from 'echarts';
  import { createChart,createMixLineBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const userPlanOptions = ref([]);
  const statResultsOptions = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      original:true
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
    getUserPlanTree().then(
      response => {
        userPlanOptions.value = response;
      }
    );
    proxy.getEnumDict('PlanStatResult', 'FIELD', false).then(response => {
      statResultsOptions.value = response;
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
    getPlanReportDateStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createMixLineBarChartOption(response);;
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
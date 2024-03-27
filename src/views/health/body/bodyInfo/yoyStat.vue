<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="年份选择" prop="years">
        <el-select
          v-model="queryParams.years"
          placeholder="年份选择"
          clearable
          multiple
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in yearsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分组" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分组"
          clearable
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
      <el-form-item label="统计分类" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段类型"
          clearable
          style="width: 100px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:body:bodyInfo:yoyStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="yoyStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BodyInfoYoyStat">
  import { getBodyInfoYoyStat } from "@/api/health/body/bodyInfo";
  import { getYearList } from "@/api/common";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createCalenderHeatMapChartOption,createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const yoyStatChart = ref(null);
  //echarts实例
  let yoyStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateGroupTypeOptions = ref([]);
  const yearsOptions = ref([]);
  const groupTypeOptions = ref([]);

  const data = reactive({
    queryParams: {
      name: undefined,
      dateGroupType:'MONTH',
      groupType:'WEIGHT'
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 下拉框加载 */
  function loadOptions() {
    getYearList().then(response => {
      yearsOptions.value = response;
    });
    proxy.getDictItemTree('CHART_YOY_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
    proxy.getDictItemTree('BBI_YOY_STAT_GROUP_TYPE', false).then(response => {
      groupTypeOptions.value = response;
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
    let years = queryParams.value.years;
    const dateGroupType = queryParams.value.dateGroupType;
    if (years == null || years.length == 0) {
      proxy.$modal.msgError("请选择至少两个年份");
      return;
    }
    if (dateGroupType == 'DAY' && years.length != 2) {
      proxy.$modal.msgError("按天统计，年份个数只支持两个");
      return;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    var acQueryParams = deepClone(queryParams.value);
    acQueryParams.years = acQueryParams.years.join(',');
    getBodyInfoYoyStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        //组装chart数据
        const dateGroupType = queryParams.value.dateGroupType;
        if(dateGroupType=='DAY'){
          option = createCalenderHeatMapChartOption(response,echarts);
        }else{
          option = createLineChartOption(response);
        }
        createChart(option, yoyStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    yoyStatChartIns = echarts.init(yoyStatChart.value, "macarons");
    //initChart();
    loadOptions();
  })
</script>
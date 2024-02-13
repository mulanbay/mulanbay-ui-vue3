<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="发生日期" style="width: 308px">
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
      <el-form-item label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分组"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
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
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormal:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BodyAbnormalStat">
  import { getBodyAbnormalStat,getAbnormalCateTree } from "@/api/health/body/bodyAbnormal";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const groupFieldOptions = ref([]);
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
      groupField:'DISEASE',
      chartType:'PIE'
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('BodyAbnormalGroupType', 'FIELD', false).then(response => {
      groupFieldOptions.value = response;
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
    getBodyAbnormalStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const chartType = queryParams.value.chartType;
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
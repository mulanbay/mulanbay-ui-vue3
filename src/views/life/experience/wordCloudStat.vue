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
      <el-form-item label="类型" prop="types">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计字段" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计字段"
          style="width: 120px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in fieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experience:wordCloudStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="wordCloudStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ExperienceWordCloudStat">
  import { getExperienceWordCloudStat } from "@/api/life/experience";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createWorldCloudChartOption } from "@/utils/mulanbay_echarts";
  import 'echarts-wordcloud';

  const { proxy } = getCurrentInstance();
  //图形实例
  const wordCloudStatChart = ref(null);
  //echarts实例
  let wordCloudStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const fieldOptions = ref([]);
  const typesOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      field:'tags'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('ExperienceType', 'ORDINAL', false).then(response => {
      typesOptions.value = response;
    });
    proxy.getDictItemTree('EXPERIENCE_WORDCLOUD_FIELD', false).then(response => {
      fieldOptions.value = response;
    });
  }

  /** 修改图表类型 */
  function changeChartType(newVal) {
    handleQuery();
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
    let qp = proxy.addDateRange(queryParams.value, dateRange.value);
    let acQueryParams = deepClone(qp);
    if(acQueryParams.types!=null){
      acQueryParams.types = acQueryParams.types.join(',');
    }
    getExperienceWordCloudStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createWorldCloudChartOption(response);
        createChart(option, wordCloudStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    wordCloudStatChartIns = echarts.init(wordCloudStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
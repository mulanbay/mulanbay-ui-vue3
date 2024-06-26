<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="练习日期" style="width: 308px">
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
      <el-form-item label="选择乐器" prop="instrumentId">
        <el-tree-select
          v-model="queryParams.instrumentId"
          style="width: 240px"
          clearable
          :data="instrumentOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择乐器"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
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
      <el-form-item label="跟踪曲子" prop="tuneType">
        <el-select
          v-model="queryParams.tuneType"
          placeholder="类型"
          clearable
          style="width: 80px"
          @change="getTuneTreeSelect"
        >
          <el-option
            v-for="dict in tuneTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.tune"
          style="width: 160px"
          filterable
          clearable
          allow-create
          default-first-option
        >
          <el-option
            v-for="dict in tuneOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="补全日期" prop="completeDate">
        <el-switch v-model="queryParams.completeDate"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPractice:dateStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="dateStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="MusicPracticeDateStat">
  import { getMusicPracticeDateStat } from "@/api/music/musicPractice";
  import { getInstrumentTree } from "@/api/music/instrument";
  import {getTuneTree} from "@/api/music/musicPracticeDetail";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createLineChartOption, createCalanderChartOption, createScatterChartOption, createMixLineBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const instrumentOptions = ref([]);
  const tuneTypeOptions = ref([]);
  const dateGroupTypeOptions = ref([]);
  const tuneOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      name: undefined,
      chartType: 'MIX_LINE_BAR',
      dateGroupType:'MONTH',
      completeDate:true,
      tuneType:undefined
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    getInstrumentTree().then(
      response => {
        instrumentOptions.value = response;
      }
    );
    proxy.getEnumDict('TuneType', 'FIELD', false).then(response => {
      tuneTypeOptions.value = response;
    });
    proxy.getDictItemTree('CHART_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
    });
  }
  
  /** 查询曲子下拉树结构 */
  function getTuneTreeSelect() {
    var tuneType = queryParams.value.tuneType;
    getTuneTree(tuneType).then(response => {
      tuneOptions.value = response;
      queryParams.value.tune = undefined;
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
    getMusicPracticeDateStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        const dateGroupType = queryParams.value.dateGroupType;
        const chartType = queryParams.value.chartType;
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
            response.chartType = chartType;
        }
        if (option == null) {
          if (chartType == 'MIX_LINE_BAR') {
            option = createMixLineBarChartOption(response);
          } else if (chartType == 'BAR') {
            option = createBarChartOption(response);
          } else if (chartType == 'LINE') {
            option = createLineChartOption(response);
          } else if (chartType == 'PIE') {
            option = createPieChartOption(response);
          } else if (chartType == 'TREE_MAP') {
            option = createTreeMapChartOption(response, echarts);
          }
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
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
      <el-form-item label="选择乐器" prop="instrumentIds">
        <el-tree-select
          v-model="queryParams.instrumentIds"
          style="width: 240px"
          multiple
          :data="instrumentOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择乐器"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="横轴数据" prop="xgroupType">
        <el-select
          v-model="queryParams.xgroupType"
          placeholder="X轴数据"
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
      <el-form-item label="纵轴数据" prop="ygroupType">
        <el-select
          v-model="queryParams.ygroupType"
          placeholder="Y轴数据"
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
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPractice:compareStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="compareStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="MusicPracticeCompareStat">
  import { getMusicPracticeCompareStat } from "@/api/music/musicPractice";
  import { getInstrumentTree } from "@/api/music/instrument";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createScatterChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const compareStatChart = ref(null);
  //echarts实例
  let compareStatChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const instrumentOptions = ref([]);
  const dateGroupTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      xgroupType:'DAYOFWEEK',
      ygroupType:'HOUR'
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
    proxy.getDictItemTree('MUSIC_COMPARE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
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
    var qp = proxy.addDateRange(queryParams.value, dateRange.value);
    var acQueryParams = deepClone(qp);
    acQueryParams.instrumentIds = qp.instrumentIds.join(',');
    getMusicPracticeCompareStat(acQueryParams).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createScatterChartOption(response);
        createChart(option, compareStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    compareStatChartIns = echarts.init(compareStatChart.value, "macarons");
    //initChart();
    loadOptions();
  })
</script>
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
      <el-form-item label="练习类型" prop="tuneType">
        <el-select
          v-model="queryParams.tuneType"
          placeholder="练习类型"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in tuneTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['music:musicPracticeDetail:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="MusicPracticeDetailStat">
  import { getInstrumentTree } from "@/api/music/instrument";
  import { getMusicPracticeDetailStat } from "@/api/music/musicPracticeDetail";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const instrumentOptions = ref([]);
  const tuneTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      name: undefined,
      tuneType: undefined
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
    getMusicPracticeDetailStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createBarChartOption(response);
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
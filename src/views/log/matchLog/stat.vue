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
      <el-form-item label="匹配类型" prop="matchType">
        <el-select
          v-model="queryParams.matchType"
          placeholder="匹配类型"
          clearable
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in matchTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['log:matchLog:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="analyseStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="MatchLogStat">
  import { onMounted } from 'vue'
  import { statMatchLog } from "@/api/log/matchLog";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseStatChart = ref(null);
  //echarts实例
  let analyseStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  const matchTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {

    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

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
    statMatchLog(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);
        createChart(option, analyseStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    //初始化
    analyseStatChartIns = echarts.init(analyseStatChart.value, "macarons");
    initChart();
    proxy.getEnumDict('GoodsMatchType', 'FIELD', false).then(response => {
      matchTypeOptions.value = response;
    });
  })
</script>
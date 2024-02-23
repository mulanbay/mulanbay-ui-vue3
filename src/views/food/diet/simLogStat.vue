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
      <el-form-item label="餐次" prop="dietType">
        <el-select
          v-model="queryParams.dietType"
          placeholder="餐次"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in dietTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:simLogStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="simLogStatChart" :style="{height:height,margin:0 }" />
    
  </div>
</template>

<script setup name="DietSimLogStat">
  import { getDietSimLogStat } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption} from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const simLogStatChart = ref(null);
  //echarts实例
  let simLogStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dietTypeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      dietType:'BREAKFAST'
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
    proxy.getEnumDict('DietType', 'FIELD', false).then(response => {
      dietTypeOptions.value = response;
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
    getDietSimLogStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);
        createChart(option, simLogStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    simLogStatChartIns = echarts.init(simLogStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
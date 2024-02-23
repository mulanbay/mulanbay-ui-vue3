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
      <el-form-item label="统计字段" prop="statField">
        <el-select
          v-model="queryParams.statField"
          placeholder="统计分组"
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in statFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="地点" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="地点"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:compare']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="compareChart" :style="{height:height,margin:0 }" />
    
  </div>
</template>

<script setup name="DietCompare">
  import { getDietCompare } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createStaHorBarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const compareChart = ref(null);
  //echarts实例
  let compareChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const statFieldOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      statField:'TOTAL_PRICE'
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
    proxy.getDictItemTree('DIET_COMPARE_FIELD', false).then(response => {
      statFieldOptions.value = response;
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
    getDietCompare(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createStaHorBarChartOption(response);
        createChart(option, compareChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    compareChartIns = echarts.init(compareChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
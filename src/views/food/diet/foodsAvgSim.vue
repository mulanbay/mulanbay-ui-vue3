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
      <el-form-item label="排序方式" prop="orderByField">
        <el-select
          v-model="queryParams.orderByField"
          placeholder="排序方式"
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in orderByFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物类型" prop="foodType">
        <el-select
          v-model="queryParams.foodType"
          placeholder="食物类型"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in foodTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.dietSource"
          placeholder="食物来源"
          clearable
          style="width: 115px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="饮食餐次" prop="dietType">
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
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:foodsAvgSim']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="success" icon="TrendCharts" @click="handleSimLogStat" v-hasPermi="['food:diet:simLogStat']">多样性日志</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="foodsAvgSimChart" :style="{height:height,margin:0 }" />
    
  </div>
</template>

<script setup name="FoodsAvgSim">
  import { getFoodsAvgSim } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createGaugeChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const foodsAvgSimChart = ref(null);
  //echarts实例
  let foodsAvgSimChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);
  const orderByFieldOptions = ref([
    {
      id: 'occur_time',
      text: '时间'
    },
    {
      id: 'foods',
      text: '食物'
    }
  ]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      orderByField:'occur_time'
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
    proxy.getEnumDict('FoodType', 'ORDINAL', false).then(response => {
      foodTypeOptions.value = response;
    });
    proxy.getEnumDict('DietType', 'ORDINAL', false).then(response => {
      dietTypeOptions.value = response;
    });
    proxy.getEnumDict('DietSource', 'ORDINAL', false).then(response => {
      dietSourceOptions.value = response;
    });
  }
  
  /** 多样性日志 */
  function handleSimLogStat(){
    proxy.$router.push({name:'DietSimLogStat',query: {}})
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
    getFoodsAvgSim(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createGaugeChartOption(createChartData(response));
        createChart(option, foodsAvgSimChartIns);
      }
    );
  }
  
  function createChartData(avg) {
    let chartData = {};
    chartData.value = (avg*100).toFixed(0);
    chartData.name = '相似度';
    chartData.title = '饮食相似度';
    return chartData;
  }

  /** 初始化 **/
  onMounted(() => {
    foodsAvgSimChartIns = echarts.init(foodsAvgSimChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
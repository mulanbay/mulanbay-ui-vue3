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
          :shortcuts="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="商品类型" prop="goodsTypeId">
        <el-tree-select
          v-model="queryParams.goodsTypeId"
          style="width: 240px"
          :data="goodsTypeOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择商品类型"
          check-strictly
          clearable />
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="购买来源" prop="sourceId">
        <el-select
          v-model="queryParams.sourceId"
          placeholder="购买来源"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="是否二手" prop="secondhand">
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手类型"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in secondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:soldStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>
    
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center">
            <div ref="secondhandStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <div ref="soldStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center">
            <div ref="fullRateStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center">
            <div ref="nshRateStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center">
            <div ref="shRateStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="24" class="card-box">
        <el-card>
          <div v-loading="dateStatLoading" class="chart-wrapper">
            <!--图表数据-->
            <div ref="dateStatChart" :style="{height:dateStatHeight,margin:0 }" />
          </div>
        </el-card>
      </el-col>
      
    </el-row>
    
  </div>
</template>

<script setup name="ConsumeSoldStat">
  import { getConsumeSoldStat } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { deepClone } from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createMixLineBarChartOption,createPieChartOption,createDoublePieChartOption,createTripPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //时间统计图形实例
  const dateStatChart = ref(null);
  //echarts实例
  let dateStatChartIns = ref(null);
  let dateStatLoading = ref(false);
  const dateStatHeight = ref('300px');
  
  //是否二手图形实例
  const secondhandStatChart = ref(null);
  //echarts实例
  let secondhandStatChartIns = ref(null);
  
  //是否出售图形实例
  const soldStatChart = ref(null);
  //echarts实例
  let soldStatChartIns = ref(null);
  
  //折扣图形实例
  const fullRateStatChart = ref(null);
  //echarts实例
  let fullRateStatChartIns = ref(null);
  
  //非二手折扣图形实例
  const nshRateStatChart = ref(null);
  //echarts实例
  let nshRateStatChartIns = ref(null);
  
  //二手折扣图形实例
  const shRateStatChart = ref(null);
  //echarts实例
  let shRateStatChartIns = ref(null);
  
  
  const height = ref('360px');

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const secondhandOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 0
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
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('SECONDHAND', false).then(response => {
      secondhandOptions.value = response;
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
  
  function initChart(){
    initDateStatChart();
    initSecondhandStatChart();
    initSoldStatChart();
    initSoldRateStatChart();
    initNshSoldRateStatChart();
    initShSoldRateStatChart();
  }

  function initDateStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'DATE';
    para.dateGroupType = 'YEAR';
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        let option = createMixLineBarChartOption(response);
        createChart(option, dateStatChartIns);
      }
    );
  }
  
  function initSecondhandStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'SECONDHAND';
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        let option = createDoublePieChartOption(response);
        createChart(option, secondhandStatChartIns);
      }
    );
  }

  function initSoldStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'SOLD';
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        let option = createTripPieChartOption(response);
        createChart(option, soldStatChartIns);
      }
    );
  }
  
  function initSoldRateStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'RATE';
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        //response.title ='商品出售折扣分析';
        let option = createPieChartOption(response);
        createChart(option, fullRateStatChartIns);
      }
    );
  }
  
  function initNshSoldRateStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'RATE';
    para.secondhand = 0;
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        response.title ='非二手商品出售折扣分析';
        let option = createPieChartOption(response);
        createChart(option, nshRateStatChartIns);
      }
    );
  }
  
  function initShSoldRateStatChart() {
    let op = proxy.addDateRange(queryParams.value, dateRange.value);
    var para = deepClone(op);
    para.statType = 'RATE';
    para.secondhand = 1;
    getConsumeSoldStat(para).then(
      response => {
        //组装chart数据
        response.title ='二手商品出售折扣分析';
        let option = createPieChartOption(response);
        createChart(option, shRateStatChartIns);
      }
    );
  }
  
  /** 初始化 **/
  onMounted(() => {
    dateStatChartIns = echarts.init(dateStatChart.value, "macarons");
    secondhandStatChartIns = echarts.init(secondhandStatChart.value, "macarons");
    soldStatChartIns = echarts.init(soldStatChart.value, "macarons");
    fullRateStatChartIns = echarts.init(fullRateStatChart.value, "macarons");
    nshRateStatChartIns = echarts.init(nshRateStatChart.value, "macarons");
    shRateStatChartIns = echarts.init(shRateStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
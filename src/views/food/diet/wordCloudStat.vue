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
      <el-form-item label="统计字段" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计字段"
          style="width: 240px"
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
          v-model="queryParams.dietType"
          placeholder="餐次"
          clearable
          style="width: 115px"
        >
          <el-option
            v-for="dict in dietTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物来源" prop="dietSource">
        <el-select
          v-model="queryParams.dietSource"
          placeholder="食物来源"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:wordCloudStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="wordCloudStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="DietWordCloudStat">
  import { getDietWordCloudStat } from "@/api/food/diet";
  import * as echarts from 'echarts';
  import { createChart, createWorldCloudChartOption } from "@/utils/mulanbay_echarts";
  import 'echarts-wordcloud';

  const { proxy } = getCurrentInstance();
  //图形实例
  const wordCloudStatChart = ref(null);
  //echarts实例
  let wordCloudStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);
  const fieldOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      name: undefined,
      field:'foods'
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
    proxy.getDictItemTree('DIET_WORD_CLOUD_FIELD', false).then(response => {
      fieldOptions.value = response;
    });
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
    getDietWordCloudStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
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
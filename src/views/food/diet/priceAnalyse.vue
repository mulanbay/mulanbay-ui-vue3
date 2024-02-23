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
      <el-form-item label="统计分组" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分组"
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <!--暂时不用-->
      <el-form-item v-if="1>2" label="分组字段" prop="statField">
        <el-select
          v-model="queryParams.statField"
          placeholder="分组字段"
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
          style="width: 120px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="价格类型" prop="minPrice">
        <el-select
          v-model="queryParams.minPrice"
          placeholder="价格类型"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in priceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="消费预测" prop="predict">
        <el-switch v-model="queryParams.predict" :disabled="moreCdn==true||(queryParams.dateGroupTypeStr!='MONTH'&&queryParams.dateGroupTypeStr!='YEAR')"></el-switch>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="补全日期" prop="completeDate">
        <el-switch v-model="queryParams.completeDate"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:priceAnalyse']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="analyseChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="DietPriceAnalyse">
  import { getDietPriceAnalyse } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createMixLineBarChartOption, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseChart = ref(null);
  //echarts实例
  let analyseChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);
  const statFieldOptions = ref([]);
  const dateGroupTypeOptions = ref([]);
  const priceOptions = ref([
    {
      id: 0,
      text: '大于0'
    },
    {
      id: '',
      text: '全部'
    }
  ]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      minPrice:0,
      dateGroupType:'MONTH',
      statField:'DIET_SOURCE',
      completeDate:true,
      predict: false
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
    proxy.getDictItemTree('DIET_STAT_FIELD', false).then(response => {
      statFieldOptions.value = response;
    });
    proxy.getDictItemTree('CHART_DATE_GROUP', false).then(response => {
      dateGroupTypeOptions.value = response;
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
    getDietPriceAnalyse(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        let dateGroupType=queryParams.value.dateGroupType;
        if(dateGroupType=='DAYCALENDAR'){
          option = createPieChartOption(response);
        }else{
          let statField = queryParams.value.statField;
          if(statField=='DIET_SOURCE'||statField=='FOOD_TYPE'||statField=='DIET_TYPE'){
            option = createPieChartOption(response);
          }else{
            option = createMixLineBarChartOption(response);
          }
        }
        createChart(option, analyseChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    analyseChartIns = echarts.init(analyseChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
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
      <el-form-item label="统计分组" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计分组"
          collapse-tags
          style="width: 120px"
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
      <el-form-item v-if="moreCdn==true" label="评分范围">
          <el-input-number v-model="queryParams.minScore" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxScore" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="图表类型" prop="chartType">
        <el-select
          v-model="queryParams.chartType"
          placeholder="图表类型"
          collapse-tags
          style="width: 120px"
          @change="changeChartType">
          <el-option
            v-for="dict in chartTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="显示未知分类" prop="includeUnknown">
        <el-switch v-model="queryParams.includeUnknown" ></el-switch>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="数据值:最低">
          <el-input-number v-model="queryParams.minCount" clearable :min="0" label="" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:analyse']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="analyseChart" :style="{height:height,margin:0 }" />
    
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="initChart" />
    
  </div>
</template>

<script setup name="DietAnalyse">
  import { getDietAnalyse } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createBarChartOption, createPieChartOption,createTreeMapChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseChart = ref(null);
  //echarts实例
  let analyseChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');
  // 总条数(目前写死只能显示前200条)
  const total = ref(200);

  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);
  const fieldOptions = ref([]);
  const chartTypeOptions = ref([
    {
      id: 'PIE',
      text: '饼图'
    },
    {
      id: 'BAR',
      text: '柱状图'
    },
    {
      id: 'TREE_MAP',
      text: '树形图'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize:10,
      minCount:1,
      field:'FOODS',
      includeUnknown:true,
      chartType:'BAR'
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
    proxy.getDictItemTree('DIET_ANALYSE_FIELD', false).then(response => {
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
    if (newVal == 'TREE_MAP') {
      queryParams.value.field = 'CLASS_NAME';
    }
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
    getDietAnalyse(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        if(response.xdata.length<=0){
          proxy.$modal.msgError("无更多数据");
          return;
        }
        //组装chart数据
        let option = null;
        let chartType=queryParams.value.chartType;
        switch (chartType) {
          case 'BAR':
            //日历图
            option = createBarChartOption(response);
            break;
          case 'PIE':
            //散点图
            option = createPieChartOption(response);
            break;
          default:
            option = createTreeMapChartOption(response,echarts);
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
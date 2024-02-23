<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="统计类型" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          :style="{width: '80px'}">
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="YYYY"
          style="width: 120px"
          placeholder="选择年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="YYYY-MM"
          style="width: 120px"
          placeholder="选择月份">
        </el-date-picker>
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
      <el-form-item label="饮食餐次" prop="dietSource">
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
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['food:diet:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="DietStat">
  import { getDietStat } from "@/api/food/diet";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createCalanderChartOption,createCalanderPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 200).toString() + 'px');

  const dateGroupTypeOptions = ref([
    {
      id: 'YEAR',
      text: '年'
    },
    {
      id: 'MONTH',
      text: '月'
    }
  ]);
  
  const foodTypeOptions = ref([]);
  const dietTypeOptions = ref([]);
  const dietSourceOptions = ref([]);

  const data = reactive({
    queryParams: {
      dateGroupType:'MONTH',
      yearMonth:(new Date()).Format("yyyy-MM")
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
    proxy.getEnumDict('FoodType', 'FIELD', false).then(response => {
      foodTypeOptions.value = response;
    });
    proxy.getEnumDict('DietType', 'FIELD', false).then(response => {
      dietTypeOptions.value = response;
    });
    proxy.getEnumDict('DietSource', 'FIELD', false).then(response => {
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
    const dateGroupType = queryParams.value.dateGroupType;
    if (dateGroupType == 'MONTH') {
      let v = queryParams.value.yearMonth;
      queryParams.value.year = v.substring(0, 4);
      queryParams.value.month = v.substring(5, 7);
    } else {
      queryParams.value.month = undefined;
    }
    getDietStat(queryParams.value).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = null;
        if (dateGroupType == 'YEAR') {
          option = createCalanderChartOption(response);
        } else {
          response.cellSize = 70;
          response.pieRadius = 15;
          option = createCalanderPieChartOption(response,statChartIns, echarts);
        }
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
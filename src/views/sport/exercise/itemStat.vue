<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="锻炼日期" style="width: 308px">
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
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="统计项目" prop="field">
        <el-select
          v-model="queryParams.field"
          placeholder="统计项目"
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
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['sport:exercise:itemStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="itemStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="ExerciseItemStat">
  import { getExerciseItemStat } from "@/api/sport/exercise";
  import { getSportTree } from "@/api/sport/sport";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption} from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const itemStatChart = ref(null);
  //echarts实例
  let itemStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const sportOptions = ref([]);
  const fieldOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      field:'VALUE'
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
    getSportTree().then(
      response => {
        sportOptions.value = response;
      }
    );
    proxy.getEnumDict('ExerciseItemStatField', 'FIELD', false).then(response => {
      fieldOptions.value = response;
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
    getExerciseItemStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);
        createChart(option, itemStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    itemStatChartIns = echarts.init(itemStatChart.value, "macarons");
    //initChart();
    loadOptions();
  })
</script>
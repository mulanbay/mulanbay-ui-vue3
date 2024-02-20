<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="日期类型" prop="dateQueryType">
        <el-select
          v-model="queryParams.dateQueryType"
          placeholder="日期类型"
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateQueryTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item label="分组类型" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="分组类型"
          collapse-tags
          style="width: 120px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['read:book:analyseStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="TrendCharts" @click="handleFullStat" v-hasPermi="['read:book:fullStat']">总体统计</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="analyseStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BookAnalyseStat">
  import { getBookAnalyseStat } from "@/api/read/book";
  import {deepClone} from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const analyseStatChart = ref(null);
  //echarts实例
  let analyseStatChartIns = ref(null);
  
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const dateQueryTypeOptions = ref([]);
  const groupTypeOptions = ref([]);
  const statusOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      groupType:'BOOK_CATEGORY',
      dateQueryType:'finish_date'
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('BOOK_DATE_QUERT_TYPE', false).then(response => {
      dateQueryTypeOptions.value = response;
    });
    proxy.getDictItemTree('BOOK_DATE_GROUP_TYPE', false).then(response => {
      groupTypeOptions.value = response;
    });
    proxy.getEnumDict('BookStatus', 'ORDINAL', false).then(response => {
      statusOptions.value = response;
    });
  }
  
  /** 总体统计操作 */
  function handleFullStat(){
    //路由定向
    proxy.$router.push({ name: 'BookFullStat', query: {} })
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
    getBookAnalyseStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createPieChartOption(response);
        createChart(option, analyseStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    analyseStatChartIns = echarts.init(analyseStatChart.value, "macarons");
    initChart();
    loadOptions();
  })
</script>
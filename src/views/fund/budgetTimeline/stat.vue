<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="周期" prop="statPeriod">
        <el-select
          v-model="queryParams.statPeriod"
          placeholder="周期"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in statPeriodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.statPeriod == 'YEARLY'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="YYYY"
          style="width: 120px"
          placeholder="选择年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.statPeriod == 'MONTHLY'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="YYYY-MM"
          style="width: 120px"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="数据" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="数据"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in statTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="消费预测" prop="predict">
        <el-switch v-model="queryParams.predict"></el-switch>
      </el-form-item>
      <el-form-item label="包含突发消费" prop="needOutBurst">
        <el-switch v-model="queryParams.needOutBurst"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:budgetTimeline:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="refresh" @click="handleReStat" v-hasPermi="['fund:budgetTimeline:reStat']">重新统计</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="BudgetTimelineStat">
  import { getBudgetTimelineStat, reStatBudgetTimeline } from "@/api/fund/budgetTimeline";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const statTypeOptions = ref([{
      id: 'RATE',
      text: '按比例'
    },
    {
      id: 'VALUE',
      text: '按金额'
    }
  ]);
  const statPeriodOptions = ref([]);

  const data = reactive({
    queryParams: {
      statPeriod: 'MONTHLY',
      yearMonth: (new Date()).Format("yyyy-MM"),
      statType: 'RATE',
      predict: false,
      needOutBurst: false
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    //预算周期采用数据字典配置，有些周期类型不好实现
    proxy.getDictItemTree('BUDGET_STAT_PERIOD', false).then(response => {
      statPeriodOptions.value = response;
    });
  }

  /** 计算运营日 */
  function getBussDay(statPeriod) {
    if (statPeriod == 'YEARLY') {
      return queryParams.value.year + '-01-01';
    } else {
      return queryParams.value.yearMonth + '-01';
    }
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

  /** 重新统计 */
  function handleReStat() {
    const statPeriod = queryParams.value.statPeriod;
    const bussDay = getBussDay(statPeriod);
    let title = undefined;
    if (statPeriod == 'MONTHLY') {
      title = '是否重新统计' + queryParams.value.yearMonth + '月的所有预算及具体消费数据?';
    } else {
      title = '是否重新统计' + queryParams.value.year + '年的所有预算及具体消费数据?';
    }
    proxy.$confirm(title, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      proxy.$modal.loading("正在重新统计数据，请稍候！");
      const dd = {
        statPeriod: statPeriod,
        bussDay: bussDay
      }
      return reStatBudgetTimeline(dd);
    }).then(() => {
      proxy.$modal.closeLoading();
      proxy.$modal.msgSuccess("统计成功");
      initChart();
    }).catch(function() {});
  }

  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    const statPeriod = queryParams.value.statPeriod;
    queryParams.value.bussDay = getBussDay(statPeriod);
    getBudgetTimelineStat(queryParams.value).then(
      response => {
        proxy.$modal.closeLoading();
        if (statPeriod == 'YEARLY') {
          response.itemLabelShow = false;
        }
        response.smooth = true;
        //组装chart数据
        let option = createLineChartOption(response);;
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
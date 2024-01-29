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
      <el-form-item label="关联账户" prop="accountId">
        <el-tree-select
          v-model="queryParams.accountId"
          style="width: 240px"
          clearable
          :data="accountOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="请选择账户"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="收入状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="收入状态"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:income:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="IncomeStat">
  import { getIncomeStat } from "@/api/fund/income";
  import { getAccountTree } from "@/api/fund/account";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const accountOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      accountId: undefined
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    getAccountTree().then(
      response => {
        accountOptions.value = response;
      }
    );
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
    getIncomeStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createPieChartOption(response);;
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
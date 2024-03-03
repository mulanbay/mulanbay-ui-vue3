<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :rules="rules" :inline="true">
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
      <el-form-item label="选择调度器" prop="triggerId">
        <el-tree-select
          v-model="queryParams.triggerId"
          style="width: 240px"
          clearable
          :data="taskTriggerOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="请选择调度器"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="执行结果" prop="executeResult">
        <el-select
          v-model="queryParams.executeResult"
          placeholder="执行结果"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in executeResultOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['schedule:taskLog:costTimeStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="costTimeStatChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="TaskLogCostTimeStat">
  import { onMounted } from 'vue'
  import { getTaskTriggerTree } from "@/api/schedule/taskTrigger";
  import { getTaskLogCostTimeStat } from "@/api/schedule/taskLog";
  import { copyObject, getQueryObject } from "@/utils/mulanbay";

  import * as echarts from 'echarts';
  import { createChart, createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const costTimeStatChart = ref(null);
  //echarts实例
  let costTimeStatChartIns = ref(null);
  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const executeResultOptions = ref([]);
  const taskTriggerOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      triggerId: undefined
    },
    rules: {
      triggerId: [
        { required: true, message: "请先选择调度器", trigger: "blur" }
      ]
    }
  });

  const { queryParams, form, rules } = toRefs(data);

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
    getTaskLogCostTimeStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);
        createChart(option, costTimeStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    //初始化
    costTimeStatChartIns = echarts.init(costTimeStatChart.value, "macarons");
    
    let qb = getQueryObject(null);
    if (!proxy.isEmpty(qb.triggerId)) {
      queryParams.value.triggerId = parseInt(qb.triggerId);
      initChart();
    }

    getTaskTriggerTree(false).then(response => {
      taskTriggerOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.JobResult', 'FIELD', false).then(response => {
      executeResultOptions.value = response;
    });
  })
</script>
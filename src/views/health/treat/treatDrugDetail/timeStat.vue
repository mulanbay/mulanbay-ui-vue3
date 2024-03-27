<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item label="用药日期" style="width: 308px">
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
        <el-form-item label="合并药名" prop="mergeSameName">
          <el-switch v-model="queryParams.mergeSameName" @change="handleQuery"></el-switch>
          <el-tooltip class="box-item" effect="dark" content="合并相同药名：多次看病记录有相同药品名称的药合并在一起统计。否则只统计该次看病记录中该药品的记录" placement="top">
            <span>
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </span>
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:timeStat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />

    </div>
  </el-dialog>

</template>

<script setup name="TreatDrugDetailTimeStat">
  import { getTreatDrugDetailTimeStat } from "@/api/health/treat/treatDrugDetail";
  import * as echarts from 'echarts';
  import { createChart, createScatterChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref((document.body.clientHeight - 300).toString() + 'px');

  //可执行时间段
  const title = ref('时间点统计');
  const open = ref(false);
  const formRef = ref();

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      mergeSameName: false
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (drugId, drugName) => {
    open.value = true;
    title.value = '[' + drugName + ']用药日历统计';
    queryParams.value.drugId = drugId;
    //解决在dialog里面打开echarts报：Initialize failed: invalid dom
    proxy.$nextTick(()=>{
      if(!chartInited.value){
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 搜索按钮操作 */
  function handleQuery() {
    initChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    initChart();
  }

  // 表单重置
  function resetForm() {
    queryParams.value = {
      drugId: undefined
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getTreatDrugDetailTimeStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      proxy.$modal.closeLoading();
      let option = createScatterChartOption(response);
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item label="检验项目" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入检验项目"
            clearable
            style="width: 120px"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="检测日期" style="width: 308px">
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
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatTest:stat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />
      
    </div>
  </el-dialog>

</template>

<script setup name="TreatTestStat">
  import { getTreatTestStat } from "@/api/health/treat/treatTest";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption,createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref((document.body.clientHeight - 300).toString() + 'px');

  //可执行时间段
  const title = ref('统计');
  const open = ref(false);
  const formRef = ref();

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const data = reactive({
    queryParams: {
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (name) => {
    open.value = true;
    title.value = '[' + name + ']检测结果统计';
    queryParams.value.name = name;
    proxy.$nextTick(()=>{
      if(!chartInited.value){
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
      handleQuery();
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
      
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getTreatTestStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      proxy.$modal.closeLoading();
      //组装chart数据
      let chartType=response.chartType;
      let option={};
      if(chartType=='LINE'){
        let minValue = response.minValue== null ? 0 : response.minValue;
        let maxValue = response.maxValue== null ? 0 : response.maxValue;
        option = createLineChartOption(response.chartData,minValue,maxValue);
      }else{
        option = createPieChartOption(response.chartData);
      }
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
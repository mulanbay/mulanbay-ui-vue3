<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
				<el-form-item label="消费标签" prop="name">
				  <el-input
				    v-model="queryParams.name"
				    placeholder="请输入名称"
				    disabled
				    style="width: 240px"
				    @keyup.enter.native="handleQuery"
				  />
				</el-form-item>
        <el-form-item label="大类分组" prop="groupTop">
          <el-switch v-model="queryParams.groupTop" @change="handleQuery"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['life:experience:costStat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />

    </div>
  </el-dialog>

</template>

<script setup name="ExperienceCostStat">
  import { getConsumeAnalyseStat } from "@/api/consume/consume";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref((document.body.clientHeight - 250).toString() + 'px');

  const title = ref('消费统计');
  const open = ref(false);
  const formRef = ref();
  
  const data = reactive({
    queryParams: {
      groupField:'goods_type_id',
			type:"TOTAL_PRICE",
			chartType:"PIE",
      groupTop:true
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (expId,expName) => {
    open.value = true;
    queryParams.value.name = expName;
    proxy.$nextTick(() => {
      if (!chartInited.value) {
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
      handleQuery();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 初始化下拉树结构 */
  function initOptions() {

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

  // 表单重置
  function resetForm() {
    queryParams.value = {

    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getConsumeAnalyseStat(queryParams.value).then(response => {
      proxy.$modal.closeLoading();
      //组装chart数据
      let option = createPieChartOption(response, statChartIns);
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
    initOptions();
  })
</script>
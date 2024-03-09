<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item>
          <el-button type="primary" icon="refresh" @click="initChart" v-hasPermi="['data:userScore:analyse']">统计</el-button>
        </el-form-item>
      </el-form>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />
      
    </div>
  </el-dialog>

</template>

<script setup name="UserScoreAnalyse">
  import { getUserScoreAnalyse } from "@/api/data/userScore";
  import * as echarts from 'echarts';
  import { createChart, createRadarChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref((document.body.clientHeight - 300).toString() + 'px');

  //可执行时间段
  const title = ref('评分分析');
  const open = ref(false);
  const formRef = ref();

  const data = reactive({
    queryParams: {
      scoreId: undefined
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (scoreId) => {
    open.value = true;
    queryParams.value.scoreId = scoreId;
    proxy.$nextTick(()=>{
      if(!chartInited.value){
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
      initChart();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getUserScoreAnalyse(queryParams.value).then(response => {
      proxy.$modal.closeLoading();
      let option = createRadarChartOption(response);
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
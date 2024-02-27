<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
        <el-form-item label="选择统计项" prop="statId">
          <el-tree-select
            v-model="queryParams.statId"
            style="width: 380px"
            :data="userStatOptions"
            :props="{ value: 'id', label: 'text', children: 'children' }"
            value-key="id"
            placeholder="选择模版"
            :check-strictly="false"
            @change="handleUserStatChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:stat:userStat:stat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="refresh" @click="refreshStat(queryParams.statId)" v-hasPermi="['report:stat:userStat:deleteCache']">刷新</el-button>
        </el-form-item>
      </el-form>

      <div>
        <el-descriptions class="margin-top" :column="1" border v-loading="loading">
          <el-descriptions-item width="80px">
            <template #label>
              <div class="cell-item">
                <el-icon>
                  <Clock />
                </el-icon>
                统计值
              </div>
            </template>
            {{ statTitle}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon>
                  <Clock />
                </el-icon>
                统计信息
              </div>
            </template>
            {{ statContent}}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          统计信息
        </span>
      </el-divider>

      <el-row>
        <el-col :span="12">
          <div class="chart-wrapper">
            <!--图表数据-->
            <div ref="warningStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-wrapper">
            <!--图表数据-->
            <div ref="alertStatChart" :style="{height:height,margin:0 }" />
          </div>
        </el-col>
      </el-row>

    </div>
  </el-dialog>

</template>

<script setup name="UserStatStat">
  import { getUserStatStat, getUserStatTree } from "@/api/report/stat/userStat";
  import { getPercent } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createGaugeChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const warningStatChart = ref(null);
  //echarts实例
  let warningStatChartIns = ref(null);
  //图形实例
  const alertStatChart = ref(null);
  //echarts实例
  let alertStatChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref('400px');

  //可执行时间段
  const title = ref('用户统计');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const userStatOptions = ref([]);
  const statTitle = ref('');
  const statContent = ref('');

  const data = reactive({
    queryParams: {},
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (statId, name) => {
    open.value = true;
    title.value = '[' + name + ']统计';
    queryParams.value.statId = statId;
    proxy.$nextTick(() => {
      if (!chartInited.value) {
        warningStatChartIns = echarts.init(warningStatChart.value, "macarons");
        alertStatChartIns = echarts.init(alertStatChart.value, "macarons");
        chartInited.value = true;
      }
      initChart();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 用户统计变化 */
  function handleUserStatChange(statId) {
    handleQuery();
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
      statId: undefined
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getUserStatStat(queryParams.value).then(response => {
      proxy.$modal.closeLoading();
      if (response.userStat.template.resultType == 'DATE_NAME' || response.userStat.template.resultType == 'NUMBER_NAME') {
        statContent.value = response.name + '，' + response.compareValue + response.userStat.template.valueTypeName;
      } else {
        statContent.value = '';
      }
      const unit = response.userStat.template.valueTypeName;
      statTitle.value = response.compareValue + unit;

      let warningOption = createGaugeChartOption(createWarningChartData(response));
      createChart(warningOption, warningStatChartIns);

      let alertOption = createGaugeChartOption(createAlertChartData(response));
      createChart(alertOption, alertStatChartIns);
    });
  }

  function createWarningChartData(response) {
    let chartData = {};
    let rateWarningPercent = getPercent(response.compareValue, response.userStat.warningValue);
    const unit = response.userStat.template.valueTypeName;
    chartData.value = rateWarningPercent.toFixed(0);
    chartData.name = '';
    chartData.title = '达到警告比例';
    chartData.subTitle = "警告配置:" + response.userStat.warningValue + unit;
    return chartData;
  }

  function createAlertChartData(response) {
    let chartData = {};
    let rateAlertPercent = getPercent(response.compareValue, response.userStat.alertValue);
    const unit = response.userStat.template.valueTypeName;
    chartData.value = rateAlertPercent.toFixed(0);
    chartData.name = '';
    chartData.title = '达到报警比例';
    chartData.subTitle = "报警配置:" + response.userStat.alertValue + unit;
    return chartData;
  }

  /** 初始化 **/
  onMounted(() => {
    getUserStatTree().then(response => {
      userStatOptions.value = response;
    });
  })
</script>
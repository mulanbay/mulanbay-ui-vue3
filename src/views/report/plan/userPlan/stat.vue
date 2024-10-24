<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
        <el-form-item label="选择计划" prop="planId">
          <el-tree-select
            v-model="queryParams.planId"
            style="width: 240px"
            :data="userPlanOptions"
            :props="{ value: 'id', label: 'text', children: 'children' }"
            value-key="id"
            placeholder="选择计划"
            :check-strictly="false"
            @change="handleUserPlanChange" />
        </el-form-item>
        <el-form-item label="数据预测" prop="predict">
          <el-switch v-model="queryParams.predict"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:plan:userPlan:stat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div>
        <el-table v-loading="loading" :data="statDataList">
          <el-table-column label="数据类型" align="center">
            <template #default="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="统计值" align="center">
            <template #default="scope">
              <span>{{ scope.row.statValue }}</span>
            </template>
          </el-table-column>
          <el-table-column label="计划值" align="center">
            <template #default="scope">
              <span>{{ scope.row.planValue }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预测值" align="center">
            <template #default="scope">
              <span>{{ scope.row.predictValue }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" align="center">
            <template #default="scope">
              <span>{{ scope.row.unit }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          比例
        </span>
      </el-divider>
      
      <el-card>
          <el-row>
            <el-col :span="12">
              <div class="chart-wrapper">
                <!--图表数据-->
                <div ref="countStatChart" :style="{height:height,margin:0 }" />
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-wrapper">
                <!--图表数据-->
                <div ref="valueStatChart" :style="{height:height,margin:0 }" />
              </div>
            </el-col>
          </el-row>
      </el-card>
      
    </div>
  </el-dialog>

</template>

<script setup name="UserPlanStat">
  import { getUserPlanStat, getUserPlanTree } from "@/api/report/plan/userPlan";
  import { getPercent } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createGaugeChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const countStatChart = ref(null);
  //echarts实例
  let countStatChartIns = ref(null);
  //图形实例
  const valueStatChart = ref(null);
  //echarts实例
  let valueStatChartIns = ref(null);
  const statDataList = ref([]);
  
  //是否初始化
  let chartInited = ref(false);
  const height = ref('400px');

  //可执行时间段
  const title = ref('用户统计');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const userPlanOptions = ref([]);

  const data = reactive({
    queryParams: {
      predict:false
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (planId, name) => {
    open.value = true;
    title.value = '[' + name + ']统计';
    queryParams.value.planId = planId;
    loadOptions();
    proxy.$nextTick(() => {
      if (!chartInited.value) {
        countStatChartIns = echarts.init(countStatChart.value, "macarons");
        valueStatChartIns = echarts.init(valueStatChart.value, "macarons");
        chartInited.value = true;
      }
      initChart();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 用户统计变化 */
  function handleUserPlanChange(planId) {
    handleQuery();
  }
  
  function loadOptions(){
    getUserPlanTree().then(response => {
      userPlanOptions.value = response;
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

  // 表单重置
  function resetForm() {
    queryParams.value = {
      planId: undefined
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    statDataList.value= [];
    getUserPlanStat(queryParams.value).then(response => {
      proxy.$modal.closeLoading();
      let countData = {
        name:'次数',
        statValue:response.planReport.reportCountValue,
        planValue:response.planReport.planCountValue,
        predictValue:(response.predictCount==null ? null:response.predictCount.toFixed(1)),
        unit:'次'
      }
      statDataList.value.push(countData);

      let countChartData = {};
      let cp = getPercent(countData.statValue, countData.planValue);
      countChartData.value = cp;
      countChartData.title = '统计次数/计划次数-比例';
      countChartData.name = "统计次数:" + countData.statValue + '次,'+"计划次数:" + countData.planValue + '次';
      let countOption = createGaugeChartOption(countChartData);
      createChart(countOption, countStatChartIns);
      
      let unit = response.planReport.plan.unit;
      let valueData = {
        name:'统计值',
        statValue:response.planReport.reportValue,
        planValue:response.planReport.planValue,
        predictValue:(response.predictValue==null ? null:response.predictValue.toFixed(1)),
        unit:unit
      }
      statDataList.value.push(valueData);
      
      let valueChartData = {};
      let vp = getPercent(valueData.statValue, valueData.planValue);
      valueChartData.value = vp;
      valueChartData.title = '统计值/计划值-比例';
      valueChartData.name = "统计值:" + valueData.statValue + unit+",计划值:" + valueData.planValue + unit;
      let valueOption = createGaugeChartOption(valueChartData);
      createChart(valueOption, valueStatChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
    
  })
</script>
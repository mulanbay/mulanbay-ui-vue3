<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body class="customDialogCss">
    <div class="app-container">
      <el-row>
        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="hospitalStatChart" :style="{height:height,margin:0 }" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="departmentStatChart" :style="{height:height,margin:0 }" />
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="organStatChart" :style="{height:height,margin:0 }" />
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="osStatChart" :style="{height:height,margin:0 }" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-dialog>

</template>

<script setup name="FullStatAnalyse">
  import {getTreatAnalyseStat} from "@/api/health/treat/treat";
  import * as echarts from 'echarts';
  import { createChart,createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const hospitalStatChart = ref(null);
  let hospitalStatChartIns = ref(null);
  
  const departmentStatChart = ref(null);
  let departmentStatChartIns = ref(null);
  
  const organStatChart = ref(null);
  let organStatChartIns = ref(null);
  
  const osStatChart = ref(null);
  let osStatChartIns = ref(null);
  
  let chartInited = ref(false);
  const height = ref('300px');

  const loading = ref(false);
  //可执行时间段
  const title = ref('统计');
  const open = ref(false);

  const data = reactive({
    statData: {},
    rules: {}
  });

  const { statData, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (sd) => {
    open.value = true;
    title.value = '[' + sd.tags + ']分析';
    statData.value = sd;
    proxy.$nextTick(() => {
      if (!chartInited.value) {
        hospitalStatChartIns = echarts.init(hospitalStatChart.value, "macarons");
        departmentStatChartIns = echarts.init(departmentStatChart.value, "macarons");
        organStatChartIns = echarts.init(organStatChart.value, "macarons");
        osStatChartIns = echarts.init(osStatChart.value, "macarons");
        chartInited.value = true;
      }
      let tags = sd.tags;
      initHospitalChart(tags);
      initDepartmentChart(tags);
      initOrganChart(tags);
      initOsChart(tags);
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 医院分析 */
  function initHospitalChart(tags) {
    let paras= {
      tags: tags,
      groupField:'hospital',
      groupType:'COUNT',
      feeField:'total_fee',
      chartType:'PIE',
    };
    getTreatAnalyseStat(paras).then(
      response => {
        //组装chart数据
        response.chartType='PIE';
        response.title ='医院分析';
        let option = createPieChartOption(response);
        createChart(option, hospitalStatChartIns);
      }
    );
  }
  
  /** 科室分析 */
  function initDepartmentChart(tags) {
    let paras= {
      tags: tags,
      groupField:'department',
      groupType:'COUNT',
      feeField:'total_fee',
      chartType:'PIE',
    };
    getTreatAnalyseStat(paras).then(
      response => {
        //组装chart数据
        response.chartType='PIE';
        response.title ='科室分析';
        let option = createPieChartOption(response);
        createChart(option, departmentStatChartIns);
      }
    );
  }
  
  /** 器官分析 */
  function initOrganChart(tags) {
    let paras= {
      tags: tags,
      groupField:'organ',
      groupType:'COUNT',
      feeField:'total_fee',
      chartType:'PIE',
    };
    getTreatAnalyseStat(paras).then(
      response => {
        //组装chart数据
        response.chartType='PIE';
        response.title ='器官分析';
        let option = createPieChartOption(response);
        createChart(option, organStatChartIns);
      }
    );
  }
  
  /** 器官分析 */
  function initOsChart(tags) {
    let paras= {
      tags: tags,
      groupField:'os',
      groupType:'COUNT',
      feeField:'total_fee',
      chartType:'PIE',
    };
    getTreatAnalyseStat(paras).then(
      response => {
        //组装chart数据
        response.chartType='PIE';
        response.title ='门诊分析';
        let option = createPieChartOption(response);
        createChart(option, osStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {})
</script>
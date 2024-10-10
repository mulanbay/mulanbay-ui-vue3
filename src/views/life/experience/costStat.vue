<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="人生经历" prop="expId">
          <el-select
            v-model="queryParams.expId"
            placeholder="人生经历"
            clearable
            style="width: 240px"
            @change="handleQuery"
          >
            <el-option
              v-for="dict in expIdOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="旅行日期" style="width: 308px">
          <el-date-picker
            v-model="dateRange"
            unlink-panels
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="datePickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="统计分组" prop="statType" >
          <el-select
            v-model="queryParams.statType"
            placeholder="统计分组"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in statTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="大类分组" v-if="queryParams.statType=='CONSUME_TYPE'" prop="groupTop">
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
  import { getExperienceCostStat } from "@/api/life/experience";
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
  const expIdOptions = ref([]);
  const statTypeOptions = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const data = reactive({
    queryParams: {
      statType:'CONSUME_TYPE',
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
    queryParams.value.expId = expId;
    expIdOptions.value=[{
      id: expId,
      text:expName
    }]
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
    proxy.getEnumDict('ExperienceCostStatType', 'FIELD', false).then(response => {
      statTypeOptions.value = response;
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

    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getExperienceCostStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
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
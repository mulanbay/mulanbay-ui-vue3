<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item label="统计类型" prop="dateGroupType">
          <el-select
            v-model="queryParams.dateGroupType"
            :style="{width: '80px'}">
            <el-option
              v-for="dict in dateGroupTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
          <el-date-picker
            v-model="queryParams.year"
            type="year"
            value-format="YYYY"
            style="width: 120px"
            placeholder="选择年份">
          </el-date-picker>
        </el-form-item>
        <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
          <el-date-picker
            v-model="queryParams.yearMonth"
            type="month"
            value-format="YYYY-MM"
            style="width: 120px"
            placeholder="选择月份">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="合并药名" prop="mergeSameName">
          <el-switch v-model="queryParams.mergeSameName" @change="handleQuery"></el-switch>
          <el-tooltip class="box-item" effect="dark" content="合并相同药名：多次看病记录有相同药品名称的药合并在一起统计。否则只统计该次看病记录中该药品的记录" placement="top">
            <span>
              <el-icon><QuestionFilled /></el-icon>
            </span>
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:calendarStat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />
      
    </div>
  </el-dialog>

</template>

<script setup name="TreatDrugDetailCalendarStat">
  import { getTreatDrugDetailCalendarStat } from "@/api/health/treat/treatDrugDetail";
  import * as echarts from 'echarts';
  import { createChart, createCalanderChartOption, createCalanderPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref((document.body.clientHeight - 300).toString() + 'px');

  //可执行时间段
  const title = ref('日历统计');
  const open = ref(false);
  const formRef = ref();
  const dateGroupTypeOptions = ref([
    {
      id: 'YEAR',
      text: '年'
    },
    {
      id: 'MONTH',
      text: '月'
    }
  ]);

  const data = reactive({
    queryParams: {
      dateGroupType: 'MONTH',
      yearMonth: (new Date()).Format("yyyy-MM"),
      mergeSameName: true
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
    proxy.$nextTick(()=>{
      if(!chartInited.value){
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
    });
    //initChart();
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
    const dateGroupType = queryParams.value.dateGroupType;
    if (dateGroupType == 'MONTH') {
      let v = queryParams.value.yearMonth;
      queryParams.value.year = v.substring(0, 4);
      queryParams.value.month = v.substring(5, 7);
    } else {
      queryParams.value.month = undefined;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    getTreatDrugDetailCalendarStat(queryParams.value).then(response => {
      proxy.$modal.closeLoading();
      let option = null;
      if (dateGroupType == 'YEAR') {
        option = createCalanderChartOption(response);
      } else {
        response.cellSize = 70;
        response.pieRadius = 15;
        option = createCalanderPieChartOption(response,statChartIns, echarts);
      }
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
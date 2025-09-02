<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
        <el-form-item label="消费日期" style="width: 308px">
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
					<el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['consume:consume:analyseStat']">统计</el-button>
        </el-form-item>
      </el-form>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />

    </div>
  </el-dialog>

</template>

<script setup name="BudgetConsumeStat">
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
  const height = ref('400px');

  //可执行时间段
  const title = ref('消费统计');
  const open = ref(false);
  const loading = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
			chartType: 'PIE',
			groupField: 'goods_type_id',
			type: 'TOTAL_PRICE',
			groupTop: true
		},
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (statPeriod,bussKey) => {
    open.value = true;
		if(statPeriod=='YEARLY'){
			dateRange.value = [bussKey + '-01-01', bussKey + '-12-31'];
		}else{
			// 提取年、月
			const year = bussKey.substring(0, 4);
			const month = bussKey.substring(4, 6); // 注意：JavaScript 月份从 0 开始，所以要减 1			
			// 创建 Date 对象（注意：月份要 -1）
			const date = new Date(parseInt(year), parseInt(month) - 1, 1);
			dateRange.value = proxy.getMonthDateRange(date);
		}
    //queryParams.value.statId = statId;
    loadOptions();
    proxy.$nextTick(() => {
      if (!chartInited.value) {
        statChartIns = echarts.init(statChart.value, "macarons");
        chartInited.value = true;
      }
      initChart();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function loadOptions(){
    
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
    
  }

  /** 图表 */
  function initChart() {
    proxy.$modal.loading("正在加载数据，请稍候！");
    getConsumeAnalyseStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
				proxy.$modal.closeLoading();
        //组装chart数据
        let option = createPieChartOption(response);
        createChart(option, statChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    
  })
</script>
<template>
  <div class="app-container">

    <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          style="width: 240px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['sport:sportMilestone:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />
    
  </div>
</template>

<script setup name="SportMilestoneStat">
  import { getSportMilestoneStat } from "@/api/sport/sportMilestone";
  import { getSportTree } from "@/api/sport/sport";
  import * as echarts from 'echarts';
  import { createChart, createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();

  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');
  const sportOptions = ref([]);

  const data = reactive({
    queryParams: {},
    rules: {
      sportId: [
        { required: false, message: "运动类型不能为空", trigger: "blur" }
      ],
      reInit: [
        { required: true, message: "是否重新初始化不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 搜索按钮操作 */
  function handleQuery() {
    initChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    initChart();
  }

  /** 加载树 */
  function loadSportTree() {
    getSportTree(false).then(response => {
      sportOptions.value = response;
      if(sportOptions.value.length>0){
        queryParams.value.sportId = sportOptions.value[0].id;
        initChart();
      }
      
    });
  }

  // 表单重置
  function resetForm() {
    queryParams.value = {
      sportId: undefined
    };
    proxy.resetForm("queryRef");
  }

  /** 显示图表 */
  function initChart() {
    if(queryParams.value.sportId==null){
      proxy.$modal.msgError("请选择运动类型");
      return;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    getSportMilestoneStat(queryParams.value).then(
      response => {
        proxy.$modal.closeLoading();
        //组装chart数据
        let option = createLineChartOption(response);;
        createChart(option, statChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    loadSportTree();

  })
</script>
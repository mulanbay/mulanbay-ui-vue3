<template>
  <div class="app-container">

    <div>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
        <el-form-item label="起止日期" style="width: 308px">
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
        <el-form-item label="数据类型" prop="groupType">
          <el-select
            v-model="queryParams.groupType"
            placeholder="类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in groupTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="积分来源" prop="source">
          <el-select
            v-model="queryParams.source"
            placeholder="类型"
            clearable
            style="width: 240px"
            @change="handleSourceChange"
          >
            <el-option
              v-for="dict in sourceOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源明细" prop="sourceId">
          <el-tree-select
            v-model="queryParams.sourceId"
            style="width: 240px"
            :data="sourceIdOptions"
            :props="{ value: 'id', label: 'text', children: 'children' }"
            value-key="id"
            placeholder=""
            clearable
            :check-strictly="false"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['data:userReward:sourceStat']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--图表数据-->
    <div ref="statChart" :style="{height:height,margin:0 }" />

  </div>
</template>

<script setup name="UserScoreSourceStat">
  import { getUserRewardSourceStat } from "@/api/data/userReward";
  import { getUserStatTree } from "@/api/report/stat/userStat";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import { deepClone } from "@/utils/index";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);

  const height = ref((document.body.clientHeight - 240).toString() + 'px');

  const sourceOptions = ref([]);
  const sourceIdOptions = ref([]);
  const groupTypeOptions = ref([
    {
      id: 'COUNT',
      text: '次数'
    },
    {
      id: 'VALUE',
      text: '分数'
    }
  ]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      groupType: 'COUNT'
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 来源选择菜单改变 */
  function handleSourceChange(source){
    sourceIdOptions.value = [];
    queryParams.value.sourceId = null;
    if(source==1){
      getUserStatTree().then(response => {
        sourceIdOptions.value = response;
      });
    }else if(source==2){
      getUserPlanTree().then(response => {
        sourceIdOptions.value = response;
      });
    }
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    initChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }
  
  /** 图表 */
  function initChart(){
    proxy.$modal.loading("正在加载数据，请稍候！");
    getUserRewardSourceStat(proxy.addDateRange(queryParams.value, dateRange.value)).then(
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
    //初始化
    statChartIns = echarts.init(statChart.value, "macarons");
    initChart();
    proxy.getEnumDict('BussSource', 'ORDINAL', false).then(response => {
      sourceOptions.value = response;
    });
  })

</script>
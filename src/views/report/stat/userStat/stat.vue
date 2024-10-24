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
          <el-button type="success" icon="MessageBox" @click="handleCacheInfo(queryParams.statId)" v-hasPermi="['report:stat:userStat:cacheInfo']">缓存</el-button>
        </el-form-item>
      </el-form>

      <div>
        <el-descriptions class="margin-top" :column="1" border v-loading="loading">
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><InfoFilled /></el-icon>
                {{ statData.title}}
              </div>
            </template>
            {{ statData.valueDesc}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><StarFilled /></el-icon>
                统计信息
              </div>
            </template>
            {{ statData.statContent}}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          比例
        </span>
      </el-divider>

      <!--图表数据-->
      <div ref="statChart" :style="{height:height,margin:0 }" />
      
      <!-- 缓存信息 -->
      <CacheInfo ref="cacheInfoRef" />
      
    </div>
  </el-dialog>

</template>

<script setup name="UserStatStat">
  import { getUserStatStat, getUserStatTree } from "@/api/report/stat/userStat";
  import { getPercent } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createGaugeChartOption } from "@/utils/mulanbay_echarts";
  import CacheInfo from './cacheInfo.vue'

  const { proxy } = getCurrentInstance();
  const cacheInfoRef = ref();
  
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref('400px');

  //可执行时间段
  const title = ref('用户统计');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const userStatOptions = ref([]);

  const data = reactive({
    statData:{},
    queryParams: {},
    rules: {}
  });

  const { statData,queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (statId, name) => {
    open.value = true;
    title.value = '[' + name + ']统计';
    queryParams.value.statId = statId;
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

  /** 用户统计变化 */
  function handleUserStatChange(statId) {
    handleQuery();
  }
  
  /** 缓存信息 */
  function handleCacheInfo(statId) {
    cacheInfoRef.value.showData(statId);
  }
  
  function loadOptions(){
    getUserStatTree().then(response => {
      userStatOptions.value = response;
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
        statData.value.statContent = response.nameValue + '，' + response.statValue + response.userStat.template.valueTypeName;
      } else {
        statData.value.statContent = '';
      }
      let unit = response.userStat.template.valueTypeName;
      let valueDesc =  response.statValue + unit;
      valueDesc += '   (期望值:'+response.userStat.compareTypeName+response.userStat.expectValue+unit+')'
      statData.value.valueDesc = valueDesc;
      statData.value.title = response.userStat.title;
      
      let chartData = {};
      let percent = getPercent(response.statValue, response.userStat.expectValue);
      chartData.value = percent;
      chartData.title = '统计值/期望值-比例';
      chartData.name = valueDesc;
      
      let option = createGaugeChartOption(chartData);
      createChart(option, statChartIns);
    });
  }

  /** 初始化 **/
  onMounted(() => {
    
  })
</script>
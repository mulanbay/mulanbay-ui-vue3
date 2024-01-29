<template>
  <div class="app-container">
    <PanelGroup ref="panelGroupRef" />

    <el-divider content-position="center">
    </el-divider>

    <el-card>
      <el-divider content-position="center">
        <span class="table-title" @click="handleDispatch('Consume')">
          <svg-icon icon-class="budget" />
          消费/收入/账户统计
          <i class="el-icon-s-promotion" />
        </span>
      </el-divider>

      <el-row>
        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="consumeChart" :style="{height:consumeHeight,margin:0 }" />
            </div>
            <div align="center">
              <el-button type="primary" icon="Histogram" @click="consumeChartStat">消费分析</el-button>
              <el-button type="primary" icon="Histogram" @click="incomeChartStat">收入分析</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12" class="card-box">
          <el-card>
            <div class="chart-wrapper">
              <div ref="accountChart" :style="{height:accountHeight,margin:0 }" />
            </div>
          </el-card>
        </el-col>

      </el-row>
    </el-card>

    <el-divider content-position="center">
      <span class="table-title" @click="handleDispatch('Budget')">
        <svg-icon icon-class="budget" />
        预算列表
        <i class="el-icon-s-promotion" />
      </span>
    </el-divider>

    <!--预算列表数据-->
    <el-table v-loading="loading" :data="budgetList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="budgetId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.budgetId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算名称" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.budgetName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" width="150">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周期类型" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付时间" :show-overflow-tooltip="true" align="center" width="150">
        <template #default="scope">
          <span>{{ formatCurrentPaidTime(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付金额" :show-overflow-tooltip="true" align="center" width="150">
        <template #default="scope">
          <span>{{ formatCurrentPaidAmount(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.cpPaidAmount!=null">
            {{formatPercent(scope.row)+'%'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="历史" align="center">
        <template #default="scope">
          <span class="link-type" @click="showHistory(scope.row)" v-hasPermi="['fund:budgetSnapshot:history']">
            <el-icon>
              <Compass />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.tags != null">
            <el-tag type="success">{{ scope.row.tags}}</el-tag>
          </span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script setup name="Finance">
  import { getIncomeStat } from "@/api/fund/income";
  import { getConsumeAnalyseStat } from "@/api/consume/consume";
  import { getAccountStat } from "@/api/fund/account";
  import { fetchList as getBudgetList } from "@/api/fund/budget";
  import { getPercent, progressColors } from "@/utils/mulanbay";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";
  import PanelGroup from './panelGroup.vue'

  const { proxy } = getCurrentInstance();

  const panelGroupRef = ref();
  //图形实例
  const consumeChart = ref(null);
  //echarts实例
  let consumeChartIns = ref(null);
  //图形实例
  const accountChart = ref(null);
  //echarts实例
  let accountChartIns = ref(null);
  const consumeHeight = ref('450px');
  const accountHeight = ref('480px');
  const budgetList = ref([]);
  const loading = ref(false);


  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getMonthDateRange(new Date()));

  const data = reactive({
    queryParams: {
      accountId: undefined
    }
  });

  const { queryParams } = toRefs(data);

  //路由跳转
  function handleDispatch(pathName) {
    //路由定向
    proxy.$router.push({ name: pathName, query: {} })
  }

  /** 展示历史 */
  function showHistory(row) {
    proxy.$router.push({ name: 'BudgetSnapshotHistory', query: { budgetId: row.budgetId } })
  }

  // 消费图表统计
  function consumeChartStat() {
    let para = proxy.addDateRange(queryParams.value, dateRange.value);
    para.groupField = 'goods_type_id';
    para.type = 'TOTALPRICE';
    para.chartType = 'PIE';
    getConsumeAnalyseStat(para).then(
      response => {
        let option = createPieChartOption(response);
        createChart(option, consumeChartIns);
      }
    );
  }

  // 收入图表统计
  function incomeChartStat() {
    let para = proxy.addDateRange(queryParams.value, dateRange.value);
    getIncomeStat(para).then(
      response => {
        let option = createPieChartOption(response);
        createChart(option, consumeChartIns);
      }
    );
  }

  // 账户图表统计
  function accountChartStat() {
    const para = {
      groupType: "NAME"
    };
    getAccountStat(para).then(
      response => {
        let option = createPieChartOption(response);
        createChart(option, accountChartIns);
      }
    );
  }

  // 预算列表
  function loadBudgetList() {
    const para = {
      page: 0,
      status: 'ENABLE'
    };
    getBudgetList(para).then(
      response => {
        budgetList.value = response.rows;
      }
    );
  }

  /** 本期支付时间 */
  function formatCurrentPaidTime(row) {
    if (row.cpPaidTime) {
      return row.cpPaidTime.substr(5, 5) + '(已支付)';
    } else {
      if (row.nextPaytime) {
        let cpt = row.nextPaytime.substr(5, 5);
        if (row.leftDays == 0) {
          return cpt + '(今天)';
        } else if (row.leftDays < 0) {
          var ld = 0 - row.leftDays;
          return cpt + '(已过去' + ld + '天)';
        } else {
          var ld = row.leftDays;
          return cpt + '(' + ld + '天后)';
        }
      } else {
        return '--';
      }
    }
  }

  /** 本期支付金额 */
  function formatCurrentPaidAmount(row) {
    if (row.cpPaidAmount) {
      var ca = (row.cpPaidAmount - row.amount).toFixed(2);
      if (ca > 0) {
        return proxy.formatMoney(row.cpPaidAmount) + '(+' + ca + ')';
      } else if (ca < 0) {
        return proxy.formatMoney(row.cpPaidAmount) + '(-' + (0 - ca) + ')';
      } else {
        return proxy.formatMoney(row.cpPaidAmount);
      }
    } else {
      return '--';
    }
  }

  /** 进度 */
  function formatPercent(row) {
    let pp = getPercent(row.cpPaidAmount, row.amount);
    return parseInt(pp.toFixed(0));
  }

  /** 初始化 **/
  onMounted(() => {
    consumeChartIns = echarts.init(consumeChart.value, "macarons");
    accountChartIns = echarts.init(accountChart.value, "macarons");
    consumeChartStat();
    accountChartStat();
    loadBudgetList();
  })
</script>
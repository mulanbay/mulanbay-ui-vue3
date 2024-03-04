<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="预算周期" prop="statPeriod">
              <el-radio-group v-model="queryParams.statPeriod">
                <el-radio
                  v-for="dict in statPeriodOptions"
                  :key="dict.id"
                  :label="dict.id">{{dict.text}}</el-radio>
              </el-radio-group>
            </el-form-item>
           <el-form-item v-if="queryParams.statPeriod == 'YEARLY'" label="选择年份">
             <el-date-picker
               v-model="queryParams.year"
               type="year"
               value-format="YYYY"
               style="width: 120px"
               placeholder="选择年份">
             </el-date-picker>
           </el-form-item>
           <el-form-item v-if="queryParams.statPeriod == 'MONTHLY'" label="选择月份">
             <el-date-picker
               v-model="queryParams.yearMonth"
               type="month"
               value-format="YYYY-MM"
               style="width: 120px"
               placeholder="选择月份">
             </el-date-picker>
           </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:budgetLog:periodStat']">统计</el-button>
              <el-button icon="refresh" @click="resetQuery">重置</el-button>
              <el-button type="primary" icon="ArrowLeft" @click="getNext(-1)" v-hasPermi="['fund:budgetLog:periodStat']">往前</el-button>
              <el-button type="primary" icon="ArrowRight" @click="getNext(1)" v-hasPermi="['fund:budgetLog:periodStat']">往后</el-button>
              <el-button type="primary" icon="Operation" @click="handleDispatch('Finance')" v-hasPermi="['fund:budgetLog:list']">财务速览</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="16" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <div ref="statChart" :style="{height:height,margin:0 }" />
          </div>
          <div align="center">
            <el-button type="primary" icon="TrendCharts" @click="consumeChartStat">消费分析</el-button>
            <el-button type="primary" icon="TrendCharts" @click="incomeChartStat">收入分析</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" class="card-box">
        <el-card>
          <div slot="header" align="center"><span>{{ statData.bussKey }}消费&预算统计数据</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">名称</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">统计值</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">链接</div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3">
                    <el-divider content-position="center">
                      <span class="table-title">
                        <svg-icon icon-class="budget" />
                        统计数据
                      </span>
                    </el-divider>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">预算金额</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.budgetAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Budget')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">普通消费</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.ncAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Consume')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">突发消费</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.bcAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Consume')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">看病(自费)</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.trAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Treat')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">收入统计</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.incomeAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Income')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">总共消费</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(statData.totalAmount) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Consume')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <el-divider content-position="center">
                      <span class="table-title">
                        <svg-icon icon-class="budget" />
                        预算/消费比例
                      </span>
                    </el-divider>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      预算/消费比例
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{statData.monthConsumeBudgetRate}}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Consume')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span v-if="statData.totalConsume>statData.budgetAmount" style="color: red;">
                        超出预算
                        <el-tooltip content="总消费金额大于预算金额." effect="dark" placement="top">
                          <el-icon>
                            <QuestionFilled />
                          </el-icon>
                        </el-tooltip>
                      </span>
                      <span v-else style="color: green;">
                        低于预算
                        <el-tooltip content="总消费金额低于预算金额." effect="dark" placement="top">
                          <el-icon>
                            <QuestionFilled />
                          </el-icon>
                        </el-tooltip>
                      </span>
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{ formatMoney(statData.cb) }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Consume')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span v-if="statData.totalConsume>statData.incomeAmount" style="color: red;">
                        存款减少
                        <el-tooltip content="存款值=收入-总消费金额." effect="dark" placement="top">
                          <el-icon>
                            <QuestionFilled />
                          </el-icon>
                        </el-tooltip>
                      </span>
                      <span v-else style="color: green;">
                        存款增加
                        <el-tooltip content="存款值=收入-总消费金额." effect="dark" placement="top">
                          <el-icon>
                            <QuestionFilled />
                          </el-icon>
                        </el-tooltip>
                      </span>
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{ formatMoney(statData.ib) }}
                    </div>
                    </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Income')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span v-if="statData.accountChangeAmount==null">
                        账户变化
                      </span>
                      <span v-else-if="statData.accountChangeAmount<0" style="color: red;">
                        账户减少
                      </span>
                      <span v-else style="color: green;">
                        账户增加
                      </span>
                      <el-tooltip content="账户管理页面中的账户总值变化." effect="dark" placement="top">
                        <el-icon>
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">{{ formatMoney(Math.abs(statData.accountChangeAmount)) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('Account')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      账户/存款差率
                      <el-tooltip content="差率=(账户变化值-存款变化值)/存款变化值，代表着账户里的银行卡余额变化和系统的消费、收入统计数据之间的差值，数字越小说明越精确." effect="dark" placement="top">
                        <el-icon>
                          <QuestionFilled />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      {{ statData.aiv }}
                    </div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">
                      <span class="link-type" @click="handleDispatch('BudgetLog/valueErrorStat')"><el-icon><Promotion /></el-icon></span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>{{ statData.bussKey }}预算快照信息</span>
          </div>
          <!-- 列表 -->
          <SnapshotList ref="snapshotListRef" />
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script setup name="BudgetLogPeriodStat">
  import { getBudgetLogPeriodStat } from "@/api/fund/budgetLog";
  import { getIncomeStat } from "@/api/fund/income";
  import { fetchList as fetchSnapshotList } from "@/api/fund/budgetSnapshot";
  import { getConsumeAnalyseStat } from "@/api/consume/consume";
  import { copyObject, getQueryObject, getPercent } from "@/utils/mulanbay";
  import { getDay, getMonth } from "@/utils/datetime";
  import SnapshotList from '../budgetSnapshot/list.vue'

  import * as echarts from 'echarts';
  import { createChart, createPieChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  const snapshotListRef = ref();

  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  const height = ref('570px');

  const statPeriodOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    statData: {},
    queryParams: {
      statPeriod: 'MONTHLY',
      year: undefined,
      yearMonth: undefined
    }
  });

  const { statData, queryParams } = toRefs(data);

  /** 统计 */
  function handleDispatch(name) {
    //路由定向
    proxy.$router.push({ name: name, query: {} })
  }

  /** 往前往后 */
  function getNext(n) {
    const statPeriod = queryParams.value.statPeriod;
    if (statPeriod == 'YEARLY') {
      queryParams.value.year = (parseInt(queryParams.value.year) + n) + '';
    } else {
      const date = queryParams.value.yearMonth + '-01';
      let m = getMonth(n, date);
      queryParams.value.yearMonth = m.substring(0, 7);
    }
    dataStat();
  }

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getDictItemTree('BUDGET_STAT_PERIOD', false).then(response => {
      statPeriodOptions.value = response;
    });
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    dataStat();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    dataStat();
  }

  /** 计算运营日 */
  function getDateRange() {
    let ds = undefined;
    if (queryParams.value.statPeriod == 'YEARLY') {
      let year = queryParams.value.year;
      ds = [year+'-01-01',year+'-12-31'];
    } else {
      const date = queryParams.value.yearMonth + '-01';
      ds = proxy.getMonthDateRange(new Date(date.replace(/-/, "/")));
    }
    return { startDate: ds[0], endDate: ds[1] };
  }

  // 数据统计
  function dataStat() {
    const statPeriod = queryParams.value.statPeriod;
    let para = { bussKey: undefined };
    if (statPeriod == 'YEARLY') {
      para.bussKey = queryParams.value.year;
    } else {
      para.bussKey = queryParams.value.yearMonth.replace('-', '');
    }
    getBudgetLogPeriodStat(para).then(
      response => {
        if (response == null) {
          proxy.$modal.msgError('没有相关数据');
          return;
        }
        statData.value = response;
        //预算和消费差值
        let aa = response.budgetAmount - response.totalAmount;
        statData.value.cb = Math.abs(aa);
        //收入与消费差值
        let bb = response.incomeAmount - response.totalAmount;
        statData.value.ib = Math.abs(bb);
        //账户/存款差率
        if (bb == 0 || response.accountChangeAmount == null) {
          statData.value.aiv = null;
        } else {
          let aiv = getPercent(response.accountChangeAmount - bb, statData.value.ib);
          statData.value.aiv = aiv + '%';
        }
        //消费/预算比例
        let monthConsumeBudgetRate = getPercent(response.totalAmount, response.budgetAmount);
        statData.value.monthConsumeBudgetRate = parseInt(monthConsumeBudgetRate);
        //统计
        consumeChartStat();
        //预算快照
        getBudgetSnapshotList(response.logId);
      }
    );
  }

  /** 列表 */
  function getBudgetSnapshotList(budgetLogId) {
    let para = {
      budgetLogId: budgetLogId,
      page: 0
    };
    fetchSnapshotList(para).then(
      response => {
        snapshotListRef.value.showData(response.rows);
      }
    );
  }

  // 消费图表统计
  function consumeChartStat() {
    let para = getDateRange();
    para.groupField = 'goods_type_id';
    para.type = 'TOTAL_PRICE';
    para.chartType = 'PIE';
    getConsumeAnalyseStat(para).then(
      response => {
        let option = createPieChartOption(response);
        createChart(option, statChartIns);
      }
    );
  }

  // 收入图表统计
  function incomeChartStat() {
    let para = getDateRange();
    getIncomeStat(para).then(
      response => {
        let option = createPieChartOption(response);
        createChart(option, statChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    statChartIns = echarts.init(statChart.value, "macarons");
    loadOptions();
    let qb = getQueryObject(null);
    if (!proxy.isEmpty(qb.date)) {
      if (qb.date.length == 4) {
        //年
        queryParams.value.statPeriod = 'YEARLY';
        queryParams.value.year = qb.date;
      } else {
        //月
        queryParams.value.statPeriod = 'MONTHLY';
        queryParams.value.yearMonth = qb.date;
      }
    } else {
      //默认月
      queryParams.value.statPeriod = 'MONTHLY';
      const day = getDay(0);
      //默认取上一个月
      const md = getMonth(-1, day);
      queryParams.value.yearMonth = md.substring(0, 7);
    }
    dataStat();
  })
</script>
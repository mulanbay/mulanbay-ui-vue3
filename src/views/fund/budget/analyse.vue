<template>
  <div class="app-container">
    <!-- 表单编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="870px" append-to-body class="customDialogCss">
      <div>
        <el-form ref="queryRef" :model="queryParams" :inline="true">
          <el-form-item label="周期类型" prop="period">
            <el-select
              v-model="queryParams.period"
              placeholder="周期"
              clearable
              style="width: 120px">
              <el-option
                v-for="dict in periodOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="queryParams.period == 'YEARLY'" label="选择年份">
            <el-date-picker
              v-model="queryParams.year"
              type="year"
              value-format="YYYY"
              style="width: 120px"
              placeholder="选择年份">
            </el-date-picker>
          </el-form-item>
          <el-form-item v-if="queryParams.period == 'MONTHLY'" label="选择月份">
            <el-date-picker
              v-model="queryParams.yearMonth"
              type="month"
              value-format="YYYY-MM"
              style="width: 120px"
              placeholder="选择月份">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="TrendCharts" @click="handleQuery">统计</el-button>
            <el-button icon="refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="el-table el-table--enable-row-hover el-table--medium">
        <table cellspacing="0" style="width: 100%;">
          <tbody>
            <tr>
              <td class="el-table__cell is-leaf">
                <div class="cell">预算金额</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.budget) }}</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">消费/预算比例</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ getPercent(fundStat.totalConsume,fundStat.budget)+'%' }}</div>
              </td>
            </tr>
            <tr>
              <td class="el-table__cell is-leaf">
                <div class="cell">总消费</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.totalConsume) }}</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">普通消费</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.ncAmount) }}</div>
              </td>
            </tr>
            <tr>
              <td class="el-table__cell is-leaf">
                <div class="cell">突发消费</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.bcAmount) }}</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">看病花费</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.trAmount) }}</div>
              </td>
            </tr>
            <tr>
              <td class="el-table__cell is-leaf">
                <div class="cell">收入</div>
              </td>
              <td class="el-table__cell is-leaf">
                <div class="cell">{{ formatMoney(fundStat.income) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <!--列表数据-->
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="预算名称" min-width="140px" :show-overflow-tooltip="true">
            <template #default="scope">
              <span class="link-type">{{ scope.row.budgetName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="预算金额" align="center" width="95">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" align="center" width="70">
            <template #default="scope">
              <span>{{ scope.row.typeName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="周期类型" align="center" width="90">
            <template #default="scope">
              <span>{{ scope.row.periodName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="系数" align="center" width="60">
            <template #default="scope">
              <span>{{ scope.row.drate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总金额" align="center" width="120">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.ttAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="百分比" align="center" width="95">
            <template #default="scope">
              <span>{{ scope.row.pp }}</span>
            </template>
          </el-table-column>
          <el-table-column label="占据收入" align="center" width="95">
            <template #default="scope">
              <span>{{ scope.row.bir }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </el-dialog>
  </div>
</template>

<script setup name="BudgetAnalyse">
  import { getBudgetAnalyse } from "@/api/fund/budget";
  import { getPercent } from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('预算');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const dataList = ref([]);

  const periodOptions = ref([{
      id: 'MONTHLY',
      text: '月度预算'
    },
    {
      id: 'YEARLY',
      text: '年度预算'
    }
  ]);

  const data = reactive({
    fundStat: {},
    queryParams: {
      period: 'MONTHLY',
      yearMonth: proxy.getFormatDate(new Date(), "yyyy-MM")
    },
    rules: []
  });

  const { fundStat, queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    open.value = true;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {

  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 计算运营日 */
  function getBussDay(period) {
    if (period == 'YEARLY') {
      return queryParams.value.year + '-01-01';
    } else {
      return queryParams.value.yearMonth + '-01';
    }
  }

  /** 获取数据 **/
  function getList() {
    const period = queryParams.value.period;
    queryParams.value.date = getBussDay(period);
    loading.value = true;
    getBudgetAnalyse(queryParams.value).then(
      response => {
        //表单数据
        fundStat.value = response.fundStat;
        dataList.value = response.budgetList;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
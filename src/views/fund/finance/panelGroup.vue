<template>
  <el-row :gutter="16" class="panel-group">
    <el-col :span="6">
      <div class="statistic-card">
        <el-statistic :value="(consumeData.monthConsumeAmount+consumeData.totalTreatAmount)" prefix="￥">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              本月花费
              <el-tooltip
                effect="dark"
                content="当前月的消费总额"
                placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>本月预算</span>
            <span class="green">
              {{formatMoney(consumeData.monthBudget)}}
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
          <div class="footer-item">
            <span>消费占比</span>
            <span class="green">
              {{'&nbsp;'+consumeData.rateStr}}
            </span>
          </div>
          <div class="footer-item">
            <span>本月预测</span>
            <span class="green">
              {{formatMoney(consumeData.monthPredict)}}
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="statistic-card">
        <el-statistic :value="consumeData.yearBudget" prefix="￥">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              今年预算
              <el-tooltip
                effect="dark"
                content="今年的预算消费总额"
                placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>今年预测</span>
            <span class="green">
              {{formatMoney(consumeData.yearPredict)}}
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="statistic-card">
        <el-statistic :value="consumeData.totalIncome" prefix="￥">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              本月收入
              <el-tooltip
                effect="dark"
                content="这个月的总收入"
                placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="statistic-card">
        <el-statistic :value="consumeData.monthPassDays" suffix="天">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              本月过去
              <el-tooltip
                effect="dark"
                content="截止今天"
                placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>本月总天数</span>
            <span class="green">
              {{consumeData.monthDays}}天
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup name="IncomeStat">
  import { generalStat } from "@/api/main";
  import { getFirstDayOfMonth, getLastDayOfMonth } from "@/utils/datetime";
  import { getPercent } from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();

  const data = reactive({
    consumeData: {
      monthBudget: 0,
      monthConsumeAmount: 0,
      totalTreatAmount: 0
    }
  });

  const { consumeData } = toRefs(data);

  function handleGeneralStat() {
    let nowDate = new Date();
    const para = {
      startDate: getFirstDayOfMonth(nowDate),
      endDate: getLastDayOfMonth(nowDate)
    };
    generalStat(para).then(
      response => {
        consumeData.value = response;
        let rate = getPercent(response.monthConsumeAmount + response.totalTreatAmount, response.monthBudget);
        consumeData.value.rateStr = rate.toFixed(1) + '%';
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    handleGeneralStat();
  })
</script>
<style scoped>
  :global(h2#card-usage ~ .example .example-showcase) {
    background-color: var(--el-fill-color) !important;
  }

  .el-statistic {
    --el-statistic-content-font-size: 28px;
  }

  .statistic-card {
    height: 100%;
    padding: 20px;
    border-radius: 4px;
    background-color: var(--el-bg-color-overlay);
  }

  .statistic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
  }

  .statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .statistic-footer .footer-item span:last-child {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
  }

  .green {
    color: var(--el-color-success);
  }

  .red {
    color: var(--el-color-error);
  }
</style>
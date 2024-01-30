<template>
  <el-row :gutter="16" class="panel-group">
    <el-col :span="6">
      <el-card body-style="height:200px">
        <div class="statistic-card">
          <el-statistic :value="(monthStat.totalConsume)" prefix="￥">
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
              <span class="red">
                {{formatMoney(monthStat.budget)}}
              </span>
            </div>
            <div class="footer-item">
              <span>消费占比</span>
              <span class="red">
                {{'&nbsp;'+getPercent(monthStat.totalConsume,monthStat.budget)}}%
                <el-tooltip content="已经消费金额/预算金额" effect="dark" placement="top">
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </div>
            <div class="footer-item">
              <span>本月预测</span>
              <span class="red">
                {{formatMoney(monthStat.consumePredict)}}
              </span>
            </div>
            <div class="footer-item">
              <span>本月收入</span>
              <span class="green">
                {{formatMoney(monthStat.income)}}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card body-style="height:200px">
        <div class="statistic-card">
          <el-statistic :value="(monthStat.consumeCount)" suffix="次">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                本月消费分析
                <el-tooltip
                  effect="dark"
                  content="本月消费分析"
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
              <span>普通消费</span>
              <span class="red">
                {{formatMoney(monthStat.ncAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>突发消费</span>
              <span class="red">
                {{formatMoney(monthStat.bcAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>看病消费</span>
              <span class="red">
                {{formatMoney(monthStat.trAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>本月过去</span>
              <span class="green">
                {{monthStat.passDays+'天&nbsp;(剩'+(monthStat.totalDays-monthStat.passDays)+'天)'}}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card body-style="height:200px">
        <div class="statistic-card">
          <el-statistic :value="(yearStat.totalConsume)" prefix="￥">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                今年花费
                <el-tooltip
                  effect="dark"
                  content="今年的消费总额"
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
              <span>今年预算</span>
              <span class="red">
                {{formatMoney(yearStat.budget)}}
              </span>
            </div>
            <div class="footer-item">
              <span>消费占比</span>
              <span class="red">
                {{'&nbsp;'+getPercent(yearStat.totalConsume,yearStat.budget)}}%
                <el-tooltip content="已经消费金额/预算金额" effect="dark" placement="top">
                  <el-icon>
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </div>
            <div class="footer-item">
              <span>今年预测</span>
              <span class="red">
                {{formatMoney(yearStat.consumePredict)}}
              </span>
            </div>
            <div class="footer-item">
              <span>今年收入</span>
              <span class="green">
                {{formatMoney(yearStat.income)}}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card body-style="height:200px">
        <div class="statistic-card">
          <el-statistic :value="(yearStat.consumeCount)" suffix="次">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                今年消费分析
                <el-tooltip
                  effect="dark"
                  content="今年消费分析"
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
              <span>普通消费</span>
              <span class="red">
                {{formatMoney(yearStat.ncAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>突发消费</span>
              <span class="red">
                {{formatMoney(yearStat.bcAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>看病消费</span>
              <span class="red">
                {{formatMoney(yearStat.trAmount)}}
              </span>
            </div>
            <div class="footer-item">
              <span>今年过去</span>
              <span class="green">
                {{yearStat.passDays+'天&nbsp;('+getPercent(yearStat.passDays,yearStat.totalDays)+'%)'}}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup name="IncomeStat">
  import { generalStat } from "@/api/main";
  import { getFirstDayOfMonth, getLastDayOfMonth } from "@/utils/datetime";
  import { getPercent } from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();

  const data = reactive({
    monthStat: {},
    yearStat: {}
  });

  const { monthStat, yearStat } = toRefs(data);

  function handleGeneralStat() {
    generalStat().then(
      response => {
        monthStat.value = response.monthStat;
        yearStat.value = response.yearStat;
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
    white-space: normal;
    width: 200px;
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
<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-row>
        <el-col :span="14" class="card-box">
          <el-card>
            <div class="chart-wrapper" v-loading="loading">
              <!--图表数据-->
              <div ref="statChart" :style="{height:height,margin:0 }" />
            </div>
            <div align="center">
            </div>
          </el-card>
        </el-col>

        <el-col :span="10" class="card-box">
          <el-card>
            <div slot="header" align="center">
              <span>统计数据&nbsp; &nbsp; </span>
            </div>
            <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
                <thead>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">字段</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">统计值</div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总次数</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ statData.totalCount }}次</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总挂号费</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.regFee) }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总药费</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.drugFee) }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总手术费</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.operationFee) }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总医保支付费用</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.miFee) }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总个人支付费用</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.pdFee) }}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">总费用</div>
                    </td>
                    <td class="el-table__cell is-leaf">
                      <div class="cell">{{ formatMoney(statData.totalFee) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </el-col>

      </el-row>

    </div>
  </el-dialog>

</template>

<script setup name="FullStatFeeDetail">
  import * as echarts from 'echarts';
  import { createChart } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const statChart = ref(null);
  //echarts实例
  let statChartIns = ref(null);
  //是否初始化
  let chartInited = ref(false);
  const height = ref('340px');

  const loading = ref(false);
  //可执行时间段
  const title = ref('统计');
  const open = ref(false);

  const data = reactive({
    statData: {},
    rules: {}
  });

  const { statData, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (sd) => {
    open.value = true;
    title.value = '[' + sd.tags + ']费用统计';
    statData.value = sd;
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

  /** 图表 */
  function initChart() {
    let option = {
      title: {
        show: true,
        top: 'auto',
        bottom: 'auto',
        text: "["+statData.value.tags+"]费用统计",
        x: 'center',
        y: 'top',
        textAlign: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        x: 'center',
        y: 'bottom',
        padding:[100,0,0,0],
        data: ["医保支付", "个人支付", "挂号费", "药费", "手术费"]
      },
      series: [{
          name: '医保/个人',
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '30%'],
          data: [{
            "name": "医保支付",
            "value": statData.value.miFee
          }, {
            "name": "个人支付",
            "value": statData.value.pdFee
          }]
        },
        {
          name: '分项费用',
          type: 'pie',
          radius: ['45%', '60%'],
          labelLine: {
            length: 30
          },
          label: {
            alignTo: 'labelLine', //labelLine
            formatter: '{name|{b}}\n{time|{c} ' + '元' + ' ({d}%)}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
            rich: {
              time: {
                fontSize: 12,
                color: '#460000'
              }
            }
          },
          data: [{
            "name": "挂号费",
            "value": statData.value.regFee
          }, {
            "name": "药费",
            "value": statData.value.drugFee
          }, {
            "name": "手术费",
            "value": statData.value.operationFee
          }]
        }
      ]
    };
    createChart(option, statChartIns);
  }



  /** 初始化 **/
  onMounted(() => {})
</script>
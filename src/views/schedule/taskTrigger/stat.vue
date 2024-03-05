<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryFormRef" :inline="true">
            <el-form-item label="自动刷新" prop="seconds">
              <el-input-number
                v-model="seconds"
                :precision="0"
                style="width: 120px"
                @blur="updateRefreshInterval" />秒
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['schedule:taskTrigger:stat']">统计</el-button>
            </el-form-item>
            <el-form-item>
              <span v-if="dataLoading==true" class="link-type" style="color:red ;">
                <el-icon>
                  <Loading />
                </el-icon>数据刷新中
              </span>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="14" class="card-box">
        <el-card>
          <div class="chart-wrapper" align="center">
            <div ref="triggerStatChart" :style="{height:height,margin:0 }" />
          </div>
          <div align="center">
            <el-select
              v-model="groupField"
              placeholder="分组类型"
              collapse-tags
              style="width: 160px"
              @change="initChart">
              <el-option
                v-for="dict in groupFieldOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10" class="card-box" align="center">
        <el-card>
          <el-divider content-position="center">调度信息</el-divider>
          <el-descriptions class="margin-top" :column="1" border v-loading="scheduleInfoLoading">
            <el-descriptions-item width="180px">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  服务器节点
                </div>
              </template>
              {{ scheduleData.deployId}}
            </el-descriptions-item>
            <el-descriptions-item width="180px">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <ChatLineRound />
                  </el-icon>
                  调度是否启用
                </div>
              </template>
              <span v-if="scheduleData.schedule==true">
                <el-icon color="green">
                  <SuccessFilled />
                </el-icon>
              </span>
              <span v-else>
                <el-icon color="red">
                  <CircleCloseFilled />
                </el-icon>
              </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  支持分布式
                </div>
              </template>
              <span v-if="scheduleData.distriable==true">
                <el-icon color="green">
                  <SuccessFilled />
                </el-icon>
              </span>
              <span v-else>
                <el-icon color="red">
                  <CircleCloseFilled />
                </el-icon>
              </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  是否定时检查
                </div>
              </template>
              <span v-if="scheduleData.check==true">
                <el-icon color="green">
                  <SuccessFilled />
                </el-icon>
              </span>
              <span v-else>
                <el-icon color="red">
                  <CircleCloseFilled />
                </el-icon>
              </span>
            </el-descriptions-item>
            <el-descriptions-item span="4">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <HomeFilled />
                  </el-icon>
                  定时检查周期
                </div>
              </template>
              {{ scheduleData.interval+'秒'}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Ticket />
                  </el-icon>
                  被调度的任务数
                </div>
              </template>
              {{ scheduleData.scheduleJobsCount+'个'}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Ticket />
                  </el-icon>
                  执行中的任务数
                </div>
              </template>
              {{ scheduleData.currentlyExecutingJobsCount+'个'}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Ticket />
                  </el-icon>
                  线程池活跃数
                </div>
              </template>
              {{ scheduleData.threadPoolActiveCount+'个'}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <Ticket />
                  </el-icon>
                  线程池已运行数
                </div>
              </template>
              {{ scheduleData.threadPoolCompletedTaskCount+'个'}}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div v-loading="timelineLoading" class="chart-wrapper">
            <div ref="timelineChart" :style="{height:timelineHeight,margin:0 }" />
          </div>
        </el-card>
      </el-col>

    </el-row>

  </div>
</template>

<script setup name="TaskTriggerStat">
  import { getTaskTriggerStat,getScheduleStat,getScheduleInfo } from "@/api/schedule/taskTrigger";
  import * as echarts from 'echarts';
  import { createChart, createPieChartOption, createLineChartOption } from "@/utils/mulanbay_echarts";

  const { proxy } = getCurrentInstance();
  //图形实例
  const triggerStatChart = ref(null);
  //echarts实例
  let triggerStatChartIns = ref(null);

  const height = ref('380px');
  //自动刷新
  let seconds = ref(10);
  const timer = ref();
  const dataLoading = ref(false);
  const groupField = ref('LAST_EXECUTE_RESULT');
  const groupFieldOptions = ref([]);
  const scheduleData = ref({});
  const scheduleInfoLoading = ref(false);
  const cecJobsList = ref([]);
  
  const timelineLoading = ref(false);
  const timelineHeight = ref('450px');

  //图形实例
  const timelineChart = ref(null);
  //echarts实例
  let timelineChartIns = ref(null);

  const data = reactive({
    form: {},
    queryParams: {
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 搜索按钮操作 */
  function handleQuery() {
    loadScheduleInfo();
    initTimeLineChart();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }


  /** 自动刷新 */
  function updateRefreshInterval() {
    clearInterval(timer.value);
    if (!proxy.isEmpty(seconds.value) && seconds.value > 0) {
      timer.value = setInterval(() => {
        handleQuery();
      }, seconds.value * 1000)
    }
  }
  
  /** 加载数据 */
  function loadScheduleInfo() {
    scheduleData.value = {};
    cecJobsList.value = [];
    scheduleInfoLoading.value = true;
    getScheduleInfo().then(response => {
      scheduleInfoLoading.value = false;
      scheduleData.value = response.scheduleInfo;
      //调度列表
      const ceJobs = response.currentlyExecutingJobs;
      let ceList = new Array();
      if (ceJobs != null && ceJobs.length > 0) {
        for (let i = 0; i < ceJobs.length; i++) {
          let row = {
            id: ceJobs[i].id,
            name: ceJobs[i].name
          };
          ceList.push(row);
        }
      }
      cecJobsList.value = ceJobs;
    });
  }

  function initTimeLineChart() {
    getScheduleStat().then(
      response => {
        response.smooth = true;
        //组装chart数据
        let option = createLineChartOption(response);
        createChart(option, timelineChartIns);
      }
    );
  }

  function initChart() {
    dataLoading.value = true;
    let para ={
      groupField:groupField.value
    }
    getTaskTriggerStat(para).then(
      response => {
        dataLoading.value = false;
        //组装chart数据
        let option = createPieChartOption(response);
        createChart(option, triggerStatChartIns);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    //初始化
    triggerStatChartIns = echarts.init(triggerStatChart.value, "macarons");
    timelineChartIns = echarts.init(timelineChart.value, "macarons");
    initChart();
    initTimeLineChart();
    loadScheduleInfo();
    //每秒检查参数
    timer.value = setInterval(() => {
      handleQuery();
    }, seconds.value * 1000);
    proxy.getEnumDict('TriggerGroupField', 'FIELD', false).then(response => {
      groupFieldOptions.value = response;
    });
  })

  /** 关闭前 **/
  onUnmounted(() => {
    clearInterval(timer.value);
  })
</script>
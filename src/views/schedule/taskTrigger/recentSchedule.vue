<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="recentScheduleTitle" v-model="recentScheduleOpen" width="550px" append-to-body class="customDialogCss">

    <!--列表数据-->
    <el-timeline v-loading="recentScheduleLoading">
      <template v-for="item in dataList">
        <el-timeline-item :timestamp="item.timestamp" :type="item.type" placement="top">
          <el-card class="box-card">
            <div>
              <el-descriptions class="margin-top" :column="1" border>
                <el-descriptions-item width="80px" align="center">
                  <template #label>
                    <div class="cell-item">
                      <el-icon>
                        <InfoFilled />
                      </el-icon>
                      调度名称
                    </div>
                  </template>
                  {{ item.content }}
                </el-descriptions-item>
                <el-descriptions-item width="80px" align="center">
                  <template #label>
                    <div class="cell-item">
                      <el-icon>
                        <Clock />
                      </el-icon>
                      剩余时间
                    </div>
                  </template>
                  <el-countdown title="距离现在" :value="item.nextExecuteTime" />
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-timeline-item>
      </template>
    </el-timeline>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['schedule:taskTrigger:recentSchedules']">刷新</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="TaskTriggerRecentSchedule">
  import { recentSchedules } from "@/api/schedule/taskTrigger";
  import { getNowDateString } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const recentScheduleTitle = ref('24H调度信息');
  const recentScheduleOpen = ref(false);
  const recentScheduleLoading = ref(false);

  const dataList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openRecentSchedule = async () => {
    recentScheduleOpen.value = true;
    loadRecentSchedule();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openRecentSchedule });

  function loadRecentSchedule() {
    resetForm();
    recentScheduleLoading.value = true;
    let para = {
      page: 0,
      pageSize : 0,
      period: true
    };
    recentSchedules(para).then(response => {
      recentScheduleLoading.value = false;
      let datas = response;
      const n = datas.length;
      const now = getNowDateString();
      for (let i = 0; i < n; i++) {
        let timestamp = datas[i].nextExecuteTime.substr(11, 5);
        if (datas[i].nextExecuteTime.substr(0, 10) != now) {
          timestamp += '(明天)';
        }
        let net = (datas[i].nextExecuteTime == null ? datas[i].firstExecuteTime : datas[i].nextExecuteTime);
        let row = {
          content: datas[i].triggerName,
          timestamp: timestamp,
          nextExecuteTime: (new Date(net.replace(/-/, "/"))),
          type: 'primary'
        };
        dataList.value.push(row);
      }
    });
  }

  function refresh() {
    loadRecentSchedule();
  }

  // 表单重置
  function resetForm() {
    dataList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
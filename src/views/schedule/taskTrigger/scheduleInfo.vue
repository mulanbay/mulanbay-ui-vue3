<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="scheduleInfoTitle" v-model="scheduleInfoOpen" width="680px" append-to-body class="customDialogCss">
    <el-divider content-position="center">调度信息</el-divider>
    <el-descriptions class="margin-top" :column="2" border v-loading="scheduleInfoLoading">
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
        <span v-if="scheduleData.enabled==true">
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
    </el-descriptions>

    <el-divider content-position="center">正在执行中的调度</el-divider>

    <el-table :data="cecJobsList" v-loading="scheduleInfoLoading">
      <el-table-column label="编号" prop="key" align="center" width="60">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度名称" prop="value" align="center">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度信息" prop="value" align="center" width="80">
        <template #default="scope">
          <span>--</span>
        </template>
      </el-table-column>
    </el-table>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['schedule:taskTrigger:scheduleInfo']">刷新</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="TaskTriggerScheduleInfo">
  import { getScheduleInfo } from "@/api/schedule/taskTrigger";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const scheduleInfoTitle = ref('调度详情');
  const scheduleInfoOpen = ref(false);
  const scheduleInfoLoading = ref(false);

  const scheduleData = ref();
  const cecJobsList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openScheduleInfo = async () => {
    scheduleInfoOpen.value = true;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
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

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openScheduleInfo });

  // 表单重置
  function resetForm() {
    scheduleData.value = {};
    cecJobsList.value = [];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
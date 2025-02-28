<template>

  <!-- 时间详情对话框 -->
  <el-dialog :title="timeInfoTitle" v-model="timeInfoOpen" width="550px" append-to-body >

    <!--列表数据-->
    <el-timeline v-loading="timeInfoLoading">
      <el-timeline-item :timestamp="'首次执行时间:'+triggerData.firstExecuteTime" type="primary" placement="top" icon="Message">
        <el-card class="box-card">
          <div>
            <el-text class="mx-1" type="primary">{{ triggerData.fetDesc }}</el-text>
          </div>
        </el-card>
      </el-timeline-item>
      <el-timeline-item :timestamp="'相距间隔:'+triggerData.fletDesc" type="success" placement="top">
      </el-timeline-item>
      <el-timeline-item :timestamp="'最近一次执行时间:'+triggerData.lastExecuteTime" type="primary" placement="top" icon="StarFilled">
        <el-card class="box-card">
          <div>
            <el-text class="mx-1" type="danger">{{ triggerData.letDesc }}</el-text>
          </div>
        </el-card>
      </el-timeline-item>
      <el-timeline-item :timestamp="'相距间隔:'+triggerData.lnetDesc" type="success" placement="top">
      </el-timeline-item>
      <el-timeline-item :timestamp="'下一次执行时间:'+triggerData.nextExecuteTime" type="primary" placement="top" icon="Promotion">
        <el-card class="box-card">
          <div>
            <el-countdown 
            title="距离现在" 
            format="MM个月DD天 HH:mm:ss"
            value-style="color:#9acd32 ;"
            :value="triggerData.net" />
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['schedule:taskTrigger:get']">刷新</el-button>
      <el-button type="danger" icon="Close" @click="timeInfoOpen=false" >关闭</el-button>
      
    </div>

  </el-dialog>

</template>

<script setup name="TaskTriggerTimeInfo">
  import { getTaskTrigger } from "@/api/schedule/taskTrigger";
  import { tillNowSeconds,tillNowString,formatSeconds } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const timeInfoTitle = ref('调度时间信息');
  const timeInfoOpen = ref(false);
  const timeInfoLoading = ref(false);

  const triggerId = ref({});
  const triggerData = ref({});

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    timeInfoOpen.value = true;
    triggerId.value = id;
    loadTimeInfo();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function loadTimeInfo() {
    resetForm();
    timeInfoLoading.value = true;
    getTaskTrigger(triggerId.value).then(response => {
      timeInfoLoading.value = false;
      triggerData.value = response;
      timeInfoTitle.value = '调度('+response.triggerName+')时间信息';
      //首次执行时间
      let fetSecs = tillNowSeconds(null,triggerData.value.firstExecuteTime);
      triggerData.value.fetDesc = tillNowString(fetSecs);
      //最近一次执行时间
      let letSecs = tillNowSeconds(null,triggerData.value.lastExecuteTime);
      triggerData.value.letDesc = tillNowString(letSecs);
      //下一次执行时间
      let net = triggerData.value.nextExecuteTime;
      if(net==null){
        net = triggerData.value.firstExecuteTime;
      }
      triggerData.value.net = (new Date(net.replace(/-/, "/")));
      let netSecs = tillNowSeconds(null,net);
      triggerData.value.netDesc = tillNowString(netSecs);
      //首次执行时间--最近一次执行时间，间隔
      let fletSecs = tillNowSeconds(triggerData.value.lastExecuteTime,triggerData.value.firstExecuteTime);
      triggerData.value.fletDesc = formatSeconds(Math.abs(fletSecs));
      //最近一次执行时间--下一次执行时间，间隔
      let lnetSecs = tillNowSeconds(triggerData.value.lastExecuteTime,net);
      triggerData.value.lnetDesc = formatSeconds(Math.abs(lnetSecs));
    });
  }

  function refresh() {
    loadTimeInfo();
  }

  // 表单重置
  function resetForm() {
    triggerData.value = {};
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
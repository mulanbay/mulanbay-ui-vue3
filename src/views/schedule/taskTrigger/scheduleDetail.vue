<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="scheduleDetailTitle" v-model="scheduleDetailOpen" width="850px" append-to-body class="customDialogCss">
    <el-row>
      <el-col :span="24" align="center">
        <el-card>
          <div>
            <el-descriptions class="margin-top" :column="1" border>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <house />
                    </el-icon>
                    加入调度器时间
                  </div>
                </template>
                <span v-if="scheduleInfo.addToScheduleTime!=null" class="link-type" style="color:red ;">
                  {{ scheduleInfo.addToScheduleTime +' ('+scheduleInfo.tillNow+')'}}
                </span>
              </el-descriptions-item>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <user />
                    </el-icon>
                    调度运行状态
                  </div>
                </template>
                <span v-if="scheduleInfo.isExecuting==true" class="link-type" style="color:red ;">
                  <i class="loading"></i>正在运行中
                </span>
                <span v-else>未运行</span>
                <el-button link icon="refresh" type="success" @click="loadData" v-hasPermi="['schedule:taskTrigger:lockKey']">刷新</el-button>
              </el-descriptions-item>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <Tools />
                    </el-icon>
                    调度锁
                  </div>
                </template>
                <el-button link icon="InfoFilled" type="success" @click="showLockKey" v-hasPermi="['schedule:taskTrigger:lockKey']">详情</el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">数据比对</el-divider>
    <el-row>
      <el-col :span="24" class="card-box" align="center">
        <!--数据-->
        <div style="padding: 0px 20px 0px 20px;">
          <el-steps align-center>
            <el-step title="数据库中数据" status="success" icon="coin"></el-step>
            <el-step title="调度服务器中数据" status="finish" icon="MessageBox"></el-step>
          </el-steps>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <el-table
              :data="dbDataList"
              row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="值"  :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.text }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <el-table
              :data="scheduleDataList"
              row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="值"  :show-overflow-tooltip="true">
                <template #default="scope">
                  <span v-if="isChanged(scope.row.text)" style="color: red;">{{ scope.row.text }}</span>
                  <span v-else>{{ scope.row.text }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </el-dialog>

  <!-- 调度锁信息 -->
  <LockKey ref="lockKeyRef" />
  
</template>

<script setup name="TaskTriggerScheduleDetail">
  import { getScheduleDetail } from "@/api/schedule/taskTrigger";
  import { tillNowSeconds, tillNowString } from "@/utils/datetime";
  import {parseJsonToTree} from "@/utils/mulanbay";
  import LockKey from './lockKey.vue'

  const { proxy } = getCurrentInstance();
  const lockKeyRef = ref();

  //可执行时间段
  const scheduleDetailTitle = ref('调度详情');
  const scheduleDetailOpen = ref(false);

  const dbDataList = ref([]);
  const scheduleDataList = ref();
  const formTriggerId = ref();

  const data = reactive({
    scheduleInfo: {}
  });
  const { scheduleInfo } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openScheduleDetail = async (triggerId) => {
    scheduleDetailOpen.value = true;
    formTriggerId.value = triggerId;
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openScheduleDetail });
  
  /** 加载数据 */
  function isChanged(s){
    if(proxy.isEmpty(s)){
      return false;
    }else{
      s=''+s;
      return s.indexOf("***")!=-1;
    }
  }
  
  /** 加载数据 */
  function loadData(){
    resetForm();
    getScheduleDetail(formTriggerId.value).then(response => {
      let diTree = parseJsonToTree(response.dbInfo);
      dbDataList.value = diTree;
      if (response.scheduleInfo != null) {
        let dbData = response.dbInfo ; 
        let siData = response.scheduleInfo ; 
        let datas = new Array();
        //不相同的增加标识
        for(let key in siData){
          if(siData[key]!= dbData[key]){
            siData[key] = siData[key]+'***';
          }
        }
        let siTree = parseJsonToTree(siData);
        scheduleDataList.value = siTree;
      }
      let ts = tillNowSeconds(null, response.addToScheduleTime);
      let tillNow = tillNowString(ts);
      scheduleInfo.value = {
        addToScheduleTime: response.addToScheduleTime,
        tillNow: tillNow,
        isExecuting: response.isExecuting
      };
    });
  }

  // 表单重置
  function resetForm() {
    scheduleInfo.value = {};
    dbDataList.value=[];
    scheduleDataList.value=[];
  }

  /** 提交表单 */
  function submitscheduleDetail() {
    proxy.$refs["scheduleDetailFormRef"].validate(valid => {
      if (valid) {
        scheduleDetail(scheduleDetailForm.value).then(response => {
          proxy.$modal.msgSuccess("调度成功");
          scheduleDetailOpen.value = false;
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 调度锁详情 */
  function showLockKey() {
    lockKeyRef.value.showData(formTriggerId.value);
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
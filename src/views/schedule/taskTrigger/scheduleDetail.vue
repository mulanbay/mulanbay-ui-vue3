<template>
  
  <!-- 调度详情对话框 -->
  <el-dialog :title="scheduleDetailTitle" v-model="scheduleDetailOpen" width="850px" append-to-body class="customDialogCss">
    <!--调度比较数据-->
    <el-row>
      <el-col :span="24" align="center">
        <el-card>
            <div>
              <el-descriptions class="margin-top" :column="1" border >
                <el-descriptions-item width="150px">
					<template #label>
					  <div class="cell-item">
						<el-icon><house /></el-icon>
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
						<el-icon><user /></el-icon>
						调度运行状态
					  </div>
					</template>
					<span v-if="scheduleInfo.isExecuting==true" class="link-type" style="color:red ;">
					  <i class="loading"></i>正在运行中
					</span>
					<span v-else>未运行</span>
				</el-descriptions-item>
              </el-descriptions>
            </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">数据比对</el-divider>
    <el-row>
	  <el-col :span="24" class="card-box"  align="center">
		  <!--数据-->
		  <div style="padding: 0px 20px 0px 20px;">
			<el-steps align-center>
			  <el-step title="数据库中数据" status="success" icon="coin"></el-step>
			  <el-step title="调度服务器中数据" status="finish" icon="upload"></el-step>
			</el-steps>
		  </div>
	  </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="card-box"  align="center">
        <el-card>
          <div class="chart-wrapper">
            <DBDataDetail ref="dbDataRef" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card >
          <div class="chart-wrapper">
            <ScheduleDataDetail ref="scheduleDataRef"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
	
  </el-dialog>
  
</template>

<script setup name="TaskTriggerScheduleDetail">
	import {getScheduleDetail} from "@/api/schedule/taskTrigger";
	import {tillNowSeconds,tillNowString} from "@/utils/datetime";
	import DBDataDetail from '../../common/jsonTreeTable'
	import ScheduleDataDetail from '../../common/jsonTreeTable'
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const scheduleDetailTitle = ref('调度详情');
	const scheduleDetailOpen = ref(false);
	
	const dbDataRef = ref();
	const scheduleDataRef = ref();
	
	const data = reactive({
	  scheduleInfo:{}
	});
	const {scheduleInfo} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openScheduleDetail = async (triggerId) => {
	  scheduleDetailOpen.value = true;
	  resetForm();
	  getScheduleDetail(triggerId).then(response => {
		dbDataRef.value.showData(response.dbInfo);
		if(response.scheduleInfo!=null){
			scheduleDataRef.value.showData(response.scheduleInfo);  
		}
	    let ts = tillNowSeconds(null,response.addToScheduleTime);
	    let tillNow = tillNowString(ts);
	    scheduleInfo.value = {
	      addToScheduleTime:response.addToScheduleTime,
	      tillNow:tillNow,
	      isExecuting:response.isExecuting
	    };
	  });
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openScheduleDetail }); 

	// 表单重置
	function resetForm() {
	  scheduleInfo.value = {};
	  setTimeout(function()  {
	    dbDataRef.value.showData(null);
	  }, 100);
	  setTimeout(function()  {
	    scheduleDataRef.value.showData(null);  
	  }, 100);
	  
	}
	
	/** 提交表单 */
	function submitscheduleDetail(){
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
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>

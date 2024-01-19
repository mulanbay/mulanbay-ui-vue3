<template>
  
  <!-- 调度详情对话框 -->
  <el-dialog :title="lastInfoTitle" v-model="lastInfoOpen" width="750px" append-to-body >
    <el-descriptions class="margin-top" :column="2" border v-loading="lastInfoLoading">
		<el-descriptions-item width="150px">
			<template #label >
			  <div class="cell-item">
				<el-icon><StarFilled /></el-icon>
				日志编号
			  </div>
			</template>
			{{ lastInfo.logId}}
		</el-descriptions-item>
		<el-descriptions-item width="150px">
			<template #label>
			  <div class="cell-item">
				<el-icon><user /></el-icon>
				触发器
			  </div>
			</template>
			{{ lastInfo.taskTrigger.triggerName }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				业务日期
			  </div>
			</template>
			{{ lastInfo.bussDate}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><UploadFilled /></el-icon>
				唯一标识
			  </div>
			</template>
			{{ lastInfo.scheduleIdentityId}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				执行开始时间
			  </div>
			</template>
			{{ lastInfo.startTime}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				执行开始时间
			  </div>
			</template>
			{{ lastInfo.endTime}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				耗时
			  </div>
			</template>
			{{ lastInfo.costTime+'毫秒'}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><ChatLineRound /></el-icon>
				执行结果
			  </div>
			</template>
			<span v-if="lastInfo.executeResult==null || lastInfo.executeResult==''">
			 --
			</span>
			<span v-else-if="lastInfo.executeResult=='SUCCESS'">
			 <el-icon color="green"><SuccessFilled /></el-icon>
			</span>
			<span v-else-if="lastInfo.executeResult=='FAIL'">
			 <el-icon color="red"><CircleCloseFilled /></el-icon>
			</span>
			{{ lastInfo.executeResultName }}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><InfoFilled /></el-icon>
				部署点
			  </div>
			</template>
			{{ lastInfo.deployId}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><LocationFilled /></el-icon>
				服务器IP
			  </div>
			</template>
			{{ lastInfo.ipAddress}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Refresh /></el-icon>
				重做次数
			  </div>
			</template>
			{{ lastInfo.redoTimes}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Refresh /></el-icon>
				子任务
			  </div>
			</template>
			{{ lastInfo.subTaskExecuteResults}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				重做开始时间
			  </div>
			</template>
			{{ lastInfo.lastStartTime}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><Clock /></el-icon>
				重做结束时间
			  </div>
			</template>
			{{ lastInfo.lastEndTime}}
		</el-descriptions-item>
		<el-descriptions-item>
			<template #label>
			  <div class="cell-item">
				<el-icon><InfoFilled /></el-icon>
				备注信息
			  </div>
			</template>
			{{ lastInfo.logComment}}
		</el-descriptions-item>
    </el-descriptions>
	
  </el-dialog>
  
</template>

<script setup name="TaskLogLastInfo">
	import {getLastTaskLog,getTaskLog} from "@/api/schedule/taskLog";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const lastInfoTitle = ref('最后一次调度日志');
	const lastInfoOpen = ref(false);
	const lastInfoLoading = ref(false);

	const data = reactive({
	  lastInfo: {}
	});
	
	const { lastInfo } = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openLastInfo = async (triggerId,logId) => {
	  if(proxy.isEmpty(triggerId)&&proxy.isEmpty(triggerId)){
		  proxy.$modal.msgError("调度编号或日志编号为空");
		  return;
	  }
	  lastInfoOpen.value = true;
	  resetForm();
	  lastInfoLoading.value = true;
	  if(!proxy.isEmpty(logId)){
		  lastInfoTitle.value = '调度日志信息';
		  //按日志编号查询
		  getTaskLog(logId).then(response => {
			lastInfoLoading.value = false;
			if(response==null){
				proxy.$modal.msgError("无相关日志信息");
				return;
			}
			lastInfo.value = response;
		  });
	  }else{
		  lastInfoTitle.value = '最后一次调度日志';
		  getLastTaskLog(triggerId).then(response => {
			lastInfoLoading.value = false;
			if(response==null){
				proxy.$modal.msgError("无相关日志信息");
				return;
			}
			lastInfo.value = response;
		  });
	  }
	  
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openLastInfo }); 

	// 表单重置
	function resetForm() {
	  lastInfo.value = {
		  taskTrigger:{}
	  };
	}
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>

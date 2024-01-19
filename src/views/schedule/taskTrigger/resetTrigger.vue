<template>
  
  <!-- 手动执行对话框 -->
  <el-dialog :title="resetTriggerTitle" v-model="resetTriggerOpen" width="480px" append-to-body>
    <el-form ref="resetTriggerFormRef" :model="resetTriggerForm" :rules="resetTriggerRules"  label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="总执行次数" prop="totalCount">
            <el-input-number v-model="resetTriggerForm.totalCount" placeholder="" controls-position="right" :controls="false" :precision="0" />
			<el-button type="primary"  @click="resetTriggerForm.totalCount=0">归零</el-button>
		  </el-form-item>
        </el-col>
      </el-row>
	  <el-row>
	    <el-col :span="24">
	      <el-form-item label="总失败次数" prop="failCount">
	        <el-input-number v-model="resetTriggerForm.failCount" placeholder="" controls-position="right" :controls="false" :precision="0" />
			<el-button type="primary" @click="resetTriggerForm.failCount=0">归零</el-button>
		  </el-form-item>
	    </el-col>
	  </el-row>
    </el-form>
	<template #footer>
	   <div class="dialog-footer">
	      <el-button type="primary" @click="submitResetTrigger" v-hasPermi="['schedule:taskTrigger:reset']">确 定</el-button>
	      <el-button @click="resetTriggerOpen=false">取 消</el-button>
	   </div>
	</template>
  </el-dialog>
  
</template>

<script setup name="TaskTriggerresetTrigger">
	import {getTaskTrigger,resetTaskTrigger} from "@/api/schedule/taskTrigger";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const resetTriggerTitle = ref('重置触发器');
	const resetTriggerOpen = ref(false);
	const resetTriggerFormRef = ref();
	
	const data = reactive({
	  resetTriggerForm: {},
	  resetTriggerRules:{
        totalCount: [
          { required: true, message: "总执行次数不能为空", trigger: "blur" }
        ],
        failCount: [
          { required: true, message: "总失败次数不能为空", trigger: "blur" }
        ]
      }
	});
	
	const {resetTriggerForm,resetTriggerRules} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openResetTrigger = async (triggerId) => {
	  resetTriggerOpen.value = true;
	  resetTriggerForm.value = {
	    triggerId: undefined,
	  		totalCount: undefined,
	  		failCount:undefined
	  };
	  proxy.resetForm("resetTriggerFormRef");
	  loadTaskTrigger(triggerId);
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openResetTrigger }); 
	
	/** 加载*/
	function loadTaskTrigger(triggerId){
		getTaskTrigger(triggerId).then(response => {
		  resetTriggerForm.value = {
			  triggerId: response.triggerId,
			  totalCount: response.totalCount,
			  failCount:response.failCount
		  };
		});
	}
	
	/** 提交表单 */
	function submitResetTrigger(){
		proxy.$refs["resetTriggerFormRef"].validate(valid => {
		  if (valid) {
		    resetTaskTrigger(resetTriggerForm.value).then(response => {
			  proxy.$modal.msgSuccess("设置成功");
		      resetTriggerOpen.value = false;
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

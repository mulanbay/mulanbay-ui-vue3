<template>
  
  <!-- 手动执行对话框 -->
  <el-dialog :title="manualStartTitle" v-model="manualStartOpen" width="600px" append-to-body>
    <el-form ref="manualStartFormRef" :model="manualStartForm" :rules="manualStartRules"  label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="选择调度器" prop="triggerId">
			  <el-tree-select
				 v-model="manualStartForm.triggerId"
				 style="width: 515px"
				 :data="taskTriggerOptions"
				 :props="{ value: 'id', label: 'text', children: 'children' }"
				 value-key="id"
				 placeholder="请选择调度器"
				 :check-strictly ="false"
			  />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="业务日期" prop="bussDate">
			  <el-date-picker type="date" v-model="manualStartForm.bussDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
						:style="{width: '100%'}" placeholder="请选择时间" clearable >
			  </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="同步执行" prop="sync">
            <el-switch v-model="manualStartForm.sync"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
	<template #footer>
	   <div class="dialog-footer">
	      <el-button type="primary" @click="submitManualStart">确 定</el-button>
	      <el-button @click="manualStartOpen=false">取 消</el-button>
	   </div>
	</template>
  </el-dialog>
  
</template>

<script setup name="TaskTriggerManualStart">
	import {getTaskTriggerTree,manualStart} from "@/api/schedule/taskTrigger";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const manualStartTitle = ref('手动执行');
	const manualStartOpen = ref(false);
	const manualStartFormRef = ref();
	const taskTriggerOptions = ref([]);
	
	const data = reactive({
	  manualStartForm: {},
	  manualStartRules:{
        triggerId: [
          { required: true, message: "调度器不能为空", trigger: "blur" }
        ],
        bussDate: [
          { required: true, message: "业务日期不能为空", trigger: "blur" }
        ],
        sync: [
          { required: true, message: "同步执行不能为空", trigger: "blur" }
        ]
      }
	});
	
	const {manualStartForm,manualStartRules} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openManualStart = async (triggerId) => {
	  manualStartOpen.value = true;
	  resetForm();
	  loadTaskTriggerTree();
	  if(triggerId!=null){
		  manualStartForm.value.triggerId = triggerId;
	  }
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openManualStart }); 
	
	/** 加载调度树 */
	function loadTaskTriggerTree(){
		getTaskTriggerTree(false).then(response => {
		  taskTriggerOptions.value = response;
		});
	}
	
	// 表单重置
	function resetForm() {
	  manualStartForm.value = {
	    triggerId: undefined,
		sync: false,
		bussDate:undefined
	  };
	  proxy.resetForm("teFormRef");
	}
	
	/** 提交表单 */
	function submitManualStart(){
		proxy.$refs["manualStartFormRef"].validate(valid => {
		  if (valid) {
		    manualStart(manualStartForm.value).then(response => {
			  proxy.$modal.msgSuccess("调度成功");
		      manualStartOpen.value = false;
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

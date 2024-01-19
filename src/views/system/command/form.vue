<template>
  
  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="名称" prop="name">
           <el-input v-model="form.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="CODE" prop="code">
           <el-input v-model="form.code" placeholder="请输入code" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="SCODE" prop="scode">
           <el-input v-model="form.scode" placeholder="请输入scode" />
          </el-form-item>
        </el-col>
      </el-row>
	  <el-row>
	    <el-col :span="24">
	      <el-form-item label="路径" prop="url">
	       <el-input v-model="form.url" placeholder="请输入命令路径" />
	      </el-form-item>
	    </el-col>
	  </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="级别" prop="level">
			  <el-select
			    v-model="form.level"
			    placeholder="状态"
			    clearable
			    collapse-tags
			    style="width: 225px"
			  >
			    <el-option
			      v-for="dict in levelOptions"
			      :key="dict.id"
			      :label="dict.text"
			      :value="dict.id"
			    />
			  </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="form.status"
              placeholder="状态"
              clearable
              collapse-tags
              style="width: 225px"
            >
              <el-option
                v-for="dict in commonStatusOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" style="width: 225px" placeholder="" controls-position="right" :min="0" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
	  <el-row>
	    <el-col :span="24">
	      <el-form-item label="备注" prop="remark">
	       <el-input v-model="form.remark" placeholder="请输入备注" />
	      </el-form-item>
	    </el-col>
	  </el-row>
    </el-form>
	<template #footer>
	   <div class="dialog-footer">
	      <el-button type="primary" @click="submitForm">确 定</el-button>
	      <el-button @click="open=false">取 消</el-button>
	   </div>
	</template>
  </el-dialog>
  
</template>

<script setup name="MessageForm">
	import {createCommand,editCommand,getCommand} from "@/api/system/command";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const title = ref('消息发送');
	const open = ref(false);
	const formLoading = ref(false);
	const formRef = ref();
	const commonStatusOptions = ref(proxy.commonStatusOptions);
	const levelOptions = ref([]);
	
	const data = reactive({
	  form: {},
	  // 表单校验
	  rules: {
	    name: [
	      { required: true, message: "名称不能为空", trigger: "blur" }
	    ],
	    code: [
	      { required: true, message: "Code不能为空", trigger: "blur" }
	    ],
	    scode: [
	      { required: true, message: "scode不能为空", trigger: "blur" }
	    ],
	    level: [
	      { required: true, message: "级别不能为空", trigger: "blur" }
	    ],
		url: [
		  { required: true, message: "URL不能为空", trigger: "blur" }
		],
	    orderIndex: [
	      { required: true, message: "排序号不能为空", trigger: "blur" }
	    ],
	    status: [
	      { required: true, message: "状态不能为空", trigger: "blur" }
	    ],
	    cleanType: [
	      { required: true, message: "删除类型不能为空", trigger: "blur" }
	    ]
	  }
	});
	
	const {form,rules} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openForm = async (id) => {
	  open.value = true;
	  resetForm();
	  if(id!=null){
		 title.value = "修改";
		 try {
		   formLoading.value = true;
		   getCommand(id).then(response => {
		     form.value = response;
		   });
		 } finally {
		   formLoading.value = false;
		 }
	  }else{
		 title.value = "新增";
	  }
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openForm }); 
	
	// 表单重置
	function resetForm() {
	  form.value = {
	    id: undefined,
	    code: undefined,
		scode: undefined,
		url: undefined,
	    orderIndex: 0,
	    status: "ENABLE"
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      if (form.value.id != undefined) {
	        editCommand(form.value).then(response => {
			  proxy.$modal.msgSuccess("修改成功");
			  open.value = false;
			  // 发送操作成功的事件
			  emit('success');
	        });
	      } else {
	        createCommand(form.value).then(response => {
	          proxy.$modal.msgSuccess("新增成功");
	          open.value = false;
			  // 发送操作成功的事件
			  emit('success');
	        });
	      }
	    }
	  });
	}
	
	/** 初始化 **/
	onMounted(() => {
		proxy.getEnumDict('LogLevel','FIELD',false).then(response => {
		  levelOptions.value = response;
		});
	})
	
</script>

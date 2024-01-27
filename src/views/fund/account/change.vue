<template>
  
  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="修改后金额" prop="afterAmount">
        <el-input-number v-model="form.afterAmount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
         <el-input type="textarea" v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
	<template #footer>
	   <div class="dialog-footer">
	      <el-button type="primary" @click="submitForm">确 定</el-button>
	      <el-button @click="open=false">取 消</el-button>
	   </div>
	</template>
  </el-dialog>
  
</template>

<script setup name="AccountChangeForm">
	import {changeAccount,getAccount} from "@/api/fund/account";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const title = ref('账户');
	const open = ref(false);
	const formLoading = ref(false);
	const formRef = ref();
	const statusOptions = ref();
	const typeOptions = ref();
	
	const data = reactive({
	  form: {},
	  // 表单校验
	  rules: {
	    afterAmount: [
	      { required: true, message: "账户余额不能为空", trigger: "blur" }
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
	  title.value = "修改账户余额";
	  try {
	    formLoading.value = true;
	    getAccount(id).then(response => {
	      form.value = {
	        accountId: response.accountId,
	        afterAmount: response.amount,
	        remark: undefined
	      };
	    });
	  } finally {
	    formLoading.value = false;
	  }
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openForm }); 
	
	// 表单重置
	function resetForm() {
	  form.value = {
	    accountId: undefined,
	    afterAmount: undefined,
	    remark: undefined
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      changeAccount(form.value).then(response => {
	        proxy.$modal.msgSuccess("新增成功");
	        open.value = false;
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

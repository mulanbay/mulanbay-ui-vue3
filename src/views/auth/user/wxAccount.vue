<template>
  
  <!-- 微信账号对话框 -->
  <el-dialog :title="wxAccountTitle" v-model="wxAccountOpen" width="480px" append-to-body>
    <el-form ref="wxAccountFormRef" :model="wxAccountForm" :rules="wxAccountRules"  label-width="120px">
      <el-row>
		  <el-col :span="24">
			<el-form-item label="OpenId" prop="openId">
			 <el-input v-model="wxAccountForm.openId" placeholder="" />
			</el-form-item>
		  </el-col>
	  </el-row>
    </el-form>
	<template #footer>
	   <div class="dialog-footer">
	      <el-button type="primary" @click="submitWxAccount" v-hasPermi="['auth:user:editWxAccount']">确 定</el-button>
	      <el-button @click="wxAccountOpen=false">取 消</el-button>
	   </div>
	</template>
  </el-dialog>
  
</template>

<script setup name="WxAccount">
	import {editWxAccount,getWxAccount} from "@/api/auth/user";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const wxAccountTitle = ref('微信账号');
	const wxAccountOpen = ref(false);
	const wxAccountFormRef = ref();
	
	const data = reactive({
	  wxAccountForm: {},
	  wxAccountRules:{
        openId: [
          { required: true, message: "OpenId不能为空", trigger: "blur" }
        ]
      }
	});
	
	const {wxAccountForm,wxAccountRules} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openWxAccount = async (userId) => {
	  wxAccountOpen.value = true;
	  wxAccountForm.value = {
	    openId: undefined,
	  	userId: undefined
	  };
	  proxy.resetForm("wxAccountFormRef");
	  loadWxAccount(userId);
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openWxAccount }); 
	
	/** 加载*/
	function loadWxAccount(userId){
		getWxAccount(userId).then(response => {
		  wxAccountForm.value = {
		    openId: response.openId,
		  	userId: response.userId
		  };
		});
	}
	
	/** 提交表单 */
	function submitWxAccount(){
		proxy.$refs["wxAccountFormRef"].validate(valid => {
		  if (valid) {
		    editWxAccount(wxAccountForm.value).then(response => {
			  proxy.$modal.msgSuccess("设置成功");
		      wxAccountOpen.value = false;
		      // 发送操作成功的事件
		      //emit('success');
		    });
		  }
		});
	}
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>

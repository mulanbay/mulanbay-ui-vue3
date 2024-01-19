<template>
  
  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="用户名/手机号" prop="username">
        <el-input v-model="form.username" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="消息标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="消息内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="5"  placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="发送时间" prop="notifyTime">
        <el-date-picker type="datetime" v-model="form.notifyTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '200px'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="消息代码" prop="code">
        <el-input-number v-model="form.code"  controls-position="right" :min="0" :controls="true" :precision="0"/>
        <span class="link-type" @click="showMsg('提示','不填表示为立即发送')"><el-icon><QuestionFilled /></el-icon></span>
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

<script setup name="MessageForm">
	import {sendMessage} from "@/api/log/message";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const title = ref('消息发送');
	const open = ref(false);
	const formLoading = ref(false);
	const formRef = ref();
	
	const data = reactive({
	  form: {},
	  rules:{
        username: [
          { required: true, message: "用户名/手机号不能为空", trigger: "blur" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
        notifyTime: [
          { required: true, message: "发送时间不能为空", trigger: "blur" }
        ]
      }
	});
	
	const {form,rules} = toRefs(data);
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 消息提示 */
	function showMsg(title,content){
		proxy.$modal.msgInfo(title,content);
	}
	
	/** 打开弹窗 */
	const openForm = async () => {
	  open.value = true;
	  resetForm();
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openForm }); 
	
	// 表单重置
	function resetForm() {
	  form.value = {
	    username: undefined,
	    title: undefined,
	    content:undefined,
	    notifyTime:undefined
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 提交表单 */
	function submitForm(){
		proxy.$refs["formRef"].validate(valid => {
		  if (valid) {
		    sendMessage(form.value).then(response => {
				proxy.$modal.msgSuccess("发送成功");
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

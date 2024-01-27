<template>
  
  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="500px" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="收入名称" prop="incomeName">
        <el-input v-model="form.incomeName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="收入金额" prop="amount">
        <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2"/>
      </el-form-item>
      <el-form-item label="关联账户" prop="accountId">
        <el-tree-select
		 v-model="form.accountId"
		 style="width: 100%"
		 clearable
		 :data="accountOptions"
		 :props="{ value: 'id', label: 'text', children: 'children' }"
		 value-key="id"
		 placeholder="请选择账户"
		 :check-strictly ="false"
        />
      </el-form-item>
      <el-form-item label="收入类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="类型"
		  style="width: 100%"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发生时间" prop="occurTime">
            <el-date-picker type="datetime" v-model="form.occurTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                       placeholder="请选择时间" clearable :style="{width: '200px'}" >
            </el-date-picker>
      </el-form-item>
      <el-form-item label="收入状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.id"
          >{{dict.text}}</el-radio>
        </el-radio-group>
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

<script setup name="IncomeForm">
	import {createIncome,editIncome,getIncome} from "@/api/fund/income";
	import {getAccountTree} from "@/api/fund/account";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const title = ref('账户');
	const open = ref(false);
	const formLoading = ref(false);
	const formRef = ref();
	const commonStatusOptions = ref(proxy.commonStatusOptions);
	const accountOptions = ref([]);
	const typeOptions = ref([]);
	
	const data = reactive({
	  form: {},
	  // 表单校验
	  rules: {
	    incomeName: [
	      { required: true, message: "账户名称不能为空", trigger: "blur" }
	    ],
	    amount: [
	      { required: true, message: "收入金额不能为空", trigger: "blur" }
	    ],
	    occurTime: [
	      { required: true, message: "发生时间不能为空", trigger: "blur" }
	    ],
	    status: [
	      { required: true, message: "状态不能为空", trigger: "blur" }
	    ],
	    type: [
	      { required: true, message: "收入类型不能为空", trigger: "blur" }
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
		   getIncome(id).then(response => {
		     form.value = response;
			 if(!proxy.isEmpty(response.account)){
			   form.value.accountId = response.account.accountId;
			 }
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
	    incomeId: undefined,
	    incomeName: undefined,
	    type: 'SALARY',
	    status: "ENABLE"
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      if (form.value.incomeId != undefined) {
	        editIncome(form.value).then(response => {
			  proxy.$modal.msgSuccess("修改成功");
			  open.value = false;
			  // 发送操作成功的事件
			  emit('success');
	        });
	      } else {
	        createIncome(form.value).then(response => {
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
		getAccountTree().then(
		  response => {
		    accountOptions.value = response;
		  }
		);
		proxy.getEnumDict('IncomeType','FIELD',false).then(response => {
		  typeOptions.value = response;
		});
	})
	
</script>

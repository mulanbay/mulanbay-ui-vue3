<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="form.goodsName" placeholder="请输入商品名称" disabled />
          </el-form-item>
        </el-col>
      </el-row>
			<el-row>
			  <el-col :span="12">
			    <el-form-item label="商品单价" prop="price">
			      <el-input-number v-model="form.price" disabled placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
			        <template #suffix>
			          <span>元</span>
			        </template>
			      </el-input-number>
			    </el-form-item>
			  </el-col>
			  <el-col :span="12">
			    <el-form-item label="商品总价" prop="totalPrice">
			      <el-input-number v-model="form.totalPrice" disabled placeholder="单位:元" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
			        <template #suffix>
			          <span>元</span>
			        </template>
			      </el-input-number>
			    </el-form-item>
			  </el-col>
			</el-row>
			<el-row>
			  <el-col :span="12">
			    <el-form-item label="购买时间" prop="buyTime">
			      <el-date-picker type="datetime" v-model="form.buyTime" disabled format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
			        :style="{width: '100%'}" >
			      </el-date-picker>
			    </el-form-item>
			  </el-col>
			  <el-col :span="12">
			    <el-form-item label="期望作废时间" label-width="100px" prop="expectInvalidTime">
			      <el-date-picker type="datetime" v-model="form.expectInvalidTime" disabled format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
			        :style="{width: '100%'}" >
			      </el-date-picker>
			    </el-form-item>
			  </el-col>
			</el-row>
			<el-row>
			  <el-col :span="24">
			    <el-form-item label="类型选择" prop="invalidType" @change="typeChange">
			      <el-radio-group v-model="form.invalidType">
			        <el-radio value="EXPIRED">过期</el-radio>
			        <el-radio value="SOLD">售出</el-radio>
			        <el-radio value="REFUND">退款</el-radio>
			      </el-radio-group>
			    </el-form-item>
			  </el-col>
			</el-row>
			<el-row>
			  <el-col :span="12">
			    <el-form-item :label="priceLable" prop="soldPrice">
			      <el-input-number v-model="form.soldPrice" :disabled='form.invalidType=="EXPIRED"' placeholder="" :style="{width: '100%'}" controls-position="right" :min="0" :controls="false" :precision="2" >
			        <template #suffix>
			           <span>元</span>
			         </template>
			      </el-input-number> 
			    </el-form-item>
			  </el-col>
			  <el-col :span="12">
			    <el-form-item :label="timeLable" prop="invalidTime">
			      <el-date-picker type="datetime" v-model="form.invalidTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
			        :style="{width: '100%'}" placeholder="请选择时间" clearable>
			      </el-date-picker>
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

<script setup name="ConsumeInvalidForm">
  import { invalidConsume,getConsume } from "@/api/consume/consume";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('商品过期');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const priceLable = ref('售出价格');
  const timeLable = ref('售出时间');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      invalidType: [
        { required: true, message: "类型不能为空", trigger: "blur" }
      ],
      invalidTime: [
        { required: true, message: "时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    try {
      formLoading.value = true;
      getConsume(id).then(response => {
        form.value = response;
      });
    } finally {
      formLoading.value = false;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 类型改变
	function typeChange(v){
		if(form.value.invalidType=='EXPIRED'){
			priceLable.value = '过期价格';
			timeLable.value = '过期时间';
		}else if(form.value.invalidType=='SOLD'){
			priceLable.value = '售出价格';
			timeLable.value = '售出时间';
		}else{
			priceLable.value = '退款金额';
			timeLable.value = '退款时间';
		}
	}
	
  // 表单重置
  function resetForm() {
    form.value = {
      consumeId: undefined,
      goodsName: undefined,
      invalidType: 'EXPIRED',
      soldPrice: undefined,
      invalidTime: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        invalidConsume(form.value).then(response => {
          proxy.$modal.msgSuccess("操作成功");
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
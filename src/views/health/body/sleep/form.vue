<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="800px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="入睡时间" prop="sleepTime">
            <el-date-picker type="datetime" v-model="form.sleepTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="起床时间" prop="getUpTime">
            <el-date-picker type="datetime" v-model="form.getUpTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="首次醒来时间" prop="fwpTime">
            <el-date-picker type="datetime" v-model="form.fwpTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最后醒来时间" prop="lwpTime">
            <el-date-picker type="datetime" v-model="form.lwpTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      :style="{width: '100%'}" placeholder="请选择时间" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="醒来次数" prop="wps">
						<el-input-number v-model="form.wps" :style="{width: '100%'}" controls-position="right" :min="0" :controls="true" :precision="0">
						  <template #suffix>
						    <span>次</span>
						  </template>
						</el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="睡眠质量" prop="quality">
						<el-input-number v-model="form.quality" :style="{width: '100%'}" controls-position="right" :min="0" :max="100" :controls="true" :precision="0">
						</el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
        </el-col>
      </el-row>
      <el-row>
				<el-col :span="12">
				  <el-form-item label="深睡时长" prop="deepSleep">
				    <el-input-number v-model="detail.dsh" :style="{width: '50%'}" controls-position="right" :min="0" :controls="true" :precision="0">
				      <template #suffix>
				        <span>小时</span>
				      </template>
				    </el-input-number> 
						<el-input-number v-model="detail.dsm" :style="{width: '50%'}" controls-position="right" :min="0" :controls="true" :precision="0">
						  <template #suffix>
						    <span>分钟</span>
						  </template>
						</el-input-number> 
				  </el-form-item>
				</el-col>
        <el-col :span="12">
          <el-form-item label="浅睡时长" prop="lightSleep">
            <el-input-number v-model="detail.lsh" :style="{width: '50%'}" controls-position="right" :min="0" :controls="true" :precision="0">
              <template #suffix>
                <span>小时</span>
              </template>
            </el-input-number> 
						<el-input-number v-model="detail.lsm" :style="{width: '50%'}" controls-position="right" :min="0" :controls="true" :precision="0">
						  <template #suffix>
						    <span>分钟</span>
						  </template>
						</el-input-number> 
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息">
            <el-input v-model="form.remark" :style="{width: '100%'}" type="textarea" :rows="5" placeholder="请输入内容"></el-input>
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

<script setup name="SleepForm">
  import { createSleep, editSleep, getSleep } from "@/api/health/body/sleep";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('运动类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
		//浅睡+深睡
		detail:{},
    // 表单校验
    rules: {
      sleepTime: [
        { required: true, message: "睡觉时间不能为空", trigger: "blur" }
      ],
      getUpTime: [
        { required: true, message: "起床时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form,detail, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getSleep(id).then(response => {
        formLoading.value = false;
        form.value = response;
				convertFormToDetail();
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

	// 浅睡+深睡 转换为 小时+分钟
	function convertFormToDetail() {
		if(form.value.lightSleep>0){
			let ls = form.value.lightSleep;
			detail.value.lsh = parseInt(ls / 60);
			detail.value.lsm = ls%60;
		}
		if(form.value.deepSleep>0){
			let ds = form.value.deepSleep;
			detail.value.dsh = parseInt(ds / 60);
			detail.value.dsm = ds%60;
		}
  }
	
	// 浅睡+深睡转换
	function convertDetailToForm() {
		form.value.lightSleep = detail.value.lsh*60+detail.value.lsm;
		form.value.deepSleep = detail.value.dsh*60+detail.value.dsm;
	}
	
  // 表单重置
  function resetForm() {
    form.value = {
      sleepId: undefined,
      wps: 1,
      lightSleep: 0,
      deepSleep: 0,
      quality:80
    };
		detail.value={
			lsh:0,
			lsm:0,
			dsh:0,
			dsm:0
		};
    proxy.resetForm("formRef");
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
				convertDetailToForm();
        if (form.value.sleepId != undefined) {
          editSleep(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createSleep(form.value).then(response => {
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

  })
</script>
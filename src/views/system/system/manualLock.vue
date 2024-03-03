<template>
  <div class="app-container">

    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="关闭代码" prop="code">
        <el-input-number v-model="form.code" placeholder="请输入code" :style="{width: '300px'}" :min="9991" :max="9999" :precision="0" />
        <el-tooltip content="值越大,级别越高." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="提示消息" prop="message">
        <el-input v-model="form.message" placeholder="请输入消息" :style="{width: '300px'}" />
      </el-form-item>
      <el-form-item label="恢复时间" prop="expireTime">
        <el-date-picker type="datetime" v-model="form.expireTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间" clearable :style="{width: '300px'}">
        </el-date-picker>
        <el-tooltip content="如果不设置恢复时间,则表示一直被锁定,直到人工解锁." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item >
          <el-row :gutter="20">
            <el-col :span="6"><div class="grid-content ep-bg-purple" /></el-col>
            <el-col :span="6"><div class="grid-content ep-bg-purple" /></el-col>
            <el-col :span="6"><div class="grid-content ep-bg-purple" /></el-col>
            <el-col :span="6">
              <el-button icon="Lock" type="danger" v-hasPermi="['system:system:lock']" @click="submitForm">锁定系统</el-button>      
            </el-col>
          </el-row>
      </el-form-item>
    </el-form>

  </div>

</template>

<script setup name="SystemManualLockForm">
  import { lockSystem } from "@/api/system/system";

  const { proxy } = getCurrentInstance();

  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      code: [
        { required: true, message: "Code不能为空", trigger: "blur" }
      ],
      message: [
        { required: true, message: "消息不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  // 表单重置
  function resetForm() {
    form.value = {
      code: 9999,
      message: '系统被锁定',
      expireTime: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        lockSystem(form.value).then(response => {
          proxy.$modal.msgSuccess("关闭成功");
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    resetForm();
  })
</script>
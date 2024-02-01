<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body >
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="关闭代码" prop="code">
        <el-input v-model="form.code" placeholder="请输入code" />
      </el-form-item>
      <el-form-item label="提示消息" prop="message">
        <el-input v-model="form.message" placeholder="请输入消息" />
      </el-form-item>
      <el-form-item label="恢复时间" prop="expireTime">
        <el-date-picker type="datetime" v-model="form.expireTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间" clearable :style="{width: '100%'}">
        </el-date-picker>
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

<script setup name="SystemStatusForm">
  import { setSystemStatus} from "@/api/system/command";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('消息发送');
  const open = ref(false);
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

  /** 打开弹窗 */
  const openForm = async () => {
    open.value = true;
    resetForm();
    title.value = "关闭系统";
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      code: 9999,
      message: '系统关闭',
      expireTime:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        setSystemStatus(form.value).then(response => {
          proxy.$modal.msgSuccess("关闭成功");
          open.value = false;
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
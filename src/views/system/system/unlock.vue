<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="解锁类型" prop="status">
        <el-select
          v-model="form.status"
          placeholder="状态"
          collapse-tags
          style="width: 260px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-tooltip content="永久解锁后,自动锁定任务无法对系统进行锁定." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="解锁码" prop="unlockCode">
        <el-input type="password" style="width: 260px" v-model="form.unlockCode" placeholder="请输入解锁码" />
      </el-form-item>
      <el-form-item label="验证码" prop="code" v-if="captchaEnabled">
        <el-input type="text" v-model="form.code" placeholder="验证码" style="width: 50%;" @keyup.enter="submitForm" />
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
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

<script setup name="SystemUnLockForm">
  import { unlockSystem } from "@/api/system/system";
  import { getCodeImg } from "@/api/login";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('解锁系统');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  // 验证码开关
  const captchaEnabled = ref(true);
  const codeUrl = ref("");
  const statusOptions = ref([
    {id:9999,text:"永久解锁,不允许自动锁定"},
    {id:9991,text:"非永久解锁,允许自动锁定"}
  ]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      status: [
        { required: true, message: "解锁状态码不能为空", trigger: "blur" }
      ],
      unlockCode: [
        { required: true, message: "解锁码不能为空", trigger: "blur" }
      ],
      code: [
        { required: true, message: "验证码不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  function getCode() {
    getCodeImg().then(res => {
      captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
      if (captchaEnabled.value) {
        codeUrl.value = "data:image/gif;base64," + res.img;
        form.value.uuid = res.uuid;
      }
    });
  }

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async () => {
    open.value = true;
    resetForm();
    title.value = "锁定系统";
    getCode();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      status:9999,
      unlockCode: undefined,
      code: undefined
    };
    proxy.resetForm("formRef");
  }


  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        unlockSystem(form.value).then(response => {
          if (true == response) {
            proxy.$modal.msgSuccess("解锁成功");
            open.value = false;
            window.location.href = '/index';
          } else {
            proxy.$modal.msgError("解锁失败");
          }
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<style lang='scss' scoped>
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
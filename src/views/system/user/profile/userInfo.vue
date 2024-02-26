<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickname">
      <el-input v-model="form.nickname" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="form.phone" maxlength="11" />
    </el-form-item>
    <el-form-item label="用户邮箱" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="我的生日" prop="birthday">
      <el-date-picker type="date" v-model="form.birthday" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
        :style="{width: '200px'}" placeholder="请选择日期" clearable >
      </el-date-picker>
      <el-tooltip content="锻炼管理中：计算最大心率使用" effect="dark" placement="top">
        <el-icon>
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
  import { getProfile,editProfile } from "@/api/auth/user";

  const { proxy } = getCurrentInstance();

const data = reactive({
    form: {},
    // 表单校验
    rules: {
      nickname: [
        { required: true, message: "用户昵称不能为空", trigger: "blur" }
      ],
      phone: [
        { required: true, message: "手机号码不能为空", trigger: "blur" }
      ],
      birthday: [
        { required: true, message: "生日不能为空", trigger: "blur" }
      ]
    }
  });
  
  const { form, rules } = toRefs(data);

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        editProfile(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
        });
      }
    });
  };

  /** 关闭按钮 */
  function close() {
    proxy.$tab.closePage();
  };

  /** 初始化 **/
  onMounted(() => {
    getProfile().then(response => {
      form.value = response;
    });
  })
</script>
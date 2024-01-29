<template>

<!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input placeholder="请输入密码" v-model="form.password" show-password></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="二次认证" prop="secAuthType">
              <el-select
                v-model="form.secAuthType"
                placeholder="二次认证"
                clearable
                collapse-tags
                style="width: 200px">
                <el-option
                  v-for="dict in secAuthTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机" prop="phone">
              <el-input v-model="form.phone" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="form.status"
                placeholder="状态"
                clearable
                collapse-tags
                style="width: 200px">
                <el-option
                  v-for="dict in commonStatusOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker type="date" v-model="form.birthday" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                :style="{width: '200px'}" placeholder="请选择日期" clearable>
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期日期" prop="expireTime">
              <el-date-picker type="datetime" v-model="form.expireTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                :style="{width: '100%'}" placeholder="请选择时间" clearable>
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="UserForm">
  import { getUser, createUser, editUser } from "@/api/auth/user";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用户');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const secAuthTypeOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      username: [
        { required: true, message: "用户名不能为空", trigger: "blur" }
      ],
      secAuthType: [
        { required: true, message: "二次认证不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      birthday: [
        { required: true, message: "生日不能为空", trigger: "blur" }
      ],
      expireTime: [
        { required: true, message: "过期日期不能为空", trigger: "blur" }
      ],
      openId: [
        { required: true, message: "OpenId不能为空", trigger: "blur" }
      ]
    }
  });

  const {form,rules} = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type) => {
    open.value = true;
    reset();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getUser(id).then(response => {
          form.value = response;
          form.value.password = undefined;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({openForm});

  // 表单重置
  function reset() {
    form.value = {
      userId: undefined,
      username: undefined,
      secAuthType: 'PASSWORD',
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.userId != undefined) {
          editUser(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createUser(form.value).then(response => {
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
    proxy.getEnumDict('AuthType', 'FIELD', false).then(response => {
      secAuthTypeOptions.value = response;
    });
  })
</script>
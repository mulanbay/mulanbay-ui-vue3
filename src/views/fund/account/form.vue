<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="账户名称" prop="accountName">
        <el-input v-model="form.accountName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="账户卡号" prop="cardNo">
        <el-input v-model="form.cardNo" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="账户余额" prop="amount">
        <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" >
          <template #suffix>
            <span>元</span>
          </template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="账户类型">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="资产状态">
        <el-select v-model="form.status" placeholder="请选择">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
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

<script setup name="AccountForm">
  import { createAccount, editAccount, getAccount } from "@/api/fund/account";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('账户');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref();
  const typeOptions = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      accountName: [
        { required: true, message: "账户名称不能为空", trigger: "blur" }
      ],
      amount: [
        { required: true, message: "账户余额不能为空", trigger: "blur" }
      ],
      type: [
        { required: true, message: "资产类型不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "资产状态不能为空", trigger: "blur" }
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
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getAccount(id).then(response => {
          form.value = response;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      accountId: undefined,
      accountName: undefined,
      type: 'BANK',
      status: "IMMOVABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.accountId != undefined) {
          editAccount(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createAccount(form.value).then(response => {
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
    proxy.getEnumDict('AccountStatus', 'FIELD', false).then(response => {
      statusOptions.value = response;
    });
    proxy.getEnumDict('AccountType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
  })
</script>
<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="440px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-form-item label="选择关联预算" prop="budgetId">
        <el-tree-select
          v-model="form.budgetId"
          style="width: 100%"
          clearable
          :data="budgetOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择预算"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="实际消费金额" prop="amount">
        <el-input-number v-model="form.amount" :style="{width: '100%'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
      </el-form-item>
      <el-form-item label="实际发生时间" prop="bussDay">
        <el-date-picker type="datetime" v-model="form.bussDay" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择时间" clearable :style="{width: '200px'}">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="预算备注信息">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
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

<script setup name="BudgetForm">
  import { createBudgetLog, editBudgetLog, getBudgetLog } from "@/api/fund/budgetLog";
  import { getBudgetTree } from "@/api/fund/budget";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('预算');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const budgetOptions = ref([]);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      amount: [
        { required: true, message: "金额不能为空", trigger: "blur" }
      ],
      bussDay: [
        { required: true, message: "发生时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (logId,type,budgetId) => {
    open.value = true;
    resetForm();
    if (logId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getBudgetLog(logId).then(response => {
          form.value = response;
          if(response.budget!=null){
            form.value.budgetId= response.budget.budgetId;
            form.value.budget = null;
          }
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
      form.value.budgetId=budgetId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      logIdId: undefined,
      budgetId: undefined,
      amount: undefined,
      bussDay: undefined,
      remark:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.logId != undefined) {
          editBudgetLog(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          editBudgetLog(form.value).then(response => {
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
    getBudgetTree(false, true).then(
      response => {
        budgetOptions.value = response;
      }
    );
  })
</script>
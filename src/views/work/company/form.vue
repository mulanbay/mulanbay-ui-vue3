<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="公司名称" prop="companyName">
        <el-input v-model="form.companyName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="入职日期" prop="entryDate">
        <el-date-picker type="date" v-model="form.entryDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                  :style="{width: '200px'}" placeholder="请选择日期" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="离职日期" prop="quitDate">
        <el-date-picker type="date" v-model="form.quitDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                  :style="{width: '200px'}" placeholder="请选择日期" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="CompanyForm">
  import { createCompany, editCompany, getCompany } from "@/api/work/company";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('公司');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      companyName: [
        { required: true, message: "公司名称不能为空", trigger: "blur" }
      ],
      entryDate: [
        { required: true, message: "入职日期不能为空", trigger: "blur" }
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
        getCompany(id).then(response => {
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
      companyId: undefined,
      companyName: undefined,
      days:0,
      entryDate: undefined,
      quitDate: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.companyId != undefined) {
          editCompany(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createCompany(form.value).then(response => {
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
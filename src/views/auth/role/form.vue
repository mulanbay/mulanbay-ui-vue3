<template>

  <!-- 添加或修改对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="orderIndex">
        <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0" />
      </el-form-item>
      <el-form-item label="角色状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :value="dict.id">{{dict.text}}
          </el-radio>
        </el-radio-group>
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

<script setup name="RoleForm">
  import { getRole, createRole, editRole } from "@/api/auth/role";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('角色');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      roleName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
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
        getRole(id).then(response => {
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
  defineExpose({openForm});

  // 表单重置
  function reset() {
    form.value = {
      roleId: undefined,
      roleName: undefined,
      orderIndex: 0,
      status: "ENABLE",
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.roleId != undefined) {
          editRole(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createRole(form.value).then(response => {
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
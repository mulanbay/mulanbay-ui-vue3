<template>

  <!-- 添加或修改对话框 -->
  <el-dialog :title="title" v-model="open" width="350px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="名称" prop="groupName">
        <el-input v-model="form.groupName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="代码" prop="code">
        <el-input v-model="form.code" placeholder="请输入代码" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.id">{{dict.text}}</el-radio>
        </el-radio-group>
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

<script setup name="ScoreGroupForm">
  import { getScoreGroup, createScoreGroup, editScoreGroup, copyScoreGroup } from "@/api/config/scoreGroup";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('评分组');
  // 是否显示弹出层
  const open = ref(false);
  //是否复制操作
  const isCopy = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      groupName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      code: [
        { required: true, message: "代码不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id, type) => {
    open.value = true;
    reset();
    if (id != null) {
      if (type == 'edit') {
        try {
          formLoading.value = true;
          getScoreGroup(id).then(response => {
            form.value = response;
            open.value = true;
            title.value = "修改(ID:" + id + ")";
          });
        } finally {
          formLoading.value = false;
        }
      } else {
        try {
          getScoreGroup(id).then(response => {
            form.value = response;
            form.value.code = form.value.code + '_COPY';
            open.value = true;
            isCopy.value = true;
            title.value = "复制(ID:" + id + ")";
          });
        } finally {
          formLoading.value = false;
        }
      }
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function reset() {
    isCopy.value = false;
    form.value = {
      groupId: undefined,
      groupName: undefined,
      orderIndex: 0,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }


  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (isCopy.value == true) {
          let copyData={
            templateId:form.value.groupId,
            groupName:form.value.groupName,
            code:form.value.code
          };
          copyScoreGroup(copyData).then(response => {
            proxy.$modal.msgSuccess("复制成功");
            open.value = false;
            isCopy.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else if (form.value.groupId != undefined) {
          editScoreGroup(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createScoreGroup(form.value).then(response => {
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
  onMounted(() => {})
</script>
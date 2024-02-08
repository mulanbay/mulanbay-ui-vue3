<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="名称" prop="sportName">
        <el-input v-model="form.sportName" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="form.unit" placeholder="请输入单位" />
      </el-form-item>
      <el-form-item label="顺序" prop="orderIndex">
        <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.id">{{dict.text}}
          </el-radio>
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

<script setup name="SportForm">
  import { createSport, editSport, getSport } from "@/api/sport/sport";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('运动类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      sportName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      unit: [
        { required: true, message: "单位不能为空", trigger: "blur" }
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
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getSport(id).then(response => {
        formLoading.value = false;
        form.value = response;
      });
    } else {
      title.value = "新增";
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {
      sportId: undefined,
      sportName: undefined,
      unit:undefined,
      orderIndex: 0,
      status: "ENABLE"
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.sportId != undefined) {
          editSport(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createSport(form.value).then(response => {
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
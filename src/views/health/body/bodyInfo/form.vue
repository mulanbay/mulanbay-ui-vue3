<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="350px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-form-item label="身高(厘米)" prop="height">
        <el-input-number v-model="form.height" :style="{width: '200px'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
      </el-form-item>
      <el-form-item label="体重(公斤)" prop="weight">
        <el-input-number v-model="form.weight" :style="{width: '200px'}" controls-position="right" :min="0" :controls="true" :precision="1"/>
      </el-form-item>
      <el-form-item label="采集时间" prop="recordTime">
        <el-date-picker type="datetime" v-model="form.recordTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '200px'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input v-model="form.remark" :style="{width: '200px'}" type="textarea" placeholder="请输入内容"></el-input>
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

<script setup name="BodyInfoForm">
  import { createBodyInfo, editBodyInfo, getBodyInfo } from "@/api/health/body/bodyInfo";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('运动类型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      height: [
        { required: true, message: "身高不能为空", trigger: "blur" }
      ],
      weight: [
        { required: true, message: "体重不能为空", trigger: "blur" }
      ],
      recordTime: [
        { required: true, message: "采集时间不能为空", trigger: "blur" }
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
      getBodyInfo(id).then(response => {
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
      id: undefined,
      height: undefined,
      weight: undefined,
      recordTime:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.id != undefined) {
          editBodyInfo(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createBodyInfo(form.value).then(response => {
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
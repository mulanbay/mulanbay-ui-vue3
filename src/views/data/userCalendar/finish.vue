<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="400px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="完成时间" prop="finishTime">
            <el-date-picker type="datetime" v-model="form.finishTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息">
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

<script setup name="UserCalendarFinish">
  import { finishUserCalendar } from "@/api/data/userCalendar";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('用户日历完成设置');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      finishTime: [
        { required: true, message: "完成时间不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules} = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (calendarId) => {
    open.value = true;
    resetForm();
    form.value.calendarId = calendarId;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    form.value = {};
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        finishUserCalendar(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
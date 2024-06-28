<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="550px"  append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="便签标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="便签内容" prop="content">
            <el-input v-model="form.content" type="textarea" placeholder="请输入内容" :autosize="{ minRows: 6, maxRows: 10 }"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="提醒时间" prop="notifyDate">
            <el-date-picker type="datetime" v-model="form.notifyDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
             placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-tooltip content="如果设置了提醒时间,则会同步到用户日历中" effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="便签备注" prop="remark">
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

<script setup name="NoteForm">
  import { createNote, editNote, getNote } from "@/api/life/note";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('便签表单');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const formType = ref('create');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      content: [
        { required: true, message: "内容不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (noteId) => {
    open.value = true;
    resetForm();
    if (noteId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getNote(noteId).then(response => {
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
      noteId: undefined,
      title: undefined,
      content: undefined,
      notifyDate: undefined,
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.noteId != undefined) {
          editNote(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createNote(form.value).then(response => {
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
<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="380px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-form-item label="阅读时间" prop="readTime">
        <el-date-picker type="datetime" v-model="form.readTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                  :style="{width: '200px'}" placeholder="请选择时间" clearable >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="阅读时长" prop="duration">
        <el-input-number v-model="form.duration" style="width: 200px" controls-position="right" :min="0" :controls="true" :precision="0">
					<template #suffix>
        		<span>分钟</span>
        	</template>
        </el-input-number>
      </el-form-item>
      <el-form-item label="备注信息" prop="remark">
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

<script setup name="ReadDetailForm">
  import { createReadDetail, editReadDetail, getReadDetail} from "@/api/read/readDetail";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('阅读明细详情');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      readTime: [
        { required: true, message: "阅读时间不能为空", trigger: "blur" }
      ],
      duration: [
        { required: true, message: "阅读时长不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,type,bookId) => {
    open.value = true;
    resetForm();
    initOptions();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getReadDetail(id).then(response => {
        formLoading.value = false;
        form.value = response;
        form.value.bookId = response.book.bookId;
        form.value.book = null;
      });
    } else {
      title.value = "新增";
      form.value.bookId = bookId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 初始化下拉树结构 */
  function initOptions() {

  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      detailId: undefined,
      duration:0
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.detailId != undefined) {
          editReadDetail(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createReadDetail(form.value).then(response => {
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
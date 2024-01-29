<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="档案标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="档案内容" prop="content">
            <el-input v-model="form.content" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="业务类型" prop="bussType">
            <el-select v-model="form.bussType" placeholder="请选择">
              <el-option
                v-for="dict in bussTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发生时间" prop="date">
            <el-date-picker type="datetime" v-model="form.date" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="业务ID" prop="sourceId">
            <el-input-number v-model="form.sourceId" :style="{width: '100%'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="档案备注" prop="remark">
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

<script setup name="ArchiveForm">
  import { createArchive, editArchive, syncArchive, getArchive } from "@/api/life/archive";
  import { getDomainClassList } from "@/api/common";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('档案表单');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const bussTypeOptions = ref([]);
  const formType = ref('create');

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      title: [
        { required: true, message: "标题不能为空", trigger: "blur" }
      ],
      content: [
        { required: true, message: "内容不能为空", trigger: "blur" }
      ],
      date: [
        { required: true, message: "发生时间不能为空", trigger: "blur" }
      ],
      bussType: [
        { required: true, message: "业务类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (archiveId, type) => {
    open.value = true;
    resetForm();
    formType.value = type;
    if (archiveId != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getArchive(archiveId).then(response => {
          form.value = response;
        });
      } finally {
        formLoading.value = false;
      }
    } else {
      title.value = "新增";
    }
  }

  /** 同步 */
  const syncData = async (data) => {
    open.value = true;
    resetForm();
    formType.value = 'sync';
    title.value = "同步";
    form.value = data;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm, syncData });

  // 表单重置
  function resetForm() {
    form.value = {
      archiveId: undefined,
      title: undefined,
      content: undefined,
      date: undefined,
      bussType: undefined,
      beanName: undefined,
      sourceId: undefined,
      remark: undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.archiveId != undefined) {
          editArchive(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          if (formType.value == 'create') {
            createArchive(form.value).then(response => {
              proxy.$modal.msgSuccess("新增成功");
              open.value = false;
              // 发送操作成功的事件
              emit('success');
            });
          } else {
            syncArchive(form.value).then(response => {
              proxy.$modal.msgSuccess("同步成功");
              open.value = false;
              // 发送操作成功的事件
              emit('success');
            });
          }

        }
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
  })
</script>
<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="650px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="系统代码" prop="code">
            <el-input-number v-model="form.code" style="width: 505px" align="left" controls-position="right" :controls="true" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="代码名称" prop="name">
            <el-input v-model="form.name" style="width: 505px" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="代码等级" prop="level">
            <el-select
              v-model="form.level"
              placeholder="等级"
              clearable
              collapse-tags
              style="width: 200px">
              <el-option
                v-for="dict in levelOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="代码分类" prop="bussType">
            <el-select
              v-model="form.bussType"
              placeholder="分类"
              clearable
              collapse-tags
              style="width: 200px">
              <el-option
                v-for="dict in bussTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="发送消息" prop="notifiable">
            <el-switch
              v-model="form.notifiable">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实时提醒" prop="realtime">
            <el-switch
              v-model="form.realtime">
            </el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="记录日志" prop="loggable">
            <el-switch
              v-model="form.loggable">
            </el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息限流" prop="limitPeriod">
            <el-input-number v-model="form.limitPeriod" controls-position="right" :min="0" :controls="true" :precision="0" style="width: 80%;" />
            秒
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="移动端连接" prop="mobileUrl">
            <el-input v-model="form.mobileUrl" style="width: 505px" placeholder="请输入连接地址" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="产生原因" prop="causes">
            <el-input v-model="form.causes" type="textarea" :rows="4" style="width: 505px" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="解决方法" prop="solutions">
            <el-input v-model="form.solutions" type="textarea" :rows="4" style="width: 505px" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" style="width: 505px" placeholder="请输入内容"></el-input>
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

<script setup name="SysCodeForm">
  import { getSysCode, createSysCode, editSysCode } from "@/api/log/sysCode";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('');
  const open = ref(false);
  const formLoading = ref(false);
  const formType = ref('create');
  const formRef = ref();
  const levelOptions = ref([]);
  const bussTypeOptions = ref([]);

  const data = reactive({
    form: {},
    rules: {
      code: [
        { required: true, message: "代码不能为空", trigger: "blur" }
      ],
      name: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      level: [
        { required: true, message: "等级不能为空", trigger: "blur" }
      ],
      bussType: [
        { required: true, message: "分类不能为空", trigger: "blur" }
      ],
      causes: [
        { required: true, message: "产生原因不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (code, type) => {
    open.value = true;
    resetForm();
    formType.value = type;
    if (type == 'edit') {
      title.value = "修改";
      try {
        formLoading.value = true;
        getSysCode(code).then(response => {
          if (response == null) {
            formType.value ='create';
            proxy.$modal.msgError("未找到相关代码");
            return;
          }
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
      code: undefined,
      name: undefined,
      level: 'NORMAL',
      bussType: 'SYSTEM',
      realtime: false,
      notifiable: true,
      loggable: true,
      limitPeriod: 0
    };
    proxy.resetForm("formRef");
  }

  /** 提交表单 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (formType.value == 'edit') {
          editSysCode(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createSysCode(form.value).then(response => {
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
    proxy.getEnumDict('LogLevel', 'FIELD', false).then(response => {
      levelOptions.value = response;
    });
    proxy.getEnumDict('MonitorBussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
  })
</script>
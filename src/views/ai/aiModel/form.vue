<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="650px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
      <el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="选择模型" prop="code">
               <el-select
                 v-model="form.code"
                 placeholder="选择模型"
                 clearable
                 collapse-tags
                 style="width: 100%"
               >
                 <el-option
                   v-for="dict in codeOptions"
                   :key="dict.id"
                   :label="dict.text"
                   :value="dict.id"
                   @click.native="handleCodeChange(dict)"
                 />
               </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="24">
          <el-form-item label="模型名称" prop="modelName">
            <el-input v-model="form.modelName" :style="{width: '100%'}" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="模型文件" prop="fileName">
            <el-input v-model="form.fileName" :style="{width: '100%'}" placeholder="请输入名称" />
            <el-upload
              class="upload-demo"
              ref="uploadRef"
              accept=".pmml"
              :on-change="fileChange"
              action="#"
              :multiple="false"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              :before-upload="beforeUpload"
              :auto-upload="false">
              <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="算法类型" prop="algorithm">
            <el-select
              v-model="form.algorithm"
              placeholder="算法类型"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="dict in algorithmOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区分用户" prop="du">
            <el-switch v-model="form.du"></el-switch>
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

<script setup name="AIModelForm">
  import { createAIModel, editAIModel, getAIModel,getProcessorTree } from "@/api/ai/aiModel";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('AI模型');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const algorithmOptions = ref([]);
  const codeOptions = ref([]);
  //文件上传列表
  const fileList = ref([]);
  const currentFile = ref();
  
  const formSubmitting = ref(false);
      
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      modelName: [
        { required: true, message: "模型名称不能为空", trigger: "blur" }
      ],
      code: [
        { required: true, message: "模型代码不能为空", trigger: "blur" }
      ],
      fileName: [
        { required: true, message: "模型文件不能为空", trigger: "blur" }
      ],
      du: [
        { required: true, message: "请选择是否区分用户", trigger: "blur" }
      ],
      algorithm: [
        { required: true, message: "模型算法不能为空", trigger: "blur" }
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
      try {
        formLoading.value = true;
        getAIModel(id).then(response => {
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

  function loadOptions(){
    getProcessorTree().then(response => {
      codeOptions.value = response;
    });
    proxy.getEnumDict('MLAlgorithm', 'FIELD', false).then(response => {
      algorithmOptions.value = response;
    });
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      modelId: undefined,
      modelName: undefined,
      du: false,
      status: "ENABLE"
    };
    fileList.value=[];
    currentFile.value = null;
    proxy.resetForm("formRef");
  }
  
  /** 选择类型按钮操作 */
  function handleCodeChange(item) {
    if (proxy.isEmpty(form.value.modelId)) {
      //新增情况下
      form.value.modelName = item.text;
    }
  }
  
  /** 文件选择 */
  function fileChange (file, fileList) {
  	// 这是关键一句
    if (fileList.length > 0) {
      fileList.value = [fileList[fileList.length - 1]]
    }
    currentFile.value = fileList.value[0];
    form.value.fileName = currentFile.value.name;
  }
  
  /** 删除选择文件 */
  function handleRemove(file, fileList) {
    console.log(file, fileList);
  }
  
  function handlePreview(file) {
    console.log(file);
  }
  
  function beforeUpload(file){
    let fileName = file.name;
    //alert(fileName);
    let fileExt = fileName.replace(/.+\./, "").toLowerCase();
    if(fileExt!='pmml'){
      proxy.$modal.msgError("文件类型必须为pmml");
    }
    form.value.fileName = fileName;
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        let formData = new FormData();
        if(currentFile.value!=null){
          console.log('上传了文件');
          formData.append("file", currentFile.value.raw);
        }
        formData.append('modelId', form.value.modelId==undefined ? '':form.value.modelId);
        formData.append('modelName', form.value.modelName);
        formData.append('code', form.value.code);
        formData.append('fileName', form.value.fileName);
        formData.append('du', form.value.du);
        formData.append('algorithm', form.value.algorithm);
        formData.append('remark', form.value.remark==undefined ? '':form.value.remark);
        if (form.value.modelId != undefined) {
          editAIModel(formData).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createAIModel(formData).then(response => {
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
    loadOptions();
  })
</script>
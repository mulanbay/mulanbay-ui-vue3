<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="730px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="配置名称" prop="configName">
            <el-input v-model="form.configName" style="width: 580px" @blur="setRemark" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="数据来源" prop="source">
            <el-select
              v-model="form.source"
              placeholder="数据来源"
              collapse-tags
              style="width: 230px"
              @change="handleSourceChange"
            >
              <el-option
                v-for="dict in sourceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="级联类型" prop="casCadeType">
            <el-select v-model="form.casCadeType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in casCadeTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item v-if="form.source != 'ANY'" label="配置值" prop="configValue">
            <el-input v-model="form.configValue" type="textarea" :rows="5"  style="width: 580px"  placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="值类型" prop="valueClass">
            <el-select v-model="form.valueClass" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in valueClassOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="绑定用户" v-if="form.source == 'SQL'" prop="bindUser">
            <el-switch v-model="form.bindUser"></el-switch>
            <el-tooltip content="如果绑定用户,说明SQL语句中包含筛选用户字段." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="树形数据" v-if="form.source == 'SQL'||form.source == 'JSON'" prop="tree">
            <el-switch v-model="form.tree"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="form.source == 'ENUM'" label="枚举字段" prop="enumIdType">
            <el-select
              v-model="form.enumIdType"
              placeholder="枚举字段"
              collapse-tags
              style="width: 230px"
            >
              <el-option
                v-for="dict in enumIdTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="提示信息" prop="msg">
            <el-input v-model="form.msg" style="width: 580px"  placeholder="" />
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

<script setup name="StatBindConfigForm">
  import { createStatBindConfig, editStatBindConfig, getStatBindConfig } from "@/api/report/bind/statBindConfig";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('明细');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const sourceOptions = ref([]);
  const casCadeTypeOptions = ref([]);
  const enumIdTypeOptions = ref([]);
  const valueClassOptions = ref([]);
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      configName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      type: [
        { required: true, message: "业务类型不能为空", trigger: "blur" }
      ],
      source: [
        { required: true, message: "数据来源不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      valueClass:[
        { required: true, message: "JSON数据不能为空", trigger: "blur" }
      ],
      fid:[
        { required: true, message: "业务外键不能为空", trigger: "blur" }
      ],
      casCadeType: [
        { required: true, message: "级联类型不能为空", trigger: "blur" }
      ],
      msg: [
        { required: true, message: "提示信息不能为空", trigger: "blur" }
      ],
      bindUser: [
        { required: true, message: "绑定用户不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (id,editType,fid,type) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      formLoading.value = true;
      getStatBindConfig(id).then(response => {
        formLoading.value = false;
        form.value = response;
      });
    } else {
      title.value = "新增";
      form.value.fid = fid;
      form.value.type = type;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 设置备注
  function setRemark(){
    if(proxy.isEmpty(form.value.msg)){
      form.value.msg='请选择'+form.value.configName;
    }
  }
  
  // 来源变化
  function handleSourceChange(source){
    if(source=='SQL'){
      form.value.bandUser = true;
    }
    if(source=='ENUM'){
      form.value.enumIdType = 'ORDINAL';
    }
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      configId: undefined,
      configName: undefined,
      valueClass: 'LONG',
      orderIndex:1,
      casCadeType:'NOT_CASCADE',
      source:'SQL',
      bindUser:true,
      tree:false,
      msg:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.configId != undefined) {
          editStatBindConfig(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createStatBindConfig(form.value).then(response => {
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
    proxy.getEnumDict('StatValueSource', 'FIELD', false).then(response => {
      sourceOptions.value = response;
    });
    proxy.getEnumDict('CasCadeType', 'FIELD', false).then(response => {
      casCadeTypeOptions.value = response;
    });
    proxy.getEnumDict('EnumIdType', 'FIELD', false).then(response => {
      enumIdTypeOptions.value = response;
    });
    proxy.getEnumDict('StatValueClass', 'FIELD', false).then(response => {
      valueClassOptions.value = response;
    });
  })
</script>
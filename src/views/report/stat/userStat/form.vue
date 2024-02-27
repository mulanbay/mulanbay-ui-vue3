<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="统计模板" prop="templateId">
            <el-tree-select
              v-model="form.templateId"
              style="width: 580px"
              :data="statTemplateOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择模版"
              :check-strictly="false" 
              :disabled="form.statId!=null"
              @change="handleFromTemplateChange"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <FormCreate :option="peOption" v-model:api="peApi" :rule="peRule"></FormCreate>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="统计标题" prop="title">
            <el-input v-model="form.title" style="width: 580px"  placeholder="请输入标题" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历标题" prop="calendarTitle">
            <el-input v-model="form.calendarTitle" style="width: 580px"  placeholder="请输入标题" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9">
          <el-form-item :label="'警告值('+compareTypeName+')'" label-width="120px" prop="warningValue">
            <el-input-number v-model="form.warningValue" style="width: 145px" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item :label="'报警值('+compareTypeName+')'" label-width="120px" prop="alertValue">
            <el-input-number v-model="form.alertValue" style="width: 145px" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="单位" prop="unit" label-width="65px">
            <el-input v-model="form.unit" style="width: 75px"  placeholder="请输入单位" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="模板状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.id"
                :label="dict.id"
              >{{dict.text}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示顺序" prop="orderIndex">
            <el-input-number v-model="form.orderIndex" style="width: 230px" controls-position="right" :min="0" :controls="true" :precision="0"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="日历时间" prop="calendarTime">
            <el-time-picker
               v-model="form.calendarTime"
               :picker-options="{
               selectableRange: '00:00:00 - 23:59:00'
               }"
               format="HH:mm" value-format="HH:mm"
               placeholder="任意时间点">
             </el-time-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息提醒" prop="remind">
            <el-switch v-model="form.remind"></el-switch>
            <span v-if="form.statId!=null&&form.remind==true">
              <el-button type="success" size="small" @click="showRemind()" icon="Tools" >设置</el-button>
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
            <el-input v-model="form.remark"  style="width: 580px"  type="textarea" placeholder="请输入内容"></el-input>
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

  <!-- 提醒表单 -->
  <UserStatRemindForm ref="userStatRemindFormRef" />
  
</template>

<script setup name="UserStatForm">
  import { createUserStat, editUserStat, getUserStat,getUserStatTree } from "@/api/report/stat/userStat";
  import { getStatTemplate,getStatTemplateTree } from "@/api/report/stat/statTemplate";
  import { parseStatBindConfigs } from "@/api/report/bind/statBindConfig";
  import { generateFcRules, setTriggerParasBindValues, getBindValues, setBindValues } from "@/utils/formCreateUtils";
  import UserStatRemindForm from '../userStatRemind/form.vue'
  
  //导入 form-create
  import formCreate from "@form-create/element-ui";
  
  const { proxy } = getCurrentInstance();

  //获取 formCreate 组件
  const FormCreate = formCreate.$form();
  const parasEditTitle = ref('绑定条件编辑');
  const parasEditOpen = ref(false);
  const peApi = ref();
  
  const userStatRemindFormRef = ref();
  
  const title = ref('用户统计');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref(proxy.commonStatusOptions);
  const statTemplateOptions = ref([]);
  const compareTypeName = ref('');
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      templateId: [
        { required: true, message: "模板不能为空", trigger: "blur" }
      ],
      title: [
        { required: true, message: "标题不能为空", trigger: "blur" }
      ],
      calendarTitle: [
        { required: true, message: "日历标题不能为空", trigger: "blur" }
      ],
      warningValue: [
        { required: true, message: "警告值不能为空", trigger: "blur" }
      ],
      alertValue: [
        { required: true, message: "报警值不能为空", trigger: "blur" }
      ],
      status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
      ],
      orderIndex: [
        { required: true, message: "排序号不能为空", trigger: "blur" }
      ],
      remind: [
        { required: true, message: "消息提醒不能为空", trigger: "blur" }
      ],
      unit: [
        { required: true, message: "单位不能为空", trigger: "blur" }
      ]
    },
    peRule: [],
    peOption: {
      onSubmit: (formData) => {
        //alert(JSON.stringify(formData));
        parasEditOpen.value = false;
        // 发送操作成功的事件
        emit('success', JSON.stringify(formData));
      },
      submitBtn:false,
      resetBtn: false,
      form: {
        labelPosition: 'right',
        labelWidth: '90px',
        size: undefined,
        inline: false,
        hideRequiredAsterisk: false
      },
      row: {
        type: '',
        gutter: 5
      }
    }
  });

  const { form, rules,peRule, peOption } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);
  
  /** 来源模版变更 */
  function handleFromTemplateChange(id){
    if(form.value.statId!=null){
      return;
    }
    getStatTemplate(id).then(response => {
      compareTypeName.value = response.compareTypeName;
      form.value.title = response.title;
      form.value.calendarTitle= response.calendarTitle;
      form.value.unit = response.valueTypeName;
    });
    loadStatBindConfigs(id,'STAT',form.value.bindValues);
  }
  
  /** 获取值配置列表列表 */
  function loadStatBindConfigs(fid,type,bindValues){
    peApi.value.reload([]);
    parseStatBindConfigs(fid,type).then(
      response => {
        peRule.value = generateFcRules(response);
        //需要重载规则，否则编辑时无法设定值
        peApi.value.reload(peRule.value);
        setBindValues(bindValues,peApi.value);
      }
    );
  }
  
  /** 提醒配置 */
  function showRemind(){
    userStatRemindFormRef.value.openForm(form.value.statId);
  }

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    loadOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getUserStat(id).then(response => {
          form.value = response;
          form.value.templateId = response.template.templateId;
          compareTypeName.value = response.template.compareTypeName;
          form.value.template = null;
          loadStatBindConfigs(form.value.templateId,'STAT',form.value.bindValues);
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
    getStatTemplateTree().then(response => {
      statTemplateOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      statId: undefined,
      status:'ENABLE',
      remind:false,
      orderIndex :1,
      title:undefined,
      calendarTitle:undefined,
      unit:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        //获取绑定值
        let bindValues = getBindValues(peApi.value);
        form.value.bindValues = bindValues;
        if (form.value.statId != undefined) {
          editUserStat(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createUserStat(form.value).then(response => {
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
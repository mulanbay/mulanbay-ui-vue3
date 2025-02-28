<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="90px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="计划模板" prop="templateId">
            <el-tree-select
              v-model="form.templateId"
              style="width: 580px"
              :data="planTemplateOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择模版"
              :check-strictly="false" 
              :disabled="form.planId!=null"
              @change="handleFromTemplateChange"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <FormCreate :option="peOption" v-model:api="peApi" :rule="peRule"></FormCreate>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="计划标题" prop="title">
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
        <el-col :span="12">
          <el-form-item label="计划类型" prop="planType">
            <el-select v-model="form.planType" style="width: 230px" placeholder="请选择">
              <el-option
                v-for="dict in planTypeOptions"
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
        <el-col :span="24">
          <el-form-item label="计划配置" prop="compareType">
            <el-select v-model="form.compareType" style="width: 100px" placeholder="请选择">
              <el-option
                v-for="dict in compareTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"/>
            </el-select>
            <el-tooltip content="大于:统计的值需要比设置的期望值要大.<br>小于:统计的值需要比设置的期望值要小." raw-content effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
            <el-input-number v-model="form.planCountValue" style="width: 180px" controls-position="right" :min="0" :controls="true" :precision="0"/>
                <el-tag type="success">次</el-tag>
            <el-input-number v-model="form.planValue" style="width: 180px" controls-position="right" :min="0" :controls="true" :precision="0"/>
            <el-input v-model="form.unit" style="width: 70px"  placeholder="单位" />
            <el-text class="mx-1" type="danger">{{planDesc}}</el-text>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="计划状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.id"
                :value="dict.id"
              >{{dict.text}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
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
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="消息提醒" prop="remind">
            <el-switch v-model="form.remind"></el-switch>
            <span v-if="form.planId!=null&&form.remind==true">
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
  <UserPlanRemindForm ref="userPlanRemindFormRef" />
  
</template>

<script setup name="UserPlanForm">
  import { createUserPlan, editUserPlan, getUserPlan } from "@/api/report/plan/userPlan";
  import { getPlanTemplate, getPlanTemplateTree } from "@/api/report/plan/planTemplate";
  import { parseStatBindConfigs } from "@/api/report/bind/statBindConfig";
  import { generateFcRules, setTriggerParasBindValues, getBindValues, setBindValues } from "@/utils/formCreateUtils";
  import UserPlanRemindForm from '../userPlanRemind/form.vue'
  
  //导入 form-create
  import formCreate from "@form-create/element-ui";
  
  const { proxy } = getCurrentInstance();

  //获取 formCreate 组件
  const FormCreate = formCreate.$form();
  const parasEditTitle = ref('绑定条件编辑');
  const parasEditOpen = ref(false);
  const peApi = ref();
  
  const userPlanRemindFormRef = ref();
  //计划描述
  const planDesc = ref();
  const title = ref('用户计划');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref(proxy.commonStatusOptions);
  const planTemplateOptions = ref([]);
  const compareTypeOptions = ref([]);
  const planTypeOptions = ref([]);
  
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
      expectValue: [
        { required: true, message: "期望值不能为空", trigger: "blur" }
      ],
      compareType: [
        { required: true, message: "比较类型不能为空", trigger: "blur" }
      ],
      planType: [
        { required: true, message: "计划类型不能为空", trigger: "blur" }
      ],
      planCountValue: [
        { required: true, message: "计划次数值不能为空", trigger: "blur" }
      ],
      planValue: [
        { required: true, message: "计划值不能为空", trigger: "blur" }
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
        inline: true,
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
    if(form.value.planId!=null){
      return;
    }
    getPlanTemplate(id).then(response => {
      form.value.title = response.title;
      form.value.calendarTitle= response.calendarTitle;
      form.value.unit = response.unit;
      planDesc.value = response.remark;
    });
    loadStatBindConfigs(id,'PLAN',form.value.bindValues);
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
    userPlanRemindFormRef.value.openForm(form.value.planId);
  }

  /** 打开弹窗 */
  const openForm = async (id) => {
    open.value = true;
    resetForm();
    loadOptions();
    proxy.$nextTick(() => {
      //方便清除上一次加载过的表单数据
      peApi.value.reload([]);
    });
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getUserPlan(id).then(response => {
          form.value = response;
          planDesc.value = response.template.remark;
          form.value.templateId = response.template.templateId;
          form.value.template = null;
          loadStatBindConfigs(form.value.templateId,'PLAN',form.value.bindValues);
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
    getPlanTemplateTree().then(response => {
      planTemplateOptions.value = response;
    });
    proxy.getEnumDict('CompareType', 'FIELD', false).then(response => {
      compareTypeOptions.value = response;
    });
    proxy.getEnumDict('PlanType', 'FIELD', false).then(response => {
      planTypeOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    form.value = {
      planId: undefined,
      status:'ENABLE',
      remind:false,
      compareType: 'MORE',
      planType: 'MONTH',
      orderIndex :1,
      planCountValue :0,
      planValue :0,
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
        if (form.value.planId != undefined) {
          editUserPlan(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createUserPlan(form.value).then(response => {
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
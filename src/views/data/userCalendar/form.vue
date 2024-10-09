<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历标题" prop="title">
            <el-input v-model="form.title" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历内容" prop="content">
            <el-input v-model="form.content" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="周期类型" prop="period">
            <el-select
              v-model="form.period"
              placeholder="周期"
              style="width: 240px"
              @change="loadPeriodValueOptions">
              <el-option
                v-for="dict in periodOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="唯一标识" prop="bussIdentityKey">
            <el-input v-model="form.bussIdentityKey" placeholder="" disabled/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="form.period == 'WEEKLY'||form.period == 'MONTHLY'" :span="24">
          <el-form-item label="周期值" prop="periodValues">
            <el-checkbox-group v-model="periodValues" @change="handlePeriodValuesChange">
              <el-checkbox v-for="pv in periodValueOptions" :label="pv.id" :key="pv.id">{{pv.text}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-card>
      <el-row>
        <el-col :span="23">
          <el-form-item label="绑定行为" prop="templateId">
            <el-tree-select
              v-model="form.templateId"
              :data="behaviorTemplateOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              style="width: 740px"
              clearable
              placeholder="选择模版"
              :check-strictly="false"
              :disabled="form.planId!=null"
              @change="handleTemplateChange" />
          </el-form-item>
        </el-col>
        <el-col :span="1">
          <el-tooltip content="如果绑定了绑定用户行为,则系统会自动根据模版的数据值来判断该日历是否完成." effect="dark" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <FormCreate :option="peOption" v-model:api="peApi" :rule="peRule"></FormCreate>
        </el-col>
      </el-row>
      </el-card>
      <el-divider />
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="bussDay">
            <el-date-picker type="datetime" v-model="form.bussDay" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '210px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-tooltip content="如果是周期性的日历,则选择任意一天的时分秒" effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过期时间" prop="expireTime">
            <el-date-picker type="datetime" v-model="form.expireTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="日历来源" prop="sourceType">
            <el-select
              v-model="form.sourceType"
              placeholder="日历来源"
              style="width: 240px">
              <el-option
                v-for="dict in sourceTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="全天日历" prop="allDay">
            <el-switch
              v-model="form.allDay">
            </el-switch>
            <span class="link-type" @click="msgAlert('提示','如果是全天日历，则预定时间里面的时分秒没有实际意义')"><i class="el-icon-question" /></span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="完成时间" prop="finishTime">
            <el-date-picker type="datetime" v-model="form.finishTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '100%'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="完成类型" prop="finishType">
            <el-select
              v-model="form.finishType"
              placeholder="完成类型"
              clearable
              style="width: 240px">
              <el-option
                v-for="dict in finishTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历地点">
            <el-input v-model="form.location" placeholder="" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="日历备注">
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

<script setup name="UserCalendarForm">
  import { createUserCalendar, editUserCalendar, getUserCalendar } from "@/api/data/userCalendar";
  import { getBehaviorTemplateUserTree } from "@/api/behavior/behaviorTemplate";
  import { getCalendarTemplateUserTree } from "@/api/data/calendarTemplate";
  import { parseStatBindConfigs } from "@/api/report/bind/statBindConfig";
  import { generateFcRules, getBindValues, setBindValues } from "@/utils/formCreateUtils";

  //导入 form-create
  import formCreate from "@form-create/element-ui";

  const { proxy } = getCurrentInstance();
  //获取 formCreate 组件
  const FormCreate = formCreate.$form();
  const parasEditTitle = ref('绑定条件编辑');
  const parasEditOpen = ref(false);
  const peApi = ref();

  //可执行时间段
  const title = ref('用户日历');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const periodOptions = ref([]);
  const periodValues = ref([]);
  const periodValueOptions = ref([]);
  const behaviorTemplateOptions = ref([]);
  const finishTypeOptions = ref([]);
  const sourceTypeOptions = ref([]);

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
      period: [
        { required: true, message: "周期不能为空", trigger: "blur" }
      ],
      bussDay: [
        { required: true, message: "开始时间不能为空", trigger: "blur" }
      ],
      sourceType: [
        { required: true, message: "日历来源不能为空", trigger: "blur" }
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
        labelWidth: '100px',
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

  const { form, rules,peRule,peOption } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 日历模版变更 */
  function handleTemplateChange(id) {
    if(proxy.isEmpty(id)){
      peApi.value.reload([]);
      return;
    }
    if (form.value.templateId != null) {
      //return;
    }
    loadStatBindConfigs(id, 'BEHAVIOR', form.value.bindValues);
  }

  /** 获取值配置列表列表 */
  function loadStatBindConfigs(fid, type, bindValues) {
    peApi.value.reload([]);
    parseStatBindConfigs(fid, type).then(
      response => {
        peRule.value = generateFcRules(response);
        //需要重载规则，否则编辑时无法设定值
        peApi.value.reload(peRule.value);
        setBindValues(bindValues, peApi.value);
      }
    );
  }

  /** 打开弹窗 */
  const openForm = async (id, type) => {
    open.value = true;
    resetForm();
    proxy.$nextTick(() => {
      //方便清除上一次加载过的表单数据
      peApi.value.reload([]);
    });
    loadOptions();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getUserCalendar(id).then(response => {
          form.value = response;
          if (!proxy.isEmpty(form.value.templateId)) {
            loadStatBindConfigs(form.value.templateId, 'BEHAVIOR', form.value.bindValues);
          }
          loadPeriodValueOptions();
          if (proxy.isEmpty(response.periodValues)) {
            periodValues.value = [];
          } else {
            //这里解析出来是字符数组，所以loadPeriodValueOptions方法里的id也需要是字符
            periodValues.value = response.periodValues.split(',');
          }
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

  function loadOptions() {
    getBehaviorTemplateUserTree().then(response => {
      behaviorTemplateOptions.value = response;
    });

  }

  // 枚举类的下拉菜单
  function loadTypeOptions() {
    proxy.getEnumDict('PeriodType', 'FIELD', false).then(response => {
      periodOptions.value = response;
    });
    proxy.getEnumDict('BussSource', 'FIELD', false).then(response => {
      sourceTypeOptions.value = response;
    });
    proxy.getEnumDict('UserCalendarFinishType', 'FIELD', false).then(response => {
      finishTypeOptions.value = response;
    });
  }

  //加载值的选项
  function loadPeriodValueOptions() {
    periodValueOptions.value = [];
    if (form.value.period == 'WEEKLY') {
      periodValueOptions.value = new Array();
      periodValueOptions.value.push({ id: '1', text: '周一' });
      periodValueOptions.value.push({ id: '2', text: '周二' });
      periodValueOptions.value.push({ id: '3', text: '周三' });
      periodValueOptions.value.push({ id: '4', text: '周四' });
      periodValueOptions.value.push({ id: '5', text: '周五' });
      periodValueOptions.value.push({ id: '6', text: '周六' });
      periodValueOptions.value.push({ id: '7', text: '周日' });
    } else if (form.value.period == 'MONTHLY') {
      periodValueOptions.value = new Array();
      for (let i = 1; i <= 31; i++) {
        var text = i + '号';
        if (i < 10) {
          text = '_' + i + '号';
        }
        periodValueOptions.value.push({ id: i + '', text: text });
      }
    }
  }

  //周期值刷新
  function handlePeriodValuesChange() {
    proxy.$forceUpdate();
  }

  // 表单重置
  function resetForm() {
    form.value = {
      calendarId: undefined,
      bussIdentityKey: 'manual_' + (new Date().Format("yyyyMMddhhmmss")),
      sourceType: 'MANUAL',
      allDay: false,
      period: 'ONCE'
    };
    form.value.periodValues = [];
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        //获取绑定值
        let bindValues = getBindValues(peApi.value);
        form.value.bindValues = bindValues;
        let pvs = periodValues.value;
        if (pvs != null && pvs.length > 0) {
          form.value.periodValues = pvs.join(',');
        } else {
          form.value.periodValues = undefined;
        }
        if (form.value.calendarId != undefined) {
          editUserCalendar(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createUserCalendar(form.value).then(response => {
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
    loadTypeOptions();
  })
</script>
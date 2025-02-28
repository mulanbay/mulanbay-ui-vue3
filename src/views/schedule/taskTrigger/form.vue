<template>
  <!-- 添加或修改对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body class="customDialogCss">
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="调度名称" prop="triggerName">
            <el-input v-model="form.triggerName" placeholder="请输入调度名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="调度类名" prop="taskClass">
            <el-input v-model="form.taskClass" placeholder="请输入调度类" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="调度分组" prop="groupName">
            <el-select
              v-model="form.groupName"
              filterable
              allow-create
              default-first-option
              style="width: 200px">
              <el-option
                v-for="dict in groupNameOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调度周期" prop="redoType">
            每
            <el-input-number v-model="form.triggerInterval" style="width: 80px;" placeholder="" controls-position="right" :min="1" :controls="false" :precision="0" />
            <el-select
              v-model="form.triggerType"
              placeholder="周期"
              clearable
              allow-create
              collapse-tags
              style="width: 100px">
              <el-option
                v-for="dict in triggerTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            /次
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="部署点" prop="deployId">
            <el-select
              v-model="form.deployId"
              filterable
              allow-create
              default-first-option
              style="width: 200px">
              <el-option
                v-for="dict in deployIdOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支持分布式" prop="distriable">
            <el-switch v-model="form.distriable"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="重做类型" prop="redoType">
            <el-select
              v-model="form.redoType"
              placeholder="状态"
              clearable
              allow-create
              collapse-tags
              style="width: 200px">
              <el-option
                v-for="dict in redoTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大重做次数" prop="allowedRedoTimes">
            <el-input-number v-model="form.allowedRedoTimes" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
            次
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="超时时间" prop="timeout">
            <el-input v-model="form.timeout" placeholder="" type="number" min="-1" style="width: 200px;" >
              <template #append>
                <el-tooltip content="小于0则表示由系统自动决定." effect="dark" placement="top">
                  <el-icon>
                    毫秒
                  </el-icon>
                </el-tooltip>
              </template> 
            </el-input>
            <el-button type="primary" icon="HelpFilled" @click="handleTimeout" v-hasPermi="['schedule:taskTrigger:calcTimeout']">选取</el-button>
            <el-text class="mx-1" type="success">
              <span v-if="form.timeout<0">
                由系统自动决定
              </span>
              <span v-else>
                {{ form.timeout/1000 +'秒' }}
              </span>
            </el-text>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.triggerType == 'CRON'">
        <el-col :span="24">
          <el-form-item label="CRON公式" prop="cronExpression">
            <el-input v-model="form.cronExpression" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="调度参数" prop="triggerParas">
            <el-input v-model="form.triggerParas" style="width: 500px;" disabled placeholder="" />
            <el-button type="primary" icon="edit" @click="handleParasEdit" v-hasPermi="['schedule:taskTrigger:create']">编辑</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="执行时间段" prop="execTimePeriods">
            <el-input v-model="form.execTimePeriods" style="width: 500px;" disabled placeholder="" />
            <el-button type="primary" icon="edit" @click="handleExecTimeEdit" v-hasPermi="['schedule:taskTrigger:create']">编辑</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="调度状态" prop="triggerStatus">
            <el-select
              v-model="form.triggerStatus"
              placeholder="状态"
              clearable
              allow-create
              collapse-tags
              style="width: 200px">
              <el-option
                v-for="dict in triggerStatusOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="时间偏移量" prop="offsetDays">
            <el-input-number v-model="form.offsetDays" placeholder="" controls-position="right" :controls="false" :precision="0" />
            天
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="首次执行时间" prop="firstExecuteTime">
            <el-date-picker type="datetime" v-model="form.firstExecuteTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '200px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="下一次执行时间" prop="nextExecuteTime">
            <el-date-picker type="datetime" v-model="form.nextExecuteTime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              :style="{width: '200px'}" placeholder="请选择时间" clearable>
            </el-date-picker>
            <span class="link-type" @click="msgAlert('提示','默认等于首次执行时间')"><i class="el-icon-question" /></span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="检查唯一性" prop="checkUnique">
            <el-switch v-model="form.checkUnique"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="唯一性类型" prop="uniqueType">
            <el-select
              v-model="form.uniqueType"
              placeholder="唯一性类型"
              clearable
              allow-create
              collapse-tags
              style="width: 200px">
              <el-option
                v-for="dict in uniqueTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="记录日志" prop="loggable">
            <el-switch v-model="form.loggable"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="消息提醒" prop="notifiable">
            <el-switch v-model="form.notifiable"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="未做检查" prop="undoCheck">
            <el-switch v-model="form.undoCheck"></el-switch>
            <el-tooltip content="设置未做检查,则系统自动按照运营日检查且执行没有做的任务." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息">
            <el-input v-model="form.comment" type="textarea" placeholder="请输入内容"></el-input>
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

  <!-- 调度参数编辑 -->
  <TriggerParasForm ref="triggerParasFormRef" @success="confirmTriggerParasEdit" />

  <!-- 时间段编辑 -->
  <TimePeriodsForm ref="timePeriodsFormRef" @success="confirmExecTimeEdit" />

  <!-- 超时时间编辑 -->
  <TimeoutForm ref="timeoutFormRef" @success="confirmTimeout" />
  
</template>

<script setup name="TaskTriggerForm">
  import { getTaskTrigger, createTaskTrigger, editTaskTrigger, getTaskTriggerCategoryTree } from "@/api/schedule/taskTrigger";
  import { getTaskServerTree } from "@/api/schedule/taskServer";
  import { encodeJsonString,deepEqual,deepClone } from "@/utils/mulanbay";
  import TimePeriodsForm from './timePeriods.vue'
  import TriggerParasForm from './triggerParas.vue'
  import TimeoutForm from './timeout.vue'
  import { ElNotification } from 'element-plus'

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //时间段编辑
  const timePeriodsFormRef = ref();
  //调度参数编辑
  const triggerParasFormRef = ref();
  //超时时间编辑
  const timeoutFormRef = ref();
  
  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);
  const formLoading = ref(false);
  //对象编辑检查
  const oldFormData = ref({});
  
  const triggerTypeOptions = ref([]);
  const triggerStatusOptions = ref([]);
  const groupNameOptions = ref([]);
  const deployIdOptions = ref([]);
  const redoTypeOptions = ref([]);
  const uniqueTypeOptions = ref([]);

  const data = reactive({
    form: {},
    rules: {
      triggerName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      taskClass: [
        { required: true, message: "调度类名不能为空", trigger: "blur" }
      ],
      groupName: [
        { required: true, message: "分组名不能为空", trigger: "blur" }
      ],
      timeout: [
        { required: true, message: "超时时间不能为空", trigger: "blur" }
      ],
      deployId: [
        { required: true, message: "部署点不能为空", trigger: "blur" }
      ],
      distriable: [
        { required: true, message: "支持分布式不能为空", trigger: "blur" }
      ],
      redoType: [
        { required: true, message: "重做类型不能为空", trigger: "blur" }
      ],
      undoCheck: [
        { required: true, message: "未做检查不能为空", trigger: "blur" }
      ],
      triggerInterval: [
        { required: true, message: "调度周期不能为空", trigger: "blur" }
      ],
      triggerType: [
        { required: true, message: "调度周期类型不能为空", trigger: "blur" }
      ],
      offsetDays: [
        { required: true, message: "时间偏移量不能为空", trigger: "blur" }
      ],
      triggerStatus: [
        { required: true, message: "调度状态不能为空", trigger: "blur" }
      ],
      firstExecuteTime: [
        { required: true, message: "首次执行时间不能为空", trigger: "blur" }
      ],
      triggerInterval: [
        { required: true, message: "调度周期不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

  /** 打开弹窗 */
  const openForm = async (id, type) => {
    open.value = true;
    resetForm();
    if (id != null) {
      title.value = "修改";
      try {
        formLoading.value = true;
        getTaskTrigger(id).then(response => {
          form.value = response;
          if (type == 'copy') {
            form.value.triggerId = null;
            form.value.triggerName = form.value.triggerName + '_COPY';
            title.value = "复制";
          }else{
            //方便检查表单是否编辑过
            oldFormData.value = deepClone(response);
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

  // 表单重置
  function resetForm() {
    form.value = {
      triggerId: undefined,
      triggerName: undefined,
      timeout: 60000,
      distriable: true,
      redoType: 'MUNUAL_REDO',
      undoCheck: false,
      allowedRedoTimes: 5,
      triggerInterval: 1,
      triggerType: 'HOUR',
      offsetDays: 0,
      triggerStatus: 'ENABLE',
      checkUnique: true,
      uniqueType: 'IDENTITY',
      loggable: true,
      notifiable: false
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.triggerId != undefined){
          //检测是否编辑过,不能在执行参数编码之后比对，否则数据对不上
          let eqs = deepEqual(form.value,oldFormData.value);
          if(eqs){
            ElNotification({title: '提示',message: '数据未变化，不进行更新!',type: 'warning',});
            open.value = false;
            return;
          }
        }
        //需要编码
        form.value.triggerParas = encodeJsonString(form.value.triggerParas);
        form.value.execTimePeriods = encodeJsonString(form.value.execTimePeriods);
        if (form.value.triggerId != undefined) {
          editTaskTrigger(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createTaskTrigger(form.value).then(response => {
            proxy.$modal.msgSuccess("新增成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        }
      }
    });
  }

  /** 调度参数编辑 **/
  function handleParasEdit() {
    const className = form.value.taskClass;
    if (proxy.isEmpty(className)) {
      proxy.$modal.msgError('请先设置调度类');
      return;
    }
    triggerParasFormRef.value.openParasEdit(className, form.value.triggerParas);
  }

  /** 确认调度执行时间段编辑 **/
  function confirmTriggerParasEdit(data) {
    form.value.triggerParas = data;
  }

  /** 调度执行时间段编辑 **/
  function handleExecTimeEdit() {
    timePeriodsFormRef.value.openTimePeriodsEdit(form.value.execTimePeriods);
  }

  /** 确认调度执行时间段编辑 **/
  function confirmExecTimeEdit(data) {
    form.value.execTimePeriods = data;
  }
  
  /** 超时时间编辑 **/
  function handleTimeout() {
    timeoutFormRef.value.openForm(form.value.triggerId);
  }
  
  /** 确认超时时间编辑 **/
  function confirmTimeout(data) {
    form.value.timeout = data;
  }
  
  /** 初始化 **/
  onMounted(() => {
    getTaskServerTree().then(response => {
      deployIdOptions.value = response;
    });
    getTaskTriggerCategoryTree('groupName', false).then(response => {
      groupNameOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.RedoType', 'FIELD', false).then(response => {
      redoTypeOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TriggerStatus', 'FIELD', false).then(response => {
      triggerStatusOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TaskUniqueType', 'FIELD', false).then(response => {
      uniqueTypeOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TriggerType', 'FIELD', false).then(response => {
      triggerTypeOptions.value = response;
    });
  })
</script>
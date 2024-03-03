<template>
  <div class="app-container">

    <el-form ref="formRef" v-loading="formLoading"  :model="form" :rules="rules" label-width="140px">
      <el-form-item label="自动锁定检查周期" prop="redoType">
        每
        <el-input-number v-model="form.triggerInterval" disabled style="width: 80px;" placeholder="" controls-position="right" :min="1" :controls="false" :precision="0" />
        <el-select
          v-model="form.triggerType"
          placeholder="周期"
          disabled
          allow-create
          collapse-tags
          style="width: 155px">
          <el-option
            v-for="dict in triggerTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        /次
      </el-form-item>
      <el-form-item label="自动锁定检查状态" prop="triggerStatus">
        <el-select
          v-model="form.triggerStatus"
          placeholder="状态"
          collapse-tags
          style="width: 250px">
          <el-option
            v-for="dict in triggerStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="系统锁定时间段" prop="stopPeriod">
        <el-tag
          :key="tag"
          v-for="tag in stopPeriodOptions"
          closable
          size="large"
          :disable-transitions="false"
          @close="handleTagClose(tag)">
          {{tag}}
        </el-tag>
         <el-popover :visible="tagsPopOpen" placement="top" :width="450">
          <el-time-picker
            v-model="timePeriod"
            is-range
            format="HH:mm" 
            value-format="HH:mm"
            :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
          <div style="text-align: right; margin: 0">
            <br>
            <el-button size="small" type="primary" icon="Check" @click="confirmTimePeriod" >确定</el-button>
            <el-button size="small" type="warning" icon="Close" @click="tagsPopOpen = false" >取消</el-button>
          </div>
          <template #reference>
            <el-button type="success" @click="tagsPopOpen = true" size="default" icon="Share">选择</el-button>
          </template>
        </el-popover>
        <el-tooltip content="格式:01:00-02:00,多个以逗号分隔,空为不锁定." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-button icon="refresh" type="primary" v-hasPermi="['system:system:getAutoLock']" @click="loadAutoLock">刷新</el-button>
            </el-col>
            <el-col :span="12">
              <el-button icon="edit" type="danger" v-hasPermi="['system:system:editAutoLock']" @click="submitForm">修改</el-button>      
            </el-col>
          </el-row>
      </el-form-item>
    </el-form>

  </div>

</template>

<script setup name="SystemAutoLockForm">
  import { getAutoLock,editAutoLock } from "@/api/system/system";
  import { appendTagToOptions } from "@/utils/tagUtils";

  const { proxy } = getCurrentInstance();

  const formLoading = ref(false);
  const formRef = ref();
  const triggerData = ref();
  const triggerTypeOptions = ref([]);
  const triggerStatusOptions = ref([]);
  const stopPeriodOptions = ref([]);
  const timePeriod = ref();
  const tagsPopOpen = ref(false);

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      triggerInterval: [
        { required: true, message: "调度频率不能为空", trigger: "blur" }
      ],
      triggerType: [
        { required: true, message: "调度周期不能为空", trigger: "blur" }
      ],
      triggerStatus: [
        { required: true, message: "调度状态不能为空", trigger: "blur" }
      ]
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);
  
  // 表单重置
  function resetForm() {
    form.value = {
      
    };
    proxy.resetForm("formRef");
  }

  function loadAutoLock(){
    formLoading.value = true;
    resetForm();
    getAutoLock().then(response => {
      formLoading.value = false;
      form.value.stopPeriod = response.stopPeriod;
      form.value.triggerType = response.trigger.triggerType;
      form.value.triggerInterval = response.trigger.triggerInterval;
      form.value.triggerStatus = response.trigger.triggerStatus;
      triggerData.value = response.trigger;
      if (!proxy.isEmpty(form.value.stopPeriod)) {
        stopPeriodOptions.value = form.value.stopPeriod.split(',');
      } else {
        stopPeriodOptions.value = [];
      }
    });
  }
  
  
  /** 标签处理 start */
  function handleTagClose(tag) {
    stopPeriodOptions.value.splice(stopPeriodOptions.value.indexOf(tag), 1);
  }
  
  function confirmTimePeriod(){
    if(proxy.isEmpty(timePeriod.value)){
      return;
    }
    let pd = timePeriod.value[0]+'-'+timePeriod.value[1];
    appendTagToOptions(pd,stopPeriodOptions.value);
    tagsPopOpen.value= false;
  }
  /** 标签处理 end */
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (stopPeriodOptions.value.length > 0) {
          form.value.tags = stopPeriodOptions.value.join(',');
        } else {
          form.value.stopPeriod = undefined;
        }
        editAutoLock(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {
    loadAutoLock();
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TriggerType', 'FIELD', false).then(response => {
      triggerTypeOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TriggerStatus', 'FIELD', false).then(response => {
      triggerStatusOptions.value = response;
    });
  })
</script>
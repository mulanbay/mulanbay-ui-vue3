<template>

  <!-- 执行时间段编辑对话框 -->
  <el-dialog :title="teEditTitle" v-model="teEditOpen" width="600px" append-to-body>
    <el-form ref="teFormRef" :model="teForm" label-width="120px">
      <el-form-item label="运行时间段" prop="times">
        <el-tag
          :key="tag"
          v-for="tag in timePeriodOptions"
          closable
          size="large"
          :disable-transitions="false"
          @close="handleTagClose(tag)">
          {{tag}}
        </el-tag>
         <el-popover :visible="tagsPopOpen" placement="bottom" :width="450">
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
        <el-tooltip content="格式:01:00-02:00,多个以逗号分隔,空为总是要运行." effect="dark" placement="top">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="运行的星期" prop="weeks">
        <el-checkbox-group v-model="teForm.weeks" @change="handleWeeksChange">
          <el-checkbox label="1">星期一</el-checkbox>
          <el-checkbox label="2">星期二</el-checkbox>
          <el-checkbox label="3">星期三</el-checkbox>
          <el-checkbox label="4">星期四</el-checkbox>
          <el-checkbox label="5">星期五</el-checkbox>
          <el-checkbox label="6">星期六</el-checkbox>
          <el-checkbox label="7">星期日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitExecTimeEdit">确 定</el-button>
        <el-button @click="teEditOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TaskTriggerTimePeriods">
  import { appendTagToOptions } from "@/utils/tagUtils";
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const teEditTitle = ref('可执行时间段');
  const teEditOpen = ref(false);
  const teFormRef = ref();

  const timePeriodOptions = ref([]);
  const timePeriod = ref();
  const tagsPopOpen = ref(false);
  
  const data = reactive({
    teForm: {}
  });

  const { teForm } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openTimePeriodsEdit = async (execTimePeriods) => {
    teEditOpen.value = true;
    resetForm();
    if (proxy.isEmpty(execTimePeriods) || execTimePeriods == '{}') {
      return;
    }
    let pp = JSON.parse(execTimePeriods);;
    if (pp == undefined) {
      return;
    }
    if (!proxy.isEmpty(pp.times)) {
      timePeriodOptions.value = pp.times.split(',');
    } else {
      timePeriodOptions.value = [];
    }
    if (pp.weeks != undefined) {
      teForm.value.weeks = pp.weeks.split(',');
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openTimePeriodsEdit });

  /** 标签处理 start */
  function handleTagClose(tag) {
    timePeriodOptions.value.splice(timePeriodOptions.value.indexOf(tag), 1);
  }
  
  function confirmTimePeriod(){
    if(proxy.isEmpty(timePeriod.value)){
      return;
    }
    let pd = timePeriod.value[0]+'-'+timePeriod.value[1];
    appendTagToOptions(pd,timePeriodOptions.value);
    tagsPopOpen.value= false;
  }
  /** 标签处理 end */
  
  /** 不刷新显示有问题 */
  function handleWeeksChange() {
    proxy.$forceUpdate();
  }

  // 表单重置
  function resetForm() {
    teForm.value = {
      times: undefined,
      weeks: undefined
    };
    proxy.resetForm("teFormRef");
  }

  /** 提交表单 */
  function submitExecTimeEdit() {
    let pp = { times: undefined, weeks: undefined };
    if (timePeriodOptions.value.length > 0) {
      pp.times = timePeriodOptions.value.join(',');
    } else {
      pp.times = undefined;
    }
    if (teForm.value.weeks != null && teForm.value.weeks.length > 0) {
      pp.weeks = teForm.value.weeks.join(',');
    }
    teEditOpen.value = false;
    // 发送操作成功的事件
    emit('success', JSON.stringify(pp));
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
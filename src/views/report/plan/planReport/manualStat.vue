<template>

  <!-- 手动执行对话框 -->
  <el-dialog :title="manualStatTitle" v-model="manualStatOpen" width="600px" append-to-body>
    <el-form ref="manualStatFormRef" :model="manualStatForm" :rules="manualStatRules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="数据类型" prop="planSource">
            <el-radio-group v-model="planSource" @change="handleSourceChange">
              <el-radio label="PLAN">指定计划</el-radio>
              <el-radio label="TYPE">指定类型</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="计划类型" v-show="planSource=='TYPE'" prop="planType">
            <el-select
              v-model="manualStatForm.planType"
              placeholder="计划类型"
              clearable
              style="width: 515px"
            >
              <el-option
                v-for="dict in planTypeOptions"
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
          <el-form-item label="选择计划" v-show="planSource=='PLAN'" prop="planId">
            <el-tree-select
              v-model="manualStatForm.planId"
              style="width: 515px"
              :data="userPlanOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择计划"
              :check-strictly="false" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="业务日期" prop="bussDay">
            <el-date-picker type="date" v-model="manualStatForm.bussDay" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
              style="width: 140px" placeholder="请选择时间" clearable>
            </el-date-picker>
            <el-tooltip content="1. 年计划则选择该年中的任意一天.<br>2. 月计划则选择该月中的任意一天." raw-content effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="统计类型" prop="statType">
            <el-select
              v-model="manualStatForm.statType"
              placeholder="状态"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in statTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitManualStat">确 定</el-button>
        <el-button @click="manualStatOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="UserPlanManualStat">
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import { manualStatPlanReport } from "@/api/report/plan/planReport";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const manualStatTitle = ref('手动统计');
  const manualStatOpen = ref(false);
  const manualStatFormRef = ref();
  const userPlanOptions = ref([]);
  const statTypeOptions = ref([]);
  const planTypeOptions = ref([]);
  const planSource = ref('PLAN');

  const data = reactive({
    manualStatForm: {},
    manualStatRules: {
      bussDay: [
        { required: true, message: "业务日期不能为空", trigger: "blur" }
      ],
      statType: [
        { required: true, message: "统计类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { manualStatForm, manualStatRules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async () => {
    manualStatOpen.value = true;
    resetForm();
    loadOptions();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  function handleSourceChange(){
    resetForm();
  }
  
  /** 加载树 */
  function loadOptions() {
    getUserPlanTree().then(response => {
      userPlanOptions.value = response;
    });
    proxy.getEnumDict('ManualStatType', 'FIELD', false).then(response => {
      statTypeOptions.value = response;
    });
    proxy.getEnumDict('PlanType', 'FIELD', false).then(response => {
      planTypeOptions.value = response;
    });
    
  }

  // 表单重置
  function resetForm() {
    manualStatForm.value = {
      statType: 'RE_STAT',
      bussDay: undefined
    };
    proxy.resetForm("teFormRef");
  }

  /** 提交表单 */
  function submitManualStat() {
    proxy.$modal.loading("正在统计数据，请稍候！");
    proxy.$refs["manualStatFormRef"].validate(valid => {
      if (valid) {
        manualStatPlanReport(manualStatForm.value).then(response => {
          proxy.$modal.closeLoading();
          proxy.$modal.msgSuccess("统计成功");
          manualStatOpen.value = false;
          // 发送操作成功的事件
          emit('success');
        });
      }
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
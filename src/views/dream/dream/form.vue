<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="720px" append-to-body>
    <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="梦想名称" prop="dreamName">
           <el-input v-model="form.dreamName" placeholder="请输入梦想名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="困难程度" prop="difficulty">
           <el-rate
             v-model="form.difficulty"
             show-score
             text-color="#ff9900"
             score-template="{value}">
           </el-rate>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="重要程度" prop="important">
           <el-rate
             v-model="form.important"
             show-score
             allow-half
             text-color="#ff9900"
             score-template="{value}">
           </el-rate>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="期望实现日期" prop="expectDate">
            <el-date-picker type="date" v-model="form.expectDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '200px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最晚截止日期" prop="deadline">
            <el-date-picker type="date" v-model="form.deadline" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '200px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="实现日期" prop="finishDate">
            <el-date-picker type="date" v-model="form.finishDate" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                      :style="{width: '200px'}" placeholder="请选择日期" clearable >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="梦想状态" prop="status">
            <el-select
              v-model="form.status"
              placeholder="状态"
              clearable
              collapse-tags
              style="width: 200px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所需资金" prop="cost">
           <el-input-number v-model="form.cost" :style="{width: '200px'}" placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息提醒" prop="remind">
            <el-switch v-model="form.remind"></el-switch>
            <span v-if="form.dreamId!=null&&form.remind==true">
              <el-button type="success" size="small" @click="showRemind()" icon="Tools" >设置</el-button>
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预计完成天数" prop="expectDays">
           <el-input-number v-model="form.expectDays" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="进度(%)" prop="rate">
           <el-input-number v-model="form.rate" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :max="100" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="关联计划" prop="planId">
            <el-tree-select
              v-model="form.planId"
              style="width: 200px"
              :data="userPlanOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择计划"
              :check-strictly="false"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划期望值" prop="planValue">
            <el-input-number v-model="form.planValue" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="积分奖励" prop="rewards">
           <el-input-number v-model="form.rewards" :style="{width: '200px'}" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注信息" prop="remark">
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

  <!-- 提醒 -->
  <DreamRemindForm ref="dreamRemindFormRef" />
  
</template>

<script setup name="DreamForm">
  import { createDream, editDream, getDream } from "@/api/dream/dream";
  import { getUserPlanTree } from "@/api/report/plan/userPlan";
  import DreamRemindForm from '../dreamRemind/form.vue'

  const { proxy } = getCurrentInstance();
  const dreamRemindFormRef = ref();

  //可执行时间段
  const title = ref('乐器');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  const statusOptions = ref();
  const userPlanOptions = ref();

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      dreamName: [
        { required: true, message: "名称不能为空", trigger: "blur" }
      ],
      deadline: [
        { required: true, message: "截止日期不能为空", trigger: "blur" }
      ],
      expectDate: [
        { required: true, message: "期望实现日期不能为空", trigger: "blur" }
      ],
      difficulty: [
        { required: true, message: "困难程度不能为空", trigger: "blur" }
      ],
      important: [
        { required: true, message: "重要程度不能为空", trigger: "blur" }
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
        getDream(id).then(response => {
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
  
  /** 提醒 */
  function showRemind(){
    dreamRemindFormRef.value.openForm(form.value.dreamId);
  }
  
  // 表单重置
  function resetForm() {
    form.value = {
      dreamId: undefined,
      dreamName: undefined,
      status: "CREATED",
      difficulty: 5,
      important: 3,
      rate: 0,
      expectDays:0,
      rewards:0,
      remind:false,
      planId:undefined,
      remark:undefined
    };
    proxy.resetForm("formRef");
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        if (form.value.dreamId != undefined) {
          editDream(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            // 发送操作成功的事件
            emit('success');
          });
        } else {
          createDream(form.value).then(response => {
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
    proxy.getEnumDict('DreamStatus', 'FIELD', false).then(response => {
      statusOptions.value = response;
    });
    getUserPlanTree().then(response => {
      userPlanOptions.value = response;
    });
  })
</script>
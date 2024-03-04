<template>

  <!-- 手动执行对话框 -->
  <el-dialog :title="cleanTitle" v-model="cleanOpen" width="480px" append-to-body>
    <el-divider content-position="center">表信息</el-divider>
    <el-descriptions class="margin-top" :column="1" border>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            清理名称
          </div>
        </template>
        {{ cleanForm.name}}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            数据库表
          </div>
        </template>
        {{ cleanForm.tableName}}
      </el-descriptions-item>
      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <StarFilled />
            </el-icon>
            附加条件
          </div>
        </template>
        {{ cleanForm.extraCondition}}
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">清理</el-divider>

    <el-form ref="cleanFormRef" :model="cleanForm" :rules="cleanRules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="清理数据类型" prop="cleanType">
            <el-radio-group v-model="cleanForm.cleanType">
              <el-radio label="DATE_COMPARE">按时间条件</el-radio>
              <el-radio label="TRUNCATE">全表删除</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="cleanForm.cleanType=='DATE_COMPARE'">
        <el-col :span="24">
          <el-form-item label="数据保留天数" prop="days">
            <el-input-number v-model="cleanForm.days" placeholder="" :precision="0" />天
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="cleanForm.cleanType=='DATE_COMPARE'&&cleanForm.extraCondition!=null">
        <el-col :span="24">
          <el-form-item label="添加附加条件" prop="useEc">
            <el-switch v-model="cleanForm.useEc" :active-value="true" :inactive-value="false"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitClean" v-hasPermi="['system:dbClean:manualClean']">清 理</el-button>
        <el-button @click="cleanOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="TaskTriggerclean">
  import { getDBClean, manualClean } from "@/api/system/dbClean";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const cleanTitle = ref('清理数据库表数据');
  const cleanOpen = ref(false);
  const cleanFormRef = ref();

  const data = reactive({
    cleanForm: {},
    cleanRules: {
      cleanType: [
        { required: true, message: "清理类型不能为空", trigger: "blur" }
      ],
      days: [
        { required: true, message: "天数不能为空", trigger: "blur" }
      ],
      useEc: [
        { required: true, message: "附加条件不能为空", trigger: "blur" }
      ]
    }
  });

  const { cleanForm, cleanRules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openClean = async (id) => {
    cleanOpen.value = true;
    cleanForm.value = {
      id: undefined,
      cleanType: 'DATE_COMPARE',
      useEc: true
    };
    proxy.resetForm("cleanFormRef");
    loadDBClean(id);
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openClean });

  /** 加载*/
  function loadDBClean(id) {
    getDBClean(id).then(response => {
      cleanForm.value = response;
      cleanForm.value.useEc = true;
    });
  }

  /** 提交表单 */
  function submitClean() {
    proxy.$refs["cleanFormRef"].validate(valid => {
      if (valid) {
        proxy.$modal.loading("数据清理中，请稍候！");
        let para = {
          id: cleanForm.value.id,
          cleanType: cleanForm.value.cleanType,
          days: cleanForm.value.days,
          useEc: cleanForm.value.useEc
        }
        manualClean(para).then(response => {
          proxy.$modal.msgSuccess("清理成功");
          cleanOpen.value = false;
          proxy.$modal.closeLoading();
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
<style>
  .my-label {
    width: 120px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>
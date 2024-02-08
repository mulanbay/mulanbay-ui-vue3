<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="refreshTitle" v-model="refreshOpen" width="450px" append-to-body>
    <el-form ref="refreshFormRef" :model="refreshForm" :rules="refreshRules" label-width="120px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="选择运动类型" prop="sportId">
            <el-select
              v-model="refreshForm.sportId"
              placeholder="运动"
              clearable
              style="width: 240px">
              <el-option
                v-for="dict in sportOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="重新初始化" prop="reInit">
            <el-switch v-model="refreshForm.reInit"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitRefresh">确 定</el-button>
        <el-button @click="refreshOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="SportMilestoneRefresh">
  import { refreshSportMilestone } from "@/api/sport/sportMilestone";
  import { getSportTree } from "@/api/sport/sport";
  
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const refreshTitle = ref('刷新里程碑');
  const refreshOpen = ref(false);
  const refreshFormRef = ref();
  const sportOptions = ref([]);

  const data = reactive({
    refreshForm: {},
    refreshRules: {
      sportId: [
        { required: false, message: "运动类型不能为空", trigger: "blur" }
      ],
      reInit: [
        { required: true, message: "是否重新初始化不能为空", trigger: "blur" }
      ]
    }
  });

  const { refreshForm, refreshRules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openRefresh = async (sportId) => {
    refreshOpen.value = true;
    resetForm();
    loadSportTree();
    if (sportId != null) {
      refreshForm.value.sportId = sportId;
    }
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openRefresh });

  /** 加载树 */
  function loadSportTree() {
    getSportTree(false).then(response => {
      sportOptions.value = response;
    });
  }

  // 表单重置
  function resetForm() {
    refreshForm.value = {
      sportId: undefined,
      reInit: false,
    };
    proxy.resetForm("refreshFormRef");
  }

  /** 提交表单 */
  function submitRefresh() {
    proxy.$refs["refreshFormRef"].validate(valid => {
      if (valid) {
        refreshSportMilestone(refreshForm.value).then(response => {
          proxy.$modal.msgSuccess("刷新成功");
          refreshOpen.value = false;
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
<template>

    <!-- 监控对话框 -->
    <el-dialog :title="monitorTitle" v-model="monitorOpen" width="350px" append-to-body>
      <el-form ref="monitorFormRef" :model="monitorForm" label-width="80px">
        <el-form-item label="监控列表">
          <el-tree
            :data="monitorOptions"
            show-checkbox
            ref="monitorTree"
            node-key="id"
            empty-text="加载中，请稍后"></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitMonitorForm" v-hasPermi="['auth:monitorUser:save']">确 定</el-button>
          <el-button @click="monitorOpen=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

</template>

<script setup name="RoleForm">
  import { getMonitorUserTree, saveMonitorUser } from "@/api/auth/monitorUser";
  const { proxy } = getCurrentInstance();

  //监控授权
  // 弹出层标题
  const monitorTitle = ref("");
  // 是否显示弹出层
  const monitorOpen = ref(false);
  const monitorOptions = ref([]);
  const monitorForm = ref({});

  const data = reactive({
    form: {},
    // 表单校验
    rules: {}
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (row) => {
    monitorTitle.value = "[" + row.username + "]监控授权";
    monitorOpen.value = true;
    monitorForm.value.userId = row.userId;
    monitorForm.value.bussTypes = undefined;
    if (proxy.$refs["monitorTree"] != undefined) {
      proxy.$refs["monitorTree"].setCheckedKeys([]);
    }
    getMonitorUserTree(row.userId, true, true).then(
      response => {
        monitorOptions.value = response.treeData;
        //设置已经勾选
        //默认选中的树的数据
        setTimeout(function() {
          response.checkedKeys.forEach(value => {
            proxy.$refs["monitorTree"].setChecked(value, true, false);
          });
        }, 500);
      }
    );
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function reset() {

  }

  //保存权限
  function submitMonitorForm() {
    // 目前半选中的节点
    let checkedKeys = proxy.$refs["monitorTree"].getHalfCheckedKeys();
    // 选中的节点
    let halfCheckedKeys = proxy.$refs["monitorTree"].getCheckedKeys();
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    monitorForm.value.bussTypes = checkedKeys.join(',');
    saveMonitorUser(monitorForm.value).then(
      response => {
        monitorOpen.value = false;
        proxy.$modal.msgSuccess("修改成功");
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
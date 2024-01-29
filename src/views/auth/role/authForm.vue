<template>

  <!-- 权限对话框 -->
  <el-dialog :title="authTitle" v-model="authOpen" append-to-body class="customDialogCss">
    <el-form ref="authFormRef" :model="authForm" label-width="80px" v-loading="authLoading">
      <el-form-item label="功能列表">
        <el-tree
          :data="authOptions"
          show-checkbox
          ref="authTree"
          node-key="id"
          empty-text="加载中，请稍后"
          :default-expanded-keys="[0]">
        </el-tree>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitAuthForm" v-hasPermi="['auth:role:saveRoleFunction']">确 定</el-button>
        <el-button @click="authOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="RoleForm">
  import { getRoleFunctionTree, saveRoleFunction } from "@/api/auth/role";
  const { proxy } = getCurrentInstance();

  //授权
  // 弹出层标题
  const authTitle = ref("");
  // 是否显示弹出层
  const authOpen = ref(false);
  const authOptions = ref([]);
  const authForm = ref({});
  const authLoading = ref(false);

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
    authTitle.value = "[" + row.roleName + "]授权";
    authOpen.value = true;
    authForm.value.roleId = row.roleId;
    authForm.value.functionIds = undefined;
    if (proxy.$refs["authTree"] != undefined) {
      proxy.$refs["authTree"].setCheckedKeys([]);
    }
    getRoleFunctionTree(row.roleId, true, true).then(
      response => {
        authOptions.value = response.treeData;
        //设置已经勾选
        //默认选中的树的数据
        setTimeout(function() {
          response.checkedKeys.forEach(value => {
            proxy.$refs["authTree"].setChecked(value, true, false);
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
  function submitAuthForm() {
    // 目前半选中的节点
    let checkedKeys = proxy.$refs["authTree"].getHalfCheckedKeys();
    // 选中的节点
    let halfCheckedKeys = proxy.$refs["authTree"].getCheckedKeys();
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    authForm.value.functionIds = checkedKeys.join(',');
    authLoading.value = true;
    saveRoleFunction(authForm.value).then(
      response => {
        authOpen.value = false;
        authLoading.value = false;
        proxy.$modal.msgSuccess("修改成功");
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
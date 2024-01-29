<template>

  <!-- 角色授权对话框 -->
  <el-dialog :title="userRoleTitle" v-model="userRoleOpen" width="350px" append-to-body>
    <el-form ref="userRoleFormRef" :model="userRoleForm" label-width="80px">
      <el-form-item label="角色列表">
        <el-tree
          :data="userRoleOptions"
          show-checkbox
          ref="userRoleTree"
          node-key="id"
          empty-text="加载中，请稍后"></el-tree>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitAuthForm" v-hasPermi="['auth:user:saveUserRole']">确 定</el-button>
        <el-button @click="userRoleOpen=false">取 消</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup name="UserAuthForm">
  import { getUserRoleTree, saveUserRole } from "@/api/auth/user";
  const { proxy } = getCurrentInstance();

  //角色授权
  // 弹出层标题
  const userRoleTitle = ref("");
  // 是否显示弹出层
  const userRoleOpen = ref(false);
  const userRoleOptions = ref([]);
  const userRoleForm = ref({});

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
    userRoleTitle.value = "[" + row.username + "]角色授权";
    userRoleOpen.value = true;
    userRoleForm.value.userId = row.userId;
    userRoleForm.value.roleIds = undefined;
    if (proxy.$refs["userRoleTree"] != undefined) {
      proxy.$refs["userRoleTree"].setCheckedKeys([]);
    }
    getUserRoleTree(row.userId, true, true).then(
      response => {
        userRoleOptions.value = response.treeData;
        //设置已经勾选
        //默认选中的树的数据
        setTimeout(function() {
          response.checkedKeys.forEach(value => {
            proxy.$refs["userRoleTree"].setChecked(value, true, false);
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
    let checkedKeys = proxy.$refs["userRoleTree"].getHalfCheckedKeys();
    // 选中的节点
    let halfCheckedKeys = proxy.$refs["userRoleTree"].getCheckedKeys();
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    if (checkedKeys.length > 1) {
      proxy.$modal.msgError("目前只支持选择一个角色");
      return;
    }
    userRoleForm.value.roleIds = checkedKeys.join(',');
    saveUserRole(userRoleForm.value).then(
      response => {
        userRoleOpen.value = false;
        proxy.$modal.msgSuccess("修改成功");
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
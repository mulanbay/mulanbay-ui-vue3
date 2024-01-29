<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['auth:role:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['auth:role:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['auth:role:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['auth:role:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="refresh"
          @click="handleRefreshCache"
          v-hasPermi="['auth:role:refreshCache']">刷新缓存
        </el-button>
      </el-col>
    </el-row>


    <!--列表数据-->
    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="roleId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.roleId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleAuth(scope.row)"><svg-icon icon-class="tree" /></span>
        </template>
      </el-table-column>
      <el-table-column label="显示顺序" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['auth:role:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['auth:role:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 表单 -->
    <RoleForm ref="formRef" @success="getList" />
    
    <!-- 表单 -->
    <AuthForm ref="authFormRef" @success="getList" />
    
  </div>
</template>

<script setup name="Role">
  import { fetchList, refreshCache, getRole, deleteRole } from "@/api/auth/role";
	import RoleForm from './form.vue'
	import AuthForm from './authForm.vue'

  const { proxy } = getCurrentInstance();
  // 遮罩层
  const loading = ref(true);
  // 选中数组
  const ids = ref([]);
  // 非单个禁用
  const single = ref(true);
  // 非多个禁用
  const multiple = ref(true);
  // 总条数
  const total = ref(0);
  // 查询列表数据
  const roleList = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const formRef = ref();
  const authFormRef = ref();

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      name: undefined,
      status: undefined
    }
  });

  const { queryParams } = toRefs(data);

  /** 查询列表 */
  function getList() {
    loading.value = true;
    roleList.value = [];
    fetchList(queryParams.value).then(
      response => {
        roleList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    roleList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    roleList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.roleId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  // 刷新缓存
  function handleRefreshCache() {
    refreshCache().then(
      response => {
        proxy.$modal.msgSuccess("刷新成功");
      }
    );
  }
  
  // 授权按钮
  function handleAuth(row){
    authFormRef.value.openForm(row);
  }

	/** 新增按钮操作 */
	function handleCreate() {
	  formRef.value.openForm(null,'create');
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  const id = row.roleId || ids.value.join(",");
	  formRef.value.openForm(id,'edit');
	}
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.roleId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的角色数据?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteRole(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>
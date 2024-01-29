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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['auth:user:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['auth:user:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['auth:user:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['auth:user:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="tools"
          :disabled="single"
          @click="handleOffline"
          v-hasPermi="['auth:user:offline']">强制离线
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="tools"
          :disabled="single"
          @click="handleDeleteUserData"
          v-hasPermi="['auth:user:deleteUserData']">格式化数据
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="tools"
          :disabled="single"
          @click="handleInitUserData"
          v-hasPermi="['auth:user:initUserData']">初始化数据
        </el-button>
      </el-col>
    </el-row>


    <!--列表数据-->
    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户编号" prop="userId" sortable="custom" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center">
        <template #default="scope">
          <span>{{ scope.row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机" align="center" width="120px">
        <template #default="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" align="center">
        <template #default="scope">
          <span>{{ scope.row.level }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="角色授权" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleUserRole(scope.row)"><svg-icon icon-class="tree" /></span>
        </template>
      </el-table-column>
      <el-table-column label="监控授权" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleMonitor(scope.row)"><el-icon>
              <Monitor />
            </el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="微信绑定" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleWxBand(scope.row)"><svg-icon icon-class="wechat" /></span>
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center">
        <template #default="scope">
          <span>{{ scope.row.points }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center" width="180px">
        <template #default="scope">
          <span>{{ scope.row.expireTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="二次授权" align="center">
        <template #default="scope">
          <span>{{ scope.row.secAuthTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登陆时间" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.lastLoginTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登陆IP" align="center" min-width="110px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.lastLoginIp }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['auth:user:edit']">修改</el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['auth:user:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 微信账号 -->
    <WxAccountForm ref="wxAccountFormRef" @success="getList" />

    <!-- 表单 -->
    <UserForm ref="formRef" @success="getList" />
    
    <!-- 授权表单 -->
    <AuthForm ref="authFormRef" @success="getList" />

    <!-- 监控授权 -->
    <MonitorForm ref="monitorFormRef" @success="getList" />

  </div>
</template>

<script setup name="User">
  import { fetchList, getUserRoleTree, getUser, createUser, editUser, deleteUser, offlineUser, deleteUserData, initUserData, saveUserRole } from "@/api/auth/user";
  import WxAccountForm from "./wxAccount.vue";
	import UserForm from './form.vue'
	import AuthForm from './authForm.vue'
	import MonitorForm from './monitorForm.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const authFormRef = ref();
  const monitorFormRef = ref();
  //微信账号
  const wxAccountFormRef = ref();

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
  const userList = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);

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
    userList.value = [];
    fetchList(queryParams.value).then(
      response => {
        userList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 微信账号*/
  function handleWxBand(row) {
    wxAccountFormRef.value.openWxAccount(row.userId);
  }

  // 角色授权按钮
  function handleUserRole(row) {
    authFormRef.value.openForm(row);
  }

  // 监控按钮
  function handleMonitor(row) {
    monitorFormRef.value.openForm(row);
  }

  //强制离线
  function handleOffline() {
    const id = this.ids.join(",")
    this.$confirm('确认要强制离线编号为"' + id + '"的用户吗?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return offlineUser(id);
    }).then(() => {
      this.msgSuccess("操作成功");
    }).catch(function() {});
  }

  //格式化数据
  function handleDeleteUserData() {
    const id = this.ids.join(",")
    this.$confirm('确认要删除编号为"' + id + '"的用户数据吗?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteUserData(id);
    }).then(() => {
      this.msgSuccess("数据处理中，稍后请查收提醒消息及检查数据!");
    }).catch(function() {});
  }

  //初始化用户数据
  function handleInitUserData(row) {
    const id = this.ids.join(",")
    this.$confirm('确认要初始化编号为"' + id + '"的用户数据吗?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return initUserData(id);
    }).then(() => {
      this.msgSuccess("数据处理中，稍后请查收提醒消息及检查数据!");
    }).catch(function() {});
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    userList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    userList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.userId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

	/** 新增按钮操作 */
	function handleCreate() {
	  formRef.value.openForm(null,'create');
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  const id = row.userId;
	  formRef.value.openForm(id,'edit');
	}

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.userId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteUser(deleteIds);
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
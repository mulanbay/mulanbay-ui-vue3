<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
	  <el-form-item label="状态" prop="status">
		  <el-select
			v-model="queryParams.status"
			placeholder="状态"
			clearable
			style="width: 240px"
		  >
			<el-option
			  v-for="dict in commonStatusOptions"
			  :key="dict.id"
			  :label="dict.text"
			  :value="dict.id"
			/>
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
		  v-hasPermi="['auth:user:create']"
		>新增</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="success"
		  icon="edit"
		  :disabled="single"
		  @click="handleEdit"
		  v-hasPermi="['auth:user:edit']"
		>修改</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['auth:user:delete']"
		>删除</el-button>
	  </el-col>
	  <el-col :span="1.5">
	    <el-button
	      type="warning"
	      icon="tools"
	      :disabled="single"
	      @click="handleOffline"
	      v-hasPermi="['auth:user:offline']"
	    >强制离线</el-button>
	  </el-col>
	  <el-col :span="1.5">
	    <el-button
	      type="danger"
	      icon="tools"
	      :disabled="single"
	      @click="handleDeleteUserData"
	      v-hasPermi="['auth:user:deleteUserData']"
	    >格式化数据</el-button>
	  </el-col>
	  <el-col :span="1.5">
	    <el-button
	      type="primary"
	      icon="tools"
	      :disabled="single"
	      @click="handleInitUserData"
	      v-hasPermi="['auth:user:initUserData']"
	    >初始化数据</el-button>
	  </el-col>
	</el-row>


    <!--列表数据-->
	<el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="用户编号" prop="userId" sortable="custom" align="center" width="100">
		<template  #default="scope">
		  <span>{{ scope.row.userId }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="用户名" min-width="120px">
		<template  #default="scope">
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
	      <span class="link-type" @click="handleMonitor(scope.row)"><el-icon><Monitor /></el-icon></span>
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
	  <el-table-column label="邮箱" align="center" min-width="120px"  :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ scope.row.email }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="过期时间" align="center"  width="180px">
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
	  <el-table-column label="操作" align="center" width="150"  fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="edit"
			@click="handleEdit(scope.row)"
			v-hasPermi="['auth:user:edit']"
		  >修改</el-button>
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['auth:user:delete']"
		  >删除</el-button>
		</template>
	  </el-table-column>
	</el-table>

	<pagination
	 v-show="total > 0"
	 :total="total"
	 v-model:page="queryParams.page"
	 v-model:limit="queryParams.pageSize"
	 @pagination="getList"
	/>

	<!-- 添加或修改对话框 -->
	<el-dialog :title="title" v-model="open" width="600px" append-to-body>
	  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
		<el-row>
		  <el-col :span="12">
		    <el-form-item label="用户名" prop="username">
		     <el-input v-model="form.username" placeholder="" />
		    </el-form-item>
		  </el-col>
		  <el-col :span="12">
		    <el-form-item label="昵称" prop="nickname">
		     <el-input v-model="form.nickname" placeholder="" />
		    </el-form-item>
		  </el-col>
		</el-row>
		<el-row>
		  <el-col :span="12">
		    <el-form-item label="密码" prop="password">
		     <el-input placeholder="请输入密码" v-model="form.password" show-password></el-input>
		    </el-form-item>
		  </el-col>
		  <el-col :span="12">
		    <el-form-item label="二次认证" prop="secAuthType">
		      <el-select
		        v-model="form.secAuthType"
		        placeholder="二次认证"
		        clearable
		        collapse-tags
		        style="width: 200px"
		      >
		        <el-option
		          v-for="dict in secAuthTypeOptions"
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
		    <el-form-item label="手机" prop="phone">
		     <el-input v-model="form.phone" placeholder="" />
		    </el-form-item>
		  </el-col>
		  <el-col :span="12">
		    <el-form-item label="状态" prop="status">
		      <el-select
		        v-model="form.status"
		        placeholder="状态"
		        clearable
		        collapse-tags
		        style="width: 200px"
		      >
		        <el-option
		          v-for="dict in commonStatusOptions"
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
		    <el-form-item label="生日" prop="birthday">
		     <el-date-picker type="date" v-model="form.birthday" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
		               :style="{width: '200px'}" placeholder="请选择日期" clearable >
		     </el-date-picker>
		    </el-form-item>
		  </el-col>
		  <el-col :span="12">
		    <el-form-item label="过期日期" prop="expireTime">
		      <el-date-picker type="datetime" v-model="form.expireTime"  format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
		                :style="{width: '100%'}" placeholder="请选择时间" clearable >
		      </el-date-picker>
		    </el-form-item>
		  </el-col>
		</el-row>
		<el-row>
		  <el-col :span="24">
		    <el-form-item label="邮箱" prop="email">
		     <el-input v-model="form.email" placeholder="" />
		    </el-form-item>
		  </el-col>
		</el-row>
		<el-row>
		  <el-col :span="24">
		    <el-form-item label="备注" prop="remark">
		      <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
		    </el-form-item>
		  </el-col>
		</el-row>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitForm">确 定</el-button>
	        <el-button @click="cancel">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>
	
	<!-- 角色授权对话框 -->
	<el-dialog :title="userRoleTitle" v-model="userRoleOpen" width="350px" append-to-body>
	  <el-form ref="userRoleFormRef" :model="userRoleForm" label-width="80px">
	    <el-form-item label="角色列表">
	      <el-tree
	        :data="userRoleOptions"
	        show-checkbox
	        ref="userRoleTree"
	        node-key="id"
	        empty-text="加载中，请稍后"
	      ></el-tree>
	    </el-form-item>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitUserRoleForm" v-hasPermi="['auth:user:saveUserRole']">确 定</el-button>
	        <el-button @click="userRoleOpen=false">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>
	
	<!-- 监控对话框 -->
	<el-dialog :title="monitorTitle" v-model="monitorOpen" width="350px" append-to-body>
	  <el-form ref="monitorFormRef" :model="monitorForm" label-width="80px">
	    <el-form-item label="监控列表">
	      <el-tree
	        :data="monitorOptions"
	        show-checkbox
	        ref="monitorTree"
	        node-key="id"
	        empty-text="加载中，请稍后"
	      ></el-tree>
	    </el-form-item>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitMonitorForm" v-hasPermi="['auth:monitorUser:save']">确 定</el-button>
	        <el-button @click="monitorOpen=false">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>

	<!-- 微信账号 -->
	<WxAccountForm ref="wxAccountFormRef" @success="getList" />
	
  </div>
</template>

<script setup name="User">
	import {fetchList,getUserRoleTree,getUser,createUser,editUser,deleteUser,offlineUser,deleteUserData,initUserData,saveUserRole } from "@/api/auth/user";
	import {getMonitorUserTree,saveMonitorUser } from "@/api/auth/monitorUser";
	import WxAccountForm from "./wxAccount.vue";

	const { proxy } = getCurrentInstance();
	
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
	const secAuthTypeOptions = ref([]);
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	
	//角色授权
	// 弹出层标题
	const userRoleTitle = ref("");
	// 是否显示弹出层
	const userRoleOpen = ref(false);
	const userRoleOptions = ref([]);
	const userRoleForm = ref({});
	
	//监控授权
	// 弹出层标题
	const monitorTitle = ref("");
	// 是否显示弹出层
	const monitorOpen = ref(false);
	const monitorOptions = ref([]);
	const monitorForm = ref({});
	
	const data = reactive({
	  form: {},
	  queryParams: {
		page: 1,
		pageSize: 10,
		name: undefined,
		status:undefined
	  },
	  rules: {
		username: [
		  { required: true, message: "用户名不能为空", trigger: "blur" }
		],
		secAuthType: [
		  { required: true, message: "二次认证不能为空", trigger: "blur" }
		],
		status: [
		  { required: true, message: "状态不能为空", trigger: "blur" }
		],
		birthday: [
		  { required: true, message: "生日不能为空", trigger: "blur" }
		],
		expireTime: [
		  { required: true, message: "过期日期不能为空", trigger: "blur" }
		],
		openId: [
		  { required: true, message: "OpenId不能为空", trigger: "blur" }
		]
	  }
	});

	const { queryParams, form, rules } = toRefs(data);
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  userList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      userList.value = response.rows;
		  total.value = response.total;
	      loading.value = false;
	    }
	  );
	}
	
	// 取消按钮
	function cancel() {
	  open.value = false;
	  reset();
	}
	
	// 表单重置
	function reset() {
	  form.value = {
	    userId: undefined,
	    username: undefined,
	    secAuthType: 'PASSWORD',
	    status: "ENABLE"
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 微信账号*/
	function handleWxBand(row){
		wxAccountFormRef.value.openWxAccount(row.userId);
	}
	
	// 角色授权按钮
	function handleUserRole(row){
	  userRoleTitle.value="["+row.username+"]角色授权";
	  userRoleOpen.value = true;
	  userRoleForm.value.userId = row.userId;
	  userRoleForm.value.roleIds=undefined;
	  if (proxy.$refs["userRoleTree"] != undefined) {
	    proxy.$refs["userRoleTree"].setCheckedKeys([]);
	  }
	  getUserRoleTree(row.userId,true,true).then(
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
	
	//保存权限
	function submitUserRoleForm(){
	  // 目前半选中的节点
	  let checkedKeys = proxy.$refs["userRoleTree"].getHalfCheckedKeys();
	  // 选中的节点
	  let halfCheckedKeys = proxy.$refs["userRoleTree"].getCheckedKeys();
	  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
	  if(checkedKeys.length>1){
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
	
	// 监控按钮
	function handleMonitor(row){
	  monitorTitle.value="["+row.username+"]监控授权";
	  monitorOpen.value = true;
	  monitorForm.value.userId = row.userId;
	  monitorForm.value.bussTypes=undefined;
	  if (proxy.$refs["monitorTree"] != undefined) {
	    proxy.$refs["monitorTree"].setCheckedKeys([]);
	  }
	  getMonitorUserTree(row.userId,true,true).then(
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
	
	//保存权限
	function submitMonitorForm(){
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
	
	//强制离线
	function handleOffline(){
	  const id = this.ids.join(",")
	  this.$confirm('确认要强制离线编号为"' + id + '"的用户吗?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return offlineUser(id);
	    }).then(() => {
	      this.msgSuccess("操作成功");
	    }).catch(function() {
	    });
	}
	
	//格式化数据
	function handleDeleteUserData(){
	  const id = this.ids.join(",")
	  this.$confirm('确认要删除编号为"' + id + '"的用户数据吗?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteUserData(id);
	    }).then(() => {
	      this.msgSuccess("数据处理中，稍后请查收提醒消息及检查数据!");
	    }).catch(function() {
	    });
	}
	
	//初始化用户数据
	function handleInitUserData(row){
	  const id = this.ids.join(",")
	  this.$confirm('确认要初始化编号为"' + id + '"的用户数据吗?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return initUserData(id);
	    }).then(() => {
	      this.msgSuccess("数据处理中，稍后请查收提醒消息及检查数据!");
	    }).catch(function() {
	    });
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  userList.value=[];
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  userList.value=[];
	  queryParams.value.page=1;
	  handleQuery();
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.userId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 新增按钮操作 */
	function handleCreate(row) {
	  reset();
	  open.value = true;
	  title.value = "添加";
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  reset();
	  const id = row.userId;
	  getUser(id).then(response => {
	    form.value = response;
		form.value.password = undefined;
	    open.value = true;
	    title.value = "修改(ID:"+id+")";
	  });
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      if (form.value.userId != undefined) {
	        editUser(form.value).then(response => {
			proxy.$modal.msgSuccess("修改成功");
	        open.value = false;
			getList();
	        });
	      } else {
	        createUser(form.value).then(response => {
	          proxy.$modal.msgSuccess("新增成功");
	          open.value = false;
			  getList();
	        });
	      }
	    }
	  });
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
	  proxy.getEnumDict('AuthType','FIELD',false).then(response => {
	    secAuthTypeOptions.value = response;
	  });
	})
	
</script>

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
		  v-hasPermi="['auth:role:create']"
		>新增</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="success"
		  icon="edit"
		  :disabled="single"
		  @click="handleEdit"
		  v-hasPermi="['auth:role:edit']"
		>修改</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['auth:role:delete']"
		>删除</el-button>
	  </el-col>
	  <el-col :span="1.5">
	    <el-button
	      type="success"
	      icon="refresh"
	      @click="handleRefreshCache"
	      v-hasPermi="['auth:role:refreshCache']"
	    >刷新缓存</el-button>
	  </el-col>
	</el-row>


    <!--列表数据-->
	<el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" prop="roleId" sortable="custom" align="center" width="80">
		<template  #default="scope">
		  <span>{{ scope.row.roleId }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="120px">
		<template  #default="scope">
		  <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.roleName }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="授权" width="80" align="center">
	    <template #default="scope">
	      <span class="link-type" @click="handleAuth(scope.row)"><svg-icon icon-class="tree" /></span>
	    </template>
	  </el-table-column>
	  <el-table-column label="显示顺序" align="center" width="95">
		<template  #default="scope">
		  <span>{{ scope.row.orderIndex }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="状态" align="center" width="100">
		<template  #default="scope">
		  <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
		</template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="edit"
			@click="handleEdit(scope.row)"
			v-hasPermi="['auth:role:edit']"
		  >修改</el-button>
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['auth:role:delete']"
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
	<el-dialog :title="title" v-model="open" width="400px" append-to-body>
	  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
		<el-form-item label="角色名称" prop="roleName">
		  <el-input v-model="form.roleName" placeholder="请输入名称" />
		</el-form-item>
		<el-form-item label="显示顺序" prop="orderIndex">
		  <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0"/>
		</el-form-item>
		<el-form-item label="角色状态" prop="status">
		  <el-radio-group v-model="form.status">
		    <el-radio
		      v-for="dict in commonStatusOptions"
		      :key="dict.id"
		      :label="dict.id"
		    >{{dict.text}}</el-radio>
		  </el-radio-group>
		</el-form-item>
		<el-form-item label="备注信息" prop="remark">
		  <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
		</el-form-item>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitForm">确 定</el-button>
	        <el-button @click="cancel">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>
	
	<!-- 权限对话框 -->
	<el-dialog :title="authTitle" v-model="authOpen"  append-to-body class="customDialogCss">
	  <el-form ref="authFormRef" :model="authForm" label-width="80px" v-loading="authLoading" >
	    <el-form-item label="功能列表">
	      <el-tree
	        :data="authOptions"
	        show-checkbox
	        ref="authTree"
	        node-key="id"
	        empty-text="加载中，请稍后"
			:default-expanded-keys="[0]"
	      ></el-tree>
	    </el-form-item>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitAuthForm" v-hasPermi="['auth:role:saveRoleFunction']">确 定</el-button>
	        <el-button @click="authOpen=false">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>
		
  </div>
</template>

<script setup name="Role">
	import {fetchList,refreshCache,getRoleFunctionTree,getRole,createRole,editRole,deleteRole,saveRoleFunction} from "@/api/auth/role";
	  
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
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	
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
	  queryParams: {
		page: 1,
		pageSize: 10,
		name: undefined,
		status:undefined
	  },
	  rules: {
		roleName: [
		  { required: true, message: "名称不能为空", trigger: "blur" }
		],
		orderIndex: [
		  { required: true, message: "排序号不能为空", trigger: "blur" }
		],
		status: [
		  { required: true, message: "状态不能为空", trigger: "blur" }
		]
	  }
	});

	const { queryParams, form, rules } = toRefs(data);
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  roleList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      roleList.value = response.rows;
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
	    roleId:undefined,
		roleName: undefined,
		orderIndex: 0,
		status: "ENABLE",
		remark:undefined
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  roleList.value=[];
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  roleList.value=[];
	  queryParams.value.page=1;
	  handleQuery();
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.roleId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	// 刷新缓存
	function handleRefreshCache(){
	  refreshCache().then(
	    response => {
		  proxy.$modal.msgSuccess("刷新成功");
	    }
	  );
	}
	
	// 授权按钮
	function handleAuth(row){
	  authTitle.value="["+row.roleName+"]授权";
	  authOpen.value = true;
	  authForm.value.roleId = row.roleId;
	  authForm.value.functionIds=undefined;
	  if (proxy.$refs["authTree"] != undefined) {
	    proxy.$refs["authTree"].setCheckedKeys([]);
	  }
	  getRoleFunctionTree(row.roleId,true,true).then(
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
	
	//保存权限
	function submitAuthForm(){
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
	
	/** 新增按钮操作 */
	function handleCreate(row) {
	  reset();
	  open.value = true;
	  title.value = "添加";
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  reset();
	  const id = row.roleId || ids.value.join(",")
	  getRole(id).then(response => {
	    form.value = response;
	    open.value = true;
	    title.value = "修改(ID:"+id+")";
	  });
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      if (form.value.roleId != undefined) {
	        editRole(form.value).then(response => {
				proxy.$modal.msgSuccess("修改成功");
				open.value = false;
				getList();
	        });
	      } else {
	        createRole(form.value).then(response => {
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

<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 320px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
	  <el-form-item label="状态" prop="status">
		  <el-select
			v-model="queryParams.status"
			placeholder="状态"
			clearable
			style="width: 120px"
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:dictGroup:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
	
	<el-row :gutter="10" class="mb8">
	  <el-col :span="1.5">
		<el-button
		  type="primary"
		  icon="plus"
		  @click="handleCreate"
		  v-hasPermi="['config:dictGroup:create']"
		>新增</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="primary"
		  icon="plus"
		  :disabled="single"
		  @click="handleCopy"
		  v-hasPermi="['config:dictGroup:copy']"
		>复制</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="success"
		  icon="edit"
		  :disabled="single"
		  @click="handleEdit"
		  v-hasPermi="['config:dictGroup:edit']"
		>修改</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['config:dictGroup:delete']"
		>删除</el-button>
	  </el-col>
	</el-row>


    <!--列表数据-->
	<el-table v-loading="loading" :data="dictGroupList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" prop="groupId" sortable="custom" align="center" width="80">
		<template  #default="scope">
		  <span>{{ scope.row.groupId }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="140px" :show-overflow-tooltip="true">
		<template  #default="scope">
		  <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.groupName }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="字典项" width="100" align="center">
		<template  #default="scope">
		  <span class="link-type" @click="handleItemList(scope.row)"><el-icon><Grid/></el-icon></span>
		</template>
	  </el-table-column>
	  <el-table-column label="代码" align="center" width="160" :show-overflow-tooltip="true">
		<template  #default="scope">
		  <span>{{ scope.row.code }}</span>
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
	  <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="edit"
			@click="handleEdit(scope.row)"
			v-hasPermi="['config:dictGroup:edit']"
		  >修改</el-button>
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['config:dictGroup:delete']"
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
	<el-dialog :title="title" v-model="open" width="500px" append-to-body>
	  <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
		<el-form-item label="名称" prop="groupName">
		  <el-input v-model="form.groupName" placeholder="请输入名称" />
		</el-form-item>
		<el-form-item label="代码" prop="code">
		  <el-input v-model="form.code" placeholder="请输入代码" />
		</el-form-item>
		<el-form-item label="顺序" prop="orderIndex">
		  <el-input-number v-model="form.orderIndex" controls-position="right" :min="0" :controls="true" :precision="0"/>
		</el-form-item>
		<el-form-item label="状态" prop="status">
		  <el-radio-group v-model="form.status">
			<el-radio
			  v-for="dict in commonStatusOptions"
			  :key="dict.id"
			  :label="dict.id"
			>{{dict.text}}</el-radio>
		  </el-radio-group>
		</el-form-item>
	  </el-form>
	  <template #footer>
	     <div class="dialog-footer">
	        <el-button type="primary" @click="submitForm">确 定</el-button>
	        <el-button @click="cancel">取 消</el-button>
	     </div>
	  </template>
	</el-dialog>

	<!-- 明细列表页面 -->
	<el-dialog :title="itemListTitle" width="950px" v-model="itemListOpen"  append-to-body>
		<DictItemList :groupInfo="groupInfo"></DictItemList>
	</el-dialog>
		
  </div>
</template>

<script setup name="DictGroup">
	import {fetchList,getDictGroup,createDictGroup,editDictGroup,deleteDictGroup,copyDictGroup} from "@/api/config/dictGroup";
	import DictItemList from '../dictItem/index'
	let groupInfo = reactive({
		groupId:undefined
	});
	  
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
	const dictGroupList = ref([]);
	const commonStatusOptions = ref(proxy.commonStatusOptions);
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	//是否复制操作
	const isCopy = ref(false);
	
	//字典项
	// 弹出层标题
	const itemListTitle= ref("");
	// 是否显示弹出层
	const itemListOpen = ref(false);
	
	const data = reactive({
	  form: {},
	  queryParams: {
		page: 1,
		pageSize: 10,
		name: undefined,
		status:undefined
	  },
	  rules: {
		groupName: [
		  { required: true, message: "名称不能为空", trigger: "blur" }
		],
		code: [
		  { required: true, message: "代码不能为空", trigger: "blur" }
		],
		orderIndex: [
		  { required: true, message: "排序号不能为空", trigger: "blur" }
		],
		status: [
		  { required: true, message: "状态不能为空", trigger: "blur" }
		]
	  }
	});

	//toRefs() 函数可以将 reactive() 创建出来的响应式对象，转换为普通的对象，相当于变成一个个的ref()
	const { queryParams, form, rules } = toRefs(data);
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  dictGroupList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      dictGroupList.value = response.rows;
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
	  isCopy.value = false;
	  form.value = {
	    groupId:undefined,
		groupName: undefined,
		orderIndex: 0,
		status: "ENABLE"
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  dictGroupList.value=[];
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  dictGroupList.value=[];
	  queryParams.value.page=1;
	  handleQuery();
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.groupId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 字典项操作 */
	function handleItemList(row) {
	  itemListOpen.value = true;
	  itemListTitle.value = "["+row.groupName+"]字典项";
	  groupInfo.groupId = row.groupId;
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
	  const id = row.groupId || ids.value.join(",")
	  getDictGroup(id).then(response => {
	    form.value = response;
	    open.value = true;
	    title.value = "修改(ID:"+id+")";
	  });
	}
	
	/** 复制按钮操作 */
	function handleCopy(row) {
	  reset();
	  const id = row.groupId || ids.value.join(",")
	  getDictGroup(id).then(response => {
	    form.value = response;
		form.value.code = form.value.code+'_COPY';
	    open.value = true;
		isCopy.value = true;
	    title.value = "复制(ID:"+id+")";
	  });
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
		  if (isCopy.value==true) {
		    copyDictGroup(form.value).then(response => {
		  	proxy.$modal.msgSuccess("复制成功");
		    open.value = false;
			isCopy.value = false;
		  	getList();
		    });
		  }
	      else if (form.value.groupId != undefined) {
	        editDictGroup(form.value).then(response => {
			proxy.$modal.msgSuccess("修改成功");
	        open.value = false;
			getList();
	        });
	      } else {
	        createDictGroup(form.value).then(response => {
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
	  const deleteIds = row.groupId || ids.value.join(",");
	  proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteDictGroup(deleteIds);
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

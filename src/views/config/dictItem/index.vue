<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
	  <el-form-item label="组号" prop="groupId">
		<el-input
		  v-model="queryParams.groupId"
		  placeholder="请输入组号"
		  disabled
		  style="width: 120px"
		/>
	  </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 120px"
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['config:dictItem:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
	
	<el-row :gutter="10" class="mb8">
	  <el-col :span="1.5">
		<el-button
		  type="primary"
		  icon="plus"
		  @click="handleCreate"
		  v-hasPermi="['config:dictItem:create']"
		>新增</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="success"
		  icon="edit"
		  :disabled="single"
		  @click="handleEdit"
		  v-hasPermi="['config:dictItem:edit']"
		>修改</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['config:dictItem:delete']"
		>删除</el-button>
	  </el-col>
	</el-row>


    <!--列表数据-->
	<el-table v-loading="loading" :data="dictItemList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" prop="itemId" sortable="custom" align="center" width="80">
		<template  #default="scope">
		  <span>{{ scope.row.itemId }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="120px">
		<template  #default="scope">
		  <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.itemName }}</span>
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
		  <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE" @click="handleChangeStatus(scope.row)"></el-switch>
		</template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="edit"
			@click="handleEdit(scope.row)"
			v-hasPermi="['config:dictItem:edit']"
		  >修改</el-button>
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['config:dictItem:delete']"
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
		<el-form-item label="名称" prop="itemName">
		  <el-input v-model="form.itemName" placeholder="请输入名称" />
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

  </div>
</template>

<script setup name="DictItem">
	import {onMounted } from 'vue'
	import {fetchList,getDictItem,createDictItem,editDictItem,deleteDictItem} from "@/api/config/dictItem";
	const props = defineProps({
	  groupInfo: {
	    type: Object,
	    default: null
	  }
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
	const dictItemList = ref([]);
	const commonStatusOptions = ref(proxy.commonStatusOptions);
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	
	const data = reactive({
	  form: {},
	  queryParams: {
		page: 1,
		pageSize: 10,
		groupId:undefined,
		name: undefined,
		status:undefined
	  },
	  rules: {
		itemName: [
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

	const { queryParams, form, rules } = toRefs(data);
	
	/** 查询列表 */
	function getList() {
	  //console.log('groupId:'+props.groupInfo.groupId);
	  loading.value = true;
	  dictItemList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      dictItemList.value = response.rows;
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
	    itemId:undefined,
		itemName: undefined,
		groupId:undefined,
		orderIndex: 0,
		status: "ENABLE"
	  };
	  proxy.resetForm("formRef");
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  dictItemList.value=[];
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  dictItemList.value=[];
	  queryParams.value.page=1;
	  queryParams.value.groupId=props.groupInfo.groupId;
	  handleQuery();
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.itemId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 状态改变按钮操作 */
	function handleChangeStatus(row){
		reset();
		form.value = row;
		form.value.groupId = row.group.groupId;
		form.value.group = null;
		if(form.value.status=='ENABLE'){
			form.value.status=='DISABLE'
		}else{
			form.value.status=='ENABLE'
		}
		editDictItem(form.value).then(response => {
			proxy.$modal.msgSuccess("修改状态成功");
			getList();
		});
	}
	
	/** 新增按钮操作 */
	function handleCreate(row) {
	  reset();
	  open.value = true;
	  title.value = "添加";
	  form.value.groupId=props.groupInfo.groupId;
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  reset();
	  const id = row.itemId || ids.value.join(",")
	  getDictItem(id).then(response => {
	    form.value = response;
		form.value.groupId = response.group.groupId;
		form.value.group = null;
	    open.value = true;
	    title.value = "修改(ID:"+id+")";
	  });
	}
	
	/** 提交按钮 */
	function submitForm() {
	  proxy.$refs["formRef"].validate(valid => {
	    if (valid) {
	      if (form.value.itemId != undefined) {
	        editDictItem(form.value).then(response => {
			proxy.$modal.msgSuccess("修改成功");
	        open.value = false;
			getList();
	        });
	      } else {
	        createDictItem(form.value).then(response => {
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
	  const deleteIds = row.itemId || ids.value.join(",");
	  proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteDictItem(deleteIds);
	    }).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
		  getList();
	    }).catch(function() {});
	}
	
	/** 监控groupInfo的变化 **/
	watch(() => props.groupInfo.groupId, val => {
	  queryParams.value.groupId=val;
	  getList();
	});

	/** 初始化 **/
	onMounted(() => {
	  // 需要设置，否则第一次点击设置值
	  queryParams.value.groupId=props.groupInfo.groupId;
	  getList();
	})
	
</script>

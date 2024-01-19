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
	  <el-form-item label="代码" prop="code">
	    <el-input
	      v-model="queryParams.code"
	      placeholder="错误代码"
	      clearable
	      style="width: 240px"
	    />
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['log:sysCode:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
	
	<el-row :gutter="10" class="mb8">
	  <el-col :span="1.5">
		<el-button
		  type="primary"
		  icon="plus"
		  @click="handleCreate"
		  v-hasPermi="['log:sysCode:create']"
		>新增</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="success"
		  icon="edit"
		  :disabled="single"
		  @click="handleEdit"
		  v-hasPermi="['log:sysCode:edit']"
		>修改</el-button>
	  </el-col>
	  <el-col :span="1.5">
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['log:sysCode:delete']"
		>删除</el-button>
	  </el-col>
	  <el-col :span="1.5">
	    <el-button
	      type="success"
	      icon="refresh"
		  :disabled="multiple"
	      @click="handleRefreshCache"
	      v-hasPermi="['log:sysCode:refreshCache']"
	    >刷新缓存</el-button>
	  </el-col>
	</el-row>


    <!--列表数据-->
	<el-table v-loading="loading" :data="sysCodeList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="代码" prop="code" sortable="custom" align="center" width="80">
	    <template #default="scope">
	      <span>{{ scope.row.code }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="180px"  :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.name }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="级别" align="center" width="80">
	    <template #default="scope">
	       <span v-if="scope.row.level=='NORMAL'" style="color:black ;">
	        {{ scope.row.levelName }}
	       </span>
	       <span v-else-if="scope.row.level=='WARNING'" style="color:burlywood ;">
	        {{ scope.row.levelName }}
	       </span>
	       <span v-else-if="scope.row.level=='ERROR'" style="color:red ;">
	        {{ scope.row.levelName }}
	       </span>
	       <span v-else style="color:darkmagenta ;">
	         {{ scope.row.levelName }}
	       </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="是否提醒" align="center" width="100">
	    <template #default="scope">
	      <el-switch v-model="scope.row.notifiable"></el-switch>
	    </template>
	  </el-table-column>
	  <el-table-column label="实时提醒" align="center" width="100">
	    <template #default="scope">
	      <el-switch v-model="scope.row.realtime"></el-switch>
	    </template>
	  </el-table-column>
	  <el-table-column label="记录日志" align="center" width="100">
	    <template #default="scope">
	      <el-switch v-model="scope.row.loggable"></el-switch>
	    </template>
	  </el-table-column>
	  <el-table-column label="系统分类" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.bussTypeName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="累计次数" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.count }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="限流秒数" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.limitPeriod }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="创建时间" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.createdTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="edit"
			@click="handleEdit(scope.row)"
			v-hasPermi="['log:sysCode:edit']"
		  >修改</el-button>
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['log:sysCode:delete']"
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
	
	<!-- 表单弹窗：添加/修改 -->
	<SysCodeForm ref="formRef" @success="getList" />
	
  </div>
</template>

<script setup name="SysCode">
	import {fetchList,deleteSysCode,refreshCache} from "@/api/log/sysCode";
    import SysCodeForm from './form.vue'
    
	const { proxy } = getCurrentInstance();
	
	const formRef = ref();
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
	const sysCodeList = ref([]);
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	
	const data = reactive({
	  form: {},
	  queryParams: {
		page: 1,
		pageSize: 10
	  },
	  rules: {
		
	  }
	});

	const { queryParams, form, rules } = toRefs(data);
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  sysCodeList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      sysCodeList.value = response.rows;
		  total.value = response.total;
	      loading.value = false;
	    }
	  );
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  queryParams.value.page=1;
	  handleQuery();
	}
	
	/** 新增按钮操作 */
	function handleCreate() {
	  formRef.value.openForm(null,'create');
	}
	
	/** 修改按钮操作 */
	function handleEdit(row) {
	  const code = row.code || ids.value.join(",");
	  formRef.value.openForm(code,'edit');
	}
	
	/** 刷新缓存按钮操作 */
	function handleRefreshCache(row) {
	  const refreshIds = row.code || ids.value.join(",");
	  refreshCache(refreshIds).then(
	    response => {
	      proxy.$modal.msgSuccess("刷新成功");
	    }
	  );
	}
	
	/** 删除按钮操作 */
	function handleDelete(row) {
	  const deleteIds = row.code || ids.value.join(",");
	  proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteSysCode(deleteIds);
	    }).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
		  getList();
	    }).catch(function() {});
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.code)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 初始化 **/
	onMounted(() => {
	  getList();
	})
	
</script>

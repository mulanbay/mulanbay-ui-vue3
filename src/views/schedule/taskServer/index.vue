<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="节点名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['schedule:taskServer:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
		<el-button
		  type="danger"
		  icon="delete"
		  :disabled="multiple"
		  @click="handleDelete"
		  v-hasPermi="['schedule:taskServer:delete']"
		>删除</el-button>
      </el-form-item>
    </el-form>


    <!--列表数据-->
	<el-table v-loading="loading" :data="taskServerList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" prop="log" sortable="custom" align="center" width="80">
		<template  #default="scope">
		  <span>{{ scope.row.serverId }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="节点" align="center" min-width="120px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ scope.row.deployId }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="最后更新时间" align="center" width="180">
	    <template #default="scope">
	       <span v-if="scope.row.modifyTime==null">
	        --
	       </span>
	       <span v-else-if="tillNowSeconds(null,scope.row.modifyTime)<=-180" style="color:red ;">
	        {{ scope.row.modifyTime }}
	       </span>
	       <span v-else>
	         {{ scope.row.modifyTime }}
	       </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="IP地址" align="center"  min-width="180px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ scope.row.ipAddress }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="状态" align="center" width="100">
	    <template #default="scope">
		  <span v-if="scope.row.status==true" style="color: green;">
			  在线
		  </span>
		  <span v-else>
		  	  离线
		  </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="支持分布式" align="center" width="100">
	    <template #default="scope">
	      <span v-if="scope.row.distriable==true" >
	      	<el-icon color="green"><Check /></el-icon>
	      </span>
	      <span v-else>
	      	<el-icon color="red"><Close /></el-icon>
	      </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="正在运行job数" align="center" width="120">
	    <template #default="scope">
	      <span>{{ scope.row.cejc }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="已被调度job数" align="center"  width="120">
	    <template #default="scope">
	      <span>{{ scope.row.sjc }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="启动时间" align="center" width="180" >
	    <template #default="scope">
	      <span>{{ scope.row.startTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="停止时间" align="center"  width="180" >
	    <template #default="scope">
	      <span>{{ scope.row.shutdownTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['schedule:taskServer:delete']"
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
	

  </div>
</template>

<script setup name="SysLog">
	import {fetchList,deleteTaskServer} from "@/api/schedule/taskServer";
    import {tillNowSeconds} from "@/utils/datetime";
    
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
	const taskServerList = ref([]);
	
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
	  taskServerList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      taskServerList.value = response.rows;
		  total.value = response.total;
	      loading.value = false;
	    }
	  );
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  taskServerList.value=[];
	  getList();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  taskServerList.value=[];
	  queryParams.value.page=1;
	  handleQuery();
	}
	
	/** 删除按钮操作 */
	function handleDelete(row) {
	  const deleteIds = row.serverId || ids.value.join(",");
	  proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteTaskServer(deleteIds);
	    }).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
		  getList();
	    }).catch(function() {});
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.serverId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 初始化 **/
	onMounted(() => {
	  getList();
	})
	
</script>

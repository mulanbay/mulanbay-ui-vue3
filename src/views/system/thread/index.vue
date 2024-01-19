<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
	  <el-form-item label="名称检索" prop="name">
	    <el-input
	      v-model="queryParams.name"
	      placeholder="请输入名称"
	      clearable
	      style="width: 240px"
	      @keyup.enter.native="handleQuery"
	    />
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['system:thread:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
	<el-table v-loading="loading" :data="threadList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="线程ID" fixed="left" prop="id" sortable="custom" align="center" width="120">
	    <template  #default="scope">
	      <span>{{ scope.row.id }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="120px">
	    <template #default="scope">
	      <span class="link-type" @click="handleInfo(scope.row)" >{{ scope.row.threadName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="状态" align="center" width="100">
	    <template #default="scope">
	       <span v-if="scope.row.stop==true" style="color: red;">
	        停止
	       </span>
	       <span v-else style="color: green;">
	         运行中
	       </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="循环周期" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.interval+'秒' }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="运行时间" align="center" min-width="160px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ formatSeconds(scope.row.duration/1000)}}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="失败总次数" align="center" width="120">
	    <template #default="scope">
	      <span>{{ scope.row.failCount }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="执行总次数" align="center" width="120">
	    <template #default="scope">
	      <span>{{ scope.row.totalCount }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="创建时间" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.createdTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="最近一次执行时间" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.lastExecuteTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		<el-button v-if="scope.row.stop==true"
		  link
		  type="success"
		  icon="Open"
		  @click="handleStart(scope.row)"
		  v-hasPermi="['system:thread:start']"
		>开启</el-button>
		<el-button v-if="scope.row.stop==false"
		  link
		  type="warning"
		  icon="close"
		  @click="handleStop(scope.row)"
		  v-hasPermi="['system:thread:stop']"
		>关闭</el-button>
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

	<!-- 详情 -->
	<InfoForm ref="infoFormRef" />
	
  </div>
</template>

<script setup name="Handler">
	import {fetchList} from "@/api/system/thread";
	import {formatSeconds} from "@/utils/datetime";
    import InfoForm from './info.vue'
    
	const { proxy } = getCurrentInstance();
	const infoFormRef = ref();

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
	const threadList = ref([]);
	
	const data = reactive({
	  queryParams: {
		page: 1,
		pageSize: 10
	  }
	});

	const { queryParams } = toRefs(data);
	
	/** 详情 */
	function handleInfo(row){
		infoFormRef.value.openInfo(row.id);
	}
	
	function handleStart(row){
		
	}
	
	function handleStop(row){
		
	}
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  threadList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      threadList.value = response.rows;
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

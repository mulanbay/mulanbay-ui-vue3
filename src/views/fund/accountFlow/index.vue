<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
	  <el-form-item label="选择账户" prop="accountId">
		  <el-tree-select
			 v-model="queryParams.accountId"
			 style="width: 240px"
			 clearable
			 :data="accountOptions"
			 :props="{ value: 'id', label: 'text', children: 'children' }"
			 value-key="id"
			 placeholder="请选择账户"
			 :check-strictly ="false"
		  />
	  </el-form-item>
	  <el-form-item label="流水日期" style="width: 308px">
	     <el-date-picker
	  	  v-model="dateRange"
	  	  unlink-panels
	  	  value-format="YYYY-MM-DD"
	  	  type="daterange"
	  	  range-separator="-"
	  	  start-placeholder="开始日期"
	  	  end-placeholder="结束日期"
	  	  :shortcuts="datePickerOptions"
	     ></el-date-picker>
	  </el-form-item>
	  <el-form-item label="调整方式" prop="adjustType">
	    <el-select
	      v-model="queryParams.adjustType"
	      placeholder="方式"
	      clearable
	      style="width: 120px"
	    >
	      <el-option
	        v-for="dict in adjustTypeOptions"
	        :key="dict.id"
	        :label="dict.text"
	        :value="dict.id"
	      />
	    </el-select>
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['fund:accountFlow:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
	<el-table v-loading="loading" :data="accountFlowList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="编号" fixed="left" prop="flowId" sortable="custom" align="center" width="120">
	    <template  #default="scope">
	      <span>{{ scope.row.flowId }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="名称" min-width="150px">
	    <template #default="scope">
	      <span class="link-type">{{ scope.row.accountName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="卡号" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.cardNo }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="类型" align="center" width="95">
	    <template #default="scope">
	      <span>{{ scope.row.typeName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="调整前" align="center" width="120">
	    <template #default="scope">
	      <span>{{ formatMoney(scope.row.beforeAmount) }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="调整后" align="center" width="120">
	    <template #default="scope">
	      <span>{{ formatMoney(scope.row.afterAmount) }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="调整类型" align="center" width="95">
	    <template #default="scope">
	      <span>{{ scope.row.adjustTypeName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="快照名称" align="center" width="150" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ isEmpty(scope.row.snapshot) ? '--':scope.row.snapshot.snapshotName+'('+scope.row.snapshot.bussKey+')' }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="资产状态" align="center" width="95">
	    <template #default="scope">
	      <span>{{ scope.row.statusName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="创建时间" align="center" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.createdTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="最后更新时间" align="center" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.modifyTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="danger"
			icon="delete"
			@click="handleDelete(scope.row)"
			v-hasPermi="['fund:accountFlow:delete']"
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

<script setup name="AccountFlow">
	import {fetchList,deleteAccountFlow} from "@/api/fund/accountFlow";
	import {getAccountTree} from "@/api/fund/account";

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
	const accountFlowList = ref([]);
	const accountOptions = ref([]);
	const adjustTypeOptions = ref([]);
	
	//日期范围快速选择
	const datePickerOptions = ref(proxy.datePickerOptions);
	const dateRange = ref([]);
	
	const data = reactive({
	  queryParams: {
		page: 1,
		pageSize: 10
	  }
	});

	const { queryParams } = toRefs(data);
	
	/** 统计 */
	function handleStat(){
		//路由定向
		proxy.$router.push({name:'AccountStat',query: {}})
	}
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  accountFlowList.value =[];
	  fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
	    response => {
	      accountFlowList.value = response.rows;
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
	
	/** 删除按钮操作 */
	function handleDelete(row) {
	  const deleteIds = row.flowId || ids.value.join(",");
	  proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteAccountFlow(deleteIds);
	    }).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
		  getList();
	    }).catch(function() {});
	}
	
	// 多选框选中数据
	function handleSelectionChange(selection) {
	  ids.value = selection.map(item => item.flowId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 初始化 **/
	onMounted(() => {
	  getList();
	  getAccountTree().then(
	    response => {
	      accountOptions.value = response;
	    }
	  );
	  proxy.getEnumDict('AccountAdjustType','FIELD',false).then(response => {
	    adjustTypeOptions.value = response;
	  });
	})
	
</script>

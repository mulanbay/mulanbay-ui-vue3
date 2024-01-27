<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
		<el-form-item label="数据分组" prop="groupType">
		  <el-select
			v-model="queryParams.groupType"
			placeholder="数据分组"
			clearable
			style="width: 240px"
		  >
			<el-option
			  v-for="dict in groupTypeOptions"
			  :key="dict.id"
			  :label="dict.text"
			  :value="dict.id"
			/>
		  </el-select>
		</el-form-item>
		<el-form-item label="账户类型" prop="type">
		  <el-select
			v-model="queryParams.type"
			placeholder="类型"
			clearable
			style="width: 120px"
		  >
			<el-option
			  v-for="dict in typeOptions"
			  :key="dict.id"
			  :label="dict.text"
			  :value="dict.id"
			/>
		  </el-select>
		  <el-select
			v-model="queryParams.status"
			placeholder="资产状态"
			clearable
			style="width: 115px"
		  >
			<el-option
			  v-for="dict in statusOptions"
			  :key="dict.id"
			  :label="dict.text"
			  :value="dict.id"
			/>
		  </el-select>
		</el-form-item>
		<el-form-item label="快照名称" prop="snapshotId">
		  <el-select
			v-model="queryParams.snapshotId"
			placeholder="快照"
			clearable
			style="width: 240px"
			@change="handleSelectSnapshot"
		  >
			<el-option
			  v-for="dict in shapShotOptions"
			  :key="dict.id"
			  :label="dict.text"
			  :value="dict.id"
			/>
		  </el-select>
		</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['fund:account:stat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
	  <el-form-item>
	    <el-button type="primary" icon="DArrowLeft" @click="handlePreSnapshot">上一个快照</el-button>
	    <el-button type="primary" icon="DArrowRight"  @click="handleNextSnapshot">下一个快照</el-button>
	    <el-button type="danger" icon="delete" @click="handleDeleteSnapshot" v-hasPermi="['fund:accountSnapshot:delete']">删除当前快照</el-button>
	  </el-form-item>
    </el-form>

	<!--图表数据-->
	<div ref="statChart" :style="{height:height,margin:0 }"/>
	
  </div>
</template>

<script setup name="AccountStat">
	import {getAccountStat} from "@/api/fund/account";
	import {getAccountSnapshotTree,deleteAccountSnapshot} from "@/api/fund/accountSnapshot";
	import * as echarts from 'echarts';
	import {createChart,createPieChartOption} from "@/utils/mulanbay_echarts";
	
	const { proxy } = getCurrentInstance();
	//图形实例
	const statChart = ref(null);
	//echarts实例
	let statChartIns = ref(null);
	const height = ref((document.body.clientHeight - 240).toString() + 'px');
	
	const statusOptions = ref([]);
	const typeOptions = ref([]);
	const shapShotOptions = ref([]);
	const groupTypeOptions = ref([]);
	
	
	const data = reactive({
	  queryParams: {
		groupType:'NAME'
	  },
	  //账户快照查询参数
	  shapShotQueryParams: {
	    minId:undefined,
	    maxId:undefined,
	    page:1,
	    pageSize:20,
	    needRoot:false
	  }
	});

	const { queryParams,shapShotQueryParams } = toRefs(data);
	
	/** 下拉框加载 */
	function loadOptions(){
		proxy.getEnumDict('AccountStatus','FIELD',false).then(response => {
		  statusOptions.value = response;
		});
		proxy.getEnumDict('AccountType','FIELD',false).then(response => {
		  typeOptions.value = response;
		});
		proxy.getDictItemTree('ACCOUNT_STAT_GROUP_TYPE',false).then(response => {
		  groupTypeOptions.value = response;
		});
		getAccountSnapshotTree().then(response => {
		  shapShotOptions.value = response;
		});
		getSnapshotOptionsTreeSelect();
	}
	
	/** 查询账户快照下拉树结构 */
	function getSnapshotOptionsTreeSelect() {
	  getAccountSnapshotTree(shapShotQueryParams.value).then(response => {
	    shapShotOptions.value = response;
	  });
	}
	
	/** 更新账户快照下拉树结构 */
	function refreshSnapshotOptionsTreeSelect(maxId,minId) {
	  shapShotQueryParams.value.minId = minId;
	  shapShotQueryParams.value.maxId = maxId;
	  getSnapshotOptionsTreeSelect();
	  const l = shapShotOptions.value.length;
	  if(l>0){
	    var index=0;
	    if(maxId!=null){
	      index=0;
	    }
	    if(minId!=null){
	      index = 1-1;
	    }
	    queryParams.value.snapshotId = shapShotOptions.value[index].id;
	  }
	  handleQuery();
	}
	
	/** 上一个快照操作 */
	function handlePreSnapshot() {
	  const minId = queryParams.value.snapshotId;
	  const maxId = undefined;
	  refreshSnapshotOptionsTreeSelect(maxId,minId);
	}
	
	/** 下一个快照操作 */
	function handleNextSnapshot() {
	  const minId = undefined;
	  const maxId = queryParams.value.snapshotId;
	  refreshSnapshotOptionsTreeSelect(maxId,minId);
	}
	
	/** 删除快照操作 */
	function handleDeleteSnapshot() {
	  const snapshotId = queryParams.value.snapshotId;
	  if(snapshotId==undefined){
	    proxy.$modal.msgError('请先选择一个快照');
	    return;
	  }
	  const selectedSnapshot = shapShotOptions.value.find((item) => {
	    return item.id === snapshotId
	  });
	  let snapshotName = selectedSnapshot.text;
	  proxy.$confirm('是否确认删除"' + snapshotName + '"的账户快照?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      return deleteAccountSnapshotInfo(snapshotId);
	    }).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
	  	  getSnapshotOptionsTreeSelect();
	    }).catch(function() {});
	}
	
	/** 快照选中事件 */
	function handleSelectSnapshot(val) {
	  initChart();
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  initChart();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  initChart();
	}
	
	function initChart() {
	  proxy.$modal.loading("正在加载数据，请稍候！");
	  getAccountStat(queryParams.value).then(
	    response => {
		  proxy.$modal.closeLoading();
	      //组装chart数据
	      let option = createPieChartOption(response);
		  createChart(option,statChartIns);
	    }
	  );
	}
	
	/** 初始化 **/
	onMounted(() => {
	  statChartIns = echarts.init(statChart.value, "macarons");
	  initChart();
	  loadOptions();
	})
	
</script>

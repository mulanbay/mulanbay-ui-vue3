<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
		<el-form-item label="起止日期" style="width: 308px">
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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
	  <el-form-item v-if="moreCdn==true" label="匹配类型" prop="matchType">
	   <el-select
	     v-model="queryParams.matchType"
	     placeholder="匹配类型"
	     clearable
	     collapse-tags
	     style="width: 240px"
	   >
	     <el-option
	       v-for="dict in matchTypeOptions"
	       :key="dict.id"
	       :label="dict.text"
	       :value="dict.id"
	     />
	   </el-select>
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['log:matchLog:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
		<el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
		<el-button type="success" icon="TrendCharts" @click="handleStat" v-hasPermi="['log:matchLog:stat']">日志分析</el-button>
      </el-form-item>
    </el-form>


    <!--列表数据-->
	<el-table v-loading="loading" :data="matchLogList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" prop="log" sortable="custom" align="center" width="80">
		<template  #default="scope">
		  <span>{{ scope.row.id }}</span>
		</template>
	  </el-table-column>
	  <el-table-column label="用户ID" align="center" >
	    <template #default="scope">
	      <span>{{ scope.row.userId }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="商品名称"  min-width="250px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ scope.row.goodsName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="匹配类型" align="center" width="80">
	    <template #default="scope">
	       <span v-if="scope.row.matchType=='CONSUME'">
	        <el-tag type="success">{{ scope.row.matchTypeName }}</el-tag>
	       </span>
	       <span v-else>
	        <el-tag type="warning">{{ scope.row.matchTypeName }}</el-tag>
	       </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="AI匹配度" align="center" width="120">
	    <template #default="scope">
	      {{ scope.row.aiMatch }}
	    </template>
	  </el-table-column>
	  <el-table-column label="实际匹配度" align="center" width="120">
	    <template #default="scope">
	      {{ scope.row.acMatch }}
	    </template>
	  </el-table-column>
	  <el-table-column label="数据比较" align="center" width="80">
	    <template #default="scope">
	      <span class="link-type" @click="showCompare(scope.row)">
	        <el-icon><Switch /></el-icon>
	      </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="发生时间" align="center" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.createdTime }}</span>
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
	
	<!-- 系统代码 -->
	<CompareDataForm ref="compareDataFormRef" />
	
  </div>
</template>

<script setup name="MatchLog">
	import {fetchList} from "@/api/log/matchLog";
	import CompareDataForm from './compareData.vue'

	const { proxy } = getCurrentInstance();
	
	const compareDataFormRef = ref(true);

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
	const matchLogList = ref([]);
	
	// 弹出层标题
	const title = ref("");
	// 是否显示弹出层
	const open = ref(false);
	
	//查询条件更多属性 start
	const cdnTitle = ref("更多");
	const moreCdn = ref(false);
	
	const matchTypeOptions = ref([]);
	
	//日期范围快速选择
	const datePickerOptions = ref(proxy.datePickerOptions);
	const dateRange = ref([]);
	
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
	
	/** 更多查询条件处理 */
	function handleMoreCdn(){
	  if(moreCdn.value==true){
	    moreCdn.value=false;
	    cdnTitle.value='更多';
	  }else{
	    moreCdn.value=true;
		cdnTitle.value='取消';
	  }
	}
	
	/** 日志分析 */
	function handleStat(){
	  //路由定向
	  proxy.$router.push({name:'MatchLogStat',query: {}})
	}
	
	/** 数据比较 */
	function showCompare(row){
	  compareDataFormRef.value.openCompareData(row.id);
	}

	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  matchLogList.value =[];
	  fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
	    response => {
	      matchLogList.value = response.rows;
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
	  ids.value = selection.map(item => item.groupId)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 初始化 **/
	onMounted(() => {
	  getList();
	  proxy.getEnumDict('GoodsMatchType','FIELD',false).then(response => {
	    matchTypeOptions.value = response;
	  });
	})
	
</script>

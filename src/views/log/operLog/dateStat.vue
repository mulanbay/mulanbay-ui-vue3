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
	  <el-form-item label="统计分类" prop="dateGroupType">
	    <el-select
	      v-model="queryParams.dateGroupType"
	      placeholder="统计分类"
	      clearable
	      style="width: 120px"
	    >
	      <el-option
	        v-for="dict in dateGroupTypeOptions"
	        :key="dict.id"
	        :label="dict.text"
	        :value="dict.id"
	      />
	    </el-select>
	  </el-form-item>
	  <el-form-item v-if="moreCdn==true" label="菜单类型" prop="funcDataType">
	   <el-select
	     v-model="queryParams.funcDataType"
	     placeholder="菜单类型"
	     clearable
	     collapse-tags
	     style="width: 120px"
	   >
	     <el-option
	       v-for="dict in funcDataTypeOptions"
	       :key="dict.id"
	       :label="dict.text"
	       :value="dict.id"
	     />
	   </el-select>
	  </el-form-item>
	  <el-form-item v-if="moreCdn==true" label="功能类型" prop="funcType">
	   <el-select
	     v-model="queryParams.funcType"
	     placeholder="功能类型"
	     clearable
	     collapse-tags
	     style="width: 120px"
	   >
	     <el-option
	       v-for="dict in funcTypeOptions"
	       :key="dict.id"
	       :label="dict.text"
	       :value="dict.id"
	     />
	   </el-select>
	  </el-form-item>
      <el-form-item v-if="moreCdn==true" label="用户筛选" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名或者手机号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
	  <el-form-item v-if="moreCdn==true" label="补全日期" prop="compliteDate">
	    <el-switch v-model="queryParams.completeDate"  @change="handleQuery"></el-switch>
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['log:operLog:dateStat']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
		<el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

	<!--图表数据-->
	<div ref="dateStatChart" :style="{height:height,margin:0 }"/>
	
  </div>
</template>

<script setup name="OperLogDateStat">
	import {onMounted } from 'vue'
	import {getOperLogDateStat} from "@/api/log/operLog";
	import * as echarts from 'echarts';
	import {createChart,createCalanderChartOption,createBarChartOption,createLineChartOption} from "@/utils/mulanbay_echarts";
	import {checkYearEqual} from "@/utils/mulanbay";
	
	const { proxy } = getCurrentInstance();
	//图形实例
	const dateStatChart = ref(null);
	//echarts实例
	let dateStatChartIns = ref(null);
	const height = ref((document.body.clientHeight - 240).toString() + 'px');
	
	//查询条件更多属性 start
	const cdnTitle = ref("更多");
	const moreCdn = ref(false);

	//日期范围快速选择
	const datePickerOptions = ref(proxy.datePickerOptions);
	const dateRange = ref([]);
	const funcDataTypeOptions = ref([]);
	const funcTypeOptions = ref([]);
	const dateGroupTypeOptions = ref([]);
	
	const data = reactive({
	  form: {},
	  queryParams: {
		dateGroupType:'MONTH',
		completeDate:true
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
	  let para = proxy.addDateRange(queryParams.value, dateRange.value);
	  const dateGroupType = queryParams.value.dateGroupType;
	  if(dateGroupType=='DAYCALENDAR'){
	    //检查时间是否在同一年内
		if(checkYearEqual(para.startDate,para.endDate)==false){
			proxy.$modal.msgError("时间条件不能为空,且时间区间在同一年内");
			return;
		}
	  }
	  proxy.$modal.loading("正在加载数据，请稍候！");
      getOperLogDateStat(para).then(
        response => {
		  proxy.$modal.closeLoading();
          //组装chart数据
          let option = null;
		  const chartType = queryParams.value.chartType;
		  if(dateGroupType=='DAYCALENDAR'){
		    option = createCalanderChartOption(response)
		  }else if(chartType=='BAR'){
		    option = createBarChartOption(response)
		  }else{
		    option = createLineChartOption(response)
		  }
		  createChart(option,dateStatChartIns);
        }
      );
    }
	
	/** 初始化 **/
	onMounted(() => {
	  //初始化
	  dateStatChartIns = echarts.init(dateStatChart.value, "macarons");
	  initChart();
	  proxy.getEnumDict('FunctionType','ORDINAL',false).then(response => {
	    funcTypeOptions.value = response;
	  });
	  proxy.getEnumDict('FunctionDataType','ORDINAL',false).then(response => {
	    funcDataTypeOptions.value = response;
	  });
	  proxy.getDictItemTree('OPER_LOG_CHART_DATE_GROUP',false).then(response => {
	    dateGroupTypeOptions.value = response;
	  });
	})
	
</script>

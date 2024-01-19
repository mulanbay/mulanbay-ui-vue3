<template>
  <div class="app-container">
	<el-row>
	  <el-col :span="24" class="card-box">
	      <div>
	        <el-form :model="queryParams" ref="queryFormRef" :inline="true">
	          <el-form-item label="自动刷新" prop="seconds">
	            <el-input-number
	              v-model="seconds"
	              :precision="0"
	              style="width: 120px"
	              @blur="updateRefreshInterval"
	            />秒
	          </el-form-item>
	          <el-form-item>
				<el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['system:server:stat']">统计</el-button>
				<el-button type="success" icon="MoreFilled" @click="handleMoreDetail" v-hasPermi="['system:server:detail']">更多详情</el-button>
			  </el-form-item>
	          <el-form-item >
	            <span v-if="dataLoading==true" class="link-type" style="color:red ;">
	              <el-icon><Loading /></el-icon>数据刷新中
	            </span>
	          </el-form-item>
	        </el-form>
	      </div>
	  </el-col>
	
	  <el-col :span="8" class="card-box">
	    <el-card>
	      <div class="chart-wrapper" align="center" >
	        <div ref="diskStatChart" :style="{height:height,margin:0 }"/>
	      </div>
	      <div align="center">
	        <el-button type="success" icon="Histogram" @click="statTimeLine('DISK')" >统计</el-button>
	        <el-button type="primary" icon="Setting" @click="handleDiskMng" >操作</el-button>
	      </div>
	    </el-card>
	  </el-col>
	  <el-col :span="8" class="card-box"  align="center">
	    <el-card>
	      <div class="chart-wrapper">
	        <div ref="memoryStatChart" :style="{height:height,margin:0 }"/>
	      </div>
	      <div align="center">
	        <el-button type="success" icon="Histogram" @click="statTimeLine('MEMORY')" >统计</el-button>
	        <el-button type="primary" icon="Setting" @click="handleMemoryMng" >操作</el-button>
	      </div>
	    </el-card>
	  </el-col>
	  <el-col :span="8" class="card-box" align="center">
	    <el-card>
	      <div class="chart-wrapper">
	        <div ref="cpuStatChart" :style="{height:height,margin:0 }"/>
	      </div>
	      <div align="center">
	        <el-button type="success" icon="Histogram" @click="statTimeLine('CPU')" >统计</el-button>
	        <el-button type="primary" icon="Setting" @click="handleCpuMng" >操作</el-button>
	      </div>
	    </el-card>
	  </el-col>
	
		<el-col :span="24" class="card-box">
		  <el-card>
			<div v-loading="timelineLoading" class="chart-wrapper">
			  <div ref="timelineChart" :style="{height:timelineHeight,margin:0 }"/>
			</div>
		  </el-card>
		</el-col>
	
	</el-row>

	<!-- 详情 -->
	<ServerDetail ref="serverDetailFormRef" />
	
  </div>
</template>

<script setup name="Server">
	import {onMounted } from 'vue'
	import {statServer,getDetail} from "@/api/system/server";
	import {exeCmd} from "@/api/system/command";
	import * as echarts from 'echarts';
	import {createChart,createGaugeChartOption,createMixLineBarChartOption} from "@/utils/mulanbay_echarts";
	import ServerDetail from './detail.vue'
	
	const { proxy } = getCurrentInstance();
	//图形实例
	const diskStatChart = ref(null);
	//echarts实例
	let diskStatChartIns = ref(null);
	//图形实例
	const memoryStatChart = ref(null);
	//echarts实例
	let memoryStatChartIns = ref(null);
	//图形实例
	const cpuStatChart = ref(null);
	//echarts实例
	let cpuStatChartIns = ref(null);
	
	const height = ref('360px');
	//自动刷新
	let seconds = ref(10);
	const timer = ref();
	const dataLoading = ref(false);
	const resourceType = ref('MEMORY');
	const timelineLoading = ref(false);
	const timelineHeight = ref('450px');
	
	//图形实例
	const timelineChart = ref(null);
	//echarts实例
	let timelineChartIns = ref(null);
	
	const serverDetailFormRef = ref();
	
	const data = reactive({
	  form: {},
	  queryParams: {
		groupField: 'exception_class_name'
	  },
	  rules: {
		
	  }
	});

	const { queryParams, form, rules } = toRefs(data);

	/** 搜索按钮操作 */
	function handleQuery() {
	  initChart();
	  initTimeLineChart();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  handleQuery();
	}
	
	/** 更多 */
	function handleMoreDetail(){
		serverDetailFormRef.value.openDetail();
	}
	
	/** 自动刷新 */
	function updateRefreshInterval(){
	  clearInterval(timer.value);
	  if(!proxy.isEmpty(seconds.value)&&seconds.value>0){
		 timer.value = setInterval(() => {
	     handleQuery();
	    }, seconds.value*1000)
	  }
	}
	
	/** 磁盘操作 */
	function handleDiskMng(){
	}
	
	/** 内存操作 */
	function handleMemoryMng(){
	  proxy.$confirm('是否确认要进行缓存释放?', "警告", {
	      confirmButtonText: "确定",
	      cancelButtonText: "取消",
	      type: "warning"
	    }).then(function() {
	      //目前编号写死
	      const cmd={
	        code:'BUFF_CACHE',
	        sync:false
	      };
	      return exeCmd(cmd);
	    }).then(() => {
	      proxy.$modal.msgSuccess("发送命令成功，请稍后刷新页面");
	    }).catch(function() {});
	}
	
	/** CPU操作 */
	function handleCpuMng(){
		proxy.$modal.msgWarning("尚未提供");
	}
	
	/** 统计按钮操作 */
	function statTimeLine(rt){
	  resourceType.value = rt;
	  initTimeLineChart();
	}
	
	function initTimeLineChart(){
		statServer(resourceType.value).then(
		  response => {
			response.smooth=true;
			response.serieTypes=['line','line'];
			//组装chart数据
			let option = createMixLineBarChartOption(response);
			createChart(option,timelineChartIns);
		  }
		);
	}
	
	function initChart() {
	  dataLoading.value = true;
      getDetail().then(
        response => {
		  dataLoading.value = false;
		  let diskMonitorOption = createGaugeChartOption(createDiskMonitorChart(response.sysFiles));
		  createChart(diskMonitorOption,diskStatChartIns);
		  
		  let memoryMonitorOption= createGaugeChartOption(createMemoryMonitorChart(response.mem));
		  createChart(memoryMonitorOption,memoryStatChartIns);
		  
		  let cpuMonitorOption = createGaugeChartOption(createCpuMonitorChart(response.cpu));
		  createChart(cpuMonitorOption,cpuStatChartIns);
        }
      );
    }
	
	function createDiskMonitorChart(data) {
	  let di = data[0];
	  let total = di.totalSpace/1.0 / 1024 / 1024 / 1024;
	  let freeSpace = di.freeSpace/1.0 / 1024 / 1024 / 1024;
	  let usedRate = ((total-freeSpace)/total*100).toFixed(2);
	  let diskMonitorData={};
	  diskMonitorData.value = usedRate;
	  diskMonitorData.name = '磁盘使用率';
	  diskMonitorData.title='['+di.path+']磁盘监控';
	  diskMonitorData.subTitle='总空间:'+total.toFixed(0)+"G,空闲:"+freeSpace.toFixed(0)+'G';
	  return diskMonitorData;
	}
	
	function createMemoryMonitorChart(data) {
	  let total = data.totalMemorySize/1.0 / 1024 / 1024 / 1024;
	  let freePhysicalMemorySize = data.freePhysicalMemorySize/1.0 / 1024 / 1024 / 1024;
	  let usedRate = ((total-freePhysicalMemorySize)/total*100).toFixed(2);
	  let memoryMonitorData={};
	  memoryMonitorData.value = usedRate;
	  memoryMonitorData.name = '内存使用率';
	  memoryMonitorData.title='内存监控';
	  memoryMonitorData.subTitle='总的物理内存:'+total.toFixed(1)+"G,空闲:"+freePhysicalMemorySize.toFixed(1)+'G';
	  return memoryMonitorData;
	}
	
	function createCpuMonitorChart(data) {
	  let sysRate =  (data.sysCpuRate*100).toFixed(2);
	  let cpuMonitorData={};
	  cpuMonitorData.value = sysRate;
	  cpuMonitorData.name = 'CPU使用率';
	  cpuMonitorData.title='CPU监控';
	  cpuMonitorData.subTitle='CPU总核数:'+data.physicalProcessorCount.toFixed(0)+"核,当前空闲率:"+data.idleCpuRate.toFixed(1)+'%';
	  return cpuMonitorData;
	}
	
	/** 初始化 **/
	onMounted(() => {
	  //初始化
	  diskStatChartIns = echarts.init(diskStatChart.value, "macarons");
	  memoryStatChartIns = echarts.init(memoryStatChart.value, "macarons");
	  cpuStatChartIns = echarts.init(cpuStatChart.value, "macarons");
	  timelineChartIns = echarts.init(timelineChart.value, "macarons");
	  initChart();
	  initTimeLineChart();
	  //每秒检查参数
	  timer.value = setInterval(() => {
	   handleQuery();
	  }, seconds.value*1000)
	})
	
	/** 关闭前 **/
	onUnmounted(() => {
	  clearInterval(timer.value);
	})
	
</script>

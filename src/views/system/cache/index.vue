<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item>
              <el-button type="primary" icon="Refresh" @click="handleQuery" v-hasPermi="['system:cache:info']">刷新</el-button>
              <el-button type="success" icon="More" @click="handleMoreDetail" v-hasPermi="['system:cache:info']">更多详情</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
			<div ref="commandChart" :style="{height:height,margin:0 }"/>  
          </div>
        </el-card>
      </el-col>
    
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
			<div ref="useChart" :style="{height:height,margin:0 }"/>  
          </div>
        </el-card>
      </el-col>
    
      <el-col :span="24" class="card-box">
        <el-card>
          <div >
            <el-descriptions class="margin-top" title="服务器信息" :column="3" border>
                <template #extra>
                  <el-button type="primary" icon="InfoFilled" @click="handleMoreDetail" v-hasPermi="['system:cache:info']">更多</el-button>
                </template>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><HomeFilled /></el-icon>
                    Redis版本
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.redis_version }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Odometer /></el-icon>
                    运行模式
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.redis_mode == "standalone" ? "单机" : "集群" }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><View /></el-icon>
                    端口
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.tcp_port }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Share /></el-icon>
                    客户端数
                  </template>
                  <el-tag size="small"><div class="cell" v-if="cache.info">{{ cache.info.connected_clients }}</div></el-tag>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Clock /></el-icon>
                    运行时间
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.uptime_in_days }}天</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Connection /></el-icon>
                    使用内存
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.used_memory_human }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Bell /></el-icon>
                    使用CPU
                  </template>
                  <div class="cell" v-if="cache.info">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Service /></el-icon>
                    内存配置
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.maxmemory_human }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><TurnOff /></el-icon>
                    AOF是否开启
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.aof_enabled == "0" ? "否" : "是" }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Switch /></el-icon>
                    RDB是否成功
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.rdb_last_bgsave_status }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><UploadFilled /></el-icon>
                    Key数量
                  </template>
                  <div class="cell" v-if="cache.dbSize">{{ cache.dbSize }} </div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon><Promotion /></el-icon>
                    网络入口/出口
                  </template>
                  <div class="cell" v-if="cache.info">{{ cache.info.instantaneous_input_kbps }}kps/{{cache.info.instantaneous_output_kbps}}kps</div>
                </el-descriptions-item>
              </el-descriptions>
          </div>
        </el-card>
      </el-col>
    
    </el-row>
	
	<!-- 更多详情-->
	<el-dialog :title="detailTitle" width="650px" v-model="detailOpen"  append-to-body class="customDialogCss">
		<Detail ref="detailRef"></Detail>
	</el-dialog>
		
	
  </div>
</template>

<script setup name="Handler">
	import {getInfo} from "@/api/system/cache";
    import * as echarts from 'echarts';
    import {createChart,createPieChartOption,createGaugeChartOption} from "@/utils/mulanbay_echarts";
	import Detail from '../../common/jsonTreeTable'
	
	const { proxy } = getCurrentInstance();
	const infoFormRef = ref();
	//图形实例
	const commandChart = ref(null);
	//echarts实例
	let commandChartIns = ref(null);
	//图形实例
	const useChart = ref(null);
	//echarts实例
	let useChartIns = ref(null);
	
	const height = ref('380px');
	
	// 详情
	// 弹出层标题
	const detailTitle = ref("");
	// 是否显示弹出层
	const detailOpen = ref(false);
	const detailRef = ref();
	
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

	const data = reactive({
	  cache:{
		info:{}
	  },
	  queryParams: {
		page: 1,
		pageSize: 10
	  }
	});

	const { cache,queryParams } = toRefs(data);
	
	/** 详情 */
	function handleMoreDetail(){
		detailOpen.value = true;
		detailTitle.value ='Redis服务器详情';
		setTimeout(function()  {
		  detailRef.value.showData(cache.value);
		}, 100);
	}
	
	function initChart() {
	  proxy.$modal.loading("正在加载数据，请稍候！");
	  cache.value={
		info:{}
	  };
	  getInfo().then(
	    response => {
		  proxy.$modal.closeLoading();
	      //组装chart数据
		  //命令图表
		  let commandChartOption = createPieChartOption(response.commandStats);
		  commandChartOption.showLegend = false;
		  createChart(commandChartOption,commandChartIns);
		  
		  //内存使用图表
		  let ucd={};
		  let p = response.info.used_memory_peak_perc.replace('%','');
		  ucd.value = p;
		  ucd.name = '峰值:'+response.info.used_memory_peak_human;
		  ucd.title='内存消耗';
		  let useChartOption = createGaugeChartOption(ucd);
		  createChart(useChartOption,useChartIns);
		  
		  cache.value = response;
	    }
	  );
	}
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  initChart();
	}

	/** 初始化 **/
	onMounted(() => {
	  commandChartIns = echarts.init(commandChart.value, "macarons");
	  useChartIns = echarts.init(useChart.value, "macarons");
	  initChart();
	})
	
</script>

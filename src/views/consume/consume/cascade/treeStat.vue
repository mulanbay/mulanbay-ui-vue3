<template>
	
  <div class="app-container">
    <el-row type="flex" class="row-bg" justify="end">
      <el-col :span="6">
        <div class="grid-content bg-purple-light">
          <span slot="footer" class="dialog-footer">
            <el-button icon="refresh" type="primary" @click="handleQuery" v-hasPermi="['consume:consume:treeStat']">刷新</el-button>
          </span>
        </div>
        </el-col>
    </el-row>

	<!--图表数据-->
	<div ref="treeStatChart" :style="{height:height,margin:0 }"/>
	
  </div>
</template>

<script setup name="OperLogStat">
	import {onMounted } from 'vue'
	import {getConsumeTreeStat} from "@/api/consume/consume";
	import * as echarts from 'echarts';
	import {createChart,createTreeChartOption} from "@/utils/mulanbay_echarts";
	
	const { proxy } = getCurrentInstance();
	//图形实例
	const treeStatChart = ref(null);
	//echarts实例
	let treeStatChartIns = ref(null);
	const height = ref((document.body.clientHeight - 240).toString() + 'px');

	const data = reactive({
	  form: {},
	  queryParams: {
	  },
	  rules: {
		
	  }
	});

	const { queryParams, form, rules } = toRefs(data);
	
	/** 搜索按钮操作 */
	function handleQuery() {
	  initChart();
	}
	
	/** 重置按钮操作 */
	function resetQuery() {
	  proxy.resetForm("queryRef");
	  initChart();
	}
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openForm = async (consumeId) => {
	  queryParams.value.consumeId=consumeId;
	  setTimeout(function()  {
	    initChart();
	  }, 200);
	}
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openForm }); 
	
	function initChart() {
	  //proxy.$modal.loading("正在加载数据，请稍候！");
      getConsumeTreeStat(queryParams.value).then(
        response => {
		  //proxy.$modal.closeLoading();
          //组装chart数据
          let option = createTreeChartOption(response,echarts);
		  treeStatChartIns.resize();
		  createChart(option,treeStatChartIns);
        }
      );
    }
	
	/** 初始化 **/
	onMounted(() => {
	  //初始化
	  treeStatChartIns = echarts.init(treeStatChart.value, "macarons");
	})
	
</script>

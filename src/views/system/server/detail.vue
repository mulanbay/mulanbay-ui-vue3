<template>
  
  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="680px" append-to-body >
	  
	<el-tabs v-loading="detailLoading"  v-model="activeName" @tab-click="handleClick">
	  <el-tab-pane label="内存信息" name="mem">
	    <MemInfo ref="memInfoRef"/>
	  </el-tab-pane>
	  <el-tab-pane label="CPU信息" name="cpu">
	    <CpuInfo ref="cpuInfoRef"/>
	  </el-tab-pane>
	  <el-tab-pane label="磁盘信息" name="disk">
	    <DiskInfo ref="diskInfoRef"/>
	  </el-tab-pane>
	  <el-tab-pane label="系统信息" name="sys">
	    <SysInfo ref="sysInfoRef"/>
	  </el-tab-pane>
	  <el-tab-pane label="JVM信息" name="jvm">
	    <JvmInfo ref="jvmInfoRef"/>
	  </el-tab-pane>
	</el-tabs>
	
	<div slot="footer" class="dialog-footer" align="right">
	  <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['system:server:detail']">刷新</el-button>
	</div>
	
  </el-dialog>
  
</template>

<script setup name="ServerDetail">
	import {getDetail} from "@/api/system/server";
	import MemInfo from '../../common/keyValueTable'
	import CpuInfo from '../../common/keyValueTable'
	import DiskInfo from './diskData.vue'
	import JvmInfo from '../../common/keyValueTable'
	import SysInfo from '../../common/keyValueTable'
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const detailTitle = ref('系统详情');
	const detailOpen = ref(false);
	const detailLoading = ref(false);
	
	const activeName = ref('mem');
	
	const memInfoRef = ref();
	const cpuInfoRef = ref();
	const diskInfoRef = ref();
	const jvmInfoRef = ref();
	const sysInfoRef = ref();
	
	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openDetail = async () => {
	  detailOpen.value = true;
	  loadData();
	}
	
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openDetail }); 
	
	function handleClick(){
		
	}
	
	/** 加载数据 */
	function loadData(){
		resetForm();
		detailLoading.value = true;
		getDetail().then(response => {
			detailLoading.value = false;
			showMemoryData(response.mem);
			showCpuData(response.cpu);
			showSysData(response.sys);
			showJvmData(response.jvm);
			showDiskData(response.sysFiles);
		});
	}
	
	function showMemoryData(data){
	  let memData = new Array();
	  memData.push({key:'总的物理内存',value:convertToString(data.totalMemorySize)});
	  memData.push({key:'剩余的物理内存',value:convertToString(data.freePhysicalMemorySize)});
	  memData.push({key:'已使用的物理内存',value:convertToString(data.usedMemory)});
	  memInfoRef.value.showData(memData);
	}
	
	function showCpuData(data){
	  let cpuData = new Array();
	  cpuData.push({key:'物理cpu核数',value:data.physicalProcessorCount});
	  cpuData.push({key:'逻辑cpu核数',value:data.logicalProcessorCount});
	  cpuData.push({key:'cpu总核数',value:data.totalCpu});
	  cpuData.push({key:'cpu系统使用率',value:data.sysCpuRate});
	  cpuData.push({key:'cpu用户使用率',value:data.userCpuRate});
	  cpuData.push({key:'cpu当前等待率',value:data.iowaitCpuRate});
	  cpuData.push({key:'cpu当前空闲率',value:data.idleCpuRate});
	  cpuInfoRef.value.showData(cpuData);
	}
	
	function showSysData(data){
	  let sysData = new Array();
	  sysData.push({key:'操作系统',value:data.osName});
	  sysData.push({key:'IP地址',value:data.serverIp});
	  sysData.push({key:'userHome',value:data.userHome});
	  sysData.push({key:'userName',value:data.userName});
	  sysData.push({key:'系统架构',value:data.osArch});
	  sysInfoRef.value.showData(sysData);
	}
	
	function showJvmData(data){
	  let jvmData = new Array();
	  jvmData.push({key:'程序启动时间',value:data.startTime});
	  jvmData.push({key:'程序PID',value:data.pid});
	  jvmData.push({key:'javaHome',value:data.javaHome});
	  jvmData.push({key:'javaVersion',value:data.javaVersion});
	  jvmData.push({key:'总线程数',value:data.totalThread});
	  jvmData.push({key:'当前占用的内存',value:convertToString(data.totalMemorySize)});
	  jvmData.push({key:'初始的总内存',value:convertToString(data.initTotalMemorySize)});
	  jvmData.push({key:'最大可用内存',value:convertToString(data.maxMemorySize)});
	  jvmData.push({key:'已使用的内存',value:convertToString(data.usedMemorySize)});
	  jvmInfoRef.value.showData(jvmData);
	}
	
	function showDiskData(data){
	  diskInfoRef.value.showData(data);
	}
	
	//转换
	function convertToString(size){
	  let ms = size/1.0 / 1024 / 1024 ;
	  if(ms>1000){
	    return (ms / 1024).toFixed(1)+'G';
	  }else{
	    return ms.toFixed(0)+'M';
	  }
	}
	
	/** 刷新 */
	function refresh(){
		loadData();
	}

	// 表单重置
	function resetForm() {
	  
	}
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>

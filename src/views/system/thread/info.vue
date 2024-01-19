<template>
  
  <!-- 详情对话框 -->
  <el-dialog :title="infoTitle" v-model="infoOpen" width="680px" append-to-body >
	  
	<el-divider content-position="center">详情列表</el-divider>
    <el-table :data="detailList"  v-loading="infoLoading">
      <el-table-column label="名称" prop="key" align="center">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值" prop="value" align="center">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
    </el-table>
	
  </el-dialog>
  
</template>

<script setup name="ThreadInfo">
	import {getThreadInfo} from "@/api/system/thread";
	
	const { proxy } = getCurrentInstance();
	
	//可执行时间段
	const infoTitle = ref('线程详情');
	const infoOpen = ref(false);
	const infoLoading = ref(false);
	
	const threadId = ref();
	
	const detailList = ref([]);

	// 定义 success 事件，用于操作成功后的回调
	const emit = defineEmits(['success']);
	
	/** 打开弹窗 */
	const openInfo = async (id) => {
	  infoOpen.value = true;
	  threadId.value=id;
	  loadData();
	}
	
	
	// 提供 open 方法，用于打开弹窗
	defineExpose({ openInfo }); 
	
	/** 加载数据 */
	function loadData(){
		resetForm();
		infoLoading.value = true;
		getThreadInfo(threadId.value).then(response => {
			infoLoading.value = false;
			detailList.value=response.details;
		});
	}
	
	/** 刷新 */
	function refresh(){
		loadData();
	}

	// 表单重置
	function resetForm() {
	  detailList.value=[];
	}
	
	/** 初始化 **/
	onMounted(() => {
	  
	})
	
</script>

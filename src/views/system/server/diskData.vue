<template>
  <div class="app-container">

	<!--列表数据-->
	<el-table :data="dataList" ref="diskDataRef">
	  <el-table-column label="磁盘路径" prop="key" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.path }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="盘符类型" prop="value" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.sysTypeName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="文件类型" prop="value" align="center">
	    <template #default="scope">
	      <span>{{ scope.row.typeName }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="总空间" prop="value" align="center">
	    <template #default="scope">
	      <span>{{ convertToString(scope.row.totalSpace) }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="空闲空间" prop="value" align="center">
	    <template #default="scope">
	      <span>{{ convertToString(scope.row.freeSpace) }}</span>
	    </template>
	  </el-table-column>
	</el-table>
	

  </div>
</template>

<script setup name="DiskData">
	
	const { proxy } = getCurrentInstance();
	const diskDataRef = ref();

	// 查询列表数据
	const dataList = ref([]);
		
	//data为json格式的数据
	const showData = async (data) => {
	  if(data==null){
	    dataList.value=[];
	  }else{
	    dataList.value = data;
	  }
	}
	
	//提供对外方法
	defineExpose({ showData })
	
	function convertToString(size){
      let ms = size/1.0 / 1024 / 1024 ;
      if(ms>1000){
        return (ms / 1024).toFixed(1)+'G';
      }else{
        return ms.toFixed(0)+'M';
      }
    }
	
</script>

<template>
  <div class="app-container">

    <!--列表数据-->
    <el-table :data="dataList" ref="keyValueTableRef">
      <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值"  :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script setup name="KeyValueTable">
	
	const { proxy } = getCurrentInstance();
	const keyValueTableRef = ref();

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
	
	
</script>

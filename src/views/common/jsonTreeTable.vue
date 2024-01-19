<template>
  <div class="app-container">

    <!--列表数据-->
    <el-table
      :data="dataList"
      row-key="id"
	  ref="jsonTreeTableRef"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="值"  :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.text }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script setup name="JsonTreeTable">
   import {parseJsonToTree} from "@/utils/mulanbay";
	
	const { proxy } = getCurrentInstance();
	const jsonTreeTableRef = ref();

	// 查询列表数据
	const dataList = ref([]);
		
	//data为json格式的数据
	const showData = async (data) => {
	  let jo = data;
	  if(jo==null){
	    dataList.value=[];
	  }else{
	    let treeData = parseJsonToTree(jo);
	    dataList.value = treeData;
	  }
	}
	
	//提供对外方法
	defineExpose({ showData })
	
	
</script>

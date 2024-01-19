<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
	  <el-form-item label="名称检索" prop="name">
	    <el-input
	      v-model="queryParams.name"
	      placeholder="请输入名称"
	      clearable
	      style="width: 240px"
	      @keyup.enter.native="handleQuery"
	    />
	  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['system:backup:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
	<el-table v-loading="loading" :data="backupList" @selection-change="handleSelectionChange">
	  <el-table-column type="selection" width="55" align="center" />
	  <el-table-column label="ID" type="index" prop="id" sortable="custom" align="center" width="80">
	  </el-table-column>
	  <el-table-column label="文件名"  min-width="160px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span v-if="scope.row.days<=1">
	       <el-tag>new</el-tag>
	      </span>
	      <span v-if="scope.row.directory==true" style="color:green ;">
	       <i class="el-icon-star-off" />
	       {{ scope.row.fileName }}
	      </span>
	      <span v-else style="color:black ;">
	        {{ scope.row.fileName }}
	      </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="大小" align="center" >
	    <template #default="scope">
	      <span>{{ formatSize(scope.row) }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="路径" align="center"  min-width="160px" :show-overflow-tooltip="true">
	    <template #default="scope">
	      <span>{{ scope.row.path }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="类型" align="center" width="80">
	    <template #default="scope">
	       <span v-if="scope.row.directory==true">
	        <el-tag type="success">文件夹</el-tag>
	       </span>
	       <span v-else>
	         <el-tag type="danger">文件</el-tag>
	       </span>
	    </template>
	  </el-table-column>
	  <el-table-column label="最后修改时间" align="center" width="180">
	    <template #default="scope">
	      <span>{{ scope.row.lastModifyTime }}</span>
	    </template>
	  </el-table-column>
	  <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
		<template  #default="scope">
		  <el-button
			link
			type="success"
			icon="download"
			@click="handleDownload(scope.row)"
			v-hasPermi="['system:backup:download']"
		  >下载</el-button>
		  <el-button
		    link
		    type="danger"
		    icon="delete"
		    @click="handleDelete(scope.row)"
		    v-hasPermi="['system:backup:delete']"
		  >删除</el-button>
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

  </div>
</template>

<script setup name="Backup">
	import {fetchList,deleteFile} from "@/api/system/backup";
    
	const { proxy } = getCurrentInstance();
		
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
	const backupList = ref([]);
	
	const data = reactive({
	  queryParams: {
		page: 1,
		pageSize: 10
	  }
	});

	const { queryParams } = toRefs(data);
	
	/** 大小转换 */
	function formatSize(row){
		let bytes = row.size;
		let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}
	
	/** 下载 */
	function handleDownload(row){
		//todo 设置header的jwt信息
		window.location.href = import.meta.env.VITE_APP_BASE_API+"/backup/download?fileName=" + encodeURI(row.fileName);
	}
	
	/** 命令 */
	function handleDelete(row){
		const fileName = row.fileName;
		proxy.$confirm('是否确认删除文件"' + fileName + '"?', "警告", {
		    confirmButtonText: "确定",
		    cancelButtonText: "取消",
		    type: "warning"
		  }).then(function() {
		    return deleteFile(fileName);
		  }).then(() => {
			proxy.$modal.msgSuccess("删除成功");
		    getList();
		  }).catch(function() {});
	}
	
	/** 查询列表 */
	function getList() {
	  loading.value = true;
	  backupList.value =[];
	  fetchList(queryParams.value).then(
	    response => {
	      backupList.value = response.rows;
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
	  ids.value = selection.map(item => item.id)
	  single.value = selection.length!=1
	  multiple.value = !selection.length
	}
	
	/** 初始化 **/
	onMounted(() => {
	  getList();
	})
	
</script>

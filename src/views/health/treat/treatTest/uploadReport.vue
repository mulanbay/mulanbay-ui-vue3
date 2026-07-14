<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="600px" append-to-body>
    <div class="upload-container">

        <el-upload
          ref="uploadRef"
          v-model:file-list="fileList"
          action="#" 
          list-type="picture-card"
          :auto-upload="false"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :limit="5"
          :on-exceed="handleExceed"
          multiple
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
    
        <div class="mt-4">
          <el-button type="primary" @click="submitUpload" :loading="uploading">
            开始上传
          </el-button>
          <el-button @click="clearFiles">清空列表</el-button>
        </div>
    
        <!-- 图片预览对话框 -->
        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
        </el-dialog>
        
        <!-- 结果展示 -->
        <div v-if="uploadedUrls.length > 0" class="result-area">
          <h4>上传成功后的URL:</h4>
          <ul>
            <li v-for="(url, index) in uploadedUrls" :key="index">{{ url }}</li>
          </ul>
        </div>
      </div>
  </el-dialog>

</template>

<script setup name="TreatTestUploadReport">
  import { uploadTreatTestReport } from "@/api/health/treat/treatTest";
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('上传报告');
  const open = ref(false);
  const formRef = ref();

	// 状态定义
	const uploadRef = ref();
	const fileList = ref([]);
	const dialogImageUrl = ref('');
	const dialogVisible = ref(false);
	const uploading = ref(false);
	const uploadedUrls = ref([]);
	//手术ID
	const operationId = ref();
	
  const data = reactive({
    
  });

  const {  } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (opId) => {
    open.value = true;
    operationId.value = opId;
		fileList.value = [];
		uploadedUrls.value = [];
		uploading.value = false;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 搜索按钮操作 */
  function handleQuery() {
  }

  /** 重置按钮操作 */
  function resetQuery() {
    
  }

  // 表单重置
  function resetForm() {
    
  }

	// 限制上传数量提示
	const handleExceed = (files) => {
	  ElMessage.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件`)
	}
	
	// 移除文件时的处理
	const handleRemove = (file) => {
	  console.log('Removed file:', file)
	}
	
	// 预览图片
	const handlePreview = (file) => {
	  dialogImageUrl.value = file.url
	  dialogVisible.value = true
	}
	
	// 上传前的校验 (例如检查格式和大小)
	const beforeUpload = (rawFile) => {
	  if (!['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)) {
	    ElMessage.error('图片格式只能是 JPG/PNG/GIF!')
	    return false
	  }
	  if (rawFile.size / 1024 / 1024 > 2) {
	    ElMessage.error('图片大小不能超过 2MB!')
	    return false
	  }
	  return true
	}
	
	// 清空列表
	const clearFiles = () => {
	  fileList.value = []
	  uploadedUrls.value = []
	}
	
	// 提交上传逻辑
	const submitUpload = async () => {
	  if (fileList.value.length === 0) {
	    proxy.$modal.msgError('请先选择图片')
	    return;
	  }
		if (operationId.value == null) {
		  proxy.$modal.msgError("没有绑定手术编号，无法新增");
		  return;
		}
	  uploading.value = true;
	  const formData = new FormData();
	  
	  // 将所有选中的文件添加到 FormData 中
	  // 注意：fileList 中的对象结构可能因版本略有不同，通常 raw 属性包含原始 File 对象
	  fileList.value.forEach((file) => {
	    if (file.raw) {
	      formData.append('files', file.raw)
	    }
	  })
		
		// 2. 添加额外参数 operationId
		// 注意：key 必须与后端 @RequestParam 的名称一致
		formData.append('operationId', operationId.value)
		
		uploadTreatTestReport(formData).then(response => {
		  proxy.$modal.msgSuccess("上传成功");
		  uploadedUrls.value = response || [];
			uploading.value = false;
			
			// 发送操作成功的事件
			emit('success');
			open.value = false;
			
		});

	}
	

  /** 初始化 **/
  onMounted(() => {
  })
</script>
<style scoped>
	.upload-container {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
	}
	.mt-4 {
		margin-top: 16px;
	}
	.result-area {
		margin-top: 20px;
		padding: 10px;
		background-color: #f5f7fa;
		border-radius: 4px;
	}
	.result-area ul {
		list-style-type: disc;
		padding-left: 20px;
	}
</style>

<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
        <el-form-item>
					<el-button type="success" icon="refresh" @click="handleQuery" v-hasPermi="['system:resources:list']">刷新</el-button>
          <el-button type="primary" icon="plus"  @click="handleCreate" >新增</el-button>
        </el-form-item>
      </el-form>
			
			<!-- 加载状态 -->
			<div v-if="loading" class="loading-state">
				<el-skeleton :rows="3" animated />
			</div>
	
			<!-- 空状态 -->
			<el-empty v-else-if="reportList.length === 0" description="暂无图片，请点击右上角添加或上传" />
	
			<!-- 图片网格列表 -->
			<div v-else class="scroll-wrapper">
				<div 
					v-for="(item, index) in reportList" 
					:key="item.resId" 
					class="image-card"
				>
					<!-- 删除按钮 (绝对定位在右上角) -->
					<div class="delete-btn" @click.stop="handleDelete(item)">
						<el-icon><Close /></el-icon>
					</div>
	
					<el-image
						style="width: 100px; height: 100px"
						:src="item.path"
						:zoom-rate="1.2"
						:max-scale="7"
						:min-scale="0.2"
						:preview-src-list="previewSrcList"
						show-progress
						:initial-index="4"
						fit="cover"
					>
					
					<template
						#toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }"
					>
						<el-icon @click="prev"><Back /></el-icon>
						<el-icon @click="next"><Right /></el-icon>
						<el-icon @click="setActiveItem(previewSrcList.length - 1)">
							<DArrowRight />
						</el-icon>
						<el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
						<el-icon
							@click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })"
						>
							<ZoomIn />
						</el-icon>
						<el-icon
							@click="
								actions('clockwise', { rotateDeg: 180, enableTransition: false })
							"
						>
							<RefreshRight />
						</el-icon>
						<el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
						<el-icon @click="reset"><Refresh /></el-icon>
						<el-icon @click="download(activeIndex)"><Download /></el-icon>
						<el-tooltip content="扫码报告为文本信息" effect="dark" placement="top">
						  <el-icon @click="handleScan(item)"><FullScreen /></el-icon>
						</el-tooltip>
					</template>
				</el-image>
					
				</div>
			</div>
					
			<!-- 报告上传 -->
			<UploadReport ref="uploadReportRef" @success="getList"/>
			
    </div>
  </el-dialog>

</template>

<script setup name="TreatTestReportList">
	import { fetchList, deleteResources } from "@/api/system/resources";
	import {
	  Back,
	  DArrowRight,
	  Download,
	  Refresh,
	  RefreshLeft,
	  RefreshRight,
	  Right,
	  ZoomIn,
	  ZoomOut,
	} from '@element-plus/icons-vue'
	import Tesseract from 'tesseract.js'

  import UploadReport from './uploadReport.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('报告列表');
  const open = ref(false);
  const formRef = ref();
  const uploadReportRef = ref();
	//手术ID
	const operationId = ref();
	
	// 遮罩层
	const loading = ref(false);
	// 选中数组
	const ids = ref([]);
	const reportList = ref([]);
	// 总条数
	const total = ref(0);
	
  const data = reactive({
    queryParams: {
			page:0,
			type:'PICTURE',
			bussSource:'TREAT_OPERATION'
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (opId) => {
    open.value = true;
		operationId.value = opId;
		queryParams.value.referId = opId;
		handleQuery();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

	// 计算属性：生成用于预览的纯 URL 数组
	// el-image 的 preview-src-list 只需要字符串数组
	const previewSrcList = computed(() => {
	  return reportList.value.map(item => item.path)
	})
	
  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    
  }

  // 表单重置
  function resetForm() {

  }
	
	/** 提交表单 */
	function getList() {
	  loading.value = true;
	  fetchList(queryParams.value).then(
	    response => {
	      reportList.value = response.rows;
	      total.value = response.total;
	      loading.value = false;
	    }
	  );
	}
	
	/** 扫码操作 */
	function handleScan(item) {
		Tesseract.recognize(
		  item.path,
		  'chi_sim+eng',
		  { logger: m => console.log(m) }
		).then(({ data: { text } }) => {
		  proxy.$modal.msgSuccess(text);
		})
		
	}
	
	/** 新增操作 */
	function handleCreate() {
		uploadReportRef.value.openForm(operationId.value);
	}
	
	/** 删除操作 */
	function handleDelete(row) {
		const deleteIds = row.resId;
		proxy.$confirm('是否确认删除该报告?', "警告", {
		  confirmButtonText: "确定",
		  cancelButtonText: "取消",
		  type: "warning"
		}).then(function() {
		  return deleteResources(deleteIds);
		}).then(() => {
		  proxy.$modal.msgSuccess("删除成功");
		  getList();
		}).catch(function() {});
	}

  /** 初始化 **/
  onMounted(() => {
		
  })
</script>
<style scoped>

/* 核心：横向滚动容器 */
.scroll-wrapper {
  display: flex;
  gap: 16px; /* 图片间距 */
  overflow-x: auto; /* 允许横向滚动 */
  padding-bottom: 10px; /* 给滚动条留点空间 */
  
  /* 平滑滚动效果 */
  scroll-behavior: smooth;
  
  /* 隐藏默认滚动条 (Chrome/Safari) */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
}

/* 单个图片卡片 */
.h-image-card {
  position: relative;
  /* 关键：防止卡片被压缩 */
  flex: 0 0 auto; 
  width: 200px;   /* 固定宽度 */
  height: 150px;  /* 固定高度 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

/* 底部操作区：关键修改 */
.card-footer {
  padding: 12px;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  background-color: #fff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-top: 1px solid #ebeef5;
}
</style>

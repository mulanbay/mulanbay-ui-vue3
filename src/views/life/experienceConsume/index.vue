<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="950px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
			<el-form-item label="行程" prop="detailId">
			  <el-select
			    v-model="queryParams.detailId"
			    placeholder="全部行程"
			    collapse-tags
					clearable
			    style="width: 240px"
			  >
			    <el-option
			      v-for="dict in detailOptions"
			      :key="dict.id"
			      :label="dict.text"
			      :value="dict.id"
			    />
			  </el-select>
			</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:experienceConsume:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['life:experienceConsume:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="consumeList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="consumeId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.consumeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.consumeName }}</span>
        </template>
      </el-table-column>
			<el-table-column label="时间" align="center" width="180">
			  <template #default="scope">
			    <span>{{ scope.row.buyTime }}</span>
			  </template>
			</el-table-column>
      <el-table-column label="商品类型" align="center" width="140">
        <template #default="scope">
          <span>{{ scope.row.goodsType.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center" width="140">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.cost) }}</span>
        </template>
      </el-table-column>
			<el-table-column label="配置" width="80" align="center">
			  <template #default="scope">
					<el-tooltip class="box-item" effect="dark" content="关联消费" placement="top">
					  <span v-if="scope.row.scId!=null">
					    <el-icon color="green"><SuccessFilled /></el-icon>
					  </span>
					  <span v-else>
					    <el-icon color="red"><CircleCloseFilled /></el-icon>
					  </span>
					</el-tooltip>
					<el-divider direction="vertical"></el-divider>
			    <el-tooltip class="box-item" effect="dark" content="加入统计" placement="top">
			      <span v-if="scope.row.stat==true">
			        <el-icon color="green"><SuccessFilled /></el-icon>
			      </span>
			      <span v-else>
			        <el-icon color="red"><CircleCloseFilled /></el-icon>
			      </span>
			    </el-tooltip>
			  </template>
			</el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:experienceConsume:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
      
  </el-dialog>

  <!-- 表单 -->
  <ExperienceConsumeForm ref="formRef" @success="getList" />

</template>

<script setup name="ExperienceConsume">
  import { fetchList,deleteExperienceConsume } from "@/api/life/experienceConsume";
	import { getExperienceDetailTree } from "@/api/life/experienceDetail";
  import { formatDays,getHourDesc } from "@/utils/datetime";
  import ExperienceConsumeForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('消费明细');
  const open = ref(false);
  const formRef = ref();
  
  const consumeList = ref([]);
	//明细
	const detailOptions = ref([]);
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
    queryParams: {
      page:1,
      pageSize:10
    },
    rules: {
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (expId,detailId) => {
    open.value = true;
    resetForm();
		if(detailId!=null){
			title.value = '消费明细列表(行程ID:'+detailId+')';
		}
    queryParams.value.detailId=detailId;
		queryParams.value.expId=expId;
		initOptions();
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    proxy.resetForm("queryRef");
		detailOptions.value = [];
  }
  
  /** 新增按钮操作 */
  function handleCreate() {
    if(queryParams.value.detailId==null){
      proxy.$modal.msgError("没有明细编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.detailId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.consumeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(queryParams.value).then(
      response => {
        consumeList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.consumeId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExperienceConsume(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.consumeId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
	
	/** 初始化下拉树结构 */
	function initOptions() {
		detailOptions.value = [];
		let para ={
			expId: queryParams.value.expId,
			detailId: queryParams.value.detailId,
			needRoot:false
		}
	  getExperienceDetailTree(para).then(response => {
	    detailOptions.value = response;
	  });
	}
	
  /** 初始化 **/
  onMounted(() => {

  })
</script>
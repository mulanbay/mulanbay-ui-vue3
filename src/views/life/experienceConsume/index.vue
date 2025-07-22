<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="950px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="消费标签" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          disabled
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
			<el-form-item label="起止日期" style="width: 308px">
			  <el-date-picker
			    v-model="dateRange"
			    unlink-panels
			    value-format="YYYY-MM-DD"
			    type="daterange"
			    range-separator="-"
			    start-placeholder="开始日期"
			    end-placeholder="结束日期"
			    :shortcuts="datePickerOptions"></el-date-picker>
			</el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['consume:consume:list']">搜索</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['life:experienceConsume:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="consumeList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="consumeId" sortable="custom" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.consumeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" fixed="left" min-width="260px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.tags != null">
            <el-icon color="green"><Shop /></el-icon>
          </span>
          <span v-if="scope.row.pid != null">
            <el-icon color="red"><StarFilled /></el-icon>
          </span>
          <span v-if="scope.row.consumeType == 'TREAT'">
            <el-icon color="yellowgreen"><StarFilled /></el-icon>
          </span>
          <span v-if="scope.row.secondhand==true">
            <el-tag type="warning">二手</el-tag>
          </span>
      		<span v-if="scope.row.invalidTime!=null">
      			<el-tag type="success">售</el-tag>
      		</span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.goodsName }}</span>
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
          <span>{{ formatMoney(scope.row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['consume:consume:delete']">删除
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
  <ConsumeForm ref="formRef" @success="getList" />

</template>

<script setup name="ExperienceConsume">
  import { fetchList, deleteConsume, getConsume } from "@/api/consume/consume";
  import { formatDays,getHourDesc } from "@/utils/datetime";
  import ConsumeForm from '../../consume/consume/form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('消费明细');
  const open = ref(false);
  const formRef = ref();
  
  const consumeList = ref([]);
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
  
	//日期范围快速选择
	const datePickerOptions = ref(proxy.datePickerOptions);
	const dateRange = ref([]);
	
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
  const showData = async (expId,expName) => {
    open.value = true;
    resetForm();
		title.value = '消费明细列表('+expName+')';
    queryParams.value.name=expName;
		//queryParams.value.expId=expId;
		//initOptions();
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
  }
  
  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create',queryParams.value.name);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.consumeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
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
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?会直接删除原始的消费记录', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteConsume(deleteIds);
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
		
	}
	
  /** 初始化 **/
  onMounted(() => {

  })
</script>
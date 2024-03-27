<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="900px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
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
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:experienceDetail:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['life:experienceDetail:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="detailList"  @selection-change="handleSelectionChange">
      <el-table-column label="ID" fixed="left" prop="detailId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.detailId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日期" fixed="left" align="center" width="120">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.occurDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出发位置" align="center" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatStartLocation(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="抵达位置" align="center" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatArriveLocation(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center" width="140">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.cost) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费明细" width="100" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleConsumeList(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="地图绘制" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.mapStat==true">
            <el-icon color="green">
              <SuccessFilled />
            </el-icon>
          </span>
          <span v-else>
            <el-icon color="red">
              <CircleCloseFilled />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:experienceDetail:delete']">删除
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
  <ExperienceDetailForm ref="formRef" @success="getList" />

  <!-- 消费列表 -->
  <ExperienceConsumeList ref="experienceConsumeListRef"/>
  
</template>

<script setup name="ExperienceDetail">
  import { fetchList,deleteExperienceDetail } from "@/api/life/experienceDetail";
  import { formatDays,getHourDesc } from "@/utils/datetime";
  import ExperienceDetailForm from './form.vue'
  import ExperienceConsumeList from '../experienceConsume/index.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('行程明细');
  const open = ref(false);
  const formRef = ref();
  const experienceConsumeListRef = ref();
  
  const detailList = ref([]);
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
  const showData = async (expId) => {
    open.value = true;
    resetForm();
    queryParams.value.expId=expId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 消费明细列表操作 */
  function handleConsumeList(row){
    experienceConsumeListRef.value.showData(row.detailId);
  }
  
  /** 出发位置信息 */
  function formatStartLocation(row) {
    let name ='';
    if(row.startProvince!=null){
      name+=row.startProvince.provinceName+'-';
    }
    if(row.startCity!=null){
      name+=row.startCity.cityName+'-';
    }
    if(row.startDistrict!=null){
      name+=row.startDistrict.districtName;
    }
    return name;
  }
  
  /** 抵达位置信息 */
  function formatArriveLocation(row) {
    let name ='';
    if(row.arriveProvince!=null){
      name+=row.arriveProvince.provinceName+'-';
    }
    if(row.arriveCity!=null){
      name+=row.arriveCity.cityName+'-';
    }
    if(row.arriveDistrict!=null){
      name+=row.arriveDistrict.districtName;
    }
    return name;
  }
  
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
    if(queryParams.value.expId==null){
      proxy.$modal.msgError("没有经历编号绑定，无法新增");
      return;
    }
    formRef.value.openForm(null, 'create',queryParams.value.expId);
  }
  
  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.detailId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        detailList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }
  
  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.detailId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExperienceDetail(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }
  
  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.detailId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }
  

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="采集日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormal:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['health:body:bodyAbnormal:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:body:bodyAbnormal:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:bodyAbnormal:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="bodyAbnormalList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.disease }}</span>
          <span class="link-type" @click="showBodyAnalyse(scope.row.disease,'DISEASE')"><el-icon color="green"><Promotion /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="器官" align="center">
        <template #default="scope">
          <span>{{ scope.row.organ }}</span>
          <span class="link-type" @click="showBodyAnalyse(scope.row.organ,'ORGAN')"><el-icon color="green"><Promotion /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="用药统计" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleDrugStat(scope.row)"><el-icon><Grid /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="发生日期" align="center" width="120"  >
        <template #default="scope">
          <span>{{ scope.row.occurDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" width="120" >
        <template #default="scope">
          <span>{{ scope.row.finishDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="持续天数" align="center" >
        <template #default="scope">
          <span>{{ scope.row.days }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['health:body:bodyAbnormal:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:bodyAbnormal:delete']">删除
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

    <!-- 表单 -->
    <BodyAbnormalForm ref="formRef" @success="getList" />

    <!-- 统计 -->
    <TreatDrugDetailStat ref="treatDrugDetailStatRef" />
    
  </div>
</template>

<script setup name="BodyAbnormal">
  import { fetchList, deleteBodyAbnormal} from "@/api/health/body/bodyAbnormal";
  import BodyAbnormalForm from './form.vue';
  import {getHourDesc} from "@/utils/datetime";
  import TreatDrugDetailStat from '../../treat/treatDrugDetail/stat.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const treatDrugDetailStatRef = ref();

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
  const bodyAbnormalList = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 身体分析 */
  function showBodyAnalyse(name, groupField) {
    //路由定向
    proxy.$router.push({name:'BodyAbnormalAnalyse',query: {name:name,groupField:groupField}})
  }
  
  /** 药品统计 */
  function handleDrugStat(row){
    treatDrugDetailStatRef.value.showData(row.occurDate,row.finishDate);
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    bodyAbnormalList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        bodyAbnormalList.value = response.rows;
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
    queryParams.value.page = 1;
    handleQuery();
  }

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.id || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.id || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBodyAbnormal(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
  
</script>
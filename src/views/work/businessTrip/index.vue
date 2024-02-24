<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="所在公司" prop="companyId">
        <el-select
          v-model="queryParams.companyId"
          placeholder="公司"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in companyOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="加班日期" style="width: 308px">
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['work:businessTrip:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['work:businessTrip:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['work:businessTrip:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['work:businessTrip:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="businessTripList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="tripId" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.tripId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公司" fixed="left" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.company.companyName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出差日期" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.tripDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.country==null ? null:scope.row.country.cnName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="省份" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.province==null ? null:scope.row.province.provinceName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="城市" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.city==null ? null:scope.row.city.cityName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="县" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.district==null ? null:scope.row.district.districtName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['work:businessTrip:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['work:businessTrip:delete']">删除
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
    <BusinessTripForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="BusinessTrip">
  import { fetchList, deleteBusinessTrip } from "@/api/work/businessTrip";
  import { getCompanyTree } from "@/api/work/company";
  import BusinessTripForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();

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
  const businessTripList = ref([]);
  const companyOptions = ref([]);

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

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  /** 更多查询条件处理 */
  function handleMoreCdn() {
    if (moreCdn.value == true) {
      moreCdn.value = false;
      cdnTitle.value = '更多';
    } else {
      moreCdn.value = true;
      cdnTitle.value = '取消';
    }
  }
  
  /** 时间区间 */
  function formatWorkTimeRange(row) {
    let s = row.startTime.substr(11, 5) + '~~' + row.endTime.substr(11, 5);
    return s;
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    businessTripList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        businessTripList.value = response.rows;
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
    const id = row.tripId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.tripId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBusinessTrip(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.tripId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getCompanyTree().then(response => {
      companyOptions.value = response;
    });
  })
</script>
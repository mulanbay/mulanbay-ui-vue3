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
      <el-form-item v-if="moreCdn==true" label="体重区间">
          <el-input-number v-model="queryParams.startWeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.endWeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="身高区间">
          <el-input-number v-model="queryParams.startHeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.endHeight" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:body:bodyInfo:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['health:body:bodyInfo:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:body:bodyInfo:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:bodyInfo:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="bodyInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="体重(公斤)" align="center" width="95">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.weight }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身高(厘米)" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.height }}</span>
        </template>
      </el-table-column>
      <el-table-column label="BMI指数" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.bmi<=18.4" style="color: #bc8f8f;">
           {{ scope.row.bmi }}(偏瘦)
          </span>
          <span v-else-if="scope.row.bmi>=18.5&&scope.row.bmi<=23.9" style="color: green;">
           {{ scope.row.bmi }}(正常)
          </span>
          <span v-else-if="scope.row.bmi>=24&&scope.row.bmi<=27.9" style="color: yellow;">
           {{ scope.row.bmi }}(过重)
          </span>
          <span v-else style="color: red;">
           {{ scope.row.bmi }}(肥胖)
          </span>
        </template>
      </el-table-column>
      <el-table-column label="时辰" align="center" >
        <template #default="scope">
          <span>{{ getHourDesc(scope.row.recordTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采集时间" align="center" min-width="180px">
        <template #default="scope">
          <span>{{ scope.row.recordTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="210" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['health:body:bodyInfo:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:bodyInfo:delete']">删除
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
    <BodyInfoForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="BodyInfo">
  import { fetchList, deleteBodyInfo} from "@/api/health/body/bodyInfo";
  import BodyInfoForm from './form.vue';
  import {getHourDesc} from "@/utils/datetime";

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
  const bodyInfoList = ref([]);

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
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    bodyInfoList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        bodyInfoList.value = response.rows;
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
      return deleteBodyInfo(deleteIds);
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
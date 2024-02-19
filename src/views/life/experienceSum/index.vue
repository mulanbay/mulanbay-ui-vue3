<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true">
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:experienceSum:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['life:experienceSum:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['life:experienceSum:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:experienceSum:delete']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="TrendCharts"
          @click="handleAnalyse"
          v-hasPermi="['life:experienceSum:analyse']">分析</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sumList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="sumId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.sumId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年份" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.year }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总天数" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.totalDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作天数" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.workDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="旅行天数" align="center">
        <template #default="scope">
          <span>{{ scope.row.travelDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学习天数" align="center">
        <template #default="scope">
          <span>{{ scope.row.studyDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="Switch"
            @click="handleRevise(scope.row)"
            v-hasPermi="['life:experienceSum:revise']">修正
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:experienceSum:delete']">删除
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
    <ExperienceSumForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="ExperienceSum">
  import { fetchList, deleteExperienceSum,reviseExperienceSum } from "@/api/life/experienceSum";
  import ExperienceSumForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('经历汇总');
  const open = ref(false);
  const formRef = ref();

  const sumList = ref([]);
  // 遮罩层
  const loading = ref(false);
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
      page: 1,
      pageSize: 10
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  /** 修正操作 */
  function handleRevise(row) {
    reviseExperienceSum(row.sumId).then(response => {
      proxy.$modal.msgSuccess("修正成功");
      getList();
    });
  }
  
  /** 分析 */
  function handleAnalyse(){
    //路由定向
    proxy.$router.push({name:'ExperienceSumAnalyse',query: {}})
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
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.sumId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        sumList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.sumId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExperienceSum(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.sumId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }


  /** 初始化 **/
  onMounted(() => {
    getList();
  })
</script>
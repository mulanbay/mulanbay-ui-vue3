<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="选择运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['sport:sportMilestone:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['sport:sportMilestone:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['sport:sportMilestone:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sport:sportMilestone:delete']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="TrendCharts"
          @click="handleStat"
          v-hasPermi="['sport:sportMilestone:stat']">统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="refresh"
          @click="handleRefresh"
          v-hasPermi="['sport:sportMilestone:refresh']">刷新里程碑</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sportMilestoneList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="milestoneId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.milestoneId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.milestoneName }}</span>
          <span v-if="scope.row.exercise != null">
           <el-tag type="success">已实现</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.sport.sportName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="别名" align="center" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.alais }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期望值" align="center">
        <template #default="scope">
          <span>{{ scope.row.value+scope.row.sport.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期望时间" align="center">
        <template #default="scope">
          <span>{{ scope.row.duration+'分钟' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="达成目标的锻炼信息"  width="300">
        <template #default="scope">
          <span>{{ scope.row.exercise==null ? '--': scope.row.exercise.exerciseTime+'('+scope.row.exercise.value+scope.row.sport.unit+','+scope.row.exercise.duration+'分钟)' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费天数" align="center" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.costDays!=null">{{ formatDays(scope.row.costDays) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['sport:sportMilestone:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sport:sportMilestone:delete']">删除
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
    <SportMilestoneForm ref="formRef" @success="getList" />

    <!-- 重新刷新 -->
    <RefreshForm ref="refreshRef" @success="getList" />

  </div>
</template>

<script setup name="SportMilestone">
  import { fetchList, deleteSportMilestone } from "@/api/sport/sportMilestone";
  import { getSportTree } from "@/api/sport/sport";
  import { formatDays } from "@/utils/datetime";
  import RefreshForm from './refresh.vue'
  import SportMilestoneForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const refreshRef = ref();

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
  const sportMilestoneList = ref([]);
  const sportOptions = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  //统计
  function handleStat() {
    //路由定向
    proxy.$router.push({ name: 'SportMilestoneStat', query: { } })
  }

  //刷新
  function handleRefresh() {
    refreshRef.value.openRefresh();
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    sportMilestoneList.value = [];
    fetchList(queryParams.value).then(
      response => {
        sportMilestoneList.value = response.rows;
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
    const id = row.milestoneId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.milestoneId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteSportMilestone(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.milestoneId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getSportTree().then(
      response => {
        sportOptions.value = response;
      }
    );
  })
</script>
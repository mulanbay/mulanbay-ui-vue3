<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="选择预算" prop="budgetKey">
        <el-tree-select
          v-model="queryParams.budgetKey"
          style="width: 240px"
          clearable
          :data="budgetOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择预算"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="创建日期" style="width: 308px">
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['fund:budgetLog:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['fund:budgetLog:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['fund:budgetLog:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:budgetLog:delete']">删除
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="budgetLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="ID" sortable="custom" align="center" width="80" fixed="left">
        <template #default="scope">
          <span>{{ scope.row.logId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="140px" fixed="left">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ formartName(scope.row) }}</span>
          <span v-if="scope.row.budget == null">
            <span v-if="scope.row.statPeriod == 'YEARLY'">
              <el-tag type="danger" >{{ scope.row.statPeriodName }}</el-tag>
            </span>
           <span v-else>
             <el-tag type="success">{{ scope.row.statPeriodName }}</el-tag>
           </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="业务日期" align="center" width="100" fixed="left">
        <template #default="scope">
          <span class="link-type" @click="handleBudgetSnapshot(scope.row)">{{ scope.row.bussKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源" width="60px"  align="center">
        <template #default="scope">
          <span v-if=" 'MANUAL' == scope.row.source">
           <el-tag>{{ scope.row.sourceName }}</el-tag>
          </span>
          <span v-else-if=" 'AUTO' == scope.row.source">
           <el-tag type="success">{{ scope.row.sourceName }}</el-tag>
          </span>
          <span v-else-if=" 'REAL_TIME' == scope.row.source">
           <el-tag type="danger">{{ scope.row.sourceName }}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" width="160">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.budgetAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际消费" align="center" width="160">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalAmount) }}</span>
          <span v-if="(scope.row.totalAmount)>scope.row.budgetAmount">
           <el-tag type="danger">超支</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="预算/实际" align="center" width="100">
        <template #default="scope">
          <span>{{ (scope.row.totalAmount/scope.row.budgetAmount*100).toFixed(0)+'%' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收入统计" align="center"  width="160">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.incomeAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户变化" align="center" fixed="right" width="80">
        <template #default="scope">
          <span v-if="scope.row.accountChangeAmount == null&&scope.row.budget == null">
           <span class="link-type" @click="handleAccountChange(scope.row.bussKey)"><el-icon><EditPen /></el-icon></span>
          </span>
          <span v-else>{{ formatMoney(scope.row.accountChangeAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重新统计" width="80" fixed="right" align="center">
        <template #default="scope">
          <span v-if="scope.row.budget == null">
           <span class="link-type" @click="handleReStat(scope.row.logId)">
             <el-icon><Promotion /></el-icon>
           </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['fund:budgetLog:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:budget:delete']">删除
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
    <BudgetLogForm ref="formRef" @success="getList" />

    <!-- 快照详情 -->
    <BudgetSnapshotDetail ref="snapshotDetailRef" />

  </div>
</template>

<script setup name="BudgetLog">
  import { fetchList, deleteBudgetLog,reSaveBudgetLog } from "@/api/fund/budgetLog";
  import {getBudgetTree} from "@/api/fund/budget";
  import {updateBudgetLogAccountChange} from "@/api/fund/account";
  import { getPercent, progressColors } from "@/utils/mulanbay";
  import { getQueryObject } from "@/utils/index";
  import BudgetLogForm from './form.vue'
  import BudgetSnapshotDetail from '../budgetSnapshot/detail.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const snapshotDetailRef = ref();

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
  const budgetLogList = ref([]);
  const budgetOptions = ref([]);
  
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

  /** 统计 */
  function handleStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetStat', query: {} })
  }
  
  /** 账户变化统计 */
  function handleAccountChange(bussKey){
    proxy.$confirm('是否要统计该条记录的账户变化值?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return updateBudgetLogAccountChange(bussKey);
      }).then(() => {
        getList();
        proxy.$modal.msgSuccess("统计成功");
      }).catch(function() {});
  }
  
  /** 重新统计 */
  function handleReStat(logId){
    proxy.$confirm('是否要重新统计该条记录?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return reSaveBudgetLog(logId);
      }).then(() => {
        getList();
        proxy.$modal.msgSuccess("统计成功");
      }).catch(function() {});
  }
  
  /** 预算快照 */
  function handleBudgetSnapshot(row){
    snapshotDetailRef.value.showData(row.logId);
  }

  //新增预算流水
  function handleAddLog(budgetId) {
    this.createBudgetLogVisible = true;
    this.budgetData = Object.assign({}, this.budgetData, {
      budgetId: id
    });
  }

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
  
  /** 名称 */
  function formartName(row){
    return proxy.isEmpty(row.budget) ? '预算合计' : row.budget.budgetName;
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    budgetLogList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        budgetLogList.value = response.rows;
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
    formRef.value.openForm(null, 'create',null);
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.logId || ids.value.join(",");
    formRef.value.openForm(id, 'edit',null);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.logId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBudgetLog(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.logId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getBudgetTree(false,false).then(response => {
      budgetOptions.value = response;
    });
  })
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="类型"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsTypeId">
        <el-tree-select
          v-model="queryParams.goodsTypeId"
          style="width: 240px"
          :data="goodsTypeOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="选择商品类型"
          check-strictly
          clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['fund:budget:list']">搜索</el-button>
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
          v-hasPermi="['fund:budget:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['fund:budget:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:budget:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleStat"
          v-hasPermi="['fund:budget:stat']">统计
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleTimelineStat"
          v-hasPermi="['fund:budget:timelineStat']">进度统计
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleBudgetLogStat"
          v-hasPermi="['fund:budgetLog:stat']">执行统计
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleBudgetAnalyse"
          v-hasPermi="['fund:budget:analyse']">预算分析
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleBudgetLogValueErrorStat"
          v-hasPermi="['fund:budgetLog:valueErrorStat']">误差统计
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Histogram"
          @click="handleBudgetPeriodStat"
          v-hasPermi="['fund:budgetLog:periodStat']">预算日志
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="budgetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" fixed="left" prop="budgetId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.budgetId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算名称" fixed="left" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.goodsTypeId != null">
            <el-icon color="red">
              <Handbag />
            </el-icon>
          </span>
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.budgetName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="新增流水" width="80" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleAddLog(scope.row.budgetId)" v-if="scope.row.period=='ONCE'">
            <el-icon>
              <CirclePlus />
            </el-icon>
          </span>
          <span v-else-if="scope.row.goodsTypeId!=null">自动</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="周期类型" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付时间" :show-overflow-tooltip="true" align="center" width="150">
        <template #default="scope">
          <span>{{ formatCurrentPaidTime(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付金额" :show-overflow-tooltip="true" align="center" width="150">
        <template #default="scope">
          <span>{{ formatCurrentPaidAmount(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.cpPaidAmount!=null">
            {{formatPercent(scope.row)}}%
          </span>
        </template>
      </el-table-column>
      <el-table-column label="历史" align="center">
        <template #default="scope">
          <span class="link-type" @click="showHistory(scope.row)" v-hasPermi="['fund:budgetSnapshot:history']">
            <el-icon>
              <Compass />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.tags != null">
            <el-tag type="success">{{ scope.row.tags}}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="首次支付时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.firstPaidTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上一次支付时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.lastPaidTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.remind" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['fund:budget:edit']">修改
          </el-button>
          <el-button
            link
            type="primary"
            icon="EditPen"
            @click="handleChange(scope.row)"
            v-hasPermi="['fund:Budget:change']">变更
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
    <BudgetForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="Budget">
  import { fetchList, deleteBudget } from "@/api/fund/budget";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";
  import { getPercent, progressColors } from "@/utils/mulanbay";
  import { getQueryObject } from "@/utils/index";
  import BudgetForm from './form.vue'

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
  const budgetList = ref([]);
  const statusOptions = ref(proxy.commonStatusOptions);
  const typeOptions = ref([]);
  const periodOptions = ref([]);
  const goodsTypeOptions = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      name: undefined,
      status: undefined,
    }
  });

  const { queryParams } = toRefs(data);

  /** 统计 */
  function handleStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetStat', query: {} })
  }

  //时间线统计
  function handleTimelineStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetTimelineStat', query: {} })
  }

  //预算执行统计
  function handleBudgetLogStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetLogStat', query: {} })
  }

  //误差统计
  function handleBudgetLogValueErrorStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetLogValueErrorStat', query: {} })
  }

  //预算日志
  function handleBudgetPeriodStat() {
    //路由定向
    proxy.$router.push({ name: 'BudgetLogPeriodStat', query: {} })
  }

  //预算分析
  function handleBudgetAnalyse() {
    proxy.budgetAnalyseDetailVisible = true;
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

  /** 查询列表 */
  function getList() {
    loading.value = true;
    budgetList.value = [];
    fetchList(queryParams.value).then(
      response => {
        budgetList.value = response.rows;
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
    const id = row.budgetId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.budgetId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteBudget(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.budgetId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 本期支付时间 */
  function formatCurrentPaidTime(row) {
    if (row.cpPaidTime) {
      return row.cpPaidTime.substr(5, 5) + '(已支付)';
    } else {
      if (row.nextPaytime) {
        let cpt = row.nextPaytime.substr(5, 5);
        if (row.leftDays == 0) {
          return cpt + '(今天)';
        } else if (row.leftDays < 0) {
          var ld = 0 - row.leftDays;
          return cpt + '(已过去' + ld + '天)';
        } else {
          var ld = row.leftDays;
          return cpt + '(' + ld + '天后)';
        }
      } else {
        return '--';
      }
    }
  }

  /** 本期支付金额 */
  function formatCurrentPaidAmount(row) {
    if (row.cpPaidAmount) {
      var ca = (row.cpPaidAmount - row.amount).toFixed(2);
      if (ca > 0) {
        return proxy.formatMoney(row.cpPaidAmount) + '(+' + ca + ')';
      } else if (ca < 0) {
        return proxy.formatMoney(row.cpPaidAmount) + '(-' + (0 - ca) + ')';
      } else {
        return proxy.formatMoney(row.cpPaidAmount);
      }
    } else {
      return '--';
    }
  }

  /** 进度 */
  function formatPercent(row) {
    let pp = getPercent(row.cpPaidAmount, row.amount);
    return parseInt(pp.toFixed(0));
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('BudgetType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
    //预算周期采用数据字典配置，有些周期类型不好实现
    proxy.getDictItemTree('BUDGET_PERIOD_TYPE', false).then(response => {
      periodOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
  })
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="收入日期" style="width: 308px">
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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="关联账户" prop="accountId">
        <el-tree-select
          v-model="queryParams.accountId"
          style="width: 240px"
          clearable
          :data="accountOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="请选择账户"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="收入类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="收入状态" prop="status">
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['fund:income:list']">搜索</el-button>
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
          v-hasPermi="['fund:income:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['fund:income:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:income:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleStat"
          v-hasPermi="['fund:income:stat']">收入分析
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="incomeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" fixed="left" prop="incomeId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.incomeId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="210px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.incomeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center" width="160">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="110">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
          <span v-if="scope.row.type == 'SECONDHAND_SOLD'">
            <span class="link-type" @click="handleConsumeInfo(scope.row)"><el-icon>
                <GoodsFilled />
              </el-icon></span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="发生时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.occurTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联账户" align="center" width="95" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ isEmpty(scope.row.account) ? '--':scope.row.account.accountName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" disabled active-value="ENABLE" inactive-value="DISABLE"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['fund:income:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:income:delete']">删除
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
    <IncomeForm ref="formRef" @success="getList" />

    <!-- 消费详情表单 -->
    <ConsumeForm ref="consumeFormRef" />

  </div>
</template>

<script setup name="Income">
  import { fetchList, deleteIncome, getConsumeRefer } from "@/api/fund/income";
  import { getAccountTree } from "@/api/fund/account";
  import IncomeForm from './form.vue'
  import ConsumeForm from '../../consume/consume/form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const consumeFormRef = ref();

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
  const incomeList = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);
  const accountOptions = ref([]);
  const typeOptions = ref([]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

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

  /** 统计 */
  function handleStat() {
    //路由定向
    proxy.$router.push({ name: 'IncomeStat', query: {} })
  }

  /** 消费详情 */
  function handleConsumeInfo(row) {
    getConsumeRefer(row.incomeId).then(
      response => {
        if (response == null) {
          proxy.$modal.msgError("未找到相关消费信息");
          return;
        }
        //查找消费信息
        consumeFormRef.value.openForm(response.consumeId, 'view');
      }
    );

  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    incomeList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        incomeList.value = response.rows;
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
    const id = row.incomeId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.incomeId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteIncome(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.incomeId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getAccountTree().then(
      response => {
        accountOptions.value = response;
      }
    );
    proxy.getEnumDict('IncomeType', 'FIELD', false).then(response => {
      typeOptions.value = response;
    });
  })
</script>
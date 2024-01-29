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
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="状态"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['fund:account:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['fund:account:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['fund:account:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['fund:account:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleStat"
          v-hasPermi="['fund:account:stat']">账户统计
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" fixed="left" prop="accountId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.accountId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账户名称" fixed="left" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.accountName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="余额" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="卡号" align="center">
        <template #default="scope">
          <span>{{ scope.row.cardNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产状态" align="center" width="95">
        <template #default="scope">
          <span>{{ scope.row.statusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="210" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['fund:account:edit']">修改
          </el-button>
          <el-button
            link
            type="primary"
            icon="EditPen"
            @click="handleChange(scope.row)"
            v-hasPermi="['fund:account:change']">变更
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['fund:account:delete']">删除
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
    <AccountForm ref="formRef" @success="getList" />

    <!-- 修改账户余额表单 -->
    <AccountChangeForm ref="changeFormRef" @success="getList" />

  </div>
</template>

<script setup name="Account">
  import { fetchList, deleteAccount } from "@/api/fund/account";
  import AccountForm from './form.vue'
  import AccountChangeForm from './change.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const changeFormRef = ref();

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
  const accountList = ref([]);
  const statusOptions = ref([]);

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
    proxy.$router.push({ name: 'AccountStat', query: {} })
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    accountList.value = [];
    fetchList(queryParams.value).then(
      response => {
        accountList.value = response.rows;
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

  /** 修改账户余额按钮操作 */
  function handleChange(row) {
    changeFormRef.value.openForm(row.accountId);
  }

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.accountId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.accountId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteAccount(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.accountId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('AccountStatus', 'FIELD', false).then(response => {
      statusOptions.value = response;
    });
  })
</script>
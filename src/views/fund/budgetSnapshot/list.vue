<template>
  <div class="app-container">
    <!-- 表单编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="870px" append-to-body >
      <el-table :data="budgetSnapshotList" v-loading="loading">
        <el-table-column label="ID" prop="snapshotId" align="center">
          <template #default="scope">
            <span>{{ scope.row.snapshotId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="value" align="center" min-width="160px" :show-overflow-tooltip="true" >
          <template #default="scope">
            <span>{{ scope.row.budgetName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="预算金额" prop="value" align="center" width="150px">
          <template #default="scope">
            <span>{{ formatMoney(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="value" align="center">
          <template #default="scope">
            <span>{{ scope.row.typeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="周期类型" prop="value" align="center">
          <template #default="scope">
            <span>{{ scope.row.periodName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付金额" prop="value" align="center">
          <template #default="scope">
            <span v-if="scope.row.cpPaidAmount>scope.row.amount" style="color: red;">
              {{ formatMoney(scope.row.cpPaidAmount) }}
            </span>
            <span v-else>
              {{ formatMoney(scope.row.cpPaidAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" prop="value" align="center" width="180px" >
          <template #default="scope">
            <span>{{ scope.row.cpPaidTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="value" align="center" width="180px" >
          <template #default="scope">
            <span>{{ scope.row.createdTime }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="BudgetSnapshotList">
  import { fetchList } from "@/api/fund/budgetSnapshot";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('预算快照');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const budgetSnapshotList = ref([]);

  const data = reactive({
    queryParams: {
      page: 0,
      needTotal: false,
      budgetLogId: undefined
    }
  });

  const { queryParams } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (budgetLogId) => {
    open.value = true;
    queryParams.value.budgetLogId = budgetLogId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {

  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }

  /** 获取数据 **/
  function getList() {
    loading.value=true;
    budgetSnapshotList.value=[];
    fetchList(queryParams.value).then(
      response => {
        loading.value=false;
        budgetSnapshotList.value = response.rows;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
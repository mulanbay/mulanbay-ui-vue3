<template>
  <div class="app-container">
    <!-- 表单编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="950px" append-to-body class="customDialogCss">
      <el-descriptions class="margin-top" :column="3" border v-loading="infoLoading">
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              业务KEY
            </div>
          </template>
          {{ budgetLog.bussKey}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              业务日期
            </div>
          </template>
          {{ budgetLog.bussDay}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              预算/实际
            </div>
          </template>
          {{ (budgetLog.totalAmount/budgetLog.budgetAmount*100).toFixed(0)+'%' }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><GoodsFilled /></el-icon>
              普通消费
            </div>
          </template>
          {{ formatMoney(budgetLog.ncAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><GoodsFilled /></el-icon>
              突发消费
            </div>
          </template>
          {{ formatMoney(budgetLog.bcAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><GoodsFilled /></el-icon>
              看病消费
            </div>
          </template>
          {{ formatMoney(budgetLog.trAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><GoodsFilled /></el-icon>
              总消费值
            </div>
          </template>
          {{ formatMoney(budgetLog.totalAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><StarFilled /></el-icon>
              预算金额
            </div>
          </template>
          {{ formatMoney(budgetLog.budgetAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Shop /></el-icon>
              收入金额
            </div>
          </template>
          {{ formatMoney(budgetLog.incomeAmount)}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              创建时间
            </div>
          </template>
          {{ budgetLog.createdTime}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              最后更新时间
            </div>
          </template>
          {{ budgetLog.modifyTime}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><InfoFilled /></el-icon>
              备注
            </div>
          </template>
          {{ budgetLog.remark}}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="center">
        <span class="table-title">
          <svg-icon icon-class="budget" />
          明细列表
        </span>
      </el-divider>
      
     <!-- 列表 -->
     <SnapshotList ref="snapshotListRef" />
     
    </el-dialog>
  </div>
</template>

<script setup name="BudgetSnapshotDetail">
  import { fetchList } from "@/api/fund/budgetSnapshot";
  import { getBudgetLog } from "@/api/fund/budgetLog";
  import SnapshotList from './list.vue'

  const { proxy } = getCurrentInstance();
  const snapshotListRef = ref();

  //可执行时间段
  const title = ref('预算快照');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const infoLoading = ref(false);

  const data = reactive({
    budgetLog: {},
    queryParams: {
      page: 0,
      needTotal: false,
      budgetLogId: undefined
    }
  });

  const { queryParams, budgetLog } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (budgetLogId) => {
    open.value = true;
    queryParams.value.budgetLogId = budgetLogId;
    getInfo();
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
  function getInfo() {
    infoLoading.value = true;
    budgetLog.value = {};
    getBudgetLog(queryParams.value.budgetLogId).then(
      response => {
        infoLoading.value = false;
        budgetLog.value = response;
      }
    );
  }


  /** 获取数据 **/
  function getList() {
    fetchList(queryParams.value).then(
      response => {
        snapshotListRef.value.showData(response.rows);
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<template>
  <div class="app-container">
    <el-table :data="budgetSnapshotList" stripe v-loading="loading">
      <el-table-column label="业务日期" prop="bussKey" sortable="custom" align="center" width="100" fixed="left">
        <template #default="scope">
          <span>{{ scope.row.bussKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="value" fixed="left" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.budgetName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" prop="value" align="center" width="150px">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际消费金额" prop="value" align="center" width="180px">
        <template #default="scope">
          <span v-if="scope.row.acAmount>scope.row.amount*scope.row.factor" style="color: red;">
            {{ formatMoney(scope.row.acAmount) }}
          </span>
          <span v-else>
            {{ formatMoney(scope.row.acAmount) }}
          </span>
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
      <el-table-column label="统计系数" prop="value" align="center">
        <template #default="scope">
          <span>{{ scope.row.factor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算占比" prop="value" align="center">
        <template #default="scope">
          <span v-if="scope.row.rate!=null">{{ (scope.row.rate*100).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="收入占比" prop="value" align="center">
        <template #default="scope">
          <span v-if="scope.row.icRate!=null">{{ (scope.row.icRate*100).toFixed(0) }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" prop="value" align="center" width="180px">
        <template #default="scope">
          <span>{{ scope.row.lastPaidTime }}</span>
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
      <el-table-column label="创建时间" prop="value" align="center" width="180px">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="refresh"
            @click="handleRestat(scope.row)">重新统计
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup name="BudgetSnapshotList">
  import { reSaveBudgetLog } from "@/api/fund/budgetLog";
  const { proxy } = getCurrentInstance();

  const loading = ref(false);
  const budgetSnapshotList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (dataList) => {
    budgetSnapshotList.value = dataList;
  }

  /** 历史记录统计 */
  function showHistory(row) {
    //路由定向
    proxy.$router.push({ name: 'BudgetSnapshotHistory', query: { budgetId: row.budgetId } })
  }
  
  /** 重新统计 */
  function handleRestat(row){
    let logId = row.budgetLogId;
    proxy.$confirm('是否要重新统计该条记录?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return reSaveBudgetLog(logId);
      }).then(() => {
        //getList();
        proxy.$modal.msgSuccess("统计成功");
      }).catch(function() {});
  }
  
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 初始化 **/
  onMounted(() => {

  })
</script>
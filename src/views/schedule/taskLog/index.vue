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
      <el-form-item label="选择调度器" prop="triggerId">
        <el-tree-select
          v-model="queryParams.triggerId"
          style="width: 240px"
          clearable
          :data="taskTriggerOptions"
          :props="{ value: 'id', label: 'text', children: 'children' }"
          value-key="id"
          placeholder="请选择调度器"
          :check-strictly="false" />
      </el-form-item>
      <el-form-item label="执行结果" prop="executeResult">
        <el-select
          v-model="queryParams.executeResult"
          placeholder="执行结果"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in executeResultOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['schedule:taskLog:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <!--列表数据-->
    <el-table v-loading="loading" :data="taskLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.logId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度名称" fixed="left" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.redoTimes>0">
            <el-tag type="danger" size="small">重做</el-tag>
          </span>
          <span class="link-type" @click="showTaskTrigger(scope.row)">
            {{ scope.row.taskTrigger.triggerName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="业务日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.bussDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行结果" align="center">
        <template #default="scope">
          <span v-if="scope.row.executeResult==null || scope.row.lastExecuteResult==''">
            --
          </span>
          <span v-else-if="scope.row.executeResult=='SUCCESS'">
            <span class="link-type" @click="showLogInfo(scope.row)">
              <el-icon color="green">
                <SuccessFilled />
              </el-icon>
            </span>
          </span>
          <span v-else-if="scope.row.executeResult=='FAIL'">
            <span class="link-type" @click="showLogInfo(scope.row)">
              <el-icon color="red">
                <CircleCloseFilled />
              </el-icon>
            </span>
          </span>
          <span v-else>
            <span class="link-type" @click="showLogInfo(scope.row)">
              {{ scope.row.executeResultName }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="时间统计" placement="top">
            <span class="link-type" @click="handleCostTimeStat(scope.row)"><el-icon>
                <Histogram />
              </el-icon>
            </span>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
          <el-tooltip class="box-item" effect="dark" content="执行统计" placement="top">
            <span class="link-type" @click="handleExeStat(scope.row)"><el-icon>
                <Compass />
              </el-icon>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="花费时间" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.costTime>=1000" style="color:red ;">
            {{ (scope.row.costTime/1000).toFixed(1) +'秒' }}
          </span>
          <span v-else>
            {{ scope.row.costTime+'毫秒'  }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="运行开始时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运行结束时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调度执行ID" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.scheduleIdentityId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器节点" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.deployId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器IP" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.ipAddress }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重做次数" align="center">
        <template #default="scope">
          <span>{{ scope.row.redoTimes }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次重做开始时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.lastStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次重做结束时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.lastEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="Refresh"
            @click="handleRedo(scope.row)"
            v-hasPermi="['schedule:taskLog:redo']">重做</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 调度日志信息 -->
    <LogInfoForm ref="logInfoFormRef" />
    
    <!-- 表单弹窗：添加/修改 -->
    <TaskTriggerForm ref="formRef" @success="getList" />
    
  </div>
</template>

<script setup name="TaskLog">
  import { fetchList, redoTaskLog } from "@/api/schedule/taskLog";
  import { getTaskTriggerTree } from "@/api/schedule/taskTrigger";
  import LogInfoForm from './lastInfo.vue'
  import TaskTriggerForm from '../taskTrigger/form.vue'

  const { proxy } = getCurrentInstance();
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
  const taskLogList = ref([]);
  const executeResultOptions = ref([]);
  const taskTriggerOptions = ref([]);

  const logInfoFormRef = ref();
  const formRef = ref();
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  const data = reactive({
    form: {},
    queryParams: {
      page: 1,
      pageSize: 10
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 查询列表 */
  function getList() {
    loading.value = true;
    taskLogList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        taskLogList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    taskLogList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    taskLogList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  /** 日志信息按钮操作 */
  function showLogInfo(row) {
    logInfoFormRef.value.openLastInfo(null, row.logId);
  }
  
  /** 调度器操作 */
  function showTaskTrigger(row){
    formRef.value.openForm(row.taskTrigger.triggerId, 'edit');
  }

  /** 调度执行时间分析 */
  function handleCostTimeStat(row) {
    //路由定向
    proxy.$router.push({ name: 'TaskLogCostTimeStat', query: { triggerId: row.taskTrigger.triggerId } })
  }

  /** 调度执行结果分析 */
  function handleExeStat(row) {
    //路由定向
    proxy.$router.push({ name: 'TaskLogExeStat', query: { triggerId: row.taskTrigger.triggerId } })
  }
  
  /** 重做按钮操作 */
  function handleRedo(row) {
    const logId = row.logId;
    proxy.$confirm('是否确认重做编号为"' + logId + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return redoTaskLog(logId);
    }).then(() => {
      proxy.$modal.msgSuccess("重做成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.serverId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getTaskTriggerTree(false).then(response => {
      taskTriggerOptions.value = response;
    });
    proxy.getEnumDict('cn.mulanbay.schedule.enums.JobResult', 'FIELD', false).then(response => {
      executeResultOptions.value = response;
    });
  })
</script>
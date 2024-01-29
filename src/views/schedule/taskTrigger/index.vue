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
      <el-form-item label="调度类型" prop="triggerType">
        <el-select
          v-model="queryParams.triggerType"
          placeholder="调度类型"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in triggerTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="调度状态" prop="triggerStatus">
        <el-select
          v-model="queryParams.triggerStatus"
          placeholder="状态"
          clearable
          style="width: 120px">
          <el-option
            v-for="dict in commonStatusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['schedule:taskTrigger:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['schedule:taskTrigger:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          :disabled="single"
          @click="handleCopy"
          v-hasPermi="['schedule:taskTrigger:create']">复制
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['schedule:taskTrigger:edit']">修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['schedule:taskTrigger:delete']">删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="pointer"
          @click="handleManualStart"
          v-hasPermi="['schedule:taskTrigger:manualStart']">手动执行
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Refresh"
          @click="handleRefreshSchedule"
          v-hasPermi="['schedule:taskTrigger:refreshSchedule']">刷新调度
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="InfoFilled"
          @click="handleScheduleInfo"
          v-hasPermi="['schedule:taskTrigger:scheduleInfo']">调度信息
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="Clock"
          @click="handleRecentSchedules"
          v-hasPermi="['schedule:taskTrigger:recentSchedules']">24H调度
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="taskTriggerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="log" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.triggerId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.triggerStatus=='DISABLE'">
            <el-icon>
              <WarnTriangleFilled />
            </el-icon>
          </span>
          <span v-if="scope.row.executing==true" class="link-type" @click="handleUpdate(scope.row)" style="color:red ;">
            <i class="el-icon-loading"></i> {{ scope.row.triggerName+'[执行中]' }}
          </span>
          <span v-else class="link-type" @click="handleEdit(scope.row)">
            {{ scope.row.triggerName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center" width="80">
        <template #default="scope">
          <span class="link-type" @click="showScheduleDetail(scope.row)">
            <el-icon>
              <InfoFilled />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="调度周期" align="center" width="160">
        <template #default="scope">
          <span v-if="scope.row.triggerIntervel==1">
            {{ '每'+scope.row.triggerTypeName+"一次" }}
          </span>
          <span v-else>
            每
            <el-tag type="danger">{{ scope.row.triggerInterval+scope.row.triggerTypeName }}</el-tag>
            一次
          </span>
        </template>
      </el-table-column>
      <el-table-column label="距离下一次执行还有" align="center" min-width="160px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.tillNextExecuteTime<=60" style="color:red ;">
            {{ tillNowString(scope.row.tillNextExecuteTime) }}
          </span>
          <span v-else-if="scope.row.tillNextExecuteTime<=3600" style="color:#9acd32 ;">
            {{ tillNowString(scope.row.tillNextExecuteTime) }}
          </span>
          <span v-else-if="scope.row.tillNextExecuteTime<=3600*24" style="color:purple ;">
            {{ tillNowString(scope.row.tillNextExecuteTime) }}
          </span>
          <span v-else>
            {{ tillNowString(scope.row.tillNextExecuteTime) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="部署点" align="center">
        <template #default="scope">
          <span>{{ scope.row.deployId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="首次执行时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.firstExecuteTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下一次执行时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.nextExecuteTime==null ? scope.row.firstExecuteTime : scope.row.nextExecuteTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次执行结果" align="center" width="160">
        <template #default="scope">
          <span v-if="scope.row.lastExecuteResult==null || scope.row.lastExecuteResult==''">
            --
          </span>
          <span v-else-if="scope.row.lastExecuteResult=='SUCCESS'">
            <span class="link-type" @click="showLastTaskLog(scope.row)">
              <el-icon color="green">
                <SuccessFilled />
              </el-icon>
            </span>
          </span>
          <span v-else-if="scope.row.lastExecuteResult=='FAIL'">
            <span class="link-type" @click="showLastTaskLog(scope.row)">
              <el-icon color="red">
                <CircleCloseFilled />
              </el-icon>
            </span>
          </span>
          <span v-else>
            <span class="link-type" @click="showLastTaskLog(scope.row)">
              {{ scope.row.lastExecuteResultName }}
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次执行时间" align="center" min-width="200px">
        <template #default="scope">
          <span v-if="scope.row.lastExecuteTime==null">
            --
          </span>
          <span v-else>
            {{ scope.row.lastExecuteTime }}
            <span class="link-type" @click="handleExeCostTimeStat(scope.row)">
              <el-icon>
                <Histogram />
              </el-icon>
            </span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="调度状态" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.triggerStatus=='ENABLE'" style="color: green;">
            开启
          </span>
          <span v-else>
            关闭
          </span>
        </template>
      </el-table-column>
      <el-table-column label="日期偏移量" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.offsetDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总执行次数" align="center" width="120">
        <template #default="scope">
          <span>
            {{ scope.row.totalCount }}
          </span>
          <span @click="handleResetTrigger(scope.row)">
            <el-icon>
              <RefreshRight />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="总失败次数" align="center" width="100">
        <template #default="scope">
          <span>
            {{ scope.row.failCount }}
          </span>
          <span @click="handleResetTrigger(scope.row)">
            <el-icon>
              <RefreshRight />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="组名" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.groupName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" min-width="180px">
        <template #default="scope">
          <span v-if="scope.row.userId==0">
            用户调度
          </span>
          <span v-else>
            系统调度
          </span>
        </template>
      </el-table-column>
      <el-table-column label="支持分布式" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.distriable==true">
            <el-icon color="green">
              <Check />
            </el-icon>
          </span>
          <span v-else>
            <el-icon color="red">
              <Close />
            </el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="重做类型" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.redoTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="允许重做次数" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.allowedRedoTimes }}</span>
        </template>
      </el-table-column>
      <el-table-column label="超时时间(秒)" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.timeout }}</span>
        </template>
      </el-table-column>
      <el-table-column label="需要检查唯一" align="center" width="120">
        <template #default="scope">
          <el-switch v-model="scope.row.checkUnique" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="唯一性类型" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.uniqueTypeName==null ? '--' : scope.row.uniqueTypeName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="记录日志" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.loggable" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="需要提醒" align="center">
        <template #default="scope">
          <el-switch v-model="scope.row.notifiable" disabled></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="center" min-width="200px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.version }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-if="scope.row.triggerStatus=='DISABLE'"
            link
            type="success"
            icon="Open"
            @click="handleEditStatus(scope.row.triggerId,'ENABLE')"
            v-hasPermi="['schedule:taskTrigger:editStatus']">开启
          </el-button>
          <el-button v-if="scope.row.triggerStatus=='ENABLE'"
            link
            type="warning"
            icon="close"
            @click="handleEditStatus(scope.row.triggerId,'DISABLE')"
            v-hasPermi="['schedule:taskTrigger:editStatus']">关闭
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['schedule:taskTrigger:delete']">删除
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

    <!-- 表单弹窗：添加/修改 -->
    <TaskTriggerForm ref="formRef" @success="getList" />

    <!-- 手动执行 -->
    <ManualStartForm ref="manualStartFormRef" @success="getList" />

    <!-- 刷新调度 -->
    <RefreshScheduleForm ref="refreshScheduleFormRef" @success="getList" />

    <!-- 调度详情 -->
    <ScheduleDetailForm ref="scheduleDetailFormRef" @success="getList" />

    <!-- 调度信息 -->
    <ScheduleInfoForm ref="scheduleInfoFormRef" @success="getList" />

    <!-- 最近调度 -->
    <RecentScheduleForm ref="recentScheduleFormRef" @success="getList" />

    <!-- 最后一个调度日志 -->
    <LastTaskLogForm ref="lastTaskLogFormRef" @success="getList" />

    <!-- 重置 -->
    <ResetTriggerForm ref="resetTriggerFormRef" @success="getList" />

  </div>
</template>

<script setup name="TaskTrigger">
  import { fetchList, deleteTaskTrigger, editTaskTriggerStatus } from "@/api/schedule/taskTrigger";
  import { tillNowString } from "@/utils/datetime";
  import TaskTriggerForm from './form.vue'
  import ManualStartForm from './manualStart.vue'
  import RefreshScheduleForm from './refreshSchedule.vue'
  import ScheduleDetailForm from './scheduleDetail.vue'
  import ScheduleInfoForm from './scheduleInfo.vue'
  import RecentScheduleForm from './recentSchedule.vue'
  import LastTaskLogForm from '../taskLog/lastInfo.vue'
  import ResetTriggerForm from './resetTrigger.vue'

  const { proxy } = getCurrentInstance();
  /** 添加/修改操作 */
  const formRef = ref();
  //手动执行
  const manualStartFormRef = ref();
  //刷新调度
  const refreshScheduleFormRef = ref();
  //调度详情
  const scheduleDetailFormRef = ref();
  //调度信息
  const scheduleInfoFormRef = ref();
  //最近调度
  const recentScheduleFormRef = ref();
  //最后一个调度日志信息
  const lastTaskLogFormRef = ref();
  //重置
  const resetTriggerFormRef = ref();

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
  const taskTriggerList = ref([]);

  const triggerTypeOptions = ref([]);
  const commonStatusOptions = ref(proxy.commonStatusOptions);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  /** 获取当前选择的ID */
  function getSelectId() {
    let id = null;
    if (ids.value != null && ids.value.length > 0) {
      //取第一个
      id = ids.value[0];
    }
    return id;
  }

  /** 调度执行时间分析 */
  function handleExeCostTimeStat(row) {
    //路由定向
    proxy.$router.push({ name: 'TaskLogCostTimeStat', query: { triggerId: row.triggerId } })
  }

  /** 手动执行 */
  function handleManualStart() {
    manualStartFormRef.value.openManualStart(getSelectId());
  }

  /** 刷新调度 */
  function handleRefreshSchedule() {
    refreshScheduleFormRef.value.openRefreshSchedule(getSelectId());
  }

  /** 调度详情 */
  function showScheduleDetail(row) {
    scheduleDetailFormRef.value.openScheduleDetail(row.triggerId);
  }

  /** 最后一次调度日志信息 */
  function showLastTaskLog(row) {
    lastTaskLogFormRef.value.openLastInfo(row.triggerId, null);
  }

  /** 调度器信息 */
  function handleScheduleInfo() {
    scheduleInfoFormRef.value.openScheduleInfo();
  }

  /** 最近调度器信息 */
  function handleRecentSchedules() {
    recentScheduleFormRef.value.openRecentSchedule();
  }

  /** 重置 */
  function handleResetTrigger(row) {
    resetTriggerFormRef.value.openResetTrigger(row.triggerId);
  }

  /** 修改状态 */
  function handleEditStatus(triggerId, triggerStatus) {
    let para = {
      triggerId: triggerId,
      triggerStatus: triggerStatus
    }
    editTaskTriggerStatus(para).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      getList();
    });
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    taskTriggerList.value = [];
    fetchList(queryParams.value).then(
      response => {
        taskTriggerList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    taskTriggerList.value = [];
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    taskTriggerList.value = [];
    queryParams.value.page = 1;
    handleQuery();
  }

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.triggerId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 复制按钮操作 */
  function handleCopy(row) {
    const id = row.triggerId || ids.value.join(",");
    formRef.value.openForm(id, 'copy');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.triggerId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTaskTrigger(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.triggerId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('cn.mulanbay.schedule.enums.TriggerType', 'FIELD', false).then(response => {
      triggerTypeOptions.value = response;
    });
  })
</script>
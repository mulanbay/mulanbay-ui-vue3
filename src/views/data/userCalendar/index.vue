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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="唯一标识" prop="bussIdentityKey">
        <el-input
          v-model="queryParams.bussIdentityKey"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="日历来源" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          placeholder="类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in sourceTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="完成类型" prop="finishType">
        <el-select
          v-model="queryParams.finishType"
          placeholder="类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in finishTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="周期类型" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['data:userCalendar:list']">搜索</el-button>
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
          v-hasPermi="['data:userCalendar:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['data:userCalendar:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['data:userCalendar:delete']">删除</el-button>
      </el-col>
    </el-row>
    <!--列表数据-->
    <el-table v-loading="loading" :data="userCalendarList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="calendarId" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.calendarId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" fixed="left" min-width="200" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.finishType!=null">
           <span class="link-type" @click="handleEdit(scope.row)"><el-icon color="green"><Select /></el-icon>{{ scope.row.title }}</span>
          </span>
          <span v-else>
           <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.title }}</span>
          </span>    
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.sourceTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" align="center" width="60">
        <template #default="scope">
          <span class="link-type" @click="showCalendarDetail(scope.row)">
            <el-icon><InfoFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="周期" align="center" width="60">
        <template #default="scope">
          <span>{{ scope.row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成类型" align="center">
        <template #default="scope">
          <span v-if="scope.row.finishType=='AUTO'">
           <span style="color:green">{{ scope.row.finishTypeName }}</span>
          </span>
          <span v-else-if="scope.row.finishType=='MANUAL'">
           <span style="color:#00008b">{{ scope.row.finishTypeName }}</span>
          </span>
          <span v-else-if="scope.row.finishType=='EXPIRED'">
           <span style="color:#1e90ff">{{ scope.row.finishTypeName }}</span>
          </span>
          <span v-else-if="scope.row.period=='ONCE'">
           <span style="color:red">未完成</span>
          </span>
          <span v-else>
           --
          </span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center"  width="120">
        <template #default="scope">
          <span>{{ scope.row.bussDay.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center"  width="120">
        <template #default="scope">
          <span>{{ scope.row.expireTime.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="日历时间" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.allDay==true">
           全天
          </span>
          <span v-else>{{ scope.row.bussDay.substring(11,16) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="流水记录" align="center">
        <template #default="scope">
          <span v-if="scope.row.templateId!=null">
           <span class="link-type" @click="handleFlowLog(scope.row)">
             <el-icon><Grid /></el-icon>
           </span>
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="延迟次数" align="center">
        <template #default="scope">
          <span v-if="scope.row.delays>=10">
           <span style="color:red">{{ scope.row.delays }}</span>
          </span>
          <span v-else-if="scope.row.delays>=5">
           <span style="color:purple">{{ scope.row.delays }}</span>
          </span>
          <span v-else-if="scope.row.delays>=3">
           <span style="color:orangered">{{ scope.row.delays }}</span>
          </span>
          <span v-else>
           {{ scope.row.delays }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="只读" align="center" width="95">
        <template #default="scope">
          <span v-if="scope.row.readOnly==true">
           <el-icon color="green"><Select /></el-icon>
          </span>
          <span v-else>
            <el-icon><CircleCloseFilled /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.finishTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="唯一标识" align="center" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.bussIdentityKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center"  width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="Promotion"
            v-if="scope.row.finishTime!=null"
            @click="handleReOpen(scope.row)"
            v-hasPermi="['data:userCalendar:reOpen']">重开
          </el-button>
          <el-button
            link
            type="warning"
            icon="CircleCloseFilled"
            v-if="scope.row.finishTime==null"
            @click="handleFinish(scope.row)"
            v-hasPermi="['data:userCalendar:finish']">关闭
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['data:userCalendar:delete']">删除
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
    <UserCalendarForm ref="formRef" @success="getList" />

    <!-- 流水日志 -->
    <FlowLogList ref="flowLogListRef" />
    
    <!-- 来源详情 -->
    <SourceDetail ref="sourceDetailRef" />
    
  </div>
</template>

<script setup name="UserCalendar">
  import { fetchList, deleteUserCalendar } from "@/api/data/userCalendar";
  import UserCalendarForm from './form.vue'
  import FlowLogList from './flowLogList.vue'
  import SourceDetail from './sourceDetail.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const flowLogListRef = ref();
  const sourceDetailRef = ref();

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
  const userCalendarList = ref([]);
  const sourceTypeOptions = ref([]);
  const finishTypeOptions = ref([]);
  const periodOptions = ref([]);
  
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
  
  /** 消息来源详情 */
  function showCalendarDetail(row){
    sourceDetailRef.value.showData(row.calendarId)
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    userCalendarList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        userCalendarList.value = response.rows;
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
  
  /** 重开按钮操作 */
  function handleReOpen() {
    const id = row.calendarId;
    formRef.value.openForm(id, 'edit');
  }
  
  /** 流水日志操作 */
  function handleFlowLog(row) {
    flowLogListRef.value.showData(row.calendarId,row.title);
  }
  
  /** 新增按钮操作 */
  function handleCreate(row) {
    formRef.value.openForm(null, 'create');
  }
  
  /** 关闭按钮操作 */
  function handleFinish(row) {
    const id = row.calendarId;
    formRef.value.openForm(id, 'edit');
  }

  /** 修改按钮操作 */
  function handleEdit(row) {
    const id = row.calendarId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.calendarId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteUserCalendar(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.calendarId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('UserCalendarSource', 'FIELD', false).then(response => {
      sourceTypeOptions.value = response;
    });
    proxy.getEnumDict('UserCalendarFinishType', 'FIELD', false).then(response => {
      finishTypeOptions.value = response;
    });
    proxy.getEnumDict('PeriodType', 'FIELD', false).then(response => {
      periodOptions.value = response;
    });
  })
</script>
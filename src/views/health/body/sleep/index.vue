<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="睡眠日期" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="睡眠时长低于" prop="maxMinutes">
        <el-input-number v-model="queryParams.maxMinutes" :style="{width: '150px'}" controls-position="right" :min="0" :controls="true" :precision="0"/>
        分钟
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:body:sleep:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          @click="handleCreate"
          v-hasPermi="['health:body:sleep:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:body:sleep:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:body:sleep:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="sleepList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="sleepId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.sleepId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠日" align="center" width="120">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.sleepDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡觉时间" align="center" width="160">
        <template #default="scope">
          <span>{{ formatSleepRange(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="睡眠总时长" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.duration<360" style="color: red;">
           {{ formatSleepTimes(scope.row.duration) }}
          </span>
          <span v-else-if="scope.row.duration<450" style="color: #9acd32;">
           {{ formatSleepTimes(scope.row.duration) }}
          </span>
          <span v-else>
           {{ formatSleepTimes(scope.row.duration) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="首次醒来时间" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.fwpTime!=null">
          {{ scope.row.fwpTime.substr(11,5) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="最后醒来时间" align="center" width="120">
        <template #default="scope">
          <span v-if="scope.row.lwpTime!=null">
          {{ scope.row.lwpTime.substr(11,5) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="醒来次数" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.wps==1" style="color: green;">
           {{ scope.row.wps }}
          </span>
          <span v-else-if="scope.row.wps<=3" style="color: rebeccapurple;">
           {{ scope.row.wps }}
          </span>
          <span v-else-if="scope.row.wps>3" style="color: red;">
           {{ scope.row.wps }}
          </span>
          <span v-else>
           {{ scope.row.wps }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="起床时长" align="center" width="120">
        <template #default="scope">
          {{ formatGetUpTimes(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="睡眠质量"  align="center" width="140">
        <template #default="scope">
          <el-rate v-model="scope.row.quality" disabled></el-rate>
        </template>
      </el-table-column>
      <el-table-column label="浅睡时长" align="center" width="120">
        <template #default="scope">
          <span>{{ formatSleepTimes(scope.row.lightSleep) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="深睡时长" align="center" width="120">
        <template #default="scope">
          <span>{{ formatSleepTimes(scope.row.deepSleep) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
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
            v-hasPermi="['health:body:sleep:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:body:sleep:delete']">删除
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
    <SleepForm ref="formRef" @success="getList" />

  </div>
</template>

<script setup name="Sleep">
  import { fetchList, deleteSleep} from "@/api/health/body/sleep";
  import SleepForm from './form.vue';
  import {tillNowString,minuteDiff,formatSeconds} from "@/utils/datetime";

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
  const sleepList = ref([]);

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
  
  /** 睡眠时间 */
  function formatSleepRange(row){
    let s = row.sleepTime.substr(11,5);
    if(row.getUpTime!=null){
      s+='~~'+row.getUpTime.substr(11,5);
    }
    return s;
  }
  
  /** 起床时长 */
  function formatGetUpTimes(row){
    if(row.getUpTime==null||row.lastWakeUpTime==null){
      return null;
    }
    let minutes = minuteDiff(row.lastWakeUpTime,row.getUpTime).toFixed(0);
    return formatSeconds(minutes*60);
  }
  
  /** 睡眠时长 */
  function formatSleepTimes(minutes){
    return formatSeconds(minutes*60);
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    sleepList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        sleepList.value = response.rows;
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
    const id = row.sleepId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.sleepId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteSleep(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.sleepId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
  })
  
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="梦想名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="梦想状态" prop="statuses">
        <el-select
          v-model="queryParams.statuses"
          placeholder="状态"
          multiple
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="梦想进度">
          <el-input-number v-model="queryParams.minRate" clearable :min="0" label="%" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.maxRate" clearable :min="0" label="%" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="起止日期">
        <el-select
          v-model="queryParams.dateQueryType"
          placeholder="日期类型"
          collapse-tags
          style="width: 140px"
        >
          <el-option
            v-for="dict in dateQueryTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          style="width: 240px"
          unlink-panels
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item  v-if="moreCdn==true"  label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="排序方式"
          collapse-tags
          style="width: 140px"
        >
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          collapse-tags
          style="width: 100px"
        >
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['dream:dream:list']">搜索</el-button>
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
          v-hasPermi="['dream:dream:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['dream:dream:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dream:dream:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dreamList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column label="ID" fixed="left" prop="dreamId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.dreamId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="280px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.dreamName }}</span>
          <span v-if="scope.row.planId != null">
           <el-tag type="success">计划</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <span :style="{'color':getStatusColor(scope.row)}">{{ scope.row.statusName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成进度" align="center" width="80">
        <template #default="scope">
          <span v-if="scope.row.rate!=null">
            <el-progress :percentage="scope.row.rate" :color="customColors"></el-progress>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="配置提醒" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.remind==true">
            <el-icon color="green"><CircleCheckFilled /></el-icon>
          </span>
          <span v-else>
            <el-icon color="red"><CircleCloseFilled /></el-icon>
          </span>
          <el-divider direction="vertical"></el-divider>
          <span class="link-type" @click="showRemind(scope.row)"><el-icon><Tools /></el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="期望实现日期" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.expectDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="剩余时间" align="center" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatLeftDays(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="困难等级" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.difficulty }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重要等级" align="center" width="100">
        <template #default="scope">
          <span>{{ scope.row.important }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计花费天数" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.expectDays }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最晚截止日期" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.deadline }}</span>
        </template>
      </el-table-column>
      <el-table-column label="延期次数" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" v-if="scope.row.delays>0" content="延期列表" placement="top">
            <span class="link-type" v-if="scope.row.delays>0" @click="handleDelayList(scope.row)">
              {{ scope.row.delays }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.finishDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划期望值" align="center" width="160">
        <template #default="scope">
          <span>{{ scope.row.planValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所需资金" align="center" width="160">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.cost) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['dream:dream:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['dream:dream:delete']">删除
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
    <DreamForm ref="formRef" @success="getList" />

    <!-- 延迟列表 -->
    <DelayList ref="delayListRef" />
    
    <!-- 提醒 -->
    <DreamRemindForm ref="dreamRemindFormRef" />
    
  </div>
</template>

<script setup name="Dream">
  import { fetchList, deleteDream } from "@/api/dream/dream";
  import {deepClone} from "@/utils/index";
  import {tillNowString,tillNowSeconds} from "@/utils/datetime";
  import DreamForm from './form.vue'
  import DelayList from './delayList.vue'
  import DreamRemindForm from '../dreamRemind/form.vue'
  import {progressColors2} from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const delayListRef = ref();
  const dreamRemindFormRef = ref();

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
  const dreamList = ref([]);
  
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref();
  
  const statusOptions = ref([]);
  const dateQueryTypeOptions = ref([]);
  const sortFieldOptions = ref([]);
  const sortTypeOptions = ref([]);

  //进度百分比颜色
  const customColors = ref(progressColors2);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      dateQueryType: 'expectDate',
      sortField:'createdTime',
      sortType:'desc'
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
  
  /** 状态的字段颜色 */
  function getStatusColor(row) {
    if(row.status=='CREATED'){
      return 'black';
    }else if(row.status=='STARTED'){
      return '#4169E1';
    }else if(row.status=='FINISHED'){
      return 'green';
    }else if(row.status=='PAUSED'){
      return '#C71585';
    }else if(row.status=='GIVEDUP'){
      return '#A9A9A9';
    }else{
      return 'black';
    }
  }
  
  /** 提醒 */
  function showRemind(row){
    dreamRemindFormRef.value.openForm(row.dreamId);
  }
  
  /** 剩余时间 */
  function formatLeftDays(row){
    if(row.status=='FINISHED'||row.status=='GIVEDUP'){
      return '--';
    }
    let ss = tillNowSeconds(null,row.expectDate);
    return tillNowString(ss);
  }
  
  /** 延期列表 */
  function handleDelayList(row){
    delayListRef.value.showData(row.dreamId,row.dreamName);
  }
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    dreamList.value = [];
    let qp = proxy.addDateRange(queryParams.value, dateRange.value);
    let acQueryParams = deepClone(qp);
    if(acQueryParams.statuses!=null){
      acQueryParams.statuses = acQueryParams.statuses.join(',');
    }
    fetchList(acQueryParams).then(
      response => {
        dreamList.value = response.rows;
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
    const id = row.dreamId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.dreamId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteDream(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.dreamId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('DreamStatus', 'ORDINAL', false).then(response => {
      statusOptions.value = response;
    });
    proxy.getDictItemTree('DREAM_DATE_QUERT_TYPE', false).then(response => {
      dateQueryTypeOptions.value = response;
    });
    proxy.getDictItemTree('DREAM_ORDER_BY_TYPE', false).then(response => {
      sortFieldOptions.value = response;
    });
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
  })
</script>
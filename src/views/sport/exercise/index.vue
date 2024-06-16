<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="运动类型" prop="sportId">
        <el-select
          v-model="queryParams.sportId"
          placeholder="运动"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sportOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="锻炼日期" style="width: 308px">
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

      <el-form-item v-show="moreCdn==true" label="筛选最佳" prop="containBest">
        <el-switch v-model="queryParams.containBest" @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="排序方式"
          collapse-tags
          style="width: 120px">
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          collapse-tags
          style="width: 120px">
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['sport:exercise:list']">搜索</el-button>
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
          v-hasPermi="['sport:exercise:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['sport:exercise:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sport:exercise:delete']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="plus"
          :disabled="single"
          @click="handleArchive"
          v-hasPermi="['life:archive:sync']">同步档案
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="Histogram"
          @click="handleMultiStat"
          v-hasPermi="['sport:exercise:multiStat']">数据统计
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="refresh"
          @click="handleRefreshMaxStat"
          v-hasPermi="['sport:exercise:refreshMaxStat']">刷新最佳
        </el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="exerciseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="exerciseId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.exerciseId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center" min-width="120px">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.sport.sportName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.exerciseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时辰" align="center" width="70">
        <template #default="scope">
          <span>{{ getHourDesc(scope.row.exerciseTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="锻炼信息" align="center">
        <el-table-column label="锻炼值" align="center" width="120">
          <template #default="scope">
            <span>{{ scope.row.value+scope.row.sport.unit }}</span>
            <span v-if="'CURRENT' ==scope.row.mileageBest">
              <el-tag type="success">当前最佳</el-tag>
            </span>
            <span v-if="'ONCE' ==scope.row.mileageBest">
              <el-tag type="success">历史最佳</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="锻炼时长(分钟)" align="center">
          <template #default="scope">
            <span v-if="scope.row.duration<60" style="color: red;">
              {{ scope.row.duration }}
            </span>
            <span v-else>{{ scope.row.duration }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="速度信息" align="center">
        <el-table-column label="平均速度(公里/小时)" align="center" width="90">
          <template #default="scope">
            <span>{{ scope.row.speed }}</span>
            <span v-if="'CURRENT' ==scope.row.fastBest">
              <el-tag type="success">当前最佳</el-tag>
            </span>
            <span v-if="'ONCE' ==scope.row.fastBest">
              <el-tag type="success">历史最佳</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最佳速度(公里/小时)" align="center" width="90">
          <template #default="scope">
            <span>{{ scope.row.maxSpeed }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均配速(分钟/公里)" align="center" width="90">
          <template #default="scope">
            <span>{{ scope.row.pace }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最佳配速(分钟/公里)" align="center" width="90">
          <template #default="scope">
            <span>{{ scope.row.maxPace }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="心率信息" align="center">
        <el-table-column label="最大心率" align="center">
          <template #default="scope">
            <span>{{ scope.row.maxHeartRate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均心率" align="center">
          <template #default="scope">
            <span>{{ scope.row.avgHeartRate }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="统计分析" align="center">
        <el-table-column label="里程碑" align="center">
          <template #default="scope">
            <span class="link-type" @click="handleAchieveMilestone(scope.row.exerciseId)">
              <el-icon><Histogram /></el-icon>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="身体近况" align="center">
          <template #default="scope">
            <span class="link-type" @click="showBodyAnalyse()">
              <el-icon><VideoCameraFilled /></el-icon>
            </span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['sport:exercise:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sport:exercise:delete']">删除
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
    <ExerciseForm ref="formRef" @success="getList" />

    <!-- 档案表单 -->
    <ArchiveForm ref="archiveFormRef" />

    <!-- 统计 -->
    <MultiStat ref="multiStatRef" />

    <!-- 刷新最佳 -->
    <RefreshMaxStat ref="refreshMaxStatRef" />

    <!-- 里程碑 -->
    <AchieveMilestoneList ref="achieveMilestoneRef" />
    
  </div>
</template>

<script setup name="Exercise">
  import { fetchList, deleteExercise, getExercise } from "@/api/sport/exercise";
  import { getSportTree } from "@/api/sport/sport";
  import { formatDays } from "@/utils/datetime";
  import { getHourDesc } from "@/utils/datetime";
  import ExerciseForm from './form.vue'
  import ArchiveForm from '../../life/archive/form.vue';
  import MultiStat from './multiStat.vue';
  import RefreshMaxStat from './refreshMaxStat.vue';
  import AchieveMilestoneList from '../sportMilestone/achieveList.vue';

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const archiveFormRef = ref();
  const multiStatRef = ref();
  const refreshMaxStatRef = ref();
  const achieveMilestoneRef = ref();

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
  const exerciseList = ref([]);
  const sportOptions = ref([]);
  const sortFieldOptions = ref([]);
  const sortTypeOptions = ref([]);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'EXERCISE_TIME',
      sortType: 'desc'
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

  /** 身体分析 */
  function showBodyAnalyse() {
    //路由定向
    proxy.$router.push({name:'BodyAbnormalAnalyse',query: {name:'心脏',groupField:'ORGAN'}})
  }
  

  /** 统计 */
  function handleMultiStat() {
    multiStatRef.value.openForm();
  }

  /** 刷新最佳 */
  function handleRefreshMaxStat() {
    refreshMaxStatRef.value.openForm();
  }
  
  /** 里程碑 */
  function handleAchieveMilestone(exerciseId) {
    achieveMilestoneRef.value.openForm(exerciseId);
  }

  /** 同步档案按钮操作 */
  function handleArchive() {
    const id = ids.value.join(",");
    getExercise(id).then(response => {
      let data = {
        archiveId: undefined,
        title: '锻炼信息',
        content: response.sport.sportName + ',' + response.value + response.sport.unit + ',时长:' + response.duration + '分钟',
        date: response.exerciseTime,
        bussType: 'EXERCISE',
        sourceId: response.exerciseId,
        remark: undefined
      };
      archiveFormRef.value.syncData(data);
    });
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    exerciseList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        exerciseList.value = response.rows;
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
    const id = row.exerciseId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.exerciseId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExercise(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.exerciseId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getSportTree().then(
      response => {
        sportOptions.value = response;
      }
    );
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
    proxy.getDictItemTree('EXERCISE_ORDER_FIELD', false).then(response => {
      sortFieldOptions.value = response;
    });
  })
</script>
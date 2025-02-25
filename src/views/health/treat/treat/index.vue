<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="看病日期" style="width: 308px">
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
      <el-form-item v-show="moreCdn==true" label="是否有病" prop="sick">
        <el-select
          v-model="queryParams.sick"
          placeholder="是否有病"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in booleanOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="疾病标签" prop="tags">
        <el-select
          v-model="queryParams.tags"
          placeholder="疾病标签"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in hisTagOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="看病类型" prop="treatType">
        <el-select
          v-model="queryParams.treatType"
          placeholder="看病类型"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in treatTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-show="moreCdn==true" label="门诊阶段" prop="stage">
        <el-select
          v-model="queryParams.stage"
          placeholder="门诊阶段"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in stageOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:treat:treat:list']">搜索</el-button>
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
          v-hasPermi="['health:treat:treat:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['health:treat:treat:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['health:treat:treat:delete']">删除</el-button>
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
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="treatList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="treatId" sortable="custom" align="center" width="70">
        <template #default="scope">
          <span>{{ scope.row.treatId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="80">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.treatTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="疾病症状" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" style="color:darkgreen" @click="showBodyAnalyse(scope.row.disease,'DISEASE')">{{ scope.row.disease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医院" min-width="160" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.hospital }}</span>
        </template>
      </el-table-column>
      <el-table-column label="阶段" width="80" align="center">
        <template #default="scope">
          <span v-if="scope.row.stage=='FIRST'">
            <el-tag type="success">首诊</el-tag>
          </span>
          <span v-if="scope.row.stage=='RETURN'">
            <el-tag type="danger">复诊</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="药品" width="60" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleDrugList(scope.row)"><el-icon>
              <Grid />
            </el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="手术" width="60" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleOperationList(scope.row)"><el-icon>
              <Grid />
            </el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="确诊疾病" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" style="color:darkgreen" @click="showBodyAnalyse(scope.row.confirmDisease,'DISEASE')">{{ scope.row.confirmDisease }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病日期" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.treatTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="科室" min-width="100" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.department }}</span>
        </template>
      </el-table-column>
      <el-table-column label="器官" width="100">
        <template #default="scope">
          <span class="link-type" style="color:darkgreen" @click="showBodyAnalyse(scope.row.organ,'ORGAN')">{{ scope.row.organ }}</span>
        </template>
      </el-table-column>
      <el-table-column label="病情" align="center" width="60">
        <template #default="scope">
          <span v-if="scope.row.sick==true" style="color: red;">
            <el-tag type="danger">病</el-tag>
          </span>
          <span v-else style="color: green;">
            <el-tag type="success">无</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="费用" align="center" width="120">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.totalFee) }}</span>
          <span class="link-type" @click="showFeeDetail(scope.row)"><el-icon>
              <Grid />
            </el-icon></span>
        </template>
      </el-table-column>
      <el-table-column label="门诊类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.os }}</span>
        </template>
      </el-table-column>
      <el-table-column label="医生" align="center">
        <template #default="scope">
          <span>{{ scope.row.doctor }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="CopyDocument"
            @click="handleCopy(scope.row)"
            v-hasPermi="['health:treat:treat:copy']">复制
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['health:treat:treat:delete']">删除
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
    <TreatForm ref="formRef" @success="getList" />

    <!-- 复制表单 -->
    <TreatCopyForm ref="copyFormRef" @success="getList" />

    <!-- 费用表单 -->
    <FeeForm ref="feeFormRef" @success="confirmFee" />

    <!-- 档案表单 -->
    <ArchiveForm ref="archiveFormRef" />

    <!-- 药品列表页面 -->
    <el-dialog :title="treatDrugTitle" width="900px" v-model="treatDrugOpen" append-to-body>
      <TreatDrug ref="treatDrugRef" />
    </el-dialog>
    
    <!-- 手术列表页面 -->
    <el-dialog :title="treatOperationTitle" width="900px" v-model="treatOperationOpen" append-to-body>
      <TreatOperation ref="treatOperationRef" />
    </el-dialog>
    

  </div>
</template>

<script setup name="Treat">
  import { fetchList, getTreatCateTree, deleteTreat, getTreat } from "@/api/health/treat/treat";
  import { formatDays, getHourDesc } from "@/utils/datetime";
  import TreatForm from './form.vue'
  import TreatCopyForm from './copyForm.vue'
  import FeeForm from './feeForm.vue'
  import ArchiveForm from '../../../life/archive/form.vue';
  import TreatDrug from '../treatDrug/index.vue';
  import TreatOperation from '../treatOperation/index.vue';

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const copyFormRef = ref();
  const feeFormRef = ref();
  const archiveFormRef = ref();

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
  const treatList = ref([]);
  const booleanOptions = ref(proxy.booleanOptions);
  const hisTagOptions = ref([]);
  const treatTypeOptions = ref([]);
  const stageOptions = ref([]);

  //药品列表
  const treatDrugTitle = ref('药品列表');
  const treatDrugOpen = ref(false);
  const treatDrugRef = ref();
  
  //手术列表
  const treatOperationTitle = ref('手术列表');
  const treatOperationOpen = ref(false);
  const treatOperationRef = ref();

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
      name: undefined
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

  /** 药品列表 */
  function handleDrugList(row) {
    treatDrugTitle.value = '[' + row.disease + ']药品列表';
    treatDrugOpen.value = true;
    proxy.$nextTick(()=>{
      treatDrugRef.value.showData(row.treatId,null);
    });
  }
  
  /** 手术列表 */
  function handleOperationList(row) {
    treatOperationTitle.value = '[' + row.disease + ']手术列表';
    treatOperationOpen.value = true;
    proxy.$nextTick(()=>{
      treatOperationRef.value.showData(row.treatId,null);
    });
  }

  /** 身体分析 */
  function showBodyAnalyse(name, groupField) {
    //路由定向
    proxy.$router.push({name:'BodyAbnormalAnalyse',query: {name:name,groupField:groupField}})
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
  function handleAchieveMilestone(TreatId) {
    achieveMilestoneRef.value.openForm(TreatId);
  }

  /** 费用信息 */
  function showFeeDetail(row) {
    feeFormRef.value.openForm(row, true);
  }

  /** 同步档案按钮操作 */
  function handleArchive() {
    const id = ids.value.join(",");
    getTreat(id).then(response => {
      let data = {
        archiveId: undefined,
        title: '看病信息',
        content: '生病:' + response.confirmDisease,
        date: response.treatTime,
        bussType: 'TREAT',
        sourceId: response.treatId,
        remark: undefined
      };
      archiveFormRef.value.syncData(data);
    });
  }

  /** 费用确认 */
  function confirmFee() {

  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    treatList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        treatList.value = response.rows;
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
    const id = row.treatId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 复制按钮操作 */
  function handleCopy(row) {
    copyFormRef.value.openForm(row);
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.treatId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteTreat(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.treatId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    getTreatCateTree('tags', false).then(
      response => {
        hisTagOptions.value = response;
      }
    );
    proxy.getEnumDict('TreatType', 'FIELD', false).then(response => {
      treatTypeOptions.value = response;
    });
    proxy.getEnumDict('TreatStage', 'FIELD', false).then(response => {
      stageOptions.value = response;
    });
  })
</script>
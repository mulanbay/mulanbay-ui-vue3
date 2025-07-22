<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="起止日期" style="width: 308px" v-show="moreCdn==true">
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
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="经历类型" prop="types" v-show="moreCdn==true">
        <el-select
          v-model="queryParams.types"
          placeholder="类型"
          clearable
          multiple
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in typesOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:experience:list']">搜索</el-button>
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
          v-hasPermi="['life:experience:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="edit"
          :disabled="single"
          @click="handleEdit"
          v-hasPermi="['life:experience:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['life:experience:delete']">删除</el-button>
      </el-col>
    </el-row>

    <!--列表数据-->
    <el-table v-loading="loading" :data="experienceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="expId" sortable="custom" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.expId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="250px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.expName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="位置" align="center" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ formatLocation(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" width="80" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="dark" content="旅行地图" placement="top">
            <span class="link-type" @click="handleTransferMapStat(scope.row)">
              <el-icon><Compass /></el-icon>
            </span>
          </el-tooltip>
          <el-divider direction="vertical"></el-divider>
					<el-tooltip class="box-item" effect="dark" content="行程明细" placement="top">
					  <span class="link-type" @click="handleDetailList(scope.row)">
					    <el-icon><Grid /></el-icon>
					  </span>
					</el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="60">
        <template #default="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" width="80" align="center">
        <template #default="scope">
					<el-tooltip class="box-item" effect="dark" content="花费统计" placement="top">
					  <span class="link-type" @click="handleCostStat(scope.row)">
							<el-icon><Money /></el-icon>
					  </span>
					</el-tooltip>
					<el-divider direction="vertical"></el-divider>
          <el-tooltip class="box-item" effect="dark" content="花费明细" placement="top">
            <span class="link-type" @click="handleConsumeList(scope.row)">
							<el-icon><Grid /></el-icon>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="锻炼" width="60" align="center">
        <template #default="scope">
          <span class="link-type" @click="handleExercise(scope.row)">
            <el-icon><Bicycle /></el-icon>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center" width="120">
        <template #default="scope">
          <span>{{ formatMoney(scope.row.cost) }}</span>
					<el-divider direction="vertical"></el-divider>
					<el-tooltip class="box-item" effect="dark" content="刷新消费统计" placement="top">
					  <span class="link-type" @click="handleRefreshCost(scope.row)">
							<el-icon><Refresh /></el-icon>
					  </span>
					</el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="天数" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.days }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.startDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="edit"
            @click="handleEdit(scope.row)"
            v-hasPermi="['life:experience:edit']">修改
          </el-button>
          <el-button
            link
            type="danger"
            icon="delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['life:experience:delete']">删除
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
    <ExperienceForm ref="formRef" @success="getList" />

    <!-- 明细列表 -->
    <ExperienceDetailList ref="experienceDetailListRef"/>
    
    <!-- 锻炼 -->
    <ExerciseList ref="exerciseListRef"/>
    
    <!-- 旅行地图 -->
    <TransferDetailMap ref="transferDetailMapRef"/>
    
    <!-- 花费统计 -->
    <CostStat ref="costStatRef"/>
		
    <!-- 消费列表 -->
    <ExperienceConsumeList ref="experienceConsumeListRef"/>
    
  </div>
</template>

<script setup name="Experience">
  import { fetchList, deleteExperience,refreshExperienceCost } from "@/api/life/experience";
  import {deepClone} from "@/utils/index";
  import ExperienceForm from './form.vue';
  import ExerciseList from './exercise.vue';
  import TransferDetailMap from './transferDetailMap.vue';
  import CostStat from './costStat.vue';
  import ExperienceDetailList from '../experienceDetail/index.vue';
  import { getHourDesc } from "@/utils/datetime";
  import ExperienceConsumeList from '../experienceConsume/index.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const experienceDetailListRef = ref();
  const transferDetailMapRef = ref();
  const costStatRef = ref();
  const exerciseListRef = ref();
  const experienceConsumeListRef = ref();
  
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
  const experienceList = ref([]);
  const typesOptions = ref([]);

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
  
  /** 花费统计 */
  function handleCostStat(row) {
    costStatRef.value.showData(row.expId,row.expName);
  }
	
	/** 消费明细列表操作 */
	function handleConsumeList(row){
	  experienceConsumeListRef.value.showData(row.expId,row.expName);
		
	}

  /** 地图统计 */
  function handleTransferMapStat(row) {
    transferDetailMapRef.value.showData(row.expId);
  }

  /** 明细列表 */
  function handleDetailList(row) {
    experienceDetailListRef.value.showData(row.expId);
  }
  
  /** 锻炼 */
  function handleExercise(row) {
    exerciseListRef.value.showData(row.expId);
  }
	
	/** 刷新消费统计 */
	function handleRefreshCost(row){
		let para ={
			expId: row.expId
		}
		refreshExperienceCost(para).then(
		  response => {
		    row.cost = response;
		  }
		);
	}
  
  /** 位置信息 */
  function formatLocation(row) {
    let name ='';
    if(row.province!=null){
      name+=row.province.provinceName+'-';
    }
    if(row.city!=null){
      name+=row.city.cityName+'-';
    }
    if(row.district!=null){
      name+=row.district.districtName;
    }
    return name;
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    experienceList.value = [];
    let qp = proxy.addDateRange(queryParams.value, dateRange.value);
    let acQueryParams = deepClone(qp);
    if(acQueryParams.types!=null){
      acQueryParams.types = acQueryParams.types.join(',');
    }
    fetchList(acQueryParams).then(
      response => {
        experienceList.value = response.rows;
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
    const id = row.expId || ids.value.join(",");
    formRef.value.openForm(id, 'edit');
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.expId || ids.value.join(",");
    proxy.$confirm('是否确认删除编号为"' + deleteIds + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteExperience(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.expId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    getList();
    proxy.getEnumDict('ExperienceType', 'ORDINAL', false).then(response => {
      typesOptions.value = response;
    });
  })
</script>
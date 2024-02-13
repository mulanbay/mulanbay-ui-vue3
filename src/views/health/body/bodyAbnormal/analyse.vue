<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item v-if="queryParams.tags !=null" label="疾病标签" prop="tags">
        <el-input v-model="queryParams.tags" style="width: 240px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="起止日期" style="width: 308px">
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
      <el-form-item label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分组"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormal:analyse']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="id" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称"  fixed="left" min-width="120px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.totalCount<3" style="color: green;">
           {{ scope.row.name }}
          </span>
          <span v-else-if="scope.row.totalCount<=5" style="color: purple;">
           {{ scope.row.name }}
          </span>
          <span v-else-if="scope.row.totalCount<=10" style="color: yellowgreen;">
           {{ scope.row.name }}
          </span>
          <span v-else style="color: red;">
           {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="统计" align="center">
        <el-table-column label="发生总次数" align="center" width="70">
          <template #default="scope">
            <span>{{ scope.row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="持续总天数" align="center" width="70">
          <template #default="scope">
            <span>{{ scope.row.totalDays }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="疾病时间" align="center">
        <el-table-column label="最早一次发生时间" align="center" width="110">
          <template #default="scope">
            <span>{{ scope.row.minOccurDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次发生时间" align="center" width="110">
          <template #default="scope">
            <span>{{ scope.row.maxOccurDate }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="最近一次看病信息" align="center">
        <el-table-column label="最近一次看病时间" align="center" width="180">
          <template #default="scope">
            <span v-if="scope.row.treatStat.maxTreatTime != null">
             <span style="color:purple">{{ scope.row.treatStat.maxTreatTime }}</span>
             <span class="link-type" @click="showTreat(scope.row.treatStat.maxTreat.treatId)"><el-icon><Promotion /></el-icon></span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="距离最近一次看病" align="center" min-width="140" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.maxDays<0">
             <span style="color:red">{{ scope.row.maxDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.maxDays>=180">
             <span style="color:red">{{ scope.row.maxDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.maxDays>=90">
             <span style="color:#c71585">{{ scope.row.maxDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.maxDays>=30">
             <span style="color:purple">{{ scope.row.maxDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.maxDays>=10">
             <span style="color:green">{{ scope.row.maxDaysStr }}</span>
            </span>
            <span v-else>{{ scope.row.maxDaysStr }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次看病确诊疾病" align="center" width="110">
          <template #default="scope">
            <span v-if="scope.row.treatStat.maxTreat!=null">
             <span>{{ scope.row.treatStat.maxTreat.confirmDisease }}</span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次看病是否有病" align="center"  width="110">
          <template #default="scope">
            <span v-if="scope.row.treatStat.maxTreat!=null">
              <span v-if="scope.row.treatStat.maxTreat.sick==true" style="color: red;">
                <el-tag type="danger">病</el-tag>
               </span>
               <span v-else style="color: green;">
                <el-tag type="success">无</el-tag>
              </span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="最早一次看病信息" align="center">
        <el-table-column label="最早一次看病时间" align="center" width="180">
          <template #default="scope">
            <span v-if="scope.row.treatStat.minTreatTime != null">
             <span style="color:purple">{{ scope.row.treatStat.minTreatTime }}</span>
             <span class="link-type" @click="showTreat(scope.row.treatStat.minTreat.treatId)"><el-icon><Promotion /></el-icon></span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="距离最早一次看病" align="center" min-width="140" :show-overflow-tooltip="true">
          <template #default="scope">
            <span v-if="scope.row.minDays<0">
             <span style="color:red">--</span>
            </span>
            <span v-else-if="scope.row.minDays>=180">
             <span style="color:red">{{ scope.row.minDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.minDays>=90">
             <span style="color:#c71585">{{ scope.row.minDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.minDays>=30">
             <span style="color:purple">{{ scope.row.minDaysStr }}</span>
            </span>
            <span v-else-if="scope.row.minDays>=10">
             <span style="color:green">{{ scope.row.minDaysStr }}</span>
            </span>
            <span v-else>{{ scope.row.minDays }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最早一次看病确诊疾病" align="center" width="110">
          <template #default="scope">
            <span v-if="scope.row.treatStat.minTreat!=null">
             <span>{{ scope.row.treatStat.minTreat.confirmDisease }}</span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="最早一次看病是否有病" align="center" width="110">
          <template #default="scope">
            <span v-if="scope.row.treatStat.minTreat!=null">
              <span v-if="scope.row.treatStat.minTreat.sick==true" style="color: red;">
               <el-tag type="danger">病</el-tag>
              </span>
              <span v-else style="color: green;">
               <el-tag type="success">无</el-tag>
              </span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="身体信息" align="center">
        <el-table-column label="平均体重(KG)" align="center">
          <template #default="scope">
            <span>{{ scope.row.avgWeight==null ? '--':scope.row.avgWeight.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均身高(cm)" align="center">
          <template #default="scope">
            <span>{{ scope.row.avgHeight==null ? '--':scope.row.avgHeight.toFixed(1) }}</span>
          </template>
        </el-table-column>
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
      
  </div>
</template>

<script setup name="BodyAbnormalAnalyse">
  import { getBodyAbnormalAnalyse} from "@/api/health/body/bodyAbnormal";
  import {dateDiff,formatDays} from "@/utils/datetime";
  import {getQueryObject} from "@/utils/index";
  import TreatForm from '../../treat/treat/form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref(true);

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
  const dataList = ref([]);
  const groupFieldOptions = ref([
    {
      id: 'ORGAN',
      text: '器官'
    },
    {
      id: 'DISEASE',
      text: '疾病症状'
    }
  ]);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const data = reactive({
    queryParams: {
      chartType:'PIE',
      groupField:"DISEASE"
    }
  });

  const { queryParams } = toRefs(data);
  
  /** 查询列表 */
  function getList() {
    loading.value = true;
    dataList.value = [];
    getBodyAbnormalAnalyse(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        dataList.value = response.rows;
        let n = dataList.value.length;
        for(let i=0;i<n;i++){
          let row = dataList.value[i];
          //先计算出days供下面的方法使用
          if(row.treatStat.maxTreatTime==null){
            row.maxDays=-1;
          }else{
            const maxDays = dateDiff(row.treatStat.maxTreatTime,row.maxOccurDate);
            const maxDaysStr = formatDays(maxDays);
            row.maxDays=maxDays;
            row.maxDaysStr=maxDaysStr;
          }
          if(row.treatStat.minTreatTime==null){
            row.minDays=-1;
          }else{
            const minDays = dateDiff(row.treatStat.minTreatTime,row.maxOccurDate);
            const minDaysStr = formatDays(minDays);
            row.minDays=minDays;
            row.minDaysStr=minDaysStr;
          }
        }
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

  /** 看病信息 */
  function showTreat(treatId) {
    formRef.value.openForm(treatId, 'view');
    
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    let qb = getQueryObject(null);
    if(!proxy.isEmpty(qb.name)){
      queryParams.value.name = qb.name;
    }
    if(!proxy.isEmpty(qb.groupField)){
      queryParams.value.groupField = qb.groupField;
    }
    getList();
  })
  
</script>
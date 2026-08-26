<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="950px" append-to-body class="customDialogCss">
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="80px" :inline="true">
				<el-form-item label="名称检索" prop="name">
				  <el-input
				    v-model="queryParams.name"
				    placeholder="请输入名称"
				    clearable
				    style="width: 180px"
				    @keyup.enter.native="handleQuery" />
				</el-form-item>
        <el-form-item label="复查时间" prop="days">
          <el-select
            v-model="queryParams.days"
            placeholder="复查时间"
            clearable
            style="width: 120px"
            @change="handleQuery">
            <el-option
              v-for="dict in daysOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['health:treat:treatOperation:reviewList']">统计</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!--列表数据-->
      <el-table v-loading="loading" :data="treatOperationList" :row-class-name="tableRowClassName">
        <el-table-column label="手术/检查项目" fixed="left" width="250" :show-overflow-tooltip="true">
          <template #default="scope">
        		<span v-if="scope.row.rdDays!=null && scope.row.rdDays<=0">
        		  <el-tag type="danger">待复查</el-tag>
        		</span>
            <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.operationName }}</span>
          </template>
        </el-table-column>
				<el-table-column label="手术/检查日期" width="110" align="center" >
				  <template #default="scope">
				    <span>{{ scope.row.treatDate }}</span>
				  </template>
				</el-table-column>
				<el-table-column label="距离现在" width="110" :show-overflow-tooltip="true">
				  <template #default="scope">
				    <span v-if="scope.row.tdDays>=365" style="color: red;">
				     {{ scope.row.tdDaysStr }}
				    </span>
				    <span v-else-if="scope.row.tdDays>=90" style="color: purple;">
				     {{ scope.row.tdDaysStr }}
				    </span>
				    <span v-else-if="scope.row.tdDays>=30" style="color: green;">
				     {{ scope.row.tdDaysStr }}
				    </span>
				    <span v-else>
				     {{ scope.row.tdDaysStr }}
				    </span>
				  </template>
				</el-table-column>
				<el-table-column label="复查日期" width="100" align="center" >
				  <template #default="scope">
				    <span v-if="scope.row.rdDays>=365" style="color: black;">
				     {{ scope.row.reviewDate }}
				    </span>
				    <span v-else-if="scope.row.rdDays>=90" style="color: purple;">
				     {{ scope.row.reviewDate }}
				    </span>
				    <span v-else-if="scope.row.rdDays>=30" style="color: #8b008b;">
				     {{ scope.row.reviewDate }}
				    </span>
				    <span v-else style="color: red;">
				     {{ scope.row.reviewDate }}
				    </span>
				  </template>
				</el-table-column>
				<el-table-column label="复查剩余" width="110" :show-overflow-tooltip="true">
				  <template #default="scope">
				    <span v-if="scope.row.rdDays>=365" style="color: red;">
				     {{ scope.row.rdDaysStr }}
				    </span>
				    <span v-else-if="scope.row.rdDays>=90" style="color: purple;">
				     {{ scope.row.rdDaysStr }}
				    </span>
				    <span v-else-if="scope.row.rdDays>=30" style="color: green;">
				     {{ scope.row.rdDaysStr }}
				    </span>
				    <span v-else>
				     {{ scope.row.rdDaysStr }}
				    </span>
				  </template>
				</el-table-column>
				<el-table-column label="医院" min-width="160" align="center" :show-overflow-tooltip="true">
				  <template #default="scope">
				    <span>{{ scope.row.treat.hospital }}</span>
				  </template>
				</el-table-column>
      </el-table>

			<pagination
			  v-show="total > 0"
			  :total="total"
			  v-model:page="queryParams.page"
			  v-model:limit="queryParams.pageSize"
			  @pagination="getList" />
				
    </div>
  </el-dialog>

</template>

<script setup name="TreatOperationReviewList">
  import { fetchReviewList } from "@/api/health/treat/treatOperation";
  import { getDay, getDayByDate, getNowDateString,formatDays } from "@/utils/datetime";

  const { proxy } = getCurrentInstance();

  const title = ref('复查列表');
  const open = ref(false);
  const formRef = ref();
  const loading = ref(false);
	// 总条数
  const total = ref(0);
	
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));

  const daysOptions = ref([
		{
      id: 30,
      text: '一个月内'
    },
    {
      id: 90,
      text: '三个月内'
    },
    {
      id: 180,
      text: '半年内'
    },
    {
      id: 365,
      text: '一年内'
    },
    {
      id: 1825,
      text: '五年内'
    },
    {
      id: -1,
      text: '>>已过期<<'
    },
    {
      id: 0,
      text: '全部'
    }
  ]);
  const treatOperationList = ref([]);

  const data = reactive({
    queryParams: {
			page: 1,
			pageSize: 10,
      days: 30,
			name:undefined
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    open.value = true;
    title.value = '手术复查统计';
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function tableRowClassName({ row, rowIndex }) {
    if (row.sum == true) {
      return 'sum-row';
    } else {
      return ''
    }
  }
  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function getList() {
    loading.value = true;
		let para ={
			page: queryParams.value.page,
			pageSize: queryParams.value.pageSize,
			name: queryParams.value.name
		};
		let days = queryParams.value.days;
		if(days>0){
			para.startDate = getDay(days);
		}else if(days==0){
			para.endDate = '2099-12-31';
		}else if(days==-1){
			para.endDate = getDay(0);
		}
    fetchReviewList(para).then(
      response => {
        let dataList = response.rows;
        const n = dataList.length;
        const nowTime = new Date();
        for (let i = 0; i < n; i++) {
          let row = dataList[i];
          const td = new Date(Date.parse(row.treatDate.replace(/-/g,"/")));
          const tdDays = (parseInt(nowTime - td)) / (1000*24*3600);
          const tdDaysStr = formatDays(tdDays);
          row.tdDays=tdDays;
          row.tdDaysStr=tdDaysStr;
          if(!proxy.isEmpty(row.reviewDate)){
            const rd = new Date(Date.parse(row.reviewDate.replace(/-/g,"/")));
            const rdDays = (parseInt(nowTime - rd)) / (1000*24*3600);
            row.rdDays = rdDays;
						const rdDaysStr = formatDays(0-rdDays);
						row.rdDaysStr=rdDaysStr;
          }
        }
        treatOperationList.value = dataList;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {})
</script>
<style>
  .el-table .sum-row {
    background: #f0f9eb;
  }
</style>

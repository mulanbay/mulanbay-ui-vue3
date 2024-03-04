<template>
  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="850px" append-to-body>
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
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
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['data:userCalendar:flowLogList']">统计</el-button>
          <el-button type="success" icon="HomeFilled" @click="gotoMain" v-hasPermi="['data:userCalendar:flowLogList']">首页</el-button>
          <el-button type="success" icon="DArrowLeft" :disabled="queryParams.page==1" @click="gotoNextPage(-1)" v-hasPermi="['data:userCalendar:flowLogList']">上一页</el-button>
          <el-button type="success" icon="DArrowRight" @click="gotoNextPage(1)" v-hasPermi="['data:userCalendar:flowLogList']">下一页</el-button>
        </el-form-item>
      </el-form>

      <div>
        <el-table v-loading="loading" :data="dataList">
          <el-table-column label="日期" align="center" width="180">
            <template #default="scope">
              <span>{{ scope.row.date }}</span>
            </template>
          </el-table-column>
          <el-table-column label="统计数据" align="center">
            <template #default="scope">
              <span>{{ scope.row.value +scope.row.unit}}</span>
            </template>
          </el-table-column>
          <el-table-column label="名称" align="center">
            <template #default="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>
  </el-dialog>

</template>

<script setup name="UserCalendarFlowLogList">
  import { getCalendarFlowLogList } from "@/api/data/userCalendar";

  const { proxy } = getCurrentInstance();

  const dataList = ref([]);
  //可执行时间段
  const title = ref('流水日志');
  const open = ref(false);
  const loading = ref(false);

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref(proxy.getYearDateRange(0));
  
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize:10
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (calendarId,tt) => {
    open.value = true;
    if(tt!=null){
      title.value='['+tt+']流水日志';
    }
    queryParams.value.calendarId = calendarId;
    queryParams.value.page = 1;
    proxy.$nextTick(() => {
      handleQuery();
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 首页 */
  function gotoMain(){
    queryParams.value.page = 1;
    getList();
  }
  
  /** 上一页/下一页 */
  function gotoNextPage(p){
    queryParams.value.page += p;
    getList();
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.page = 1;
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    queryParams.value = {
  
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function getList() {
    loading.value = true;
    dataList.value= [];
    getCalendarFlowLogList(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
      loading.value = false;
      if(response.length<=0){
        queryParams.value.page = 1;
        proxy.$modal.msgError("无更多数据");
        return;
      }
      dataList.value=response;
    });
  }

  /** 初始化 **/
  onMounted(() => {
    
  })
</script>
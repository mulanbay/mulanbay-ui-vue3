<template>

  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="750px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" >
      <el-form-item label="日历日期" style="width: 308px" v-show="moreCdn==true" >
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
      <el-form-item label="唯一标识" prop="bussIdentityKey">
        <el-input
          v-model="queryParams.bussIdentityKey"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['data:userCalendar:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="calendarList"  @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" fixed="left" prop="calendarId" sortable="custom" align="center" width="90">
        <template #default="scope">
          <span>{{ scope.row.calendarId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" fixed="left" min-width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.templateId!=null">
            <el-icon><Share /></el-icon>
          </span>    
          <span v-if="scope.row.finishType!=null">
           <span class="link-type" @click="showCalendarDetail(scope.row)"><el-icon color="green"><CircleCheck /></el-icon>{{ scope.row.title }}</span>
          </span>
          <span v-else>
           <span class="link-type" @click="showCalendarDetail(scope.row)">{{ scope.row.title }}</span>
          </span>    
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.sourceTypeName }}</span>
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
      <el-table-column label="创建时间" align="center"  width="180">
        <template #default="scope">
          <span>{{ scope.row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
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
      
    <!-- 来源详情 -->
    <SourceDetail ref="sourceDetailRef" @success="getList"/>
      
  </el-dialog>

</template>

<script setup name="UserCalendarRelate">
  import { fetchList, deleteUserCalendar } from "@/api/data/userCalendar";
  import SourceDetail from './sourceDetail.vue'

  const { proxy } = getCurrentInstance();
  const sourceDetailRef = ref();

  //可执行时间段
  const title = ref('相关日历');
  const open = ref(false);
  
  const calendarList = ref([]);
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

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);
  
  const data = reactive({
    queryParams: {
      page:1,
      pageSize:10
    },
    rules: {
      bussIdentityKey: [
        { required: true, message: "唯一标识不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

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
  
  /** 打开弹窗 */
  const showData = async (bussIdentityKey) => {
    open.value = true;
    resetForm();
    queryParams.value.bussIdentityKey=bussIdentityKey;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 消息来源详情 */
  function showCalendarDetail(row){
    sourceDetailRef.value.showData(row.calendarId)
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
  
  /** 重置 */
  function resetForm() {
    queryParams.value.page = 1;
    calendarList.value = [];
    total.value = 0;
  }
  
  /** 提交表单 */
  function getList() {
    loading.value = true;
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        calendarList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
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

  })
</script>
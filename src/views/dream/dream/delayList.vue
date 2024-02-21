<template>
  <div class="app-container">
    <!-- 对话框 -->
    <el-dialog :title="title" v-model="open" width="550px" append-to-body  class="customDialogCss">
      <el-timeline v-loading="loading">
        <template v-for="item in dataList">
          <el-timeline-item :timestamp="item.createdTime" type="primary" placement="top">
            <el-card class="box-card">
              <div>
                <el-descriptions class="margin-top" :column="1" border>
                  <el-descriptions-item width="20px" align="center">
                    <template #label>
                      <div class="cell-item">
                        <el-icon>
                          <Connection />
                        </el-icon>
                        期望时间
                      </div>
                    </template>
                    {{ item.toDate }}
                  </el-descriptions-item>
                  <el-descriptions-item width="20px" align="center">
                    <template #label>
                      <div class="cell-item">
                        <el-icon>
                          <Refresh />
                        </el-icon>
                        延期变化
                      </div>
                    </template>
                    {{ item.fromDate +' --> ' + item.toDate }}
                  </el-descriptions-item>
                  <el-descriptions-item width="20px" align="center">
                    <template #label>
                      <div class="cell-item">
                        <el-icon>
                          <Clock />
                        </el-icon>
                        延期时长
                      </div>
                    </template>
                    {{formatDelayDays(item)}}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
      </el-timeline>
      
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.pageSize"
        @pagination="getList" />
        
    </el-dialog>
  </div>
</template>

<script setup name="DreamDelayList">
  import { fetchDelayList } from "@/api/dream/dream";
  import {tillNowString,tillNowSeconds} from "@/utils/datetime";

  const { proxy } = getCurrentInstance();
  
  //可执行时间段
  const title = ref('期望完成日期-延期列表');
  const open = ref(false);
  const loading = ref(false);
  const total = ref(0);
  const queryParamsRef = ref();

  const data = reactive({
    dataList: [],
    queryParams: {
      page: 1,
      pageSize: 5
    }
  });

  const { queryParams, dataList } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (dreamId,dreamName) => {
    open.value = true;
    title.value = '梦想['+dreamName+']期望完成日期-延期列表';
    queryParams.value.dreamId = dreamId;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {

  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }
  
  /** 延期时长 */
  function formatDelayDays(row){
    let ss = tillNowSeconds(row.fromDate,row.toDate);
    return tillNowString(ss);
  }
  

  /** 获取数据 **/
  function getList() {
    dataList.value = [];
    loading.value = true;
    fetchDelayList(queryParams.value).then(
      response => {
        loading.value = false;
        total.value = response.total;
        dataList.value = response.rows;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
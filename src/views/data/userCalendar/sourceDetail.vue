<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="680px" append-to-body class="customDialogCss">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['data:userCalendar:sourceDetail']">刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="edit" @click="handleEdit" :disabled="calendarId==null" v-hasPermi="['data:userCalendar:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="Grid" @click="handleFlowLog" :disabled="calendarId==null" v-hasPermi="['data:userCalendar:flowLogList']">流水</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="CircleClose" @click="detailOpen=false">关闭</el-button>
      </el-col>
    </el-row>

    <el-tabs v-loading="detailLoading" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="日历信息" name="info">
        <el-descriptions class="margin-top" :column="1" border>
          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                <el-icon><HomeFilled /></el-icon>
                标题
              </div>
            </template>
            {{ beanData.title}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Comment /></el-icon>
                内容
              </div>
            </template>
            {{ beanData.content}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Promotion /></el-icon>
                数据来源
              </div>
            </template>
            {{ calendarId==null ? '统计数据':'日历数据'}}
            <el-tooltip content="1. 统计数据为根据统计信息得出的数据. 2.日历数据为来自于日历管理页面的真实数据." effect="dark" placement="top">
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Clock /></el-icon>
                日历时间
              </div>
            </template>
            {{ formatCalendarDate(beanData)}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Clock /></el-icon>
                失效时间
              </div>
            </template>
            {{ beanData.expireTime}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><StarFilled /></el-icon>
                业务来源
              </div>
            </template>
            {{ beanData.sourceTypeName}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><StarFilled /></el-icon>
                周期类型
              </div>
            </template>
            {{ beanData.periodName}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><UploadFilled /></el-icon>
                完成状态
              </div>
            </template>
            {{ beanData.finishTypeName==null ? '未完成':beanData.finishTypeName}}
            <span v-if="beanData.finishType!=null">
              {{ beanData.match ? '(时间匹配)':'(时间未匹配)'}}
            </span>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Clock /></el-icon>
                完成时间
              </div>
            </template>
            {{ beanData.finishTime}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Clock /></el-icon>
                创建时间
              </div>
            </template>
            {{ beanData.createdTime}}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="日历来源" name="sourceData">
        <SourceDetail ref="sourceDetailRef" />
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消息名称</span>
            </div>
          </template>
          <el-text class="mx-1" type="danger">{{ sourceMessage.title}}</el-text>
        </el-card>
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消息内容</span>
            </div>
          </template>
          <el-text class="mx-1" type="danger">{{ sourceMessage.content}}</el-text>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="完成来源" name="finishSourceData">
        <FinishSourceDetail ref="finishSourceDetailRef" />
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消息名称</span>
            </div>
          </template>
          <el-text class="mx-1" type="danger">{{ finishSourceMessage.title}}</el-text>
        </el-card>
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消息内容</span>
            </div>
          </template>
          <el-text class="mx-1" type="danger">{{ finishSourceMessage.content}}</el-text>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="日历详情" name="calendarData">
        <CalendarDataInfo ref="calendarDataInfoRef" />
      </el-tab-pane>
    </el-tabs>

    <!-- 表单 -->
    <UserCalendarForm ref="formRef" @success="loadData" />
   
   <!-- 流水日志 -->
   <FlowLogList ref="flowLogListRef" />
    
  </el-dialog>

</template>

<script setup name="UserCalendarSourceDetail">
  import { getUserCalendarSourceDetail } from "@/api/data/userCalendar";
  import SourceDetail from '../common/beanDetail'
  import FinishSourceDetail from '../common/beanDetail'
  import CalendarDataInfo from '../../common/jsonTreeTable'
  import UserCalendarForm from './form.vue'
  import FlowLogList from './flowLogList.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();
  const flowLogListRef = ref();

  //可执行时间段
  const detailTitle = ref('日历详情');
  const detailOpen = ref(false);
  const detailLoading = ref(false);
  const activeName = ref('info');
  const calendarId = ref();
  const sourceDetailRef = ref();
  const finishSourceDetailRef = ref();
  const calendarDataInfoRef = ref();
  
  const data = reactive({
    sourceMessage: { },
    finishSourceMessage: {},
    beanData:{}
  });
  
  const { sourceMessage,finishSourceMessage,beanData } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    detailOpen.value = true;
    calendarId.value = id;
    activeName.value='info';
    proxy.$nextTick(()=>{
      loadData();
    });
    
  }
  
  /** 来自于组装日历，有些数据并不是日历数据过来，直接由计算过来 */
  const showComputedData = async (cpData) => {
    detailOpen.value = true;
    calendarId.value = null;
    activeName.value='info';
    proxy.$nextTick(()=>{
      resetForm();
      beanData.value = cpData;
      //需要删除原来的记录
      sourceDetailRef.value.showData({});
      finishSourceDetailRef.value.showData({});
      calendarDataInfoRef.value.showData({});
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData,showComputedData });


  function handleClick() {

  }
  
  /** 日历时间显示 */
  function formatCalendarDate(item){
    if(proxy.isEmpty(item)||proxy.isEmpty(item.bussDay)){
      return null
    }
    if(item.period=='ONCE'){
      if(item.allDay){
        return item.bussDay.substring(0,10)+' (全天日历)';
      }else{
        return item.bussDay.substring(11,16);
      }
    }else{
      return item.bussDay.substring(11,16);
    }
  }
  
  /** 修改按钮操作 */
  function handleEdit() {
    formRef.value.openForm(calendarId.value, 'edit');
  }
  
  /** 流水日志操作 */
  function handleFlowLog() {
    flowLogListRef.value.showData(calendarId.value,null);
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    detailLoading.value = true;
    getUserCalendarSourceDetail(calendarId.value).then(response => {
      detailLoading.value = false;
      sourceDetailRef.value.showData(response.sourceData);
      finishSourceDetailRef.value.showData(response.finishSourceData);
      calendarDataInfoRef.value.showData(response.calendarData);
      beanData.value = response.calendarData;
      if(response.sourceMessage!=null){
        sourceMessage.value=response.sourceMessage;
      }
      if(response.finishSourceMessage!=null){
        finishSourceMessage.value=response.finishSourceMessage;
      }
    });
  }


  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 表单重置
  function resetForm() {
    sourceMessage.value = { };
    finishSourceMessage.value = { };
    beanData.value = { };
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<style>
  .my-label {
    width: 120px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>
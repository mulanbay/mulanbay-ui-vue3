<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :rules="rules" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="日历来源" prop="sourceType">
        <el-select
          v-model="queryParams.sourceType"
          placeholder="日历来源"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in sourceTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" >
          <div class="flex items-center">
            <el-tag :color="dict.color" style="margin-right: 8px" size="small" >
              
            </el-tag>
            <span :style="{ color: dict.color }">{{ dict.text }}</span>
          </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="条件筛选" v-if="moreCdn==true">
        <el-checkbox v-model="queryParams.needFinished" label="包含完成" />
        <el-checkbox v-model="queryParams.needPeriod" label="包含周期性" />
        <el-checkbox v-model="queryParams.needBudget" label="包含预算" />
        <el-checkbox v-model="queryParams.needTreatDrug" label="用药日历" />
        <el-checkbox v-model="queryParams.needConsume" label="包含消费" />
        <el-checkbox v-model="queryParams.needBandLog" label="日志绑定" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['data:userCalendar:calendarList']">查询</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--日历数据-->
    <FullCalendar ref="myCalendarRef" :options="calendarOptions" @dateClick="handleCalendarDateClick" />
    
    <!-- 来源详情 -->
    <SourceDetail ref="sourceDetailRef" />
    
  </div>
</template>

<script setup name="UserCalendarCalendarList">
  import { getCalendarList,updateUserCalendarDate } from "@/api/data/userCalendar";
  import { copyObject, getQueryObject,getCalendarColor } from "@/utils/mulanbay";
  import { getFormatDate, getNowDateString } from "@/utils/datetime";
  import { deepClone } from "@/utils/index";
  import SourceDetail from './sourceDetail.vue'

  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import listPlugin from '@fullcalendar/list'

  const { proxy } = getCurrentInstance();
  const myCalendarRef = ref();
  const sourceTypeOptions = ref([]);
  const calendarEventList = ref([]);
  const sourceDetailRef = ref();

  const data = reactive({
    //参考:https://www.cnblogs.com/czk1634798848/p/13386178.html
    calendarOptions: {
      // 引入的插件，比如fullcalendar/daygrid，fullcalendar/timegrid引入后才可显示月，周，日
      plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin],
      initialView: 'dayGridMonth', // 默认为那个视图（月：dayGridMonth，周：timeGridWeek，日：timeGridDay）
      firstDay: 1, // 设置一周中显示的第一天是哪天，周日是0，周一是1，类推
      locale: 'zh-cn', // 切换语言，当前为中文
      //eventColor: '#3BB2E3', // 全部日历日程背景色
      initialDate: getNowDateString(), // 自定义设置背景颜色时一定要初始化日期时间
      //timeGridEventMinHeight: '20', // 设置事件的最小高度
      aspectRatio: 1.2, // 设置日历单元格宽度与高度的比例。
      // displayEventTime: false, // 是否显示时间
      // allDaySlot: false, // 周，日视图时，all-day 不显示
      //eventLimit: true, // 设置月日程，与all-day slot的最大显示数量，超过的通过弹窗显示
      headerToolbar: {
        //left: 'prev,next today',
        left: 'prevCB,nextCB todayCB',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      customButtons: {
        prevCB: {
          // this overrides the prev button
          text: "<<往前",
          click: () => {
            prevMethod();
          },
        },
        nextCB: {
          // this overrides the next button
          text: "往后>>",
          click: () => {
            nextMethod();
          },
        },
        todayCB: {
          text: "今天",
          click: () => {
            todayMethod();
          },
        }
      },
      buttonText: {
        today: '今天',
        month: '月',
        week: '周',
        day: '日',
        list: '列表'
      },
      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false,
        hour12: false // 设置时间为24小时
      },
      //allowContextMenu: false,
      editable: true, // 是否可以进行（拖动、缩放）修改
      eventStartEditable: true, // Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
      eventDurationEditable: true, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
      selectable: true, // 是否可以选中日历格
      selectMirror: true,
      selectMinDistance: 0, // 选中日历格的最小距离
      dayMaxEvents: true,
      weekends: true,
      navLinks: true, // 天链接
      //selectHelper: false,
      slotEventOverlap: false, // 相同时间段的多个日程视觉上是否允许重叠，默认true允许
      eventMouseEnter: handleEventMouseEnter, // 鼠标滑过
      dateClick: handleDateClick, // 点击日历格事件
      select: handleDateSelect, // 选中日历格事件
      eventClick: handleEventClick,
      eventsSet: handleEventSet,
      eventAdd: handleEventAdd,
      eventChange: handleEventChange,
      eventRemove: handleEventRemove,
      eventDrop: handleEventDrop, // 拖动日历日程事件
      eventResize: handleEventResize, // 修改日历日程大小事件
      eventDidMount: handleEventDidMount, // 安装提示事件
      events: calendarEventList
    },
    queryParams: {
      needFinished:true,
      needPeriod:true,
      needBudget:true,
      needTreatDrug:true,
      needConsume:true,
      needBandLog:true
    },
    rules: {
    }
  });

  const { queryParams, calendarOptions, rules } = toRefs(data);

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
  
  /** 日历事件处理 start */

  /** 上个月  */
  function prevMethod() {
    myCalendarRef.value.getApi().prev() // 更新上个月视图
    handleDateRangeChange();
  }
  /** 下个月  */
  function nextMethod() {
    myCalendarRef.value.getApi().next() // 更新下个月视图
    handleDateRangeChange();
  }
  /** 今天  */
  function todayMethod() {
    myCalendarRef.value.getApi().today() // 更新今天视图
    handleDateRangeChange();
  }
  
  /** 视图切换  */
  function handleViewRender() {
    handleDateRangeChange();
  }
  
  /** 时间区段改变  */
  function handleDateRangeChange(){
    let start = myCalendarRef.value.getApi().currentDataManager.state.dateProfile.renderRange.start;
    let end = myCalendarRef.value.getApi().currentDataManager.state.dateProfile.renderRange.end;
    var fullPara = deepClone(queryParams.value);;
    fullPara.startDate = getFormatDate(start, "yyyy-MM-dd hh:mm:ss");
    fullPara.endDate = getFormatDate(end, "yyyy-MM-dd hh:mm:ss");
    calendarEventList.value=[];
    getCalendarList(fullPara).then(
      response => {
        let n = response.length;
        for(let i=0;i<n;i++){
          let item = response[i];
          let color = getCalendarColor(item.sourceTypeIndex);
          let textColor = 'black';
          let editable = item.sourceType=='MANUAL'&&item.period=='ONCE' ? true :false;
          let title = item.title;
          if(item.finishTime!=null){
            textColor = 'green';
            title = '[完成]'+title;
          }
          let event = {
            id: item.id,
            title: title, 
            start: item.bussDay,
            end: item.expireTime,
            editable: editable,
            borderColor:color,
            backgroundColor:color,
            textColor: textColor,
            //display:'block',
            allDay:item.allDay,
            extendedProps:item
          };
          calendarEventList.value.push(event);
        }
      }
    );
  }

  function handleCalendarDateClick(arg) {
    console.log(arg.currentStart)
    console.log(arg.currentEnd)
  }

  /** 格子时间点击的事件 */
  function handleDateClick(eventInfo) {
    console.log('handleDateClick:' + getFormatDate(eventInfo.date, "yyyy-MM-dd hh:mm:ss"))
  }

  function handleDateSelect(eventInfo) {
    console.log('handleDateSelect:' + eventInfo)
  }

  function handleEventClick(eventInfo) {
    let event = eventInfo.event;
    let calendarId = event.extendedProps.calendarId;
    if(proxy.isEmpty(calendarId)){
      sourceDetailRef.value.showComputedData(event.extendedProps);
    }else{
      sourceDetailRef.value.showData(calendarId);
    }
  }
  
  function handleEventMouseEnter(eventInfo){
    
  }

  function handleEventSet() {

  }

  function handleEventAdd() {

  }

  function handleEventChange() {

  }

  function handleEventRemove() {

  }

  function handleEventDrop(eventInfo) {
    let event = eventInfo.event;
    let postData={
      calendarId: event.extendedProps.calendarId,
      bussDay: getFormatDate(event.start, "yyyy-MM-dd hh:mm:ss")
    }
    updateUserCalendarDate(postData).then(response => {
      proxy.$modal.msgSuccess("更新时间成功");
    });
  }

  function handleEventResize() {

  }

  function handleEventDidMount() {

  }
  /** 日历事件处理 end */

  /** 搜索按钮操作 */
  function handleQuery() {
    handleDateRangeChange();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleDateRangeChange();
  }

  /** 初始化 **/
  onMounted(() => {
    handleDateRangeChange();
    proxy.getEnumDict('BussSource', 'FIELD', false).then(response => {
      let n =response.length;
      for(let i=0;i<n;i++){
        let item = response[i];
        item.color = getCalendarColor(i);
        sourceTypeOptions.value.push(item);
      }
    });
  })
</script>
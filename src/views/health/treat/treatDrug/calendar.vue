<template>

  <!-- 表单编辑对话框 -->
  <el-dialog :title="title" v-model="open" width="720px" append-to-body class="customDialogCss">
    <el-form :inline="true">
      <el-form-item label="选择日期">
        <el-date-picker type="date"
          v-model="bussDay"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :style="{width: '140px'}"
          placeholder="请选择日期"
          @change="handleQuery"
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="Clock" @click="getCalendarToday" >今天</el-button>
        <el-button type="success" icon="DArrowLeft" @click="getCalendarDev(-1)" >前一天</el-button>
        <el-button type="success" icon="DArrowRight" @click="getCalendarDev(1)" >后一天</el-button>
        <el-button type="primary" icon="refresh" @click="handleQuery" >刷新</el-button>
      </el-form-item>
    </el-form>
    
    <el-row>
      <el-col :span="24">
        <div align="center">
          <svg-icon icon-class="calendar" />
          <span style="color: red;">{{bussDayTitle}}</span>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="0">
      <el-col :span="6" class="badge-col">
        <el-badge :value="statData.unTakes" class="item">
          <el-button icon="CircleCloseFilled" type="danger" plain>未服用</el-button>
        </el-badge>
      </el-col>
      <el-col :span="6" class="badge-col">
        <el-badge :value="statData.takes" class="item">
          <el-button icon="SuccessFilled" type="success" plain>已服用</el-button>
        </el-badge>
      </el-col>
      <el-col :span="6" class="badge-col">
        <el-badge :value="statData.unMatchs" class="item">
          <el-button icon="QuestionFilled" type="warning" plain>未匹配</el-button>
        </el-badge>
      </el-col>
      <el-col :span="6" class="badge-col">
        <el-badge :value="statData.drugs" class="item">
          <el-button icon="InfoFilled" type="primary" plain>药品数</el-button>
        </el-badge>
      </el-col>
    </el-row>
    
    <template v-for="cld in dataList">
      <el-divider content-position="center">
        <el-icon><Promotion /></el-icon>
        {{cld.name}}
      </el-divider>
      <el-timeline v-loading="loading" :reverse="reverse" >
        <el-timeline-item :timestamp="cld.startHour+':00'" type="success" icon="Promotion" placement="top">
        </el-timeline-item>
        <template v-for="item in cld.detailList">
          <el-timeline-item :timestamp="item.occurTimeStr" :type="item.type" placement="top">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <svg-icon icon-class="health" />
                <span>
                  针对疾病:{{item.disease}}
                </span>
                <el-button link type="success" style="color: red;float: right; padding: 3px 0" icon="delete" @click="handleStop(item)"
                  v-hasPermi="['health:treat:treatDrug:edit']">
                  暂停
                </el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button link type="success" style="float: right; padding: 3px 0" icon="plus" @click="handleAddDrugDetail(item)"
                  v-if="item.occurTime == null"
                  v-hasPermi="['health:treat:treatDrugDetail:create']">
                  服用
                </el-button>
              </div>
              <div>
                <el-divider direction="vertical"></el-divider>
                <span>
                  {{ item.perDay }}天
                  <el-tag>{{ item.perTimes }}</el-tag>
                  次
                </span>
                <el-divider direction="vertical"></el-divider>
                <span>
                  每次
                  <el-tag>{{ item.ec }}</el-tag>
                  {{ item.eu }}
                </span>
                <el-divider direction="vertical"></el-divider>
                <span>
                  <el-tag>{{item.useWay}}</el-tag>
                </span>
                <el-divider direction="vertical"></el-divider>
                <p>{{item.name}}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
        <el-timeline-item :timestamp="cld.endHour+':59'" type="success" icon="el-icon-message-solid" placement="top">
        </el-timeline-item>
      </el-timeline>
    </template>
    
  </el-dialog>

  <!-- 明细表单 -->
  <TreatDrugDetailForm ref="treatDrugDetailFormRef" @success="getList"/>
  
</template>

<script setup name="TreatDrugCalendar">
  import {getCalendar} from "@/api/health/treat/treatDrug";
  import {getNowDateString,getNowDateTimeString,getDayByDate,tillNowDays} from "@/utils/datetime";
  import TreatDrugDetailForm from '../treatDrugDetail/form.vue'

  const { proxy } = getCurrentInstance();
  const treatDrugDetailFormRef = ref();

  //可执行时间段
  const title = ref('用药记录');
  const open = ref(false);
  const loading = ref(false);
  const formRef = ref();
  const reverse = ref(false);
  
  //数据列表
  const dataList = ref([]);
  //日期标题
  const bussDayTitle = ref();
  const bussDay = ref(getNowDateString());
  
  const data = reactive({
    statData: {},
    // 表单校验
    rules: {
    }
  });

  const { statData, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async () => {
    open.value = true;
    handleQuery();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    
  }
  
  /** 用药 */
  function handleAddDrugDetail(item){
    treatDrugDetailFormRef.value.openForm(null, 'create', item.drugId);
  }
  
  /** 暂停 */
  function handleStop(item){
    proxy.$modal.msgError("尚未实现");
  }
  
  /** 今天 */
  function getCalendarToday() {
    bussDay.value = getNowDateString();
    setBussDayTitle();
    handleQuery();
  }
  
  /** 前一天/后一天 */
  function getCalendarDev(n) {
    let dd = bussDay.value;
    dd = getDayByDate(n,dd);
    bussDay.value = dd;
    setBussDayTitle();
    handleQuery();
  }
  
  /** 设置日期标题 */
  function setBussDayTitle(){
    const now = new Date(Date.parse(getNowDateString().replace(/-/g,"/")));
    const bd = new Date(Date.parse(bussDay.value.replace(/-/g,"/")));
    const days = tillNowDays(now,bd);
    switch(days){
      case 0:
        bussDayTitle.value='今天,'+bussDay.value.substr(5,5);
        break;
      case 1:
        bussDayTitle.value='明天,'+bussDay.value.substr(5,5);
        break;
      case -1:
        bussDayTitle.value='昨天,'+bussDay.value.substr(5,5);
        break;
      default:
        if(days>0){
          bussDayTitle.value=days+'天后,'+bussDay.value.substr(5,5);
        }else{
          bussDayTitle.value=(0-days)+'天前,'+bussDay.value.substr(5,5);
        }
    }
  }
  
  /** 查询列表 */
  function getList() {
    getCalendarList();
  }
  
  //列表数据
  function getCalendarList() {
    loading.value=true;
    let para={
      bussDay:bussDay.value
    };
    getCalendar(para).then(
      response => {
        let datas = response;
        //统计信息
        let unTakes=0;
        let takes=0;
        let drugs=0;
        let unMatchs=0;
        let map = new Map();
        for(let i=0;i<datas.length;i++){
          let detailList = datas[i].detailList;
          for(let j=0;j<detailList.length;j++){
            let dt = detailList[j];
            if(dt.occurTime==null){
              dt.occurTimeStr = '未服用';
              dt.type='danger';
              unTakes++;
            }else{
              dt.occurTimeStr = dt.occurTime.substr(11,5)+'服用★';
              dt.type='primary';
              takes++;
            }
            if(dt.match==false){
              dt.occurTimeStr+='(未匹配)';
              dt.type='warning';
              unMatchs++;
            }
            map.set(dt.treatDrugId,1);
          }
        }
        drugs=map.size;
        statData.value ={
          unTakes:unTakes,
          takes:takes,
          drugs:drugs,
          unMatchs:unMatchs
        }
        dataList.value = datas;
        loading.value=false;
      }
    );
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 初始化 **/
  onMounted(() => {
  })
</script>
<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="680px" append-to-body >
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" icon="CircleClose" @click="detailOpen=false">关闭</el-button>
      </el-col>
    </el-row>

    <el-tabs v-loading="detailLoading" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="日志详情" name="info">
        <el-descriptions class="margin-top" :column="1" border>
          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                <el-icon><HomeFilled /></el-icon>
                日志标题
              </div>
            </template>
            {{ beanData.title}}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                <el-icon><HomeFilled /></el-icon>
                日志内容
              </div>
            </template>
            <el-text class="mx-1" type="primary">{{ beanData.content}}</el-text>
          </el-descriptions-item>
          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                <el-icon><Comment /></el-icon>
                异常类型
              </div>
            </template>
            {{ beanData.exceptionClassName}}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="请求参数" name="paras">
        <SysLogPara ref="sysLogParaRef" />
      </el-tab-pane>
      <el-tab-pane label="操作对象" name="beanInfo">
        <BeanInfo ref="beanInfoRef" />
      </el-tab-pane>
    </el-tabs>

  </el-dialog>

</template>

<script setup name="SysLogDetail">
  import { getBeanDetail } from "@/api/log/sysLog";
  import SysLogPara from '../../common/jsonTreeTable'
  import BeanInfo from '../../common/jsonTreeTable'

  const { proxy } = getCurrentInstance();
  
  //可执行时间段
  const detailTitle = ref('日志详情');
  const detailOpen = ref(false);
  const detailLoading = ref(false);
  const activeName = ref('info');
  const sysLogParaRef = ref();
  const beanInfoRef = ref();
  
  const data = reactive({
    beanData:{}
  });
  
  const { beanData } = toRefs(data);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (log) => {
    detailOpen.value = true;
    activeName.value='info';
    proxy.$nextTick(()=>{
      beanData.value = log;
      if(proxy.isEmpty(log.paras)){
        sysLogParaRef.value.showData(null);
      }else{
        sysLogParaRef.value.showData(JSON.parse(log.paras));
      }
      if(proxy.isEmpty(log.idValue)){
        beanInfoRef.value.showData(null);
      }else{
        showBeanDetail(log.id);
      }
    });
    
  }
  
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 主键值详情 */
  function showBeanDetail(id) {
    getBeanDetail(id).then(response => {
      beanInfoRef.value.showData(response.beanData);
    });
  }
  

  function handleClick() {

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
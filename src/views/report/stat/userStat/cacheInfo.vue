<template>

  <!-- 调度详情对话框 -->
  <el-dialog :title="cacheInfoTitle" v-model="cacheInfoOpen" width="850px" append-to-body class="customDialogCss">
    <el-row>
      <el-col :span="24" align="center">
        <el-card>
          <div>
            <el-descriptions class="margin-top" :column="1" border>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    缓存中统计失效时间
                  </div>
                </template>
                {{ cacheInfo.cacheExpire}}
                <el-button link icon="Delete" type="danger" @click="clearStatCache()" v-hasPermi="['report:stat:userStat:deleteStatCache']" size="small">清除</el-button>
                <el-button link type="success" icon="refresh" @click="loadData" v-hasPermi="['report:stat:userStat:cacheInfo']" size="small">刷新</el-button>
              </el-descriptions-item>
              <el-descriptions-item width="150px">
                <template #label>
                  <div class="cell-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    用户提醒失效时间
                  </div>
                </template>
                {{ cacheInfo.lastNotifyExpire}}
                <el-button link icon="Delete" type="danger" @click="clearNotifyCache()" v-hasPermi="['report:stat:userStat:deleteNotifyCache']" size="small">清除</el-button>
                <el-button link type="success" icon="refresh" @click="loadData" v-hasPermi="['report:stat:userStat:cacheInfo']" size="small">刷新</el-button>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">数据比对</el-divider>
    <el-row>
      <el-col :span="24" class="card-box" align="center">
        <!--数据-->
        <div style="padding: 0px 20px 0px 20px;">
          <el-steps align-center>
            <el-step title="数据库中数据" status="success" icon="coin"></el-step>
            <el-step title="缓存中数据" status="finish" icon="MessageBox"></el-step>
          </el-steps>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <el-table
              :data="dbDataList"
              row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="值"  :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.text }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <div class="chart-wrapper">
            <el-table
              :data="cacheDataList"
              row-key="id"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
              <el-table-column label="字段" prop="id" sortable="custom" :show-overflow-tooltip="true">
                <template #default="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="值"  :show-overflow-tooltip="true">
                <template #default="scope">
                  <span v-if="isChanged(scope.row.text)" style="color: red;">{{ scope.row.text }}</span>
                  <span v-else>{{ scope.row.text }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </el-dialog>


</template>

<script setup name="UserStatCacheInfo">
  import { getCacheInfo,deleteStatCache,deleteNotifyCache } from "@/api/report/stat/userStat";
  import { formatSeconds } from "@/utils/datetime";
  import {parseJsonToTree} from "@/utils/mulanbay";

  const { proxy } = getCurrentInstance();
  const lockKeyRef = ref();

  //可执行时间段
  const cacheInfoTitle = ref('缓存详情');
  const cacheInfoOpen = ref(false);

  const dbDataList = ref([]);
  const cacheDataList = ref();
  const formStatId = ref();

  const data = reactive({
    cacheInfo: {}
  });
  const { cacheInfo } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (statId) => {
    cacheInfoOpen.value = true;
    formStatId.value = statId;
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
  /** 是否改变 */
  function isChanged(s){
    if(proxy.isEmpty(s)){
      return false;
    }else{
      s=''+s;
      return s.indexOf("***")!=-1;
    }
  }
  
  /** 加载数据 */
  function loadData(){
    resetForm();
    getCacheInfo(formStatId.value).then(response => {
      let diTree = parseJsonToTree(response.dbData);
      dbDataList.value = diTree;
      if (response.cacheData != null) {
        let dbData = response.dbData ; 
        let siData = response.cacheData ; 
        let siTree = parseJsonToTree(siData);
        cacheDataList.value = siTree;
      }
      cacheInfo.value = {
        cacheExpire: formatExpire(response.cacheExpire),
        lastNotifyExpire: formatExpire(response.lastNotifyExpire)
      };
    });
  }
  
  /** 缓存失效时间格式化显示 */
  function formatExpire(ms){
    if(ms==null){
      return '无数据';
    }else if(ms==-2){
      return '未设置';
    }else if(ms==-1||ms==0){
      return '永久有效';
    }else{
      return formatSeconds(ms/1000);
    }
  }
  
  /** 清除统计缓存 */
  function clearStatCache() {
    let postData={
      statId:formStatId.value
    }
    proxy.$confirm("是否要清除该项的统计缓存？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteStatCache(postData);
    }).then(() => {
      proxy.$modal.msgSuccess("清除成功");
      loadData();
    }).catch(function() {});
  }
  
  /** 清除通知缓存 */
  function clearNotifyCache() {
    let postData={
      statId:formStatId.value
    }
    proxy.$confirm("是否要清除该项的通知缓存？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteNotifyCache(postData);
    }).then(() => {
      proxy.$modal.msgSuccess("清除成功");
      loadData();
    }).catch(function() {});
  }

  // 表单重置
  function resetForm() {
    cacheInfo.value = {};
    dbDataList.value=[];
    cacheDataList.value=[];
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
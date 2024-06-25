<template>

  <!-- 详情对话框 -->
  <el-dialog :title="cacheInfoTitle" v-model="cacheInfoOpen" width="700px" append-to-body class="customDialogCss">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="refresh" @click="refresh" v-hasPermi="['auth:sysFunc:cacheInfo']">刷新数据</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="refresh" @click="handleRefreshCache" v-hasPermi="['auth:sysFunc:refreshCache']">刷新缓存</el-button>
      </el-col>
      <el-col :span="1.5">
      <el-button type="danger" icon="CircleClose" @click="cacheInfoOpen=false">关闭窗口</el-button>
      </el-col>
    </el-row>
    
    <el-tabs v-loading="cacheInfoLoading" v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="功能点信息" name="info">
        <el-divider content-position="center">数据比对</el-divider>
        <el-row>
          <el-col :span="24" class="card-box" align="center">
            <!--数据-->
            <div style="padding: 0px 20px 0px 20px;">
              <el-steps align-center>
                <el-step title="数据库中数据" status="success" icon="coin"></el-step>
                <el-step title="缓存中数据" status="finish" icon="upload"></el-step>
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
      </el-tab-pane>
      <el-tab-pane label="用户限流" name="userLimit">
        <el-table :data="userLimitList" v-loading="cacheInfoLoading">
          <el-table-column label="KEY" prop="key" align="center" >
            <template #default="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="value" align="center" >
            <template #default="scope">
              <span>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="op" align="center" width="80">
            <template #default="scope">
              <el-button
                link
                type="danger"
                icon="delete"
                @click="handleDeleteLimit(scope.row)"
                v-hasPermi="['system:cache:deleteCacheKey']">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="系统限流" name="sysLimit">
        <el-table :data="sysLimitList" v-loading="cacheInfoLoading">
          <el-table-column label="KEY" prop="key" align="center" >
            <template #default="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="值" prop="value" align="center" >
            <template #default="scope">
              <span>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" prop="op" align="center" width="80">
            <template #default="scope">
              <el-button
                link
                type="danger" 
                icon="delete"
                @click="handleDeleteLimit(scope.row)"
                v-hasPermi="['system:cache:deleteCacheKey']">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="danger" icon="CircleClose" @click="cacheInfoOpen=false">关闭</el-button>
    </div>

  </el-dialog>

</template>

<script setup name="SysFuncCacheInfo">
  import { cacheInfo,refreshCache } from "@/api/auth/sysFunc";
  import {parseJsonToTree} from "@/utils/mulanbay";
  import { deleteCacheKey } from "@/api/system/cache";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const cacheInfoTitle = ref('缓存详情');
  const cacheInfoOpen = ref(false);
  const cacheInfoLoading = ref(false);
  const activeName = ref('info');

  const funcId = ref();
  const dbDataList = ref([]);
  const cacheDataList = ref([]);
  const userLimitList = ref([]);
  const sysLimitList = ref([]);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (id) => {
    cacheInfoOpen.value = true;
    funcId.value = id;
    loadData();
  }

  /** 加载数据 */
  function loadData() {
    resetForm();
    cacheInfoLoading.value = true;
    cacheInfo(funcId.value).then(response => {
      cacheInfoLoading.value = false;
      let diTree = parseJsonToTree(response.dbData);
      dbDataList.value = diTree;
      let dbData = response.dbData ;
      let cacheData = response.cacheData ; 
      let datas = new Array();
      //不相同的增加标识
      for(let key in cacheData){
        if(cacheData[key]!= dbData[key]){
          cacheData[key] = cacheData[key]+'***';
        }
      }
      let cdTree = parseJsonToTree(cacheData);
      cacheDataList.value = cdTree;
      //限流
      userLimitList.value = response.userLimitList;
      sysLimitList.value = response.sysLimitList;
    });
  }

  /** 刷新 */
  function refresh() {
    loadData();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    dbDataList.value = [];
    cacheDataList.value = [];
    userLimitList.value = [];
    sysLimitList.value = [];
  }
  
  /** 删除按钮操作 */
  function handleDeleteLimit(row) {
    const key = row.name;
    proxy.$confirm('是否确认删除"' + key + '"的数据项?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteCacheKey(key);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      refresh();
    }).catch(function() {});
  }
  
  
  function handleClick() {
  
  }
  
  function isChanged(s){
    if(proxy.isEmpty(s)){
      return false;
    }else{
      s=''+s;
      return s.indexOf("***")!=-1;
    }
  }
  
  /** 刷新系统缓存 */
  function handleRefreshCache() {
    refreshCache(funcId.value).then(response => {
      proxy.$modal.msgSuccess("刷新成功");
      refresh();
    });
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="业务类型" prop="bussType">
        <el-select v-model="queryParams.bussType" clearable style="width: 240px" placeholder="请选择">
          <el-option
            v-for="dict in bussTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="TrendCharts" @click="handleQuery" v-hasPermi="['report:stat:userStat:statList']">统计</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="refresh" @click="resetStat" v-hasPermi="['report:stat:userStat:deleteStatCache']">强制刷新</el-button>
      </el-form-item>
    </el-form>

    <el-row v-loading="loading">
      <template v-for="item in statResultList">
        <el-col :span="12" class="card-box">
          <el-card>
            <el-row>
            <el-col :span="16">
              <div>
                <el-descriptions class="margin-top" :column="1" border labelStyle="width: 120px">
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <el-icon><StarFilled /></el-icon>
                        统计名称
                      </div>
                    </template>
                    <div class="cell">
                      <el-tooltip class="item" effect="dark" :content="item.userStat.title" placement="top">
                        <el-button round plain type="success">
                          {{ formatTitle(item.userStat.title) }}
                        </el-button>
                      </el-tooltip>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">
                        <el-icon><Histogram /></el-icon>
                        统计值
                      </div>
                    </template>
                    <div class="cell">
                      <span v-if="item.overValue>0" style="color:red ;">
                        {{ item.statValue+item.userStat.unit }}
                      </span>
                      <span v-else style="color:#2E8B57 ;">
                        {{ item.statValue+item.userStat.unit }}
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Ticket /></el-icon>
                      期望值
                    </template>
                    <div class="cell">{{ item.userStat.compareTypeName+item.userStat.expectValue+item.userStat.unit }}</div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Share /></el-icon>
                      业务类型
                    </template>
                    <div class="cell">
                    {{ item.userStat.template.bussTypeName }}
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <el-icon><Grid /></el-icon>
                      操作选择
                    </template>
                    <div class="cell">
                    <el-button link icon="tools" type="primary" @click="showRemindSet(item.userStat.statId)" size="small">配置提醒</el-button>
                    <el-button link icon="refresh" type="primary" @click="refreshStat(item.userStat.statId)" v-hasPermi="['report:stat:userStat:deleteStatCache']" size="small">刷新</el-button>
                    <el-button link icon="Promotion" type="primary" @click="handleDispatch(item.userStat.template.url)" v-hasPermi="['report:stat:userStat:list']" size="small">详情</el-button>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
            <el-col :span="8">
              <table border="0" style="margin: auto" align="right">
                <tbody>
                  <tr>
                    <td>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span v-if="'MORE'==item.userStat.comapreType">
                        <el-progress type="circle" :percentage="getPercent(item.statValue,item.userStat.expectValue)" :color="progressColors2"></el-progress>
                      </span>
                      <span v-else>
                        <el-progress type="circle" :percentage="getPercent(item.statValue,item.userStat.expectValue)" :color="progressColors"></el-progress>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <el-text class="mx-1" type="warning">
                        <br>
                        统计值/期望值-比例
                      </el-text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </el-col>
            </el-row>
          </el-card>
        </el-col>
      </template>

    </el-row>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 提醒表单 -->
    <UserStatRemindForm ref="userStatRemindFormRef" />
    
  </div>
</template>

<script setup name="UserStatStatList">
  import { getUserStatStatList,deleteStatCache } from "@/api/report/stat/userStat";
  import { getPercent,ellipsis,progressColors,progressColors2,getQueryObject } from "@/utils/mulanbay";
  import UserStatRemindForm from '../userStatRemind/form.vue'

  const { proxy } = getCurrentInstance();
  const userStatRemindFormRef = ref();

  const loading = ref(false);
  // 总条数
  const total = ref(0);
  const bussTypeOptions = ref([]);
  const statResultList = ref([]);
  const data = reactive({
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { queryParams } = toRefs(data);

  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
  }
  
  /** 提醒配置 */
  function showRemindSet(statId){
    userStatRemindFormRef.value.openForm(statId);
  }
  
  /** 路由定向 */
  function handleDispatch(pathName) {
    //路由定向
    proxy.$router.push({ name: pathName, query: {} })
  }
  
  /** 刷新 */
  function resetStat() {
    refreshStat(null);
  }

  /** 刷新单个 */
  function refreshStat(statId) {
    let title = "是否要清除所有的统计缓存？";
    if(statId!=null){
      title = "是否要清除该项的统计缓存？";
    }
    let postData={
      statId:statId
    }
    proxy.$confirm(title, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteStatCache(postData);
    }).then(() => {
      proxy.$modal.msgSuccess("清除成功");
      getList();
    }).catch(function() {});
  }

  /** 省略显示 */
  function formatTitle(title) {
    let s = ellipsis(title, 10);
    return s;
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

  function getList() {
    loading.value = true;
    statResultList.value = [];
    getUserStatStatList(queryParams.value).then(
      response => {
        statResultList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {
    let qb = getQueryObject(null);
    queryParams.value.bussType = qb.bussType;
    getList();
    loadOptions();
  })
</script>
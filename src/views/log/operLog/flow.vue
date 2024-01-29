<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="关联类名" prop="beanName">
        <el-select
          v-model="queryParams.beanName"
          placeholder="关联类名"
          clearable
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in beanNameOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="主键编号" prop="idValue">
        <el-input
          v-model="queryParams.idValue"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="操作类型" prop="funcTypes">
        <el-select
          v-model="queryParams.funcTypes"
          placeholder="操作类型"
          clearable
          multiple
          collapse-tags
          style="width: 240px">
          <el-option
            v-for="dict in funcTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
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
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['log:operLog:flow']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--数据-->
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <el-timeline v-loading="loading" :reverse="reverse">
              <template v-for="item in flowList">
                <el-timeline-item :timestamp="item.occurEndTime" type="primary" placement="top">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <el-icon>
                        <StarFilled />
                      </el-icon>
                      <el-tag v-if="item.funcTypeName!=null">{{ item.funcTypeName }}</el-tag>
                      <el-divider direction="vertical"></el-divider>
                      <span v-if="item.sysFunc!=null">
                        {{ item.sysFunc.funcName }}
                      </span>
                      <el-button link style="float: right; padding: 3px 0" icon="InfoFilled" @click="handleDetail(item.id)"
                        v-hasPermi="['log:operLog:get']">
                        请求参数
                      </el-button>
                    </div>
                    <div>
                      <el-descriptions class="margin-top" :column="1" border>
                        <el-descriptions-item>
                          <template #label>
                            <div class="cell-item">
                              <el-icon>
                                <house />
                              </el-icon>
                              操作编号
                            </div>
                          </template>
                          {{ item.id}}
                        </el-descriptions-item>
                        <el-descriptions-item>
                          <template #label>
                            <div class="cell-item">
                              <el-icon>
                                <user />
                              </el-icon>
                              操作用户
                            </div>
                          </template>
                          <span v-if="item.userId!=null">{{ item.username+'  (ID:'+item.userId +')'}}</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                          <template #label>
                            <div class="cell-item">
                              <el-icon>
                                <timer />
                              </el-icon>
                              操作时间
                            </div>
                          </template>
                          <span>{{ item.occurStartTime}}</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                          <template #label>
                            <div class="cell-item">
                              <el-icon>
                                <StarFilled />
                              </el-icon>
                              请求IP
                            </div>
                          </template>
                          <span>{{ item.ipAddress}}</span>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </el-card>
                </el-timeline-item>
              </template>
            </el-timeline>
          </div>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.page"
            v-model:limit="queryParams.pageSize"
            @pagination="getList" />

        </el-card>
      </el-col>
      <el-col :span="12" class="card-box" align="center">
        <el-card>
          <el-divider content-position="center">参数详情</el-divider>
        </el-card>
        <el-card v-loading="detailLoading">
          <div class="chart-wrapper">
            <DataList ref="dataListRef" />
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup name="OperLogFlow">
  import { getFlowList, getOperLog } from "@/api/log/operLog";
  import { getDomainClassList } from "@/api/common";
  import { deepClone, getQueryObject } from "@/utils/mulanbay";
  import DataList from '../../common/jsonTreeTable'

  //加载层
  const loading = ref(false);
  // 总条数
  const total = ref(0);
  //数据
  const flowList = ref([]);
  const detailLoading = ref(false);
  const reverse = ref(false);

  const beanNameOptions = ref([]);
  const funcTypeOptions = ref([]);
  //子页面
  const dataListRef = ref();

  const { proxy } = getCurrentInstance();

  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      beanName: undefined,
      idValue: undefined,
      funcTypes: ['CREATE', 'EDIT', 'DELETE', 'SEARCH', 'STAT', 'OTHER'],
      page: 1,
      pageSize: 10
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 搜索按钮操作 */
  function handleQuery() {
    dataListRef.value.showData(null);
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    dataListRef.value.showData(null);
    handleQuery();
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    flowList.value = [];
    let qp = proxy.addDateRange(queryParams.value, dateRange.value);
    let acQueryParams = deepClone(qp);
    if (acQueryParams.funcTypes != null) {
      acQueryParams.funcTypes = acQueryParams.funcTypes.join(',');
    }
    getFlowList(acQueryParams).then(
      response => {
        flowList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 获取详情 */
  function handleDetail(id) {
    detailLoading.value = true;
    getOperLog(id).then(
      response => {
        dataListRef.value.showData(JSON.parse(response.paras));
        detailLoading.value = false;
      }
    );

  }

  /** 初始化 **/
  onMounted(() => {
    let qb = getQueryObject(null);
    if (qb.beanName != null) {
      //业务页面进来
      queryParams.value.beanName = qb.beanName;
      queryParams.value.idValue = qb.idValue;
      getList();
    }
    getDomainClassList().then(response => {
      beanNameOptions.value = response;
    });
    proxy.getEnumDict('FunctionType', 'FIELD', false).then(response => {
      funcTypeOptions.value = response;
    });
  })
</script>
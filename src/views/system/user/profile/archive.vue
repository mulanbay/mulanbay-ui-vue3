<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item v-if="moreCdn==true" label="起止日期" style="width: 308px">
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
      <el-form-item label="排序方式" prop="sortType">
        <el-select
          v-model="queryParams.sortField"
          placeholder="排序字段"
          @change="handleQuery"
          style="width: 120px">
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="排序方式"
          @change="handleQuery"
          style="width: 120px">
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="业务类型" prop="bussType">
        <el-select
          v-model="queryParams.bussType"
          placeholder="业务类型"
          clearable
          style="width: 240px">
          <el-option
            v-for="dict in bussTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['life:archive:list']">搜索</el-button>
        <el-button icon="refresh" @click="resetQuery">重置</el-button>
        <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate" v-hasPermi="['life:archive:create']">新增</el-button>
      </el-form-item>
    </el-form>


    <el-timeline v-loading="loading">
      <template v-for="item in archiveList">
        <el-timeline-item :timestamp="item.date" :type="item.type" placement="top">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg-icon :icon-class="item.icon" />
              <span class="link-type" @click="handleEdit(item)">
                {{ item.title }}
              </span>
              <el-divider direction="vertical"></el-divider>
              <el-tag>{{ item.dayDesc }}</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-tag v-if="true==item.bmn" type="danger">本命年</el-tag>
              <el-button link type="danger" style="color: red;float: right; padding: 3px 0" icon="delete" @click="handleDelete(item)"
                v-hasPermi="['life:archive:delete']">
                删除
              </el-button>
              <el-button link type="success" style="float: right; padding: 3px 0" icon="InfoFilled" @click="handleSource(item)"
                v-hasPermi="['life:archive:getSource']" v-if="item.sourceId!=null">
                原始信息
              </el-button>
              <el-button link type="success" style="float: right; padding: 3px 0 ;color: green;" icon="Clock">
                {{item.tillNow}}
              </el-button>
            </div>
            <div>
              <el-descriptions class="margin-top" :column="1" border labelStyle="width: 100px">
                <el-descriptions-item>
                  <template #label>
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                    档案内容
                  </template>
                  <div class="cell">{{ item.content }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                    距离现在
                  </template>
                  <div class="cell">{{ item.tillNow }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                    上条间隔
                  </template>
                  <div class="cell">{{ item.gapDaysDesc }}</div>
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

    <!-- 表单 -->
    <ArchiveForm ref="archiveFormRef" @success="getList" />

    <!-- 原始信息详情 -->
    <el-dialog :title="sourceDetaiTitle" width="650px" v-model="sourceDetaiOpen" append-to-body class="customDialogCss">
      <SourceDetail ref="sourceDetailRef"></SourceDetail>
    </el-dialog>

  </div>
</template>

<script setup name="Archive">
  import { fetchList, deleteArchive, getArchiveSource } from "@/api/life/archive";
  import { getBussIconClass } from "@/utils/planUtils";
  import { dateDiff, tillNowDays, formatDays } from "@/utils/datetime";
  import ArchiveForm from '../../../life/archive/form.vue';
  import SourceDetail from '../../../common/jsonTreeTable';

  const { proxy } = getCurrentInstance();

  const archiveFormRef = ref(true);
  const sourceDetailRef = ref();

  //请求参数
  // 弹出层标题
  const sourceDetaiTitle = ref("");
  // 是否显示弹出层
  const sourceDetaiOpen = ref(false);

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
  // 查询列表数据
  const archiveList = ref([]);
  const sortTypeOptions = ref([]);
  const sortFieldOptions = ref([]);
  const bussTypeOptions = ref([]);
  const birthday = ref();

  // 弹出层标题
  const title = ref("");
  // 是否显示弹出层
  const open = ref(false);

  //查询条件更多属性 start
  const cdnTitle = ref("更多");
  const moreCdn = ref(false);


  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    form: {},
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'date',
      sortType: 'desc'
    },
    rules: {

    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 打开弹窗 */
  const showData = async (userData) => {
    birthday.value = userData.birthday;
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

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

  /** 新增 */
  function handleCreate() {
    archiveFormRef.value.openForm(null, 'create');
  }

  /** 修改 */
  function handleEdit(row) {
    archiveFormRef.value.openForm(row.archiveId, 'edit');
  }

  /** 原始信息 */
  function handleSource(row) {
    if (proxy.isEmpty(row.sourceId)) {
      proxy.$modal.msgWarning("无原始信息");
      return;
    }
    proxy.$modal.loading("正在加载数据，请稍候！");
    getArchiveSource(row.archiveId).then(response => {
      proxy.$modal.closeLoading();
      sourceDetaiOpen.value = true;
      sourceDetaiTitle.value = '档案(' + row.title + ')原始信息详情';
      setTimeout(function() {
        sourceDetailRef.value.showData(response);
      }, 100);
    });
  }

  /** 删除按钮操作 */
  function handleDelete(row) {
    const deleteIds = row.archiveId;
    proxy.$confirm('是否确认删除"' + row.title + '"的档案信息?', "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(function() {
      return deleteArchive(deleteIds);
    }).then(() => {
      proxy.$modal.msgSuccess("删除成功");
      getList();
    }).catch(function() {});
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    archiveList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        let datas = response.rows;
        const n = datas.length;
        for (let i = 0; i < n; i++) {
          let d = datas[i];
          d.icon = getBussIconClass(d.bussType);
          //console.log(JSON.stringify(props.user));
          let days = dateDiff(birthday.value, d.date);
          if (days <= 31) {
            d.dayDesc = days + '天';
          } else if (days <= 366) {
            d.dayDesc = (days / 30).toFixed(0) + '个月';
          } else {
            let years = (days / 365).toFixed(0);
            if (years % 12 === 0) {
              d.bmn = true;
            }
            d.dayDesc = years + '岁';
          }
          d.type = 'primary';
          d.tillNow = getTillNow(d);
          //计算档案间的间隔
          if (n > 1 && i < n - 1) {
            let previousData = datas[i + 1];
            let gapDays = dateDiff(previousData.date, d.date);
            let gapDaysDesc = formatDays(gapDays);
            d.gapDaysDesc = gapDaysDesc + '(-->' + previousData.title + ')';
          }
          archiveList.value.push(d);
        }
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 获取距今时间 */
  function getTillNow(row) {
    let days = tillNowDays(null, row.date);
    let ss = formatDays(0 - days);
    if (days < -30) {
      ss += '(' + (0 - days).toFixed(0) + '天)';
    }
    return ss;
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    queryParams.value.page = 1;
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.archiveId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 初始化 **/
  onMounted(() => {
    proxy.getEnumDict('BussType', 'FIELD', false).then(response => {
      bussTypeOptions.value = response;
    });
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
    proxy.getDictItemTree('ARCHIVE_SORT_FIELD', false).then(response => {
      sortFieldOptions.value = response;
    });
  })
</script>
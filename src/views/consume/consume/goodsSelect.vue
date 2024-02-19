<template>
  <div class="app-container">
    <el-dialog :title="title" v-model="open" width="850px" append-to-body class="customDialogCss">
      <el-card>
        <el-descriptions class="margin-top" title="商品关联信息" :column="1" border>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon>
                  <Shop />
                </el-icon>
                当前所选商品
              </div>
            </template>
            <span>
              {{ consumeInfo.goodsName}}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card>
        <el-form :model="queryParams" ref="queryForm" :inline="true">
          <el-form-item label="名称检索" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item v-show="moreCdn==true" label="起止日期" style="width: 308px">
            <el-date-picker
              v-model="dateRange"
              unlink-panels
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="datePickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item v-show="moreCdn==true" label="商品类型" prop="goodsTypeId">
            <el-tree-select
              v-model="queryParams.goodsTypeId"
              style="width: 240px"
              :data="goodsTypeOptions"
              :props="{ value: 'id', label: 'text', children: 'children' }"
              value-key="id"
              placeholder="选择商品类型"
              check-strictly
              clearable />
          </el-form-item>
          <el-form-item v-show="moreCdn==true" label="购买来源" prop="sourceId">
            <el-select
              v-model="queryParams.sourceId"
              placeholder="购买来源"
              clearable
              style="width: 240px">
              <el-option
                v-for="dict in sourceOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-show="moreCdn==true" label="排序方式" prop="sortField">
            <el-select
              v-model="queryParams.sortField"
              placeholder="字段"
              clearable
              style="width: 120px">
              <el-option
                v-for="dict in sortFieldOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
            <el-select
              v-model="queryParams.sortType"
              placeholder="方式"
              clearable
              style="width: 120px">
              <el-option
                v-for="dict in sortTypeOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-show="moreCdn==true" label="是否二手" prop="secondhand">
            <el-select
              v-model="queryParams.secondhand"
              placeholder="二手类型"
              clearable
              style="width: 240px">
              <el-option
                v-for="dict in secondhandOptions"
                :key="dict.id"
                :label="dict.text"
                :value="dict.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['consume:consume:list']">搜索</el-button>
            <el-button icon="refresh" @click="resetQuery">重置</el-button>
            <el-button type="warning" icon="more" @click="handleMoreCdn">{{cdnTitle}}</el-button>
          </el-form-item>
        </el-form>

        <!--列表数据-->
        <el-table v-loading="loading" :data="consumeList">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="商品名称" fixed="left" min-width="250px" :show-overflow-tooltip="true">
            <template #default="scope">
              <span v-if="scope.row.tags != null">
                <el-icon>
                  <Shop />
                </el-icon>
              </span>
              <span v-if="scope.row.pid != null">
                <el-icon color="red">
                  <StarFilled />
                </el-icon>
              </span>
              <span v-if="scope.row.consumeType == 'TREAT'">
                <el-icon color="yellowgreen">
                  <StarFilled />
                </el-icon>
              </span>
              <span v-if="scope.row.secondhand==true" style="color: green;">
                <el-tag type="warning">二手</el-tag>
              </span>
              <span>{{ scope.row.goodsName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="购买日期" align="center" width="190">
            <template #default="scope">
              <span>{{ scope.row.buyTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="关联关系" fixed="left" align="center" width="80">
            <template #default="scope">
              <span v-if="scope.row.consumeId == consumeInfo.consumeId" style="color: rebeccapurple;">
                当前商品
              </span>
            </template>
          </el-table-column>
          <el-table-column label="购买来源" align="center" width="95">
            <template #default="scope">
              <span>{{ scope.row.source.sourceName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品类型" align="center" width="120">
            <template #default="scope">
              <span>{{ scope.row.goodsType.typeName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总价" align="center" width="95">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.totalPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80" fixed="right" class-name="small-padding fixed-width">
            <template #default="scope">
              <span v-if="scope.row.consumeId!=consumeInfo.consumeId">
                <el-button
                  link
                  type="success"
                  icon="plus"
                  @click="handleSelect(scope.row)">选择
                </el-button>
              </span>
              <span v-else-if="scope.row.consumeId==consumeInfo.consumeId">
                <el-tooltip content="当前商品" effect="dark" placement="top">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.page"
          v-model:limit="queryParams.pageSize"
          @pagination="getList" />

      </el-card>
    </el-dialog>
  </div>

</template>

<script setup name="GoodsSelect">
  import { fetchList, getConsume } from "@/api/consume/consume";
  import { getConsumeSourceTree } from "@/api/consume/consumeSource";
  import { getGoodsTypeTree } from "@/api/consume/goodsType";

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('商品选择');
  const open = ref(false);
  const formRef = ref();
  
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
  const consumeList = ref([]);
  const cascaded = ref(true);

  const goodsTypeOptions = ref([]);
  const sourceOptions = ref([]);
  const sortFieldOptions = ref([]);
  const sortTypeOptions = ref([]);
  const secondhandOptions = ref([]);
  //日期范围快速选择
  const datePickerOptions = ref(proxy.datePickerOptions);
  const dateRange = ref([]);

  const data = reactive({
    consumeInfo: {},
    queryParams: {
      page: 1,
      pageSize: 10,
      sortField: 'buyTime',
      sortType: 'desc',
    }
  });

  const { consumeInfo, queryParams } = toRefs(data);

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

  /** 下拉框加载 */
  function loadOptions() {
    getConsumeSourceTree().then(response => {
      sourceOptions.value = response;
    });
    getGoodsTypeTree().then(response => {
      goodsTypeOptions.value = response;
    });
    proxy.getDictItemTree('SECONDHAND', false).then(response => {
      secondhandOptions.value = response;
    });
    proxy.getDictItemTree('CONSUME_SORT_FIELD', false).then(response => {
      sortFieldOptions.value = response;
    });
    proxy.getDictItemTree('SORT_TYPE', false).then(response => {
      sortTypeOptions.value = response;
    });
  }

  /** 查询列表 */
  function getList() {
    loading.value = true;
    consumeList.value = [];
    fetchList(proxy.addDateRange(queryParams.value, dateRange.value)).then(
      response => {
        consumeList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
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

  /** 选择商品 */
  function handleSelect(row) {
    open.value=false;
    // 发送选择的事件
    emit('confirmSelect', row);
  }

  /** 加载消费信息 */
  function loadConsumeData(consumeId) {
    consumeInfo.value = {};
    if (consumeId == null) {
      return;
    }
    consumeInfo.value.consumeId = consumeId;
    getConsume(consumeId).then(response => {
      consumeInfo.value.goodsName = response.goodsName;
    });
  }

  // 定义 confirmSelect 事件，用于操作成功后的回调
  const emit = defineEmits(['confirmSelect']);

  /** 打开弹窗 */
  const openForm = async (consumeId) => {
    open.value=true;
    loadConsumeData(consumeId);
    loadOptions();
    getList();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  /** 初始化 **/
  onMounted(() => {

  })
</script>
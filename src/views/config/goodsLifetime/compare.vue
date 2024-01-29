<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="配置" prop="lifetimeId">
        <el-select
          v-model="queryParams.lifetimeId"
          placeholder="商品类型"
          clearable
          style="width: 220px"
          @change="match">
          <el-option
            v-for="dict in lifetimeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="refresh" @click="matchNext()" v-hasPermi="['config:goodsLifetime:getAndMath']">换一批</el-button>
        <el-button type="primary" icon="plus" @click="handleCreate()" v-hasPermi="['config:goodsLifetime:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="32" v-loading="compareLoading">
      <el-col :span="24" class="card-box">
        <div>
          <el-descriptions class="margin-top" :column="1" border :labelStyle="{width: '120px'}">
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  匹配分类
                </div>
              </template>
              <span>
                {{ matchInfo.lifetimeName}}
              </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  匹配度
                </div>
              </template>
              <span>
                {{ matchInfo.match}}
              </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  设计寿命
                </div>
              </template>
              <span>
                {{ matchInfo.daysInfo}}
                <el-button type="success" v-if="queryParams.lifetimeId!=null" icon="edit" size="small" @click="handleEdit()" v-hasPermi="['config:goodsLifetime:edit']">修改</el-button>
              </span>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  使用时长
                </div>
              </template>
              <span>
                {{ matchInfo.usedDaysInfo}}
              </span>
            </el-descriptions-item>
            <el-descriptions-item v-if="matchInfo.usedRateInfo!=null">
              <template #label>
                <div class="cell-item">
                  <el-icon>
                    <StarFilled />
                  </el-icon>
                  实际/设计
                </div>
              </template>
              <span>
                {{ matchInfo.usedRateInfo}}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="end">
      <el-col :span="6">
        <div class="grid-content bg-purple-light">
          <span v-if="lifetimeCompareData.needCallback==true" slot="footer" class="dialog-footer">
            <el-button type="primary" icon="check" @click="handleConfirm()">确定</el-button>
          </span>
        </div>
      </el-col>
    </el-row>

    <!-- 表单 -->
    <GoodsLifetimeForm ref="formRef" @success="getAndMath" />

  </div>

</template>

<script setup name="ConsumeUseTimeDetail">
  import { getAndMathGoodsLifetime, compareAndMathGoodsLifetime } from "@/api/config/goodsLifetime";
  import { formatDays } from "@/utils/datetime";
  import { getPercent } from "@/utils/mulanbay";
  import GoodsLifetimeForm from './form.vue'

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  // 遮罩层
  const compareLoading = ref(false);
  // 查询列表数据
  const lifetimeOptions = ref([]);

  const data = reactive({
    matchInfo: {},
    lifetimeCompareData: {},
    queryParams: {
      page: 1,
      pageSize: 10
    }
  });

  const { matchInfo, lifetimeCompareData, queryParams } = toRefs(data);

  /** 新增按钮操作 */
  function handleCreate() {
    formRef.value.openForm(null, 'create');
  }

  /** 修改按钮操作 */
  function handleEdit() {
    const id = queryParams.value.lifetimeId;
    if (proxy.isEmpty(id)) {
      proxy.$modal.msgError('没有选择数据');
      return;
    }
    formRef.value.openForm(id, 'edit');
  }

  /** 获取和匹配 */
  function getAndMath() {
    compareLoading.value = true;
    queryParams.value.goodsName = lifetimeCompareData.value.goodsName;
    getAndMathGoodsLifetime(queryParams.value).then(response => {
      compareLoading.value = false;
      let configList = response.configs.beanList;
      let n = configList.length;
      if (n <= 0) {
        proxy.$modal.msgError('没有更多数据');
        queryParams.value.page = 1;
        return;
      }
      lifetimeOptions.value = [];
      for (let index = 0; index < n; index++) {
        let elem = configList[index];
        lifetimeOptions.value.push({
          id: elem.lifetimeId,
          text: elem.lifetimeName
        });
      }
      matchInfo.value = response.match;
      if (matchInfo.value != null) {
        queryParams.value.lifetimeId = matchInfo.value.lifetimeId;
        matchInfo.value.daysInfo = formatDays(matchInfo.value.days);
      } else {
        matchInfo.value = {};
      }
      compareUseInfo();
    });
  }

  /** 下拉框选择操作操作 */
  function match(val) {
    queryParams.value.goodsName = lifetimeCompareData.value.goodsName;
    compareAndMathGoodsLifetime(queryParams.value).then(response => {
      matchInfo.value = response;
      matchInfo.value.daysInfo = formatDays(matchInfo.value.days);
      compareUseInfo();
    });
  }

  /** 比对实际使用 */
  function compareUseInfo() {
    let usedDays = lifetimeCompareData.value.usedDays;
    if (usedDays != null) {
      matchInfo.value.usedDaysInfo = formatDays(usedDays);
      let p = 0;
      if (matchInfo.value.days >= usedDays) {
        p = getPercent(usedDays, matchInfo.value.days).toFixed(0) + '%';
      } else {
        p = (usedDays / matchInfo.value.days).toFixed(1) + '倍';
      }
      matchInfo.value.usedDays = usedDays;
      matchInfo.value.usedRateInfo = p;
    }
  }

  /** 换一批按钮操作 */
  function matchNext() {
    queryParams.value.page = queryParams.value.page + 1;
    getAndMath();
  }

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const compareData = async (cdData) => {
    lifetimeCompareData.value = cdData;
    getAndMath();
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ compareData });

  /** 初始化 **/
  onMounted(() => {

  })
</script>
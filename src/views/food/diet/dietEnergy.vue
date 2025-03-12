<template>
  <!-- 对话框 -->
  <el-dialog :title="title" v-model="open" width="850px" append-to-body class="customDialogCss">
    <div class="app-container">
      <el-form ref="queryRef" :model="queryParams" label-width="90px" :inline="true">
        <el-form-item label="日期" style="width: 308px">
          <el-date-picker type="date" v-model="queryParams.date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
            placeholder="请选择时间" clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="餐次" prop="dietType">
          <el-select
            v-model="queryParams.dietType"
            placeholder="餐次"
            clearable
            style="width: 115px"
          >
            <el-option
              v-for="dict in dietTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery" v-hasPermi="['food:diet:energyList']">搜索</el-button>
        </el-form-item>
      </el-form>

      <div>
        <el-table v-loading="loading" :data="dataList" show-summary >
          <el-table-column label="时间" align="center" width="120">
            <template #default="scope">
              <span>{{ scope.row.diet.occurTime.substr(11,5) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="食物" align="center">
            <template #default="scope">
              <span class="link-type" @click="handleEditEnergy(scope.row.energy)">{{ scope.row.energy.foodName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="热量" align="center" prop="cal" >
            <template #default="scope">
              <span v-if="scope.row.energy.cal!=null">{{ scope.row.energy.cal }}卡</span>
            </template>
          </el-table-column>
          <el-table-column label="单位" align="center">
            <template #default="scope">
              <span v-if="scope.row.energy.cal!=null">{{ scope.row.energy.amount+scope.row.energy.unit }}</span>
            </template>
          </el-table-column>
          <el-table-column label="餐次" align="center">
            <template #default="scope">
              <span>{{ scope.row.diet.dietTypeName }}</span>
            </template>
          </el-table-column>
        </el-table>
        
      </div>
    </div>
  </el-dialog>

  <!-- 表单 -->
  <FoodEnergyForm ref="formRef" @success="handleQuery" />
  
</template>

<script setup name="DietEnergyList">
  import { getEnergyList,getDiet } from "@/api/food/diet";
  import FoodEnergyForm from '../foodEnergy/form.vue'

  const { proxy } = getCurrentInstance();

  const dataList = ref([]);
  const dietTypeOptions = ref([]);
  const formRef = ref();
  
  //可执行时间段
  const title = ref('热量信息');
  const open = ref(false);
  const loading = ref(false);

  const data = reactive({
    queryParams: {
      
    },
    rules: {}
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (dietId) => {
    open.value = true;
    dataList.value= [];
    //queryParams.value.dietId = dietId;
    proxy.$nextTick(() => {
      initQuery(dietId);
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });
  
  /** 初始化查询 */
  function initQuery(dietId){
    getDiet(dietId).then(response => {
      queryParams.value.date  = response.occurTime;
      queryParams.value.dietType  = response.dietType;
      handleQuery();
    });
  }
  
  /** 下拉框加载 */
  function loadOptions() {
    proxy.getEnumDict('DietType', 'FIELD', false).then(response => {
      dietTypeOptions.value = response;
    });
  }
  
  /** 修改热量配置按钮操作 */
  function handleEditEnergy(eg){
    formRef.value.openForm(eg.foodId, 'edit',eg.foodName);
  }
  
  /** 搜索按钮操作 */
  function handleQuery() {
    //queryParams.value.page = 1;
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    getList();
  }

  // 表单重置
  function resetForm() {
    queryParams.value = {
    };
    proxy.resetForm("queryRef");
  }

  /** 图表 */
  function getList() {
    loading.value = true;
    dataList.value= [];
    getEnergyList(queryParams.value).then(response => {
      loading.value = false;
      dataList.value= response;
    });
  }

  /** 初始化 **/
  onMounted(() => {
    loadOptions();
  })
</script>
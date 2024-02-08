<template>

  <!-- 刷新对话框 -->
  <el-dialog :title="title" v-model="open" width="850px" append-to-body>
    <el-form >
      <el-form-item>
        <el-button type="primary" icon="Histogram" @click="handleNextAchieveMilestone('CURRENT')">待实现的下一个里程碑（针对当前）</el-button>
        <el-button type="primary" icon="Histogram" @click="handleNextAchieveMilestone('WHOLE')">待实现的下一个里程碑(针对全部)</el-button>
        <el-button type="primary" icon="refresh" @click="handleQuery">刷新</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList">
      <el-table-column label="ID" fixed="left" prop="milestoneId" sortable="custom" align="center" width="120">
        <template #default="scope">
          <span>{{ scope.row.milestoneId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" fixed="left" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="handleEdit(scope.row)">{{ scope.row.milestoneName }}</span>
          <span v-if="scope.row.exercise != null">
           <el-tag type="success">已实现</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="运动类型" align="center">
        <template #default="scope">
          <span>{{ scope.row.sport.sportName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序号" align="center">
        <template #default="scope">
          <span>{{ scope.row.orderIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="别名" align="center" min-width="180px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.alais }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期望值" align="center">
        <template #default="scope">
          <span>{{ scope.row.value+scope.row.sport.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期望时间" align="center">
        <template #default="scope">
          <span>{{ scope.row.duration+'分钟' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费天数" align="center" min-width="140px" :show-overflow-tooltip="true">
        <template #default="scope">
          <span v-if="scope.row.costDays!=null">{{ formatDays(scope.row.costDays) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" width="180">
        <template #default="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.page"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />
      
  </el-dialog>

  <!-- 表单 -->
  <SportMilestoneForm ref="formRef" />

</template>

<script setup name="ExerciseMultiStat">
  import { getExerciseAchieveMilestones,getNextAchieveMilestone } from "@/api/sport/exercise";
  import { formatDays } from "@/utils/datetime";
  import SportMilestoneForm from './form.vue'

  const { proxy } = getCurrentInstance();

  //可执行时间段
  const title = ref('锻炼数据统计');
  const open = ref(false);
  const formRef = ref();
  const sportOptions = ref([]);
  const dataList = ref([]);
  // 总条数
  const total = ref(0);
  const loading = ref(false);

  const data = reactive({
    queryParams: {
      page:0
    },
    rules: {
      sportId: [
        { required: false, message: "运动类型不能为空", trigger: "blur" }
      ]
    }
  });

  const { queryParams, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (exerciseId) => {
    open.value = true;
    resetForm();
    queryParams.value.exerciseId=exerciseId;
    getList();
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


  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });

  // 表单重置
  function resetForm() {
    queryParams.value = {
      exerciseId: undefined
    };
    proxy.resetForm("queryRef");
  }
  
  /** 下一个里程碑 */
  function handleNextAchieveMilestone(type){
    let tt='';
    if(type=='CURRENT'){
      tt='待实现的下一个里程碑（针对当前）';
    }else{
      tt='待实现的下一个里程碑(针对全部)';
    }
    const para = {
      type:type,
      exerciseId:queryParams.value.exerciseId
    }
    getNextAchieveMilestone(para).then(response => {
      if(response!=null){
        formRef.value.openForm(response,'view',tt);
      }else{
        proxy.$modal.msgError("没有相关里程碑信息");
      }
    });
  }

  /** 提交表单 */
  function getList() {
    loading.value = true;
    getExerciseAchieveMilestones(queryParams.value).then(
      response => {
        dataList.value = response.rows;
        total.value = response.total;
        loading.value = false;
      }
    );
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
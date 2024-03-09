<template>

  <!-- 详情对话框 -->
  <el-dialog :title="detailTitle" v-model="detailOpen" width="650px" append-to-body class="customDialogCss">
    <!--列表数据-->
    <el-table
      v-loading="loading" 
      :data="dataList"
      row-key="id">
      <el-table-column label="序号" prop="id" sortable="custom" align="center">
        <template #default="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="得分" align="center">
        <template #default="scope">
          <span v-if="scope.row.score==0" style="color:red">
           {{ scope.row.score }}
          </span>
          <span v-else-if="scope.row.score==scope.row.maxScore" style="color:green">
           {{ scope.row.score }}
          </span>
          <span v-else>
            {{ scope.row.score }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="单项满分" align="center">
        <template #default="scope">
          <span>{{ scope.row.maxScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计值" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.statValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参考值" align="center" width="80">
        <template #default="scope">
          <span>{{ scope.row.limitValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="80">
        <template #default="scope">
          <el-tooltip :content="scope.row.remark" effect="dark" placement="top">
            <el-icon>
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    
    
  </el-dialog>

</template>

<script setup name="UserRScoreDetail">
  import { getUserScoreScoreDetail } from "@/api/data/userScore";

  const { proxy } = getCurrentInstance();
  const formRef = ref();

  //可执行时间段
  const detailTitle = ref('评分详情');
  const detailOpen = ref(false);
  const loading = ref(false);
  const dataList = ref([]);
  
  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (scoreId) => {
    detailOpen.value = true;
    dataList.value = [];
    loading.value = true;
    getUserScoreScoreDetail(scoreId).then(response => {
      loading.value = false;
      let totalScore=0;
      let totalMaxScore=0;
      for (let i = 0; i < response.length; i++) {
        let item = response[i];
        let row = {
          id:i+1,
          name:item.scoreConfig.configName,
          score:item.score,
          maxScore:item.scoreConfig.maxScore,
          statValue:item.statValue,
          limitValue:item.scoreConfig.limitValue,
          remark:item.scoreConfig.remark
        };
        dataList.value.push(row);
        totalScore+=response[i].score;
        totalMaxScore+=response[i].scoreConfig.maxScore;
      }
      let row = {
        id:'',
        name:'总分',
        score:totalScore,
        maxScore:totalMaxScore,
        statValue:'',
        limitValue:'',
        remark:''
      };
      dataList.value.push(row);
    });
  }
  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  /** 初始化 **/
  onMounted(() => {

  })
</script>
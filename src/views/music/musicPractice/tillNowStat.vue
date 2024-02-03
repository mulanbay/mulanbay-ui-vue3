<template>

  <!-- 详情对话框 -->
  <el-dialog :title="tnsTitle" v-model="tnsOpen" width="450px" append-to-body >
    <el-descriptions class="margin-top" :column="1" border>
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon>
              <house />
            </el-icon>
            总次数
          </div>
        </template>
        <span>
          {{ statData.totalCount +'次'}}
        </span>
      </el-descriptions-item>
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon><AlarmClock /></el-icon>
            总时长
          </div>
        </template>
        <span>
          {{ statData.totalHours +'小时'}}
        </span>
      </el-descriptions-item>
      <el-descriptions-item width="150px">
        <template #label>
          <div class="cell-item">
            <el-icon><AlarmClock /></el-icon>
            一万小时
          </div>
        </template>
        <span>
          {{ statData.mp +'%'}}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

</template>

<script setup name="MusicPracticeTillNowStat">
  import { getMusicPracticeTillNowStat } from "@/api/music/musicPractice";
  
  const { proxy } = getCurrentInstance();

  //可执行时间段
  const tnsTitle = ref('距离此刻的练习统计值');
  const tnsOpen = ref(false);

  const data = reactive({
    statData: {}
  });
  const { statData } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const showData = async (rowData) => {
    tnsOpen.value = true;
    tnsTitle.value='截止'+rowData.practiceDate+',['+rowData.instrument.instrumentName+']练习统计信息';
    resetForm();
    getMusicPracticeTillNowStat(rowData.practiceId).then(response => {
      statData.value={
        totalCount:response.totalCount,
        totalHours:(response.totalMinutes/60).toFixed(0),
        mp:(response.totalMinutes/60/10000*100).toFixed(0)
      }
    });
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  // 表单重置
  function resetForm() {
    statData.value={}
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
<template>

  <el-row>
    <el-col :span="24">
      <el-descriptions class="margin-top" :column="1" border>
        <el-descriptions-item label-class-name="my-label">
          <template #label>
            <div class="cell-item">
              <el-icon><StarFilled /></el-icon>
              业务名称
            </div>
          </template>
          {{ beanData.bussName}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><HomeFilled /></el-icon>
              标题
            </div>
          </template>
          {{ beanData.title}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Comment /></el-icon>
              内容
            </div>
          </template>
          {{ beanData.content}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              业务时间
            </div>
          </template>
          {{ beanData.bussDay}}
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon><Clock /></el-icon>
              创建时间
            </div>
          </template>
          {{ beanData.createdTime}}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>

</template>

<script setup name="BeanDetail">

  const { proxy } = getCurrentInstance();
  const data = reactive({
    beanData: {}
  });
  const { beanData } = toRefs(data);
  
  /** 打开弹窗 */
  const showData = async (data) => {
    if(data==null){
      beanData.value = {};
    }else{
      beanData.value = data;
    } 
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ showData });

  function handleClick() {

  }
  /** 初始化 **/
  onMounted(() => {

  })
</script>
<style>
  .my-label {
    width: 120px;
    color: #999;
    font-weight: normal;
    background: #fff;
  }
</style>
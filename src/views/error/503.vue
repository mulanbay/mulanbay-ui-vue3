<template>
  <div class="errPage-container">
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">
          系统停止服务!
        </h1>
        <h2>原因:{{msg}}</h2>
        <h6>对不起，系统暂时不提供服务</h6>
        <ul class="list-unstyled">
          <li class="link-type">
            <router-link to="/index">
              回首页
            </router-link>
          </li>
          <li class="link-type">
            <el-button
              link
              type="danger"
              @click="openForm()">解锁
            </el-button>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
    
    <!-- 表单编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="400px" append-to-body >
      <el-form ref="formRef" :model="form" :rules="rules" v-loading="formLoading" label-width="80px">
        <el-form-item label="解锁码" prop="unlockCode">
          <el-input type="password" v-model="form.unlockCode" placeholder="请输入解锁码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    
  </div>
</template>

<script setup>
  import errImage from "@/assets/401_images/401.gif";
  import { getQueryObject } from "@/utils/mulanbay";
  import { unlockSystem} from "@/api/system/system";

  let { proxy } = getCurrentInstance();
  //可执行时间段
  const title = ref('解锁系统');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();
  
  const errGif = ref(errImage + "?" + +new Date());
  const msg = ref();
  
  const data = reactive({
    form: {},
    // 表单校验
    rules: {
      unlockCode: [
        { required: true, message: "解锁码不能为空", trigger: "blur" }
      ]
    }
  });
  
  const { form, rules } = toRefs(data);
  
  function openForm(){
    open.value= true;
    form.value.unlockCode=undefined;
  }
  
  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
      if (valid) {
        unlockSystem(form.value).then(response => {
          if(true==response){
            proxy.$modal.msgSuccess("解锁成功");
            open.value = false;
            window.location.href = '/index';
          }else{
            proxy.$modal.msgError("解锁失败");
          }
        });
      }
    });
  }
  
  /** 初始化 **/
  onMounted(() => {
    let qb = getQueryObject(null);
    msg.value = qb.message;
  })
</script>

<style lang="scss" scoped>
  .errPage-container {
    width: 800px;
    max-width: 100%;
    margin: 100px auto;

    .pan-back-btn {
      background: #008489;
      color: #fff;
      border: none !important;
    }

    .pan-gif {
      margin: 0 auto;
      display: block;
    }

    .pan-img {
      display: block;
      margin: 0 auto;
      width: 100%;
    }

    .text-jumbo {
      font-size: 60px;
      font-weight: 700;
      color: #484848;
    }

    .list-unstyled {
      font-size: 14px;

      li {
        padding-bottom: 5px;
      }

      a {
        color: #008489;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
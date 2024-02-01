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
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
  import errImage from "@/assets/401_images/401.gif";
  import { getQueryObject } from "@/utils/mulanbay";

  let { proxy } = getCurrentInstance();

  const errGif = ref(errImage + "?" + +new Date());
  const msg = ref();
  
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
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar :user="user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ user.username }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户昵称
                <div class="pull-right">{{ user.nickname }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.phone }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="location" />常驻城市
                <div class="pull-right">{{ user.residentCity }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="level" />用户等级
                <div class="pull-right">
                  <svg-icon icon-class="v" />
                  {{ user.level + '('+user.levelName+')' }}
                  <span class="link-type" @click="msgAlert('提示','等级越高，解锁的功能越多,最高等级10级')"><i class="el-icon-question" /></span>
                  <el-button link type="primary" @click="handleSelfJudge"
                    v-hasPermi="['config:levelConfig:selfJudge']">
                    重评
                  </el-button>
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="points" />累计积分
                <div class="pull-right">{{ user.points }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="role" />所属角色
                <div class="pull-right">{{ user.roleName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建时间
                <div class="pull-right">{{ user.createdTime }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />过期时间
                <div class="pull-right">{{ user.expireTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>我的资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <UserInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <ResetPwd :user="user" />
            </el-tab-pane>
            <el-tab-pane label="用户设置" name="userSet">
              <UserSet />
            </el-tab-pane>
            <el-tab-pane label="快捷菜单" name="fastMenu">
              <FastMenu />
            </el-tab-pane>
            <el-tab-pane label="人生档案" name="archive">
              <Archive ref="archiveRef" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup name="Profile">
  import { getProfile } from "@/api/auth/user";
  import userAvatar from "./userAvatar";
  import UserInfo from "./userInfo.vue";
  import ResetPwd from "./resetPwd.vue";
  import FastMenu from "./fastMenu.vue";
  import Archive from "./archive.vue";
  import UserSet from "./userSet.vue";

  const archiveRef = ref();
  const activeTab = ref("userinfo");
  const state = reactive({
    user: {}
  });

  const { user } = toRefs(state);

  /** 获取用户信息 **/
  function getUser() {
    getProfile().then(response => {
      user.value = response;
      archiveRef.value.showData(response);
    });
  };

  function handleSelfJudge() {

  }

  /** 初始化 **/
  onMounted(() => {
    getUser();
  })
</script>
<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <MulanbayGit id="mulanbay-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <MulanbayDoc id="mulanbay-doc" class="right-menu-item hover-effect" />
        </el-tooltip>
        
        <el-tooltip content="锁定系统" effect="dark" placement="bottom" >
          <MulanbayLock id="mulanbay-lock" class="right-menu-item hover-effect"/>
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>
	  
	  <div class="right-menu">
	    <el-dropdown class="right-menu-item hover-effect" trigger="click">
	      <div class="right-menu">
	       快速导航
	      </div>
	      <template #dropdown>
	        <el-dropdown-menu slot="dropdown">
	          <template v-for="item in fastMenus">
	            <el-dropdown-item icon="Connection" @click.native="dispatchFastMenu(item.pathName)">{{ item.menuName }}</el-dropdown-item>
	          </template>
	        </el-dropdown-menu>
	      </template>
	    </el-dropdown>
	  </div>
	  
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="userStore.avatar" class="user-avatar" />
            <el-icon><caret-bottom /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
	import { ElMessageBox } from 'element-plus'
	import Breadcrumb from '@/components/Breadcrumb'
	import TopNav from '@/components/TopNav'
	import Hamburger from '@/components/Hamburger'
	import Screenfull from '@/components/Screenfull'
	import SizeSelect from '@/components/SizeSelect'
	import HeaderSearch from '@/components/HeaderSearch'
	import MulanbayGit from '@/components/Mulanbay/Git'
	import MulanbayDoc from '@/components/Mulanbay/Doc'
  import MulanbayLock from '@/components/Mulanbay/Lock'
	import useAppStore from '@/store/modules/app'
	import useUserStore from '@/store/modules/user'
	import useSettingsStore from '@/store/modules/settings'
	import {getIndexFastMenu} from "@/api/auth/fastMenu";

	const { proxy } = getCurrentInstance();
  const systemLockFormRef = ref();

	const appStore = useAppStore()
	const userStore = useUserStore()
	const settingsStore = useSettingsStore()

	//快捷菜单
	const fastMenus = ref([]);

	function toggleSideBar() {
	  appStore.toggleSideBar()
	}
	
	/** 快捷菜单 */
	function loadFastMenus(){
	  getIndexFastMenu().then(
	    response => {
	      let list = new Array();
	      const n = response.length;
	      for(let i=0;i<n;i++){
	        let s = response[i];
	        //pathName首字母大写
	        let menu={
	          menuName:s.menuName,
	          pathName:s.path.substring(0, 1).toUpperCase() + s.path.substring(1)
	        };
	        list.push(menu);
	      }
	      fastMenus.value = list;
	    }
	  );
	}
	
	/** 跳转 */
	function dispatchFastMenu(pathName){
	  proxy.$router.push({name:pathName,query: {}})
	}

	function handleCommand(command) {
	  switch (command) {
		case "setLayout":
		  setLayout();
		  break;
		case "logout":
		  logout();
		  break;
		default:
		  break;
	  }
	}

	function logout() {
	  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	  }).then(() => {
		userStore.logOut().then(() => {
		  location.href = '/index';
		})
	  }).catch(() => { });
	}

	const emits = defineEmits(['setLayout'])
	function setLayout() {
	  emits('setLayout');
	}
	
	/** 初始化 **/
	onMounted(() => {
	  loadFastMenus();
	})
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<template>
  <el-form ref="fastMenuFormRef" :model="fastMenuForm" label-width="80px">
    <el-form-item label="菜单列表">
      <el-tree
        :data="fastMenuOptions"
        show-checkbox
        ref="fastMenuTree"
        node-key="id"
        empty-text="加载中，请稍后"
		:check-strictly ="false"
      ></el-tree>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">保 存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
	import {getMenuTree,saveFastMenu} from "@/api/auth/fastMenu";

	const { proxy } = getCurrentInstance();

	const fastMenuOptions = ref([]);
	
	const data = reactive({
	  fastMenuForm: {}
	});
	
	const {fastMenuForm} = toRefs(data);

	/** 提交按钮 */
	function submitForm() {
	  let checkedKeys = proxy.$refs["fastMenuTree"].getCheckedKeys();
	  let menuIds = checkedKeys.join(',');
	  let postData ={
		  menuIds: menuIds
	  }
	  proxy.$modal.loading("正在刷新，请稍候！");
	  saveFastMenu(postData).then(
	    response => {
		  proxy.$modal.closeLoading();
	      proxy.$modal.msgSuccess("修改成功");
	    }
	  );
	}
	
	/** 关闭按钮 */
	function close() {
	  proxy.$tab.closePage();
	}
	
	function loadMenuTree(){
	  getMenuTree().then(
	    response => {
	      fastMenuOptions.value = response.treeData;
	      //设置已经勾选
	      //默认选中的树的数据
	      setTimeout(function() {
	        response.checkedKeys.forEach(value => {
	          proxy.$refs["fastMenuTree"].setChecked(value, true, false);
	        });
	      }, 500);
	    }
	  );
	}
	
	/** 初始化 **/
	onMounted(() => {
	  loadMenuTree();
	})
	
</script>

<template>
  <div class="app-container">
    <!-- 表单编辑对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-input v-model="addressKeyword" placeholder="请输入地址来直接查找相关位置"></el-input>
      <baidu-map class="bmView" :scroll-wheel-zoom="true" :center="centerLocation"
        @click="getLocationPoint" :zoom="15">
        <bm-city-list anchor="BMAP_ANCHOR_TOP_LEFT"></bm-city-list>
        <bm-view style="width: 100%; height:450px; flex: 1"></bm-view>
        <bm-marker :position="currentLocation" :dragging="true" animation="BMAP_ANIMATION_BOUNCE">
          <bm-label :content="currentName" :labelStyle="{color: 'red', fontSize : '24px'}"
            :offset="{width: -35, height: 30}" />
        </bm-marker>
        <bm-local-search :keyword="addressKeyword" :auto-viewport="true" style="display: none"></bm-local-search>
      </baidu-map>
      <el-row>
        <el-col :span="11">
          <el-input v-model="address" />
        </el-col>
        <el-col :span="11">
          <el-input v-model="geoPoint" />
        </el-col>
        <el-col :span="2">
          <el-button type="success" icon="el-icon-check" @click="confirmLocationPoint">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup name="LocationSelect">

  const { proxy } = getCurrentInstance();
  //可执行时间段
  const title = ref('地理位置选择');
  const open = ref(false);
  const formLoading = ref(false);
  const formRef = ref();

  const addressKeyword = ref();
  //中心位置
  const centerLocation = ref('杭州');
  //当前位置
  const currentLocation = ref('杭州');
  const currentName = ref('');
  const address = ref();
  const geoPoint = ref();

  //标签属性 end

  const data = reactive({
    form: {},
    // 表单校验
    rules: {
    }
  });

  const { form, rules } = toRefs(data);

  // 定义 success 事件，用于操作成功后的回调
  const emit = defineEmits(['success']);

  /** 打开弹窗 */
  const openForm = async (name,location) => {
    open.value = true;
    if(location==null){
      centerLocation.value=name;
    }else{
      let geo = location.split('');
      centerLocation.value={lng: geo[0], lat: geo[1]};
      currentLocation.value={lng: geo[0], lat: geo[1]};
      geoPoint.value =location;
    }
    currentName.value = '当前位置：'+name;
  }

  // 提供 open 方法，用于打开弹窗
  defineExpose({ openForm });
  
  /** 获取坐标 */
  function getLocationPoint(e){
    let lng = e.point.lng;
    let lat = e.point.lat;
    geoPoint.value = lng+','+lat;
    //用所定位的经纬度查找所在地省市街道等信息
    let point = new BMap.Point(e.point.lng, e.point.lat);
    let gc = new BMap.Geocoder();
    let _this = this;
    gc.getLocation(point, function (rs) {
        let addComp = rs.addressComponents;
        //地址信息
        _this.address = rs.address;
    });
  }

  /** 提交按钮 */
  function confirmLocationPoint() {
    const locationInfo={
      location:geoPoint.value
    }
    //调用父组件的方法
    emit('confirmLocation',locationInfo);
    open.value = false;
  }

  /** 初始化 **/
  onMounted(() => {

  })
</script>
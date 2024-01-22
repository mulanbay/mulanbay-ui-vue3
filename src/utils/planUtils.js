/** 计划模块的通用方法*/

/**
 * finished描述:T=完成,F=没完成,N=没有结果
 * @param {Object} value
 * @param {Object} planValue
 * @param {Object} compareType
 */
export function getValueCompareResult(value,planValue,compareType,unit){
  unit = unit==null ? '未知' :unit;
  let result={finished:'N',valueStr:value};
  if(planValue==null||planValue==''||planValue==undefined){
    result.finished='N';
    result.valueStr='-/-';
    return result;
  }
  if(value==0&&planValue==0){
    result.finished='N';
    result.valueStr='--';
    return result;
  }
  if(compareType=='MORE'){
    if(value >= planValue){
      result.finished='T';
      result.valueStr=value+unit;
    }else {
      result.finished='F';
      result.valueStr=value+unit+'('+getPercent(value,planValue)+'%)';
    }
  }else{
    if(value <= planValue){
      result.finished='T';
      result.valueStr=value+unit;
    }else {
      result.finished='F';
      result.valueStr=value+unit+'('+getOverString(value,planValue)+')';
    }
  }
  return result;
}

//计算百分比
export function getPercent(num1,num2) {
	if(num2==0){
		return 0;
	}
  return parseInt((Math.round(num1 / num2 * 10000) / 100.00).toFixed(0));
}

export function getOverString(value,planValue){
  var vv = (value+0.0-planValue)/planValue;
  if(vv<1){
      return '超出'+(vv*100).toFixed(0)+'%';
  }else{
      return '超出'+vv.toFixed(1)+'倍';
  }
}

export function getCompareYearString(year) {
  if(year==null||year==''||year==undefined){
      return '';
  }
  let dd = new Date();
  let current  = dd.getFullYear();
  if(year==current){
      return '';
  }else{
      return '&nbsp;('+year+')';
  }
}

/**
 * 跳转到通用统计
 * @param {Object} beanName
 */
export function dispatchCommonStat(beanName,router) {
  //路由定向
  router.push({name:'UserPlanCommonStat',query: {beanName:beanName}})
}

/**
 * 业务类型的图标
 * @param {Object} bussType
 */
export function getBussIconClass(bussType) {
  let b = bussType.toLowerCase();
  const sa = b.split("_"); //分割
  return sa[0];
}

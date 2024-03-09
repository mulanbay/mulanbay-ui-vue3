/**
 * Created by fenghong on 2017/2/7.
 */
const colorList = ['#284554', '#61a0a8', '#d48265', '#c23531', '#8B0A50', '#91c7ae', '#749f83',
  '#ca8622', '#bda29a', '#6e7074', '#546570',
  '#080808', '#800000', '#006400', '#191970'
];

/**
 * 创建图表
 * 
 * @param {Object} option
 * @param {Object} instance
 */
export function createChart(option, instance) {
  instance.clear();
  instance.setOption(option);
  window.addEventListener("resize", () => {
    instance.resize();
  });
}

/**
 * 柱状图
 * @param {Object} data
 */
export function createBarChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  //是否显示折线上的图标
  let showItemStyle = true;
  //显示最大最小值
  let showMarkPoint = true;
  //显示平均值
  let showMarkLine = false;
  //显示右上角的菜单
  let showToolbox = true;
  const ln = data.xdata.length;
  //根据x轴长度动态显示
  if (ln > 20) {
    showItemStyle = false;
  }
  let showLegend = data.showLegend == null ? true : data.showLegend;
  let markPoint = {};
  if (showMarkPoint == true) {
    markPoint = {
      data: [{
          type: 'max',
          name: '最大值'
        },
        {
          type: 'min',
          name: '最小值'
        }
      ]
    };
  }
  let markLine = {};
  if (showMarkLine == true) {
    markLine = {
      data: [{
        type: 'average',
        name: '平均值'
      }]
    };
  };
  let series = new Array();
  for (let i = 0; i < data.ydata.length; i++) {
    let serie = {
      name: data.ydata[i].name,
      type: 'bar',
      stack: data.ydata[i].stack,
      data: data.ydata[i].data,
      label: {
        show: showItemStyle, //开启显示
        position: 'top', //在上方显示
        color: 'black', //数值样式
        fontSize: 16
      },
      markPoint: markPoint,
      markLine: markLine
    };
    series.push(serie);
  }
  let xAxisType = 'category';
  let xAxis;
  let yAxis;
  if (data.xAxisType) {
    xAxisType = data.xAxisType;
  }
  if (xAxisType == 'category') {
    xAxis = [{
      type: 'category',
      data: data.xdata
    }];
    yAxis = [{
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    }];
  } else {
    yAxis = [{
      type: 'category',
      data: data.xdata
    }];
    xAxis = [{
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    }];
  }
  let option = {
    darkMode: true,
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        var relVal = params[0].name
        for (var i = 0, l = params.length; i < l; i++) {
          relVal += '<br/>' + params[i].seriesName + ":" + params[i].data + data.ydata[i].unit
        }
        return relVal
      }
    },
    legend: {
      data: data.legendData,
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      padding: [100, 0, 0, 0]
    },
    toolbox: {
      show: false,
      feature: {
        dataView: {
          show: true,
          readOnly: false
        },
        magicType: {
          show: true,
          type: ['line', 'bar']
        },
        restore: {
          show: true
        },
        saveAsImage: {
          show: true
        }
      }
    },
    grid: { //四周的宽度
      left: '2%',
      right: '3%',
      bottom: '5%',
      containLabel: true
    },
    calculable: true,
    xAxis: xAxis,
    yAxis: yAxis,
    series: series
  };
  return option;
}

/**折线图
 * @param {Object} data
 */
export function createLineChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  //是否显示折线上的图标
  let showItemStyle = true;
  //显示最大最小值
  let showMarkPoint = true;
  //显示平均值
  let showMarkLine = false;
  //显示右上角的菜单
  let showToolbox = true;
  const ln = data.xdata.length;
  //根据x轴长度动态显示
  if (ln > 20) {
    showItemStyle = false;
  }
  let showLegend = data.showLegend == null ? true : data.showLegend;
  let smooth = data.smooth == null ? false : data.smooth;
  let markPoint = {};
  if (showMarkPoint == true) {
    markPoint = {
      data: [{
          type: 'max',
          name: '最大值'
        },
        {
          type: 'min',
          name: '最小值'
        }
      ],
      //位置偏移量
      //symbolOffset:[0, '-25px']
    };
  }
  let markLine = {};
  if (showMarkLine == true) {
    markLine = {
      data: [{
        type: 'average',
        name: '平均值'
      }]
    };
  };
  let series = new Array();
  for (let i = 0; i < data.ydata.length; i++) {
    let serie = {
      name: data.ydata[i].name,
      type: 'line',
      smooth: smooth,
      dataView: {
        show: true,
        readOnly: false
      },
      label: {
        show: showItemStyle, //开启显示
        position: 'top', //在上方显示
        color: 'black', //数值样式
        fontSize: 16
      },
      data: data.ydata[i].data,
      markPoint: markPoint,
      markLine: markLine
    };
    series.push(serie);
  }
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center',
      y: 'top',
      textAlign: 'center',
      link: data.link
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        var relVal = params[0].name
        for (var i = 0, l = params.length; i < l; i++) {
          relVal += '<br/>' + params[i].seriesName + ": &nbsp;&nbsp;&nbsp;" + params[i].data + data.ydata[i].unit
        }
        return relVal
      },
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      show: showLegend,
      data: data.legendData,
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      padding: [100, 0, 0, 0]
    },
    grid: { //四周的宽度
      left: '2%',
      right: '3%',
      bottom: '5%',
      containLabel: true
    },
    toolbox: {
      show: showToolbox,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: {
          readOnly: false
        },
        magicType: {
          type: ['line', 'bar']
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xdata
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    },
    series: series
  };
  return option;
}

/**
 * 堆叠面积图
 * @param {Object} data
 */
export function createStackedAreaChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  let smooth = data.smooth == null ? false : data.smooth;
  let series = new Array();
  const n = data.ydata.length;
  for (let i = 0; i < n; i++) {
    const showLabel = i == n - 1 ? true : false;
    let serie = {
      name: data.ydata[i].name,
      type: 'line',
      smooth: smooth,
      stack: '总量',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      label: {
        show: showLabel,
        position: 'top'
      },
      data: data.ydata[i].data
    };
    series.push(serie);
  }
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: data.legendData
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: data.xdata
    }],
    yAxis: [{
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    }],
    series: series
  };
  return option;
}

/**
 * 混合柱状图、折线图
 * 最后一个是折线图
 * @param {Object} data
 */
export function createMixLineBarChartOption(data) {
  if (data.ydata == null || data.ydata.length < 2) {
    createChart({}, myChart);
    return;
  }
  //是否显示折线上的图标
  let showItemStyle = true;
  //显示最大最小值
  let showMarkPoint = true;
  //显示平均值
  let showMarkLine = false;
  //显示右上角的菜单
  let showToolbox = true;
  const ln = data.xdata.length;
  //根据x轴长度动态显示
  if (ln > 20) {
    showItemStyle = false;
  }
  let showLegend = data.showLegend == null ? true : data.showLegend;
  let smooth = data.smooth == null ? false : data.smooth;
  //右侧的数据数量，默认是最后一类
  let s2Size = data.s2Size == null ? 1 : data.s2Size;
  let markPoint = {};
  if (showMarkPoint == true) {
    markPoint = {
      data: [{
          type: 'max',
          name: '最大值'
        },
        {
          type: 'min',
          name: '最小值'
        }
      ]
    };
  }
  let markLine = {};
  if (showMarkLine == true) {
    markLine = {
      data: [{
        type: 'average',
        name: '平均值'
      }]
    };
  };
  let ya0Name = '';
  let ya0Unit = '';
  let ya1Name = '';
  let ya1Unit = '';
  let yaxisLen = data.yaxis.length;
  if (yaxisLen > 0) {
    ya0Name = data.yaxis[0].name;
    ya0Unit = data.yaxis[0].unit;
    ya1Name = data.yaxis[1].name;
    ya1Unit = data.yaxis[1].unit;
  } else {
    //可以去data.ydata里面获取
  }
  let series = new Array();
  //图例类型，默认是柱状图和折线图
  let serieTypes = data.serieTypes;
  if (serieTypes == null) {
    serieTypes = ['bar', 'line']
  }
  let n = data.ydata.length;
  for (let i = 0; i < n; i++) {
    let cd = data.ydata[i];
    let yAxisIndex = 0;
    let type = serieTypes[0];
    if (i >= n - s2Size) {
      yAxisIndex = 1;
      type = serieTypes[1];
    }
    let serie = {
      name: cd.name,
      type: type,
      smooth: smooth,
      yAxisIndex: yAxisIndex,
      label: {
        show: showItemStyle, //开启显示
        position: 'top', //在上方显示
        color: 'black', //数值样式
        fontSize: 16
      },
      markPoint: markPoint,
      markLine: markLine,
      data: cd.data
    };
    series.push(serie);
  }
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      subtextStyle: {
        color: '#33004d'
      },
      x: 'center',
      y: 'top',
      textAlign: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        var relVal = params[0].name
        for (var i = 0, l = params.length; i < l; i++) {
          relVal += '<br/>' + params[i].seriesName + ": &nbsp;&nbsp;&nbsp;" + params[i].data + data.ydata[i].unit
        }
        return relVal
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    label: {
      normal: {
        show: true,
        position: 'top'
      }
    },
    toolbox: {
      feature: {
        show: showToolbox,
        dataView: {
          show: true,
          readOnly: false
        },
        magicType: {
          show: true,
          type: ['line', 'bar']
        },
        restore: {
          show: true
        },
        saveAsImage: {
          show: true
        }
      }
    },
    legend: {
      data: data.legendData,
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      padding: [100, 0, 0, 0] //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
    },
    grid: { //四周的宽度
      left: '2%',
      right: '3%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: data.xdata,
      axisPointer: {
        type: 'shadow'
      }
    }],
    yAxis: [{
        type: 'value',
        name: ya0Name,
        axisLabel: {
          formatter: '{value} ' + ya0Unit
        }
      },
      {
        type: 'value',
        name: ya1Name,
        axisLabel: {
          formatter: '{value} ' + ya1Unit
        }
      }
    ],
    series: series
  };
  return option;
}

/**
 * 饼图
 * @param {Object} data
 */
export function createPieChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  //显示项目
  let showLegend = data.showLegend == null ? true : data.showLegend;
  let series = new Array();
  for (let i = 0; i < data.detailData.length; i++) {
    let serie = {
      name: data.detailData[i].name,
      type: 'pie',
      radius: '55%',
      center: ['50%', '60%'],
      data: data.detailData[i].data,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        alignTo: 'labelLine', //labelLine
        formatter: '{name|{b}}\n{time|{c} ' + unit + ' ({d}%)}',
        minMargin: 5,
        edgeDistance: 10,
        lineHeight: 15,
        rich: {
          time: {
            fontSize: 12,
            color: '#460000'
          }
        }
      }
    };
    series.push(serie);
  };
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center'
    },
    toolbox: {
      show: false,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: {
          show: true,
          readOnly: false
        },
        magicType: {
          type: ['line', 'bar']
        },
        restore: {},
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} " + unit + "({d}%)"
    },
    legend: {
      show: showLegend,
      orient: 'vertical',
      left: 'left',
      data: data.xdata
    },
    series: series
  };
  return option;
}

/**
 * 双饼图
 * @param {Object} data
 */
export function createDoublePieChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center'
    },
    toolbox: {
      show: false,
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        dataView: {
          show: true,
          readOnly: false
        },
        magicType: {
          type: ['line', 'bar']
        },
        restore: {},
        saveAsImage: {}
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ' + unit + ' ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      data: data.xdata
    },
    series: [{
        name: data.detailData[0].name,
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],

        label: {
          normal: {
            position: 'inner'
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: data.detailData[0].data
      },
      {
        name: data.detailData[1].name,
        type: 'pie',
        radius: ['40%', '55%'],
        data: data.detailData[1].data,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          alignTo: 'labelLine', //labelLine
          formatter: '{name|{b}}\n{time|{c} ' + unit + ' ({d}%)}',
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          rich: {
            time: {
              fontSize: 12,
              color: '#460000'
            }
          }
        }
      }
    ]
  };
  return option;
}

/**
 * 日历图
 * @param {Object} data
 */
export function createCalanderChartOption(data) {
  let cellSize = 20;
  let graphData = data.graphData;
  let links = {};
  if (graphData) {
    links = graphData.map(function(item, idx) {
      return {
        source: idx,
        target: idx + 1
      };
    });
    links.pop();
  }

  let minValue = data.minValue;
  let maxValue = data.maxValue;
  //最大值最小值分成3分
  let peace = (maxValue - minValue) / 5;


  // 获取每个格子的点的大小，数值为2,4,6,8,10
  function getSymbolSize(value) {
    if (1 == 1) {
      //算法不好，强行写死
      return 10;
    }
    if (peace == 0) {
      //最小和最大值相等
      return 10;
    }
    let v = ((value[1] - minValue) / peace) * 2;
    if (v == 0) {
      return 2;
    }
    return v;
  }
  let legendData = new Array();
  let seriesData = new Array();
  //线路图
  if (data.graphData != null && data.graphData.length > 0) {
    let graphName = data.graphName == null ? '线路图' : data.graphName;
    legendData.push(graphName);
    let serieG0 = {
      name: graphName,
      type: 'graph',
      edgeSymbol: ['none', 'arrow'],
      coordinateSystem: 'calendar',
      links: links,
      symbolSize: 15,
      calendarIndex: 0,
      itemStyle: {
        color: 'green',
        shadowBlue: 9,
        shadowOffsetX: 1.5,
        shadowOffsetY: 3,
        shadowColor: '#555'
      },
      lineStyle: {
        color: '#D10E00',
        width: 1,
        opacity: 1
      },
      data: data.graphData,
      z: 20
    };
    seriesData.push(serieG0);
    let serieG1 = {
      name: graphName,
      type: 'graph',
      edgeSymbol: ['none', 'arrow'],
      coordinateSystem: 'calendar',
      links: links,
      symbolSize: 15,
      calendarIndex: 1,
      itemStyle: {
        color: 'green',
        shadowBlue: 9,
        shadowOffsetX: 1.5,
        shadowOffsetY: 3,
        shadowColor: '#555'
      },
      lineStyle: {
        color: '#D10E00',
        width: 1,
        opacity: 1
      },
      data: data.graphData,
      z: 20
    };
    seriesData.push(serieG1);
  }
  //第一个
  let seriesName = data.seriesName == null ? '系列1' : data.seriesName;
  legendData.push(seriesName);
  let serieL00 = {
    name: seriesName,
    type: 'scatter',
    coordinateSystem: 'calendar',
    data: data.series,
    symbolSize: function(val) {
      //return val[1] / data.compareSizeValue;
      return getSymbolSize(val);
    },
    itemStyle: {
      color: 'green',
      shadowBlur: 10,
      shadowColor: '#333'
    }
  };
  seriesData.push(serieL00);
  let serieL01 = {
    name: seriesName,
    type: 'scatter',
    coordinateSystem: 'calendar',
    calendarIndex: 1,
    data: data.series,
    symbolSize: function(val) {
      //return val[1] / data.compareSizeValue;
      return getSymbolSize(val);
    },
    itemStyle: {
      color: 'green',
      shadowBlur: 10,
      shadowColor: '#333'
    }
  };
  seriesData.push(serieL01);
  if (data.series2 != null && data.series2.length > 0) {
    let series2Name = data.series2Name == null ? '系列2' : data.series2Name;
    legendData.push(series2Name);
    //第二个
    let serieL20 = {
      name: series2Name,
      type: 'scatter',
      coordinateSystem: 'calendar',
      calendarIndex: 0,
      data: data.series2,
      symbolSize: function(val) {
        return getSymbolSize(val);
      },
      itemStyle: {
        color: 'red',
        shadowBlur: 10,
        shadowColor: '#333'
      }
    };
    seriesData.push(serieL20);
    let serieL21 = {
      name: series2Name,
      type: 'scatter',
      coordinateSystem: 'calendar',
      calendarIndex: 1,
      data: data.series2,
      symbolSize: function(val) {
        return getSymbolSize(val);
      },
      itemStyle: {
        color: 'red',
        shadowBlur: 10,
        shadowColor: '#333'
      }
    };
    seriesData.push(serieL21);
  }
  //数值最高的
  if (data.top && data.top > 0) {
    let topName = '前' + data.top + '项';
    legendData.push(topName);
    let serieT0 = {
      name: topName,
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      calendarIndex: 1,
      data: data.series.sort(function(a, b) {
        return b[1] - a[1];
      }).slice(0, data.top),
      symbolSize: function(val) {
        //return val[1] / data.compareSizeValue;
        return getSymbolSize(val);
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      //hoverAnimation: true,
      itemStyle: {
        color: '#f4e925',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      zlevel: 1
    };
    seriesData.push(serieT0);
    let serieT1 = {
      name: topName,
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      data: data.series.sort(function(a, b) {
        return b[1] - a[1];
      }).slice(0, data.top),
      symbolSize: function(val) {
        //return val[1] / data.compareSizeValue;
        return getSymbolSize(val);
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      //hoverAnimation: true,
      itemStyle: {
        color: '#f4e925',
        shadowBlur: 10,
        shadowColor: '#333'
      },
      zlevel: 1
    };
    seriesData.push(serieT1);
  }


  let option = {
    backgroundColor: '#404a59',
    title: {
      top: 10,
      text: data.title,
      subtext: data.subTitle,
      left: 'center',
      textStyle: {
        color: '#fff'
      },
      subtextStyle: {
        color: '#f1f178'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a}<br/>{b}({c}" + data.unit + ")"
    },
    legend: {
      top: '30',
      left: '100',
      data: legendData,
      textStyle: {
        color: '#fff'
      }
    },
    calendar: [{
      top: 80,
      itemStyle: {
        borderWidth: 0.5
      },
      left: 'center',
      range: data.rangeFirst,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 4,
          type: 'solid'
        }
      },
      yearLabel: {
        formatter: '{start}  上半年',
        color: '#fff'
      },
      itemStyle: {
        color: '#323c48',
        borderWidth: 1,
        borderColor: '#111'
      }
    }, {
      top: 269,
      left: 'center',
      itemStyle: {
        borderWidth: 0.5
      },
      range: data.rangeSecond,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 4,
          type: 'solid'
        }
      },
      yearLabel: {
        formatter: '{start}  下半年',
        color: '#fff'
      },
      itemStyle: {
        color: '#323c48',
        borderWidth: 1,
        borderColor: '#111'
      }
    }],
    series: seriesData
  };
  return option;
}

/**
 * 日历饼图
 * @param {Object} data
 * @param {Object} echarts
 */
export function createCalanderPieChartOption(data, myChart, echarts) {
  const unit = data.unit == null ? '' : data.unit;
  let cellSizeValue = data.cellSize == null ? 80 : data.cellSize;
  let cellSize = [cellSizeValue, cellSizeValue];
  let pieRadius = data.pieRadius == null ? 30 : data.pieRadius;
  let app = {};
  let seriesData = data.seriesData;
  let scatterData = data.scatterData;

  const pieSeries = scatterData.map(function(item, index) {
    return {
      type: 'pie',
      id: 'pie-' + index,
      center: item[0],
      radius: pieRadius,
      coordinateSystem: 'calendar',
      label: {
        formatter: '{c}',
        position: 'inside'
      },
      data: seriesData[item[0]]
    };
  });
  let option = {
    title: {
      show: true,
      top: 'auto',
      bottom: 'auto',
      text: data.title,
      subtext: data.subTitle,
      x: 'center',
      y: 'top',
      textAlign: 'center'
    },
    tooltip: {
      formatter: function (params) {
        //console.log(params)
        let vv = params.seriesName;
        vv+='<br/>'+params.name + ':' + params.value+unit
        vv+= ' ('+params.percent+'%'+')'
        return vv;
      }
    },
    legend: {
      data: data.legendData,
      bottom: 20
    },
    calendar: {
      top: 'middle',
      left: 'center',
      orient: 'vertical',
      cellSize: cellSize,
      yearLabel: {
        show: false,
        fontSize: 30
      },
      dayLabel: {
        margin: 20,
        firstDay: 1,
        nameMap: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      },
      monthLabel: {
        show: false
      },
      range: data.range
    },
    series: [{
        id: 'label',
        type: 'scatter',
        coordinateSystem: 'calendar',
        symbolSize: 0,
        label: {
          show: true,
          formatter: function(params) {
            return echarts.time.format(params.value[0], '{dd}', false);
          },
          offset: [-cellSize[0] / 2 + 10, -cellSize[1] / 2 + 10],
          fontSize: 14
        },
        data: scatterData
      },
      ...pieSeries
    ]
  };
  return option;
}

/**
 * 日历热点图
 * @param {Object} data
 * @param {Object} echarts
 */
export function createCalenderHeatMapChartOption(data, echarts) {
  let calendars = new Array();
  for (let i = 0; i < data.years.length; i++) {
    let c = {
      top: 100 + i * 180,
      range: data.years[i],
      cellSize: ['auto', 20],
      right: 5
    };
    calendars.push(c);
  }
  let seriesData = new Array();
  for (let i = 0; i < data.series.length; i++) {
    let serie = {
      type: 'heatmap',
      calendarIndex: i,
      coordinateSystem: 'calendar',
      data: data.series[i]
    };
    seriesData.push(serie);
  }

  let option = {
    //backgroundColor: '#1f294e',
    title: {
      top: 0,
      left: 'center',
      text: data.title
    },
    tooltip: {
      position: 'top',
      formatter: function(p) {
        let format = echarts.time.format('yyyy-MM-dd', p.data[0]);
        return format + ': ' + p.data[1] + data.unit;
      }
    },
    visualMap: {
      min: data.minValue,
      max: data.maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      top: 30
    },
    calendar: calendars,
    series: seriesData
  };
  return option;
}

//将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
function colorRgb(sColor) {
  let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  sColor = sColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = "#";
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  } else {
    return sColor;
  }
};

//渐变色算法例子
function colorHex(rgb) {
  let _this = rgb;
  let reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (/^(rgb|RGB)/.test(_this)) {
    let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
    let strHex = "#";
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16);
      hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
      if (hex === "0") {
        hex += hex;
      }
      strHex += hex;
    }
    if (strHex.length !== 7) {
      strHex = _this;
    }
    return strHex;
  } else if (reg.test(_this)) {
    let aNum = _this.replace(/#/, "").split("");
    if (aNum.length === 6) {
      return _this;
    } else if (aNum.length === 3) {
      let numHex = "#";
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += (aNum[i] + aNum[i]);
      }
      return numHex;
    }
  } else {
    return _this;
  }
};

//渐变颜色
export function getGradualColor(v, step, maxValue, startColor, endColor) {
  let startRGB = colorRgb(startColor); //转换为rgb数组模式
  let startR = startRGB[0];
  let startG = startRGB[1];
  let startB = startRGB[2];

  let endRGB = colorRgb(endColor);
  let endR = endRGB[0];
  let endG = endRGB[1];
  let endB = endRGB[2];

  let sR = (endR - startR) / step; //总差值
  let sG = (endG - startG) / step;
  let sB = (endB - startB) / step;

  let i = v * step / maxValue;

  //计算hex值
  let hex = colorHex('rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' +
    parseInt((sB * i + startB)) + ')');
  return hex;
}


/**
 * 热点图
 * @param {Object} data
 * @param {Object} echarts
 */
export function createHeatMapChartOption(data, echarts) {
  let showLabel = data.showLabel == null ? true : data.showLabel;
  let showXLabel = data.xdata.length > 31 ? false : true;
  let step = (data.maxValue - data.minValue) / 5;
  if (step <= 0) {
    step = 1;
  }

  function setColors(val, index) {
    let obj = {};
    let color = getGradualColor(val, step, data.maxValue, "#15B1F4", "#D1621D");
    if (color != null) {
      obj = {
        color: color
      }
    }
    return obj;
  };
  let seriesData = new Array();
  for (let i = 0; i < data.series.length; i++) {
    let sd = data.series[i];
    let serieDetails = new Array();
    for (let j = 0; j < sd.data.length; j++) {
      let elv = sd.data[j];
      let itemStyle = setColors(elv[2], j);
      let obj = {};
      obj.itemStyle = itemStyle;
      obj.value = elv;
      serieDetails.push(obj);
    }
    let serie = {
      name: sd.name,
      type: 'heatmap',
      data: serieDetails,
      label: {
        show: showLabel,
        color: "#fff"
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    };
    seriesData.push(serie);
  }
  let option = {
    backgroundColor: '#203c61',
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center',
      y: 'top',
      color: "#fff",
      textAlign: 'center',
      left: 'center',
      top: '2%'
    },
    tooltip: {
      position: 'top',
      backgroundColor: '#a9e1c5',
      borderColor: '#ffffff',
      color: "#fff",
      axisPointer: {
        lineStyle: {
          color: '#fff'
        }
      },
      //trigger: 'axis',
      formatter: function(params) {
        //console.log(params)
        return (
          params.seriesName + ':<br/>' + params.name + ': ' +
          params.value[2] + params.value[3]
        );
      }
    },
    grid: {
      left: '2%',
      right: '6%',
      bottom: '0%',
      top: '8%',
      containLabel: true
    },
    xAxis: [{
      show: false,
      type: '',
      data: data.xdata,
      splitArea: {
        show: true
      },
      axisLabel: {
        show: true,
        color: '#fff'
      },
    }, {
      type: 'category',
      data: data.xdata,
      splitArea: {
        show: true
      },
      axisLabel: {
        show: showXLabel,
        color: '#fff',
        interval: 0,
        rotate: 0
      },
    }],
    yAxis: {
      type: 'category',
      data: data.ydata,
      splitArea: {
        show: true
      },
      axisLabel: {
        show: true,
        color: '#fff',
        interval: 0,
        // rotate: 15
      },
    },
    visualMap: {
      min: data.minValue,
      max: data.maxValue,
      calculable: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      color: "#fff",
      // bottom: '15%',
      //自定义热力图颜色
      inRange: {
        color: ['#15B1F4', '#16c573', '#d18a17', '#ffac1d', '#D1621D']
      },
    },
    series: seriesData
  };
  return option;
}

/**
 * 散点图
 * @param {Object} data
 */
export function createScatterChartOption(data) {
  let seriesData = new Array();
  // 获取每个格子的点的大小，数值为2,4,6,8,10
  function getSymbolSize(value) {
    if (value == 1) {
      return 10;
    } else if (value < 5) {
      return 20;
    } else if (value < 10) {
      return 30;
    } else {
      return 4;
    }
  };
  for (let i = 0; i < data.seriesDatas.length; i++) {
    let serie = {
      name: data.seriesDatas[i].name,
      type: 'scatter',
      data: data.seriesDatas[i].data,
      symbolSize: function(data) {
        return getSymbolSize(data[2]);
      },
      markArea: {
        silent: true,
        itemStyle: {
          color: 'transparent',
          borderWidth: 1,
          borderType: 'dashed'
        },
        data: [
          [{
            name: data.seriesDatas[i].name + '分布区间',
            xAxis: 'min',
            yAxis: 'min'
          }, {
            xAxis: 'max',
            yAxis: 'max'
          }]
        ]
      },
      markPoint: {
        data: [{
            type: 'max',
            name: '最大值'
          },
          {
            type: 'min',
            name: '最小值'
          }
        ]
      }
    };
    seriesData.push(serie);
  }

  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center',
      y: 'top',
      textAlign: 'center'
    },
    grid: {
      left: '3%',
      right: '7%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      // trigger: 'axis',
      showDelay: 0,
      formatter: function(params) {
        if (params.value.length > 1) {
          return '[' + params.seriesName + ']<br/>' +
            params.value[0] + data.xUnit + ' :' +
            params.value[1] + data.yUnit + ',值：' + params.value[2] + data.vUnit;
        } else {
          return params.seriesName + ' :<br/>' +
            params.name + ' : ' +
            params.value + data.yUnit;
        }
      },
      axisPointer: {
        show: true,
        type: 'cross',
        lineStyle: {
          type: 'dashed',
          width: 1
        }
      }
    },
    toolbox: {
      feature: {
        dataZoom: {},
        brush: {
          type: ['rect', 'polygon', 'clear']
        }
      }
    },
    brush: {},
    legend: {
      data: data.legendData,
      orient: 'horizontal',
      x: 'left',
      y: 'left'
    },
    xAxis: [{
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: (val) => {
          return formatDateGroupLabel(val, data.dateGroup, data.xUnit);
        }
      },
      splitLine: {
        show: false
      }
    }],
    yAxis: [{
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value} ' + data.yUnit
      },
      splitLine: {
        show: false
      }
    }],
    series: seriesData
  };
  return option;
}

/**
 * 日历比较
 * @param {Object} data
 */
export function createCompareCalanderChartOption(data) {

  let graphData = data.graphData;
  let links = {};
  if (graphData) {
    links = graphData.map(function(item, idx) {
      return {
        source: idx,
        target: idx + 1
      };
    });
    links.pop();
  }

  let minValue = data.minValue;
  let maxValue = data.maxValue;
  //最大值最小值分成3分
  let peace = (maxValue - minValue) / 5;

  // 获取每个格子的点的大小，数值为2,4,6,8,10
  function getSymbolSize(value) {
    if (1 == 1) {
      //算法不好，强行写死
      return 10;
    }
    if (peace == 0) {
      //最小和最大值相等
      return 10;
    }
    let v = ((value[1] - minValue) / peace) * 2;
    if (v == 0) {
      return 2;
    }
    return v;
  }

  let seriesData = new Array();
  let serie = {
    type: 'graph',
    edgeSymbol: ['none', 'arrow'],
    coordinateSystem: 'calendar',
    links: links,
    symbolSize: 15,
    calendarIndex: 0,
    itemStyle: {
      normal: {
        color: 'green',
        shadowBlue: 9,
        shadowOffsetX: 1.5,
        shadowOffsetY: 3,
        shadowColor: '#555'
      }
    },
    lineStyle: {
      normal: {
        color: '#D10E00',
        width: 1,
        opacity: 1
      }
    },
    data: data.graphData,
    z: 20
  };
  seriesData.push(serie);
  serie = {
    type: 'graph',
    edgeSymbol: ['none', 'arrow'],
    coordinateSystem: 'calendar',
    links: links,
    symbolSize: 15,
    calendarIndex: 1,
    itemStyle: {
      normal: {
        color: 'green',
        shadowBlue: 9,
        shadowOffsetX: 1.5,
        shadowOffsetY: 3,
        shadowColor: '#555'
      }
    },
    lineStyle: {
      normal: {
        color: '#D10E00',
        width: 1,
        opacity: 1
      }
    },
    data: data.graphData,
    z: 20
  };
  seriesData.push(serie);
  serie = {
    name: data.legendData[0],
    type: 'scatter',
    coordinateSystem: 'calendar',
    data: data.series,
    symbolSize: function(val) {
      //return val[1] / data.compareSizeValue;
      return getSymbolSize(val);
    },
    itemStyle: {
      normal: {
        color: 'red'
      }
    }
  };
  seriesData.push(serie);
  serie = {
    name: data.legendData[0],
    type: 'scatter',
    coordinateSystem: 'calendar',
    calendarIndex: 1,
    data: data.series,
    symbolSize: function(val) {
      //return val[1] / data.compareSizeValue;
      return getSymbolSize(val);
    },
    itemStyle: {
      normal: {
        color: 'red'
      }
    }
  };
  seriesData.push(serie);
  if (data.series2 && data.series2.length > 0) {
    serie = {
      name: data.legendData[1],
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      calendarIndex: 1,
      data: data.series2,
      symbolSize: function(val) {
        //return val[1] / data.compareSizeValue;
        return getSymbolSize(val);
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      itemStyle: {
        normal: {
          color: '#f4e925',
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      zlevel: 1
    };
    seriesData.push(serie);
    serie = {
      name: data.legendData[1],
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      data: data.series2,
      symbolSize: function(val) {
        //return val[1] / data.compareSizeValue;
        return getSymbolSize(val);
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      //hoverAnimation: true,
      itemStyle: {
        normal: {
          color: '#f4e925',
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      zlevel: 1
    };
    seriesData.push(serie);
  }


  let option = {
    backgroundColor: '#404a59',

    title: {
      top: 10,
      text: data.title,
      subtext: data.subTitle,
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: "{a}<br/>{b}({c}" + data.unit + ")"
    },
    legend: {
      top: '30',
      left: '100',
      data: data.legendData,
      textStyle: {
        color: '#fff'
      }
    },
    calendar: [{
      top: 80,
      left: 'center',
      range: data.rangeFirst,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 4,
          type: 'solid'
        }
      },
      yearLabel: {
        formatter: '{start}  上半年',
        textStyle: {
          color: '#fff'
        }
      },
      itemStyle: {
        normal: {
          color: '#323c48',
          borderWidth: 1,
          borderColor: '#111'
        }
      }
    }, {
      top: 260,
      left: 'center',
      range: data.rangeSecond,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#000',
          width: 4,
          type: 'solid'
        }
      },
      yearLabel: {
        formatter: '{start}  下半年',
        textStyle: {
          color: '#fff'
        }
      },
      itemStyle: {
        normal: {
          color: '#323c48',
          borderWidth: 1,
          borderColor: '#111'
        }
      }
    }],
    series: seriesData
  };
  return option;
}

/**
 * 雷达图
 * @param {Object} data
 */
export function createRadarChartOption(data) {
  let option = {
    title: {
      text: data.title,
      subtext: data.subTitle,
      left: 'left'
    },
    legend: {
      data: data.legendData,
      orient: 'horizontal',
      x: 'center',
      y: 'bottom',
      padding: [100, 0, 0, 0] //可设定图例[距上方距离，距右方距离，距下方距离，距左方距离]
    },
    tooltip: {},
    radar: {
      startAngle: 90,
      splitNumber: 4,
      shape: 'circle',
      axisName: {
        formatter: '【{value}】',
        color: '#72ACD1'
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.2)',
            'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
            'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'
          ],
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 10
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
      indicator: data.indicatorData
    },
    series: (function() {
      let series = [];
      for (let i = 0; i < data.series.length; i++) {
        series.push({
          name: data.series[i].name,
          type: 'radar',
          data: [{
            value: data.series[i].data,
            name: data.series[i].name
          }]
        });
      }
      return series;
    })()
  };
  return option;
}

/**
 * 树形图
 * @param {Object} data
 */
export function createTreeMapChartOption(data, echarts) {

  function colorMappingChange(value) {
    let levelOption = getLevelOption(value);
    chart.setOption({
      series: [{
        levels: levelOption
      }]
    });
  }

  var formatUtil = echarts.format;

  function getLevelOption() {
    return [{
        itemStyle: {
          borderWidth: 0,
          gapWidth: 5
        }
      },
      {
        itemStyle: {
          gapWidth: 1
        }
      },
      {
        colorSaturation: [0.35, 0.5],
        itemStyle: {
          gapWidth: 1,
          borderColorSaturation: 0.6
        }
      }
    ];
  }

  let option = {
    title: {
      text: data.name,
      left: 'center'
    },
    tooltip: {
      formatter: function(info) {
        let value = info.value;
        let treePathInfo = info.treePathInfo;
        let treePath = [];

        for (let i = 1; i < treePathInfo.length; i++) {
          treePath.push(treePathInfo[i].name);
        }

        return [
          '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
          data.name + ': ' + formatUtil.addCommas(value) + ' ' + data.unit,
        ].join('');
      }
    },

    series: [{
      name: data.name,
      type: 'treemap',
      visibleMin: 300,
      label: {
        show: true,
        formatter: '{b}'
      },
      itemStyle: {
        borderColor: '#fff'
      },
      levels: getLevelOption(),
      data: data.data
    }]
  };
  return option;
}

/**
 * Polar
 * @param {Object} data
 */
export function createPolarBarChartOption(data) {
  let seriesData = new Array();
  for (let i = 0; i < data.ydata.length; i++) {
    let serie = {
      type: 'bar',
      data: data.ydata[i].data,
      coordinateSystem: 'polar',
      name: data.ydata[i].name,
      stack: data.ydata[i].stack
    };
    seriesData.push(serie);
  }
  let option = {
    angleAxis: {
      type: 'category',
      data: data.xdata,
      z: 10
    },
    title: {
      text: data.title,
      x: 'center'
    },
    radiusAxis: {},
    tooltip: {
      position: 'top',
      formatter: function(p) {
        return p.name + ' [' + p.seriesName + ']';
        //return JSON.stringify(p);
      }
    },
    polar: {},
    series: seriesData,
    legend: {
      show: true,
      orient: 'vertical',
      left: 'left',
      data: data.legendData
    }
  };
  return option;
}

/**
 * 树形结构
 * @param {Object} fullData
 * @param {Object} echarts
 */
export function createTreeChartOption(fullData, echarts) {
  let data = fullData.data;

  echarts.util.each(data.children, function(datum, index) {
    index % 2 === 0 && (datum.collapsed = true);
  });

  let option = {
    title: {
      text: fullData.title,
      subtext: fullData.subTitle,
      left: 'left'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: "{a}<br/>{b}({c}" + fullData.unit + ")"
    },
    series: [{
      type: 'tree',
      name: '数据',
      data: [data],

      top: '1%',
      left: '7%',
      bottom: '1%',
      right: '20%',

      symbolSize: 9,

      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 11
      },
      leaves: {
        normal: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      initialTreeDepth: 3,
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750
    }]
  };
  return option;
}

/**
 * 堆积条形图
 * @param {Object} data
 */
export function createStaHorBarChartOption(data) {
  const unit = data.unit == null ? '%' : data.unit;
  let seriesData = new Array();
  for (let i = 0; i < data.ydata.length; i++) {
    let serie = {
      name: data.ydata[i].name,
      type: 'bar',
      stack: 'total',
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: data.ydata[i].data
    };
    seriesData.push(serie);
  }
  let option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      }
    },
    legend: {
      data: data.legendData
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    },
    yAxis: {
      type: 'category',
      data: data.xdata
    },
    series: seriesData
  };
  return option;
}

/**
 * 仪表盘
 * @param {Object} data
 */
export function createGaugeChartOption(data) {
  const unit = data.unit == null ? '%' : data.unit;
  let option = {
    tooltip: {
      formatter: "{a} <br/>{b} : {c}%"
    },
    toolbox: {
      feature: {
        restore: {},
        saveAsImage: {}
      }
    },
    title: {
      text: data.title,
      subtext: data.subTitle,
      x: 'center'
    },
    grid: { //四周的宽度
      top: '5%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    series: [{
      type: 'gauge',
      axisLine: {
        lineStyle: {
          width: 10,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      pointer: {
        itemStyle: {
          color: 'inherit'
        }
      },
      axisTick: {
        distance: -30,
        length: 8,
        lineStyle: {
          color: '#fff',
          width: 2
        }
      },
      splitLine: {
        distance: -30,
        length: 30,
        lineStyle: {
          color: '#fff',
          width: 4
        }
      },
      axisLabel: {
        color: 'inherit',
        distance: 40,
        fontSize: 15
        //formatter: data.valueFormatter
      },
      detail: {
        //valueAnimation: true,
        formatter: '{value} ' + unit,
        color: 'inherit',
        fontSize: 20
      },
      data: [{
        value: data.value,
        name: data.name,
        title: {
          offsetCenter: [0, '100%'] //设置完成率位置
        }
      }]
    }]
  };
  return option;
}

export function createShadowChartOption(data) {
  const unit = data.unit == null ? '' : data.unit;
  let series = new Array();
  for (let i = 0; i < data.series.length; i++) {
    let serie = {
      name: data.series[i].name,
      type: 'line',
      stack: data.series[i].stack,
      areaStyle: {

      },
      data: data.series[i].data
    };
    series.push(serie);
  }
  let option = {
    title: {
      text: data.title
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        var relVal = params[0].name
        for (var i = 0, l = params.length; i < l; i++) {
          relVal += '<br/>' + params[i].seriesName + ": &nbsp;&nbsp;&nbsp;" + params[i].data + data.series[i].unit
        }
        return relVal
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: data.legendData
    },
    color: colorList,
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: data.yaxisData
    }],
    yAxis: [{
      type: 'value',
      axisLabel: {
        formatter: '{value}' + unit
      }
    }],
    series: series
  };
  return option;
}

/**
 * 旭日图
 * 模板：https://www.makeapie.com/editor.html?c=xHKho7CKFj
 * @param {Object} chartData
 */
export function createSunburstChartOption(chartData) {
  var colors = [
    '#7986cb',
    '#64b5f6',
    '#ce93d8',
    '#ff8a65',
    '#e57373',
    '#f06292',
    '#9fa8da',
    '#ba68c8',
    '#9575cd'
  ];
  let data = chartData.dataList;
  for (var j = 0; j < data.length; ++j) {
    var level1 = data[j].children;
    for (var i = 0; i < level1.length; ++i) {
      var block = level1[i].children;
      var bookScore = [];
      var bookScoreId;
      for (var star = 0; star < block.length; ++star) {
        bookScoreId = 0;
        let currName = Number(block[star].name);
        var val = Number(currName);
        var vv = val % 7;
        var style;
        if (vv <= 7) {
          bookScoreId = vv;
          style = { color: colors[vv] };
        } else {
          bookScoreId = 0;
          style = { color: colors[5] };
        }
        block[star].label = {
          color: style.color,
          downplay: {
            opacity: 0.5
          }
        };
        if (block[star].children) {
          style = {
            opacity: 1,
            color: style.color
          };
          let children = block[star].children;
          for (let index = 0; index < children.length; index++) {
            const book = children[index];
            book.value = 1;
            book.itemStyle = style;

            book.label = {
              color: style.color
            };
            var value = 1;
            if (bookScoreId === 0 || bookScoreId === 3) {
              value = 5;
            }
            if (bookScore[bookScoreId]) {
              bookScore[bookScoreId].value += value;
            } else {
              bookScore[bookScoreId] = {
                color: colors[bookScoreId],
                value: value
              };
            }
          }
        }
      }
      // level1[i].itemStyle = {
      //   color: data[j].itemStyle.color
      // };
    }
  }
  let option = {
    //backgroundColor: bgColor,
    color: colors,
    series: [{
      type: 'sunburst',
      center: ['50%', '48%'],
      data: data,
      sort: function(a, b) {
        if (a.depth === 1) {
          return b.getValue() - a.getValue();
        } else {
          return a.dataIndex - b.dataIndex;
        }
      },
      label: {
        rotate: 'radial'
        //color: bgColor
      },
      itemStyle: {
        //borderColor: bgColor,
        borderWidth: 2
      },
      levels: [{},
        {
          r0: 0,
          r: '38%',
          label: {
            rotate: 0,
            fontSize: 18,
            color: '#212121'
            //fontWeight:600
          }
        },
        {
          r0: '30%',
          r: '61%',
          itemStyle: {
            //shadowBlur: 2,
            //shadowColor: colors[2],
            // color: 'transparent'
          },
          label: {
            // rotate: 'tangential',
            fontSize: 12,
            color: '#212121'
          }
        },
        {
          r0: '62%',
          r: '67%',
          itemStyle: {
            //shadowBlur: 2,
            //shadowColor: colors[2],
            color: 'transparent'
          },
          label: {
            rotate: 'tangential',
            fontSize: 12,
            color: colors[0]
          }
        },
        {
          r0: '68%',
          r: '70%',
          itemStyle: {
            //shadowBlur: 80,
            //shadowColor: colors[5]
          },
          label: {
            position: 'outside',
            //textShadowBlur: 5,
            //textShadowColor: '#333',
            fontSize: 16
          },
          downplay: {
            label: {
              opacity: 0.5
            }
          }
        }
      ]
    }]
  };
  return option;
}

/**
 * 格式化以时间分组的标签
 * @param {Object} val
 * @param {Object} dateGroup
 * @param {Object} unit
 */
export function formatDateGroupLabel(val, dateGroup, unit) {
  if ('MINUTE' == dateGroup) {
    return val + '分';
  } else if ('HOUR' == dateGroup) {
    return val + '点';
  } else if ('HOURMINUTE' == dateGroup) {
    return val;
  } else if ('DAY' == dateGroup) {
    return val;
  } else if ('WEEK' == dateGroup) {
    return '第' + val + '周';
  } else if ('MONTH' == dateGroup) {
    return val + '月';
  } else if ('YEAR' == dateGroup) {
    return val + '年';
  } else if ('DAYOFMONTH' == dateGroup) {
    return val + '号';
  } else if ('DAYOFWEEK' == dateGroup) {
    if (val == 1) {
      return '周一';
    } else if (val == 2) {
      return '周二';
    } else if (val == 3) {
      return '周三';
    } else if (val == 4) {
      return '周四';
    } else if (val == 5) {
      return '周五';
    } else if (val == 6) {
      return '周六';
    } else if (val == 7) {
      return '周日';
    } else {
      return '周' + val;
    }
  } else if ('YEARMONTH' == dateGroup) {
    return val;
  } else if ('DAYCALENDAR' == dateGroup) {
    return val;
  } else if ('TIMELINE' == dateGroup) {
    return val;
  } else {
    return val + unit;
  }
}

/**
 * 词云
 * @param {Object} chartData
 */
export function createWorldCloudChartOption(chartData) {
  let option = {
    title: {
      text: chartData.title,
      link: '--',
      x: 'center',
      textStyle: {
        fontSize: 23
      }
    },
    backgroundColor: '#F7F7F7',
    tooltip: {
      show: true
    },
    toolbox: {
      feature: {
        saveAsImage: {
          iconStyle: {
            color: '#FFFFFF'
          }
        }
      }
    },
    series: [{
      name: '词云分析',
      type: 'wordCloud',
      // 词云整个图表放置的位置 和 尺寸大小
      left: 'center',
      top: 'center',
      width: '80%',
      height: '90%',
      right: null,
      bottom: null,
      //设置为true可以使单词部分在画布之外绘制, 允许绘制大于画布大小的单词
      drawOutOfBound: false,
      // 单词之间的间隔大小
      gridSize: 20,
      // 最小字体和最大字体
      sizeRange: [24, 128],
      // 字体旋转角度的范围
      //文本旋转范围和步进度。文本将通过rotationStep:45在[- 90,90]范围内随机旋转
      rotationRange: [-90, 90],
      //rotationRange: [0, 0],
      rotationStep: 45,
      //可用的形状有(circle)圆形(默认)、(cardioid)心形，(diamond)菱形，(triangle-forward)三角形向前，(triangle)三角形，(pentagon)五边形和(star)星形。*/
      shape: 'diamond',
      // 词云的形状，可选值有
      // cardioid心形,diamond菱形,square正方形,triangle-forward指向右边的三角形,triangle-upright正三角形
      // triangle三角形，pentagon五角形，star五角星形，
      textPadding: 0,
      autoSize: {
        enable: true,
        minSize: 24
      },
      textStyle: {
        color: function() {
          return 'rgb(' + [
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255)
          ].join(',') + ')';
        },
        emphasis: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: []
    }]
  };
  option.series[0].data = chartData.dataList;
  return option;
}
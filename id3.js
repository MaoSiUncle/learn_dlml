python 版本参考: https://blog.csdn.net/csqazwsxedc/article/details/65697652

/**
 * ID3 决策树
 */
/**
 * 数组删除
 * @param val
 */
Array.prototype.remove = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};
/**
 * 计算数据集合的熵
 * @param arr 数据
 */


function calc_shang(arr) {
  var len = arr.length; // 数据条目


  var labelCount = {}; //计算数据集合中的类别

  arr.forEach(row => {
    var label = row[row.length - 1];
    if (labelCount.hasOwnProperty(label)) {
      labelCount[label] += 1; // 如果有该类别 则自增1
    } else {
      labelCount[label] = 1;
    }
  });
  var shannonEnt = 0;// 计算熵
  for (var key in  labelCount) {
    var prob = parseFloat(labelCount[key]) / len;
    shannonEnt += -prob * Math.log2(prob);
  }
  return shannonEnt; // 计算熵
}

/**
 *
 * @param arr 数据集
 * @param axis 分列
 * @param value
 * @param 是否改变原引用 数组引用断开的问题
 */
function splitData(arr, axis, value, isref) {
   if(isref){
     var t = arr.slice(0);
     return t.filter(row => {
       return row[axis] == value;
     }).map(row => {
       // 做片切
        row.slice(0).splice(axis, 1);
        return row;
     });
   } else {
     return arr.filter(row => {
       return row[axis] == value;
     }).map(row => {
       // 做片切
       row.splice(axis, 1);
       return row;
     });
   }

}
/**
 * 获取 axis列的 值范围
 * @param arr
 * @param axis
 */
function getUniq(arr, axis) {
  var uarr =  arr.map(row => {
    return row[axis];
  });
  return [...new Set(uarr)];
}
function chooseBestFeature(dataset) {

  var baseEnt = calc_shang(dataset);// 计算原始熵


  var featureCount = dataset[0].length - 1; //特征数
  var bestGain = 0; //最优熵增益
  var bestFeature = -1;
  for(var i = 0 ; i < featureCount; i++){
    // 第i个特征 特征值 列表
    var featureList = getUniq(dataset, i);

    // 按 当前特征分类 的熵
    var newEnt = 0;
    featureList.forEach(featureVal => {
      var subDataSet = splitData(dataset, i, featureVal, true);
      var prob = subDataSet.length / dataset.length;
      newEnt += prob*calc_shang(subDataSet);
    });
    var infoGain = baseEnt - newEnt; //当前特征分类的信息增益
    if(infoGain > bestGain){
      bestFeature = i;
    }
  }

  return bestFeature;
}

function majorityCnt(classList) {
  var classCount = {};// hash 计数。。。
  classList.forEach(row => {
    // row[0] 结果
    if(classCount.hasOwnProperty(row[0])){
      classCount[row[0]] += 1;
    } else {
      classCount[row[0]] = 1;
    }
  })
  // hash Key Order
  var maxKey = '';
  var maxVal = 0;
  for(var key in classCount){
    if(classCount[key] > maxVal){
      maxKey = key;
      maxVal = classCount[key];
    }
  }
  return maxKey;
}
/**
 * 创建树
 * @param dataSet 数据集
 * @param labels  结果集
 */
var createTree = function (dataSet, labels) {
  /**
   * 因为要使用递归逻辑 json 逐步增加子节点
   */
  var classList = dataSet.map(row => {
    return row[row.length - 1];
  });// classList 存储了 当前数据集合的 最后一列 即 label
  // 如果 当前步骤的数据集合 的结果 全是 男 or 女 则直接返回 男女值
  var classCount = classList.filter(val => {
    return val == classList[0];
  }).length;
  if(classCount == classList.length){
    return classList[0];
  }
  // 如果当前只剩下了 label列(性别列) 则进行选举 返回最多的逻辑 二位数据 只剩下一列
  if(dataSet[0].length  == 1){
    return majorityCnt(classList);
  }
  var bestFeature = chooseBestFeature(dataSet);// return axis 返回的是 index
  var bestFeatureLabel = labels[bestFeature];
  var myTree = {};
  myTree[bestFeatureLabel] = {};// 追加树
  // 删除第一 优 的特征
  labels.splice(bestFeature, 1);// 知识点  splice 改变原数组

  featureVals = dataSet.map(row => {
    return row[bestFeature];
  });
  var uniqVals = [...new Set(featureVals)];// array 去重

  uniqVals.forEach(val => {
    var subLabels = labels;
    myTree[bestFeatureLabel][val] = createTree(splitData(dataSet, bestFeature, val, false), subLabels);
  });

  return myTree;
};

var dataSet = [
  ['长', '粗', '男'],
  ['短', '粗', '男'],
  ['短', '粗', '男'],
  ['长', '细', '女'],
  ['短', '细', '女'],
  ['短', '粗', '女'],
  ['长', '粗', '女'],
  ['长', '粗', '女']];
var labels = ['头发', '声音'];

var t = createTree(dataSet, labels);

console.log(JSON.stringify(t));


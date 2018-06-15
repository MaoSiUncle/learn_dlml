/**
 * 朴素贝叶斯算法 nodejs
 * python 版本同： https://blog.csdn.net/c406495762/article/details/77341116
 *
 */

/**
 *
 * @param arr arr 求和
 */
var sum = function (arr) {
  return arr.reduce((p,c) => p+c);
}
var np = require('numjs');
// 创建总词表
function createVocaList(dataSet) {
  var vocaSet = [];
  dataSet.forEach(doc => {
    vocaSet = Array.from(new Set([...doc, ...vocaSet]));
  })
  return vocaSet;
}
//切分词条
function setOfWords2Vec(vocaList, inputSet) {
  var returnVec = Array(vocaList.length).fill(0); // 一个词汇表 一样长的 都为0 的词汇表
  inputSet.forEach(item => {
    if(vocaList.indexOf(item) != -1){
      // 如果在词集合中 存在 则在相应位置标1
      returnVec[vocaList.indexOf(item)] = 1;
    }
  });
  return returnVec;
}

/**
 *
 * @param trainMatrix 样本转换成 词向量
 * @param trainCategory 实际训练结果集
 */
function trainNB0(trainMatrix, trainCategory) {
  var numTrainDocs = trainMatrix.length;
  var numWords = trainMatrix[0].length;// 样本数据集 转换成 向量矩阵 计算得到 每个样本的词条
  var p1Prob= sum(trainCategory)/numTrainDocs; // 输出是1 的概率 先验概率
  var p0Num = np.array(Array(numWords).fill(0));
  var p1Num = np.array(Array(numWords).fill(0));

  var p0Denom = 0.0;  var p1Denom = 0.0;

  for(var i = 0 ; i < numTrainDocs; i++){
    if(trainCategory[i] == 1){
      // 如果 i 文档的 结果是 1 属于侮辱性文档
      p1Num = p1Num.add(trainMatrix[i]);
      p1Denom += sum(trainMatrix[i]); // 该文档的词数量 统计侮辱性文档 总词的 词量
    } else {
      p0Num = p0Num.add(trainMatrix[i]);
      p0Denom += sum(trainMatrix[i]);
    }
  }
  var p1Vect = p1Num.divide(p1Denom); // 计算 每个词 在侮辱性文档里出现的概率
  var p0Vect = p0Num.divide(p0Denom);
  return {
    p1Vect,
    p0Vect,
    p1Prob
  }
}

// 训练集
var postingList = [['my', 'dog', 'has', 'flea', 'problems', 'help', 'please'],
  ['maybe', 'not', 'take', 'him', 'to', 'dog', 'park', 'stupid'],
  ['my', 'dalmation', 'is', 'so', 'cute', 'I', 'love', 'him'],
  ['stop', 'posting', 'stupid', 'worthless', 'garbage'],
  ['mr', 'licks', 'ate', 'my', 'steak', 'how', 'to', 'stop', 'him'],
  ['quit', 'buying', 'worthless', 'dog', 'food', 'stupid']];
// 训练结果
var classVec = [0,1,0,1,0,1];

var mvo = createVocaList(postingList);//创建总词集合

var trainMat = [];

postingList.forEach(doc => {
  trainMat.push(setOfWords2Vec(mvo, doc));
});
var t = trainNB0(trainMat, classVec);// 训练数据集合

/**
 * 分类函数 --简单实现
 * @param vec2classify 待分类的数据向量 需要转化成 已经训练数据集的向量
 * @param p0Vec 已经训练好的 0结果 的词集
 * @param p1Vec 已经训练好的 1结果 的词集
 * @param pClass1 p 1 的先验概率
 */
function classify(vec2classify, p0Vec, p1Vec, pClass1) {
  console.log(vec2classify);
  var p1 = np.array(vec2classify).multiply(p1Vec).tolist().reduce((p, c) => p * c) * pClass1;
  var p0 = np.array(vec2classify).multiply(p1Vec).tolist().reduce((p, c) => p * c) * pClass1;
  if(p1 > p0){
    return 1;
  }
  return 0;
}


console.log(JSON.stringify(mvo));
for(var key in t ){
  console.log('key:'+key);
  console.log('val:'+JSON.stringify(t[key]));
}

var testData = ['love', 'my', 'dalmation'];
//测试集合 转换成 对应词向量
var testMatrix = setOfWords2Vec(mvo, testData);
var s = classify(testMatrix, t.p1Vect, t.p0Vect, t.p1Prob);
console.log(s);

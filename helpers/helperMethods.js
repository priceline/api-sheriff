'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var flatten = require('flat');
var unflatten = require('flat').unflatten;

function isArray(what) {
  return Object.prototype.toString.call(what) === '[object Array]';
}
var findLength = function findLength(jsonToCheck, expectedLength) {
  switch (typeof expectedLength === 'undefined' ? 'undefined' : _typeof(expectedLength)) {
    case 'number':
      if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
        return jsonToCheck.length === expectedLength;
      } else if ((typeof jsonToCheck === 'undefined' ? 'undefined' : _typeof(jsonToCheck)) === 'object') {
        return Object.keys(jsonToCheck).length === expectedLength;
      }
      return jsonToCheck.length === expectedLength;
    default:
      if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
        return jsonToCheck.length >= expectedLength[0] && jsonToCheck.length <= expectedLength[1];
      } else if ((typeof jsonToCheck === 'undefined' ? 'undefined' : _typeof(jsonToCheck)) === 'object') {
        return Object.keys(jsonToCheck).length >= expectedLength[0] && Object.keys(jsonToCheck).length <= expectedLength[1];
      } else if (typeof jsonToCheck === 'string') {
        return jsonToCheck.length >= expectedLength[0] && jsonToCheck.length <= expectedLength[1];
      }
      return jsonToCheck >= expectedLength[0] && jsonToCheck <= expectedLength[1];
  }
};
var checkDuplicates = function checkDuplicates(pathToField, jsonToCheck) {
  var flatJson = flatten(jsonToCheck);
  var badNodeList = [];
  var duplist = [];
  for (var value in flatJson) {
    if (value.match(pathToField)) {
      var field = pathToField.split('.').pop();
      for (var i = 0; i < duplist.length; i++) {
        if (duplist[i] === flatJson[value]) {
          badNodeList.push(value);
        }
      }
      duplist.push(flatJson[value]);
    }
  }
  if (badNodeList.length > 1) {
    return [false, JSON.stringify(badNodeList) + ' are duplicates'];
  }
  return [true, 'OK'];
};
var findJsonField = function findJsonField(path, jsonToCheck, fieldName, mode, root) {
  if (path.indexOf('.') < 0 || path === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path) {
      case '*':
        for (var i = 0; i < jsonToCheck.length; i++) {
          if (findField(jsonToCheck[i], fieldName)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        };
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (var _i = 0; _i < jsonToCheck.length; _i++) {
          if (findField(jsonToCheck[_i], fieldName)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findField(jsonToCheck, fieldName)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findField(jsonToCheck[path], fieldName)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList = [];

    var _count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (var j = 0; j < jsonToCheck.length; j++) {
          var _result = findJsonField(restofpathstr, jsonToCheck[j], fieldName, mode, root);
          if (!_result[0]) {
            _badNodeList.push(root + '[' + j + '] ' + _result[1]);
          } else {
            _count++;
          }
        }
        if (_count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, _badNodeList];
      case '?':
        restofpath = [];
        for (var _k = 1; _k < pathArr.length; _k++) {
          restofpath.push(pathArr[_k]);
        }
        restofpathstr = restofpath.join('.');
        for (var _j = 0; _j < jsonToCheck.length; _j++) {
          var _result2 = findJsonField(restofpathstr, jsonToCheck[_j], fieldName, mode, root);
          if (_result2[0]) {
            _count++;
          } else {
            _badNodeList.push(root + '[' + _j + '] ' + _result2[1]);
          }
        }
        if (_count < 1) {
          return [false, _badNodeList];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if (typeof jsonToCheck === 'undefined' && mode === 'strict') {
          return [false, pathArr[0] + ' not present'];
        } else if (typeof jsonToCheck === 'undefined' && mode === 'relaxed') {
          return [true, 'OK'];
        }
        restofpath = [];
        for (var _k2 = 1; _k2 < pathArr.length; _k2++) {
          restofpath.push(pathArr[_k2]);
        }
        restofpathstr = restofpath.join('.');
        var result = findJsonField(restofpathstr, jsonToCheck, fieldName, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
var findJsonLength = function findJsonLength(path, jsonToCheck, expectedLength, mode, root) {
  if (path.indexOf('.') < 0 || path === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path) {
      case '*':
        for (var i = 0; i < jsonToCheck.length; i++) {
          if (findLength(jsonToCheck[i], expectedLength)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (var _i2 = 0; _i2 < jsonToCheck.length; _i2++) {
          if (findLength(jsonToCheck[_i2], expectedLength)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findLength(jsonToCheck, expectedLength)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findLength(jsonToCheck[path], expectedLength)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList2 = [];
    var _count2 = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (var j = 0; j < jsonToCheck.length; j++) {
          var _result3 = findJsonLength(restofpathstr, jsonToCheck[j], expectedLength, mode, root);
          if (!_result3[0]) {
            _badNodeList2.push(root + '[' + j + '] ' + _result3[1]);
          } else {
            _count2++;
          }
        }
        if (_count2 === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, _badNodeList2];
      case '?':
        restofpath = [];
        for (var _k3 = 1; _k3 < pathArr.length; _k3++) {
          restofpath.push(pathArr[_k3]);
        }
        restofpathstr = restofpath.join('.');
        for (var _j2 = 0; _j2 < jsonToCheck.length; _j2++) {
          var _result4 = findJsonLength(restofpathstr, jsonToCheck[_j2], expectedLength, mode, root);
          if (_result4[0]) {
            _count2++;
          } else {
            _badNodeList2.push(root + '[' + _j2 + '] ' + _result4[1]);
          }
        }
        if (_count2 < 1) {
          return [false, _badNodeList2];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if (typeof jsonToCheck === 'undefined' && mode === 'strict') {
          return [false, pathArr[0] + ' not present'];
        } else if (typeof jsonToCheck === 'undefined' && mode === 'relaxed') {
          return [true, 'OK'];
        }
        restofpath = [];
        for (var _k4 = 1; _k4 < pathArr.length; _k4++) {
          restofpath.push(pathArr[_k4]);
        }
        restofpathstr = restofpath.join('.');
        var result = findJsonLength(restofpathstr, jsonToCheck, expectedLength, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
var findJsonValues = function findJsonValues(path, jsonToCheck, inputJson, mode, root) {
  if (path.indexOf('.') < 0 || path === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path) {
      case '*':
        for (var i = 0; i < jsonToCheck.length; i++) {
          if (findJson(jsonToCheck[i], inputJson, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (var _i3 = 0; _i3 < jsonToCheck.length; _i3++) {
          if (findJson(jsonToCheck[_i3], inputJson, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findJson(jsonToCheck, inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findJson(jsonToCheck[path], inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList3 = [];
    var _count3 = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (var j = 0; j < jsonToCheck.length; j++) {
          var _result5 = findJsonValues(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (!_result5[0]) {
            _badNodeList3.push(root + '[' + j + '] ' + _result5[1]);
          } else {
            _count3++;
          }
        }
        if (_count3 === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, _badNodeList3];
      case '?':
        restofpath = [];
        for (var _k5 = 1; _k5 < pathArr.length; _k5++) {
          restofpath.push(pathArr[_k5]);
        }
        restofpathstr = restofpath.join('.');
        for (var _j3 = 0; _j3 < jsonToCheck.length; _j3++) {
          var _result6 = findJsonValues(restofpathstr, jsonToCheck[_j3], inputJson, mode, root);
          if (_result6[0]) {
            _count3++;
          } else {
            _badNodeList3.push(root + '[' + _j3 + '] ' + _result6[1]);
          }
        }
        if (_count3 < 1) {
          return [false, _badNodeList3];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if (typeof jsonToCheck === 'undefined' && (mode === 'strict_notnull' || mode === 'strict_null')) {
          return [false, pathArr[0] + ' not present'];
        } else if (typeof jsonToCheck === 'undefined' && (mode === 'relaxed_notnull' || mode === 'relaxed_null')) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (var _k6 = 1; _k6 < pathArr.length; _k6++) {
          restofpath.push(pathArr[_k6]);
        }
        restofpathstr = restofpath.join('.');
        var result = findJsonValues(restofpathstr, jsonToCheck, inputJson, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};

function find(json, key, value, mode) {
  var result = [];
  var found = false;
  for (var property in json) {
    if (json.hasOwnProperty(property)) {
      if (property === key && json[property] === value) {
        found = true;
        return true;
      }
      if (isArray(json[property])) {
        if (typeof json[property][0] !== 'Object') {
          return json[property].toString() === value.toString();
        }
        for (var child in json[property]) {
          var res = find(json[property][child], key, value);
          if (res) {
            return true;
          }
        }
      }
    }
  }
  if (found === false && (mode === 'strict_null' || mode === 'relaxed_null')) {
    return true;
  } else if (found === false && typeof json === 'undefined' && (mode === 'relaxed_null' || mode === 'relaxed_notnull')) {
    return true;
  }
  return false;
}
var translateToFirstJson = function translateToFirstJson(json1, json2, fieldmap, mode) {
  var errorString = '';
  var newJson = void 0;
  for (var i = 0; i < fieldmap.length; i++) {
    newJson = {};
    var map = fieldmap[i];
    var field = Object.keys(map)[0];
    var mapvalue = map[Object.keys(map)[0]];
    var fieldParts = field.split('*');
    var mapping = {};
    var mapvalueParts = mapvalue.split('*');
    if (fieldParts.length !== mapvalueParts.length) {
      return [false, 'Invalid mapping'];
      //deferred.reject(new Error('Invalid mapping'));
    }
    for (var part in fieldParts) {
      if (_fieldParts[part].charAt(_fieldParts[part].length - 1) === '.') {
        _fieldParts[part] = _fieldParts[part].substring(0, _fieldParts[part].length - 1);
      }
      if (_fieldParts[part].charAt(0) === '.') {
        _fieldParts[part] = _fieldParts[part].substring(1);
      }
      if (mapvalueParts[part].charAt(mapvalueParts[part].length - 1) === '.') {
        mapvalueParts[part] = mapvalueParts[part].substring(0, mapvalueParts[part].length - 1);
      }
      if (mapvalueParts[part].charAt(0) === '.') {
        mapvalueParts[part] = mapvalueParts[part].substring(1);
      }
      mapping[part] = JSON.parse('{ \'' + mapvalueParts[part] + '\': \'' + _fieldParts[part] + '\'}');
      var json2flat = flatten(json2);
      var newstring = void 0;
      var checkifarray = void 0;
      var checkjson = JSON.parse(JSON.stringify(json2));
      var json2flatParts = [];
      var copyArray = [];
      var levelWord = '';
      var fieldpartsval = void 0;
      var index = 0;
      var ind = void 0;
      for (var val in json2flat) {
        fieldpartsval = val.split('.');
        while (index < fieldpartsval.length) {
          if (isNaN(fieldpartsval[index])) {
            levelWord += fieldpartsval[index] + '.';
          } else {
            //encountered a number
            levelWord = levelWord.substring(0, levelWord.length - 1);
            checkifarray = levelWord.split('.');
            for (var k = 0; k < checkifarray.length; k++) {
              checkjson = checkjson[checkifarray[k]];
            }
            if (checkjson instanceof Array) {
              json2flatParts.push({ 'field': levelWord });
              json2flatParts.push({ 'number': fieldpartsval[index] });
              levelWord = '';
            } else {
              levelWord += '.' + fieldpartsval[index] + '.';
            }
          }
          index++;
          checkjson = JSON.parse(JSON.stringify(json2));
        }
        levelWord = levelWord.substring(0, levelWord.length - 1);
        json2flatParts.push({ 'field': levelWord });
        //console.log('JSON2FLATPARTS '+ JSON.stringify(json2flatParts));
        ind = 0;
        for (var pt in json2flatParts) {
          //console.log('Key '+Object.keys(json2flatParts[pt])[0]);
          if (Object.keys(json2flatParts[pt])[0] === 'number') {
            ind++;
            continue;
          } else {
            if (mapping[ind]) {
              if (json2flatParts[pt][Object.keys(json2flatParts[pt])[0]] === Object.keys(mapping[ind])[0]) {
                json2flatParts[pt][Object.keys(json2flatParts[pt])[0]] = mapping[ind][Object.keys(mapping[ind])[0]];
              }
            }
          }
        }
        for (var _pt in json2flatParts) {
          copyArray.push(json2flatParts[_pt][Object.keys(json2flatParts[_pt])[0]]);
        }
        newstring = copyArray.join('.');
        newJson[newstring] = json2flat[val];
        newstring = '';
        index = 0;
        ind = 0;
        levelWord = '';
        copyArray = [];
        checkjson = JSON.parse(JSON.stringify(json2));
        json2flatParts = [];
      }
      var _fieldParts = field.split('.');
      var topfield = _fieldParts.pop();
      var fieldpath = _fieldParts.join('.');
      if (fieldpath.length === 0) {
        fieldpath = '.';
      }
      var result = compareFields(fieldpath, json1, unflatten(newJson), topfield, mode, '.');
      if (!result[0]) {
        errorString += result[1] + ' - Field ' + field + ',';
      }
    }
  }
  if (errorString.length === 0) {
    return [true, JSON.stringify(newJson)];
  }
  return [false, errorString];
};
var compareFieldValue = function compareFieldValue(jsonToCheck1, jsonToCheck2, fieldName, mode) {
  if (typeof jsonToCheck1 === 'undefined' && typeof jsonToCheck2 === 'undefined' && mode === 'relaxed') {
    return true;
  } else if (typeof jsonToCheck1 === 'undefined' && typeof jsonToCheck2 !== 'undefined') {
    return false;
  } else if (typeof jsonToCheck1 !== 'undefined' && typeof jsonToCheck2 === 'undefined') {
    return false;
  }
  if (typeof jsonToCheck1[fieldName] === 'undefined' && typeof jsonToCheck2[fieldName] === 'undefined' && mode === 'relaxed') {
    return true;
  } else if (typeof jsonToCheck1[fieldName] === 'undefined' && typeof jsonToCheck2[fieldName] !== 'undefined') {
    return false;
  } else if (typeof jsonToCheck1[fieldName] !== 'undefined' && typeof jsonToCheck2[fieldName] === 'undefined') {
    return false;
  } else if (typeof jsonToCheck1[fieldName] === 'undefined' && typeof jsonToCheck2[fieldName] === 'undefined' && mode === 'strict') {
    return false;
  }
  if (Object.prototype.toString.call(jsonToCheck1[fieldName]) === '[object Array]') {
    return jsonToCheck1[fieldName].length === jsonToCheck2[fieldName].length;
  } else if (_typeof(jsonToCheck1[fieldName]) === 'object') {
    return Object.keys(jsonToCheck1[fieldName]).length === Object.keys(jsonToCheck2[fieldName]).length;
  }
  if (!isNaN(jsonToCheck1[fieldName]) && !isNaN(jsonToCheck2[fieldName])) {
    return Number(jsonToCheck1[fieldName]) === Number(jsonToCheck2[fieldName]);
  }
  return jsonToCheck1[fieldName] === jsonToCheck2[fieldName];
};
var compareFields = function compareFields(path, jsonToCheck1, jsonToCheck2, fieldName, mode, root) {
  if (path.indexOf('.') < 0 || path === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path) {
      case '*':
        for (var i = 0; i < jsonToCheck1.length; i++) {
          if (compareFieldValue(jsonToCheck1[i], jsonToCheck2[i], fieldName, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck1.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (var _i4 = 0; _i4 < jsonToCheck1.length; _i4++) {
          if (compareFieldValue(jsonToCheck1[_i4], jsonToCheck2[_i4], fieldName, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (compareFieldValue(jsonToCheck1, jsonToCheck2, fieldName, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (compareFieldValue(jsonToCheck1[path], jsonToCheck2[path], fieldName, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList4 = [];
    var _count4 = 0;
    var minLength = void 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        minLength = jsonToCheck1.length;
        var unequal = false;
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
            if (mode === 'strict') {
              unequal = true;
              for (var j = jsonToCheck2.length; j < jsonToCheck1.length; j++) {
                _badNodeList4.push(root + '[' + j + '] ' + 'not present in json 2');
              }
            }
          } else {
            minLength = jsonToCheck1.length;
            if (mode === 'strict') {
              unequal = true;
              for (var _j4 = jsonToCheck1.length; _j4 < jsonToCheck2.length; _j4++) {
                _badNodeList4.push(root + '[' + _j4 + '] ' + 'not present in json 1');
              }
            }
          }
        }
        for (var _j5 = 0; _j5 < minLength; _j5++) {
          var _result7 = compareFields(restofpathstr, jsonToCheck1[_j5], jsonToCheck2[_j5], fieldName, mode, root);
          if (!_result7[0]) {
            _badNodeList4.push(root + '[' + _j5 + '] ' + _result7[1]);
          } else {
            _count4++;
          }
        }
        if (_count4 === minLength && !unequal) {
          return [true, 'OK'];
        }
        return [false, _badNodeList4];
      case '?':
        restofpath = [];
        for (var _k7 = 1; _k7 < pathArr.length; _k7++) {
          restofpath.push(pathArr[_k7]);
        }
        restofpathstr = restofpath.join('.');
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
          } else {
            minLength = jsonToCheck1.length;
          }
        }
        for (var _j6 = 0; _j6 < minLength; _j6++) {
          var _result8 = compareFields(restofpathstr, jsonToCheck1[_j6], jsonToCheck2[_j6], fieldName, mode, root);
          if (_result8[0]) {
            _count4++;
          } else {
            _badNodeList4.push(root + '[' + _j6 + '] ' + _result8[1]);
          }
        }
        if (_count4 < 1) {
          return [false, _badNodeList4];
        }
        return [true, 'OK'];
      default:
        jsonToCheck1 = jsonToCheck1[pathArr[0]];
        jsonToCheck2 = jsonToCheck2[pathArr[0]];
        if (typeof jsonToCheck1 === 'undefined' && mode === 'strict') {
          return [false, pathArr[0] + ' not present in json 1'];
        } else if (typeof jsonToCheck2 === 'undefined' && mode === 'strict') {
          return [false, pathArr[0] + ' not present in json 2'];
        } else if (typeof jsonToCheck1 === 'undefined' && typeof jsonToCheck2 === 'undefined' && mode === 'relaxed') {
          return [true, 'OK'];
        } else if (typeof jsonToCheck1 === 'undefined' && mode === 'relaxed') {
          //return [false, pathArr[0]+' present in json 2 but not in json 1'];
          return [true, 'OK'];
        } else if (typeof jsonToCheck2 === 'undefined' && mode === 'relaxed') {
          //return [false, pathArr[0]+' present in json 1 but not in json 2'];
          return [true, 'OK'];
        }
        restofpath = [];
        for (var _k8 = 1; _k8 < pathArr.length; _k8++) {
          restofpath.push(pathArr[_k8]);
        }
        restofpathstr = restofpath.join('.');
        var result = compareFields(restofpathstr, jsonToCheck1, jsonToCheck2, fieldName, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
var compareFieldValueWithMap = function compareFieldValueWithMap(json1, json2, fieldMap) {
  if (Object.prototype.toString.call(jsonToCheck1[Object.keys(fieldMap)[0]]) === '[object Array]') {
    return jsonToCheck1[fieldName].length === jsonToCheck2[fieldName].length;
  }
  if (jsonToCheck1[Object.keys(fieldMap)[0]] === jsonToCheck2[fieldMap[Object.keys(fieldMap)[0]]]) {
    return true;
  }
  return false;
};
var quickParser = function quickParser(json, path) {
  var pathParts = path.split('.');
  for (var pt in pathParts) {
    json = json[pathParts[pt]];
  }
  return json;
};
var compareFieldsWithMap = function compareFieldsWithMap(path1, path2, jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2) {
  if (path1.indexOf('.') < 0 || path1 === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path1) {
      case '*':
        for (var i = 0; i < jsonToCheck1.length; i++) {
          if (compareFieldValueWithMap(jsonToCheck1[i], jsonToCheck2[i], fieldMap)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck1.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '.':
        if (compareFieldValueWithMap(jsonToCheck1, jsonToCheck2, fieldMap)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (compareFieldValueWithMap(jsonToCheck1[path1], jsonToCheck2[path2], fieldMap)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr1 = void 0;
    var restofpath1 = [];
    var restofpathstr2 = void 0;
    var restofpath2 = [];
    var restofpath = [];
    var pathArr1 = path1.split('*');
    var newPathArr = [];
    var newPathArr2 = void 0;
    var restofpathstr = void 0;
    var pathArr = [];
    if (pathArr1.length > 1) {
      for (var _i5 = 0; _i5 < pathArr1.length; _i5++) {
        if (pathArr1[_i5] !== '') {
          newPathArr.push(pathArr1[_i5]);
        }
        if (_i5 < pathArr1.length - 1) {
          newPathArr.push('*');
        }
      }
      pathArr1 = newPathArr;
    }
    newPathArr = [];
    var pathArr2 = path2.split('*');
    if (pathArr2.length > 1) {
      for (var _i6 = 0; _i6 < pathArr2.length; _i6++) {
        if (pathArr2[_i6] !== '') {
          newPathArr.push(pathArr2[_i6]);
        }
        if (_i6 < pathArr2.length - 1) {
          newPathArr2.push('*');
        }
      }
      pathArr2 = newPathArr;
    }
    if (pathArr1[0] !== '*' && pathArr1[0] !== '?') {
      root1 = pathArr1[0];
    }
    if (pathArr2[0] !== '*' && pathArr2[0] !== '?') {
      root2 = pathArr2[0];
    }
    var _badNodeList5 = [];
    var _count5 = 0;
    switch (pathArr1[0]) {
      case '*':
        restofpath1 = [];
        for (var k = 1; k < pathArr1.length; k++) {
          restofpath1.push(pathArr1[k]);
        }
        restofpathstr1 = restofpath1.join('.');
        for (var _k9 = 1; _k9 < pathArr2.length; _k9++) {
          restofpath2.push(pathArr2[_k9]);
        }
        restofpathstr2 = restofpath2.join('.');
        var minLength = jsonToCheck1.length;
        var unequal = false;
        var _fieldName = void 0;
        if (jsonToCheck1.length !== jsonToCheck2.length) {
          if (jsonToCheck1.length > jsonToCheck2.length) {
            minLength = jsonToCheck2.length;
            if (mode === 'strict') {
              unequal = true;
              for (var j = jsonToCheck2.length; j < jsonToCheck1.length; j++) {
                _badNodeList5.push(root2 + '[' + j + '] ' + 'not present in json 2');
              }
            }
          } else {
            minLength = jsonToCheck1.length;
            if (mode === 'strict') {
              unequal = true;
              for (var _j7 = jsonToCheck1.length; _j7 < jsonToCheck2.length; _j7++) {
                _badNodeList5.push(root1 + '[' + _j7 + '] ' + 'not present in json 1');
              }
            }
          }
        }
        for (var _j8 = 0; _j8 < minLength; _j8++) {
          var _result9 = compareFieldsWithMap(restofpathstr1, restofpathstr2, jsonToCheck1[_j8], jsonToCheck2[_j8], _fieldName, mode, root1, root2);
          if (!_result9[0]) {
            _badNodeList5.push(root1 + '[' + _j8 + '] ' + _result9[1]);
          } else {
            _count5++;
          }
        }
        if (_count5 === minLength && !unequal) {
          return [true, 'OK'];
        }
        return [false, _badNodeList5];
      default:
        jsonToCheck1 = quickParser(jsonToCheck1, pathArr1[0]);
        jsonToCheck2 = quickParser(jsonToCheck2, pathArr2[0]);
        //console.log(JSON.stringify(jsonToCheck1));
        //console.log(JSON.stringify(jsonToCheck2));
        if (typeof jsonToCheck1 === 'undefined' && mode === 'strict') {
          return [false, pathArr1[0] + ' not present in json 1'];
        } else if (typeof jsonToCheck2 === 'undefined' && mode === 'strict') {
          return [false, pathArr2[0] + ' not present in json 2'];
        } else if (typeof jsonToCheck1 === 'undefined' && typeof jsonToCheck2 === 'undefined' && mode === 'relaxed') {
          return [true, 'OK'];
        } else if (typeof jsonToCheck1 === 'undefined' && mode === 'relaxed') {
          //return [false, pathArr[0]+' present in json 2 but not in json 1'];
          return [true, 'OK'];
        } else if (typeof jsonToCheck2 === 'undefined' && mode === 'relaxed') {
          //return [false, pathArr[0]+' present in json 1 but not in json 2'];
          return [true, 'OK'];
        }
        restofpath1 = [];
        restofpath2 = [];
        for (var _k10 = 1; _k10 < pathArr.length; _k10++) {
          restofpath.push(pathArr[_k10]);
        }
        restofpathstr = restofpath.join('.');
        var result = compareFieldsWithMap(restofpathstr1, restofpathstr2, jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
var findJson = function findJson(parentJson, childJson, mode) {
  for (var field in childJson) {
    if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
      return findJson(parentJson[field], childJson[field], mode);
    }
    if (!find(parentJson, field, childJson[field], mode)) {
      return false;
    }
  }
  return true;
};
var findField = function findField(parentJson, fieldName) {
  if (typeof parentJson[fieldName] !== 'undefined') {
    return true;
  }
  return false;
};

function checkType(json, key, expectedType, mode) {
  var result = [];
  var found = false;
  for (var property in json) {
    if (json.hasOwnProperty(property)) {
      if (property === key && _typeof(json[property]) === expectedType.toLowerCase()) {
        found = true;
        return true;
      }
      if (isArray(json[property])) {
        if (typeof json[property][0] !== 'Object') {
          return _typeof(json[property].toString()) === expectedType.toLowerCase();
        }
        for (var child in json[property]) {
          var res = checkType(json[property][child], key, expectedType, mode);
          if (res) {
            return true;
          }
        }
      }
    }
  }
  if (found === false && (mode === 'strict_null' || mode === 'relaxed_null')) {
    return true;
  } else if (found === false && typeof json === 'undefined' && (mode === 'relaxed_null' || mode === 'relaxed_notnull')) {
    return true;
  }
  return false;
}
var findJsonTypes = function findJsonTypes(path, jsonToCheck, inputJson, mode, root) {
  if (path.indexOf('.') < 0 || path === '.') {
    var badNodeList = [];
    var count = 0;
    switch (path) {
      case '*':
        for (var i = 0; i < jsonToCheck.length; i++) {
          if (findJsonType(jsonToCheck[i], inputJson, mode)) {
            count++;
          } else {
            badNodeList.push(i);
          }
        }
        if (count === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, root + '(' + badNodeList + ')'];
      case '?':
        for (var _i7 = 0; _i7 < jsonToCheck.length; _i7++) {
          if (findJsonType(jsonToCheck[_i7], inputJson, mode)) {
            count++;
          }
        }
        if (count > 1) {
          return [true, 'OK'];
        }
        return [false, root + '(All)'];
      case '.':
        if (findJsonType(jsonToCheck, inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
      default:
        if (findJsonType(jsonToCheck[path], inputJson, mode)) {
          return [true, 'OK'];
        }
        return [false, ''];
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList6 = [];
    var _count6 = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (var j = 0; j < jsonToCheck.length; j++) {
          var _result10 = findJsonTypes(restofpathstr, jsonToCheck[j], inputJson, mode, root);
          if (!_result10[0]) {
            _badNodeList6.push(root + '[' + j + '] ' + _result10[1]);
          } else {
            _count6++;
          }
        }
        if (_count6 === jsonToCheck.length) {
          return [true, 'OK'];
        }
        return [false, _badNodeList6];
      case '?':
        restofpath = [];
        for (var _k11 = 1; _k11 < pathArr.length; _k11++) {
          restofpath.push(pathArr[_k11]);
        }
        restofpathstr = restofpath.join('.');
        for (var _j9 = 0; _j9 < jsonToCheck.length; _j9++) {
          var _result11 = findJsonTypes(restofpathstr, jsonToCheck[_j9], inputJson, mode, root);
          if (_result11[0]) {
            _count6++;
          } else {
            _badNodeList6.push(root + '[' + _j9 + '] ' + _result11[1]);
          }
        }
        if (_count6 < 1) {
          return [false, _badNodeList6];
        }
        return [true, 'OK'];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if (typeof jsonToCheck === 'undefined' && (mode === 'strict_notnull' || mode === 'strict_null')) {
          return [false, pathArr[0] + ' not present'];
        } else if (typeof jsonToCheck === 'undefined' && (mode === 'relaxed_notnull' || mode === 'relaxed_null')) {
          return [true, 'OK'];
        }
        restofpath = [];
        for (var _k12 = 1; _k12 < pathArr.length; _k12++) {
          restofpath.push(pathArr[_k12]);
        }
        restofpathstr = restofpath.join('.');
        var result = findJsonTypes(restofpathstr, jsonToCheck, inputJson, mode, root);
        if (result[0]) {
          return [true, 'OK'];
        }
        return [false, result[1] + ''];
    }
  }
};
var findJsonType = function findJsonType(parentJson, childJson, mode) {
  for (var field in childJson) {
    if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
      return findJsonType(parentJson[field], childJson[field], mode);
    }
    if (!checkType(parentJson, field, childJson[field], mode)) {
      return false;
    }
  }
  return true;
};
var checkSort = function checkSort(path, jsonToCheck, sortType, mode, root, currValue) {
  if (path.indexOf('.') < 0) {
    var badNodeList = [];
    if (Object.prototype.toString.call(jsonToCheck[path]) === '[object Object]' || Object.prototype.toString.call(jsonToCheck[path]) === '[object Array]') {
      return [false, ''];
    }
    if (typeof jsonToCheck[path] === 'undefined' && mode === 'relaxed') {
      return [true, currValue];
    }
    switch (sortType) {
      case 'ASC':
        if (Number(jsonToCheck[path]) >= Number(currValue)) {
          //console.log('true currValue '+currValue+ ' '+ jsonToCheck[path]+ ' '+(typeof jsonToCheck[path]));
          currValue = jsonToCheck[path];
        } else {
          //console.log('false currValue '+currValue+ ' '+ jsonToCheck[path]+ ' '+(typeof jsonToCheck[path]));
          return [false, ''];
        }
        break;
      case 'DESC':
        if (Number(jsonToCheck[path]) <= Number(currValue)) {
          currValue = jsonToCheck[path];
        } else {
          return [false, ''];
        }
        return [true, currValue];
      default:
    }
  } else {
    var restofpathstr = void 0;
    var restofpath = [];
    var pathArr = path.split('.');
    if (pathArr[0] !== '*' && pathArr[0] !== '?') {
      root = pathArr[0];
    }
    var _badNodeList7 = [];
    var count = 0;
    switch (pathArr[0]) {
      case '*':
        restofpath = [];
        for (var k = 1; k < pathArr.length; k++) {
          restofpath.push(pathArr[k]);
        }
        restofpathstr = restofpath.join('.');
        for (var j = 0; j < jsonToCheck.length; j++) {
          var _result12 = checkSort(restofpathstr, jsonToCheck[j], sortType, mode, root, currValue);
          if (!_result12[0]) {
            _badNodeList7.push(root + '[' + j + '] ' + _result12[1]);
          }
          count++;
          currValue = _result12[1];
        }
        if (count === jsonToCheck.length) {
          return [true, currValue];
        }
        return [false, _badNodeList7];
      default:
        jsonToCheck = jsonToCheck[pathArr[0]];
        if (typeof jsonToCheck === 'undefined' && mode === 'strict') {
          return [false, pathArr[0] + ' not present'];
        } else if (typeof jsonToCheck === 'undefined' && mode === 'relaxed') {
          return [true, currValue];
        }
        restofpath = [];
        for (var _k13 = 1; _k13 < pathArr.length; _k13++) {
          restofpath.push(pathArr[_k13]);
        }
        restofpathstr = restofpath.join('.');
        var result = checkSort(restofpathstr, jsonToCheck, sortType, mode, root, currValue);
        currValue = result[1];
        if (result[0]) {
          return [true, currValue];
        }
        return [false, result[1] + ''];
    }
  }
};

module.exports = {
  findJsonTypes: findJsonTypes,
  findJson: findJson,
  find: find,
  findJsonValues: findJsonValues,
  findJsonLength: findJsonLength,
  findJsonField: findJsonField,
  findField: findField,
  checkSort: checkSort,
  compareFields: compareFields,
  translateToFirstJson: translateToFirstJson,
  checkDuplicates: checkDuplicates,
  compareFieldsWithMap: compareFieldsWithMap
};
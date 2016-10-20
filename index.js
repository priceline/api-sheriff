'use strict';

var Q = require('q');
var request = require('request');
var helper = require('./helpers/helperMethods.js');
var flatten = require('flat');

var submitPostRequest = function submitPostRequest(url, body, headers, options, done, customError) {
  var deferred = Q.defer();
  var reqHeader = headers ? headers : { 'content-type': 'application/json' };
  var reqJson = {
    url: url,
    method: 'POST',
    headers: reqHeader,
    body: body,
    proxy: ''
  };
  if (options) {
    for (var field in options) {
      reqJson[field] = options[field];
    }
  }
  request(reqJson, function (error, response, data) {
    if (!error) {
      deferred.resolve(response);
    } else {
      if (typeof customError !== 'undefined') {
        deferred.reject(new Error(customError));
      } else if (error) {
        deferred.reject(new Error(error));
      } else {
        deferred.reject(new Error('Invalid request'));
      }
    }
  });
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var submitGetRequest = function submitGetRequest(url, headers, options, done, customError) {
  var deferred = Q.defer();
  var reqHeader = headers ? headers : { 'content-type': 'application/json' };
  var reqJson = {
    url: url,
    method: 'GET',
    headers: reqHeader,
    rejectUnauthorized: false,
    proxy: ''
  };
  if (options) {
    for (var field in options) {
      reqJson[field] = options[field];
    }
  }
  request(reqJson, function (error, response, data) {
    if (!error) {
      deferred.resolve(response);
    } else {
      if (typeof customError !== 'undefined') {
        deferred.reject(new Error(customError));
      } else if (error) {
        deferred.reject(new Error(error));
      } else {
        deferred.reject(new Error('Invalid request'));
      }
    }
  });
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkJsonTypes = function checkJsonTypes(path, inputJson, json, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict_notnull' && mode !== 'relaxed_notnull' && mode !== 'strict_null' && mode !== 'relaxed_null') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    var result = helper.findJsonTypes(path, json, inputJson, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkJsonPresent = function checkJsonPresent(path, inputJson, json, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict_notnull' && mode !== 'relaxed_notnull' && mode !== 'strict_null' && mode !== 'relaxed_null') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    var result = helper.findJsonValues(path, json, inputJson, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkFieldNotPresent = function checkFieldNotPresent(path, fieldName, json, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    var result = helper.findJsonField(path, json, fieldName, mode, '.');
    if (!result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' is present'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkFieldPresent = function checkFieldPresent(path, fieldName, json, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    var result = helper.findJsonField(path, json, fieldName, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' not present'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkJsonLength = function checkJsonLength(path, json, expectedLength, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if (typeof expectedLength !== 'number' && !(Object.prototype.toString.call(expectedLength) === '[object Array]' && typeof expectedLength[0] === 'number' && typeof expectedLength[1] === 'number' && expectedLength.length === 2)) {
      deferred.reject(new Error('Expected length type incorrect'));
    } else {
      var result = helper.findJsonLength(path, json, expectedLength, mode, '.');
      if (result[0]) {
        deferred.resolve('OK');
      } else {
        deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match'));
      }
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkHeaderContains = function checkHeaderContains(headerJson, header, value, done, customError) {
  var deferred = Q.defer();
  if (headerJson[header.toLowerCase()].indexOf(value) > -1) {
    deferred.resolve('OK');
  } else {
    deferred.reject(new Error('Not found'));
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var compareJson = function compareJson(json1, json2) {
  var fields = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
  var mode = arguments[3];
  var done = arguments[4];
  var customError = arguments[5];

  var deferred = Q.defer();
  var errorString = '';
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if (fields.length !== 0) {
      for (var i = 0; i < fields.length; i++) {
        var fieldParts = fields[i].split('.');
        if (fieldParts[fieldParts.length] === '*' || fieldParts[fieldParts.length] === '?') {
          deferred.reject('Invalid field at index ' + i);
        } else {
          var field = fieldParts.pop();
          var fieldpath = fieldParts.join('.');
          if (fieldpath.length === 0) {
            fieldpath = '.';
          }
          var result = helper.compareFields(fieldpath, json1, json2, field, mode, '.');
          if (!result[0]) {
            errorString += result[1] + ' - Field ' + field + ',';
          }
        }
      }
    } else {
      var flat1json = flatten(json1);
      for (var fieldStr in flat1json) {
        var _fieldParts = fieldStr.split('.');
        var _field = _fieldParts.pop();
        var _fieldpath = _fieldParts.join('.');
        if (_fieldpath.length === 0) {
          _fieldpath = '.';
        }
        var _result = helper.compareFields(_fieldpath, json1, json2, _field, mode, '.');
        if (!_result[0]) {
          errorString += fieldStr + ' did not match - ' + _result[1];
        }
      }
    }
    if (errorString.length === 0) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(errorString));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var compareJsonWithMap = function compareJsonWithMap(json1, json2, fieldmap, mode, done, customError) {
  var deferred = Q.defer();
  var errorString = '';
  var mapping = void 0;
  var valid = true;
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if (typeof fieldmap === 'undefined') {
      deferred.reject(new Error('Field map should be specified'));
    } else {
      if (fieldmap.length !== 0) {
        if (typeof fieldmap === 'string') {
          try {
            fieldmap = JSON.parse(fieldmap);
          } catch (err) {
            deferred.reject(new Error('Field map not valid JSON'));
            valid = false;
          }
        } else {
          try {
            fieldmap = JSON.parse(JSON.stringify(fieldmap));
          } catch (err) {
            deferred.reject(new Error('Field map not valid JSON'));
            valid = false;
          }
        }
        if (valid === true) {
          var res = helper.translateToFirstJson(json1, json2, fieldmap, mode);
          if (res[0]) {
            deferred.resolve('OK');
          } else {
            deferred.reject(new Error(res[1]));
          }
        }
      } else {
        //fieldmap length not 0
        deferred.reject(new Error('Field map cannot be empty'));
      }
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkSortOrder = function checkSortOrder(path, sortType, json, mode, done, customError) {
  var deferred = Q.defer();
  mode = mode.toLowerCase();
  if (mode !== 'strict' && mode !== 'relaxed') {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if (sortType !== 'ASC' && sortType !== 'DESC') {
      deferred.reject('Invalid value for Sort Type');
    } else {
      if (path === '.' || path[path.length - 1] === '*' || path[path.length - 1] === '?') {
        deferred.reject('Invalid path');
      } else {
        var result = void 0;
        if (sortType === 'DESC') {
          result = helper.checkSort(path, json, sortType, mode, '.', Number.MAX_VALUE);
        } else {
          result = helper.checkSort(path, json, sortType, mode, '.', Number.MIN_VALUE);
        }
        if (result[0]) {
          deferred.resolve('OK');
        } else {
          deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match sort type'));
        }
      }
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
var checkDuplicates = function checkDuplicates(fieldList, json, done, customError) {
  var deferred = Q.defer();
  var errorString = '';
  for (var i = 0; i < fieldList.length; i++) {
    var result = helper.checkDuplicates(fieldList[i], json);
    if (!result[0]) {
      errorString += result[1];
    }
  }
  if (errorString.length > 1) {
    deferred.reject(customError ? new Error(customError) : new Error(errorString));
  } else {
    deferred.resolve('OK');
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
module.exports = {
  checkSortOrder: checkSortOrder,
  submitPostRequest: submitPostRequest,
  submitGetRequest: submitGetRequest,
  checkFieldPresent: checkFieldPresent,
  checkJsonPresent: checkJsonPresent,
  checkJsonLength: checkJsonLength,
  checkHeaderContains: checkHeaderContains,
  checkJsonTypes: checkJsonTypes,
  checkFieldNotPresent: checkFieldNotPresent,
  compareJson: compareJson,
  compareJsonWithMap: compareJsonWithMap,
  checkDuplicates: checkDuplicates
};

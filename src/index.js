const Q = require('q');
const request = require('request');
const helper = require('./helpers/helperMethods.js');
const flatten = require('flat');
const submitPostRequest = function(url, body, headers, options, done, customError) {
  const deferred = Q.defer();
  const reqHeader = headers ? headers : { 'content-type': 'application/json' };
  const reqJson = {
    url,
    method: 'POST',
    headers: reqHeader,
    body,
    proxy: '',
  };
  if (options) {
    for (const field in options) {
      reqJson[field] = options[field];
    }
  }
  request(reqJson, function(error, response, data) {
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
const submitGetRequest = function(url, headers, options, done, customError) {
  const deferred = Q.defer();
  const reqHeader = headers ? headers : { 'content-type': 'application/json' };
  const reqJson = {
    url,
    method: 'GET',
    headers: reqHeader,
    rejectUnauthorized: false,
    proxy: '',
  };
  if (options) {
    for (const field in options) {
      reqJson[field] = options[field];
    }
  }
  request(reqJson, function(error, response, data) {
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
const checkJsonTypes = function(path, inputJson, json, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict_notnull') && (mode !== 'relaxed_notnull') &&
    (mode !== 'strict_null') && (mode !== 'relaxed_null')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    const result = helper.findJsonTypes(path, json, inputJson, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const checkJsonPresent = function(path, inputJson, json, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict_notnull') && (mode !== 'relaxed_notnull') &&
    (mode !== 'strict_null') && (mode !== 'relaxed_null')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    const result = helper.findJsonValues(path, json, inputJson, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' did not match'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const checkFieldNotPresent = function(path, fieldName, json, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    const result = helper.findJsonField(path, json, fieldName, mode, '.');
    if (!result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' is present'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const checkFieldPresent = function(path, fieldName, json, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    const result = helper.findJsonField(path, json, fieldName, mode, '.');
    if (result[0]) {
      deferred.resolve('OK');
    } else {
      deferred.reject(customError ? new Error(customError) : new Error(result[1] + ' not present'));
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const checkJsonLength = function(path, json, expectedLength, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if ((typeof expectedLength !== 'number') &&
      (!((Object.prototype.toString.call(expectedLength) === '[object Array]') &&
      (typeof expectedLength[0] === 'number') && (typeof expectedLength[1] === 'number') &&
      (expectedLength.length === 2)))) {
      deferred.reject(new Error('Expected length type incorrect'));
    } else {
      const result = helper.findJsonLength(path, json, expectedLength, mode, '.');
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
const checkHeaderContains = function(headerJson, header, value, done, customError) {
  const deferred = Q.defer();
  if (headerJson[header.toLowerCase()].indexOf(value) > -1) {
    deferred.resolve('OK');
  } else {
    deferred.reject(new Error('Not found'));
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const compareJson = function(json1, json2, fields = [], mode, done, customError) {
  const deferred = Q.defer();
  let errorString = '';
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if (fields.length !== 0) {
      for (let i = 0; i < fields.length; i++) {
        const fieldParts = fields[i].split('.');
        if ((fieldParts[fieldParts.length] === '*') || (fieldParts[fieldParts.length] === '?')) {
          deferred.reject('Invalid field at index ' + i);
        } else {
          const field = fieldParts.pop();
          let fieldpath = fieldParts.join('.');
          if (fieldpath.length === 0) {
            fieldpath = '.';
          }
          const result = helper.compareFields(fieldpath, json1, json2, field, mode, '.');
          if (!result[0]) {
            errorString += result[1] + ' - Field ' + field + ',';
          }
        }
      }
    } else {
      const flat1json = flatten(json1);
      for (const fieldStr in flat1json) {
        const fieldParts = fieldStr.split('.');
        const field = fieldParts.pop();
        let fieldpath = fieldParts.join('.');
        if (fieldpath.length === 0) {
          fieldpath = '.';
        }
        const result = helper.compareFields(fieldpath, json1, json2, field, mode, '.');
        if (!result[0]) {
          errorString += fieldStr + ' did not match - ' + result[1];
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
const compareJsonWithMap = function(json1, json2, fieldmap, mode, done, customError) {
  const deferred = Q.defer();
  let errorString = '';
  let mapping;
  let valid = true;
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
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
          const res = helper.translateToFirstJson(json1, json2, fieldmap, mode);
          if (res[0]) {
            deferred.resolve('OK');
          } else {
            deferred.reject(new Error(res[1]));
          }
        }
      } else { //fieldmap length not 0
        deferred.reject(new Error('Field map cannot be empty'));
      }
    }
  }
  deferred.promise.nodeify(done);
  return deferred.promise;
};
const checkSortOrder = function(path, sortType, json, mode, done, customError) {
  const deferred = Q.defer();
  mode = mode.toLowerCase();
  if ((mode !== 'strict') && (mode !== 'relaxed')) {
    deferred.reject(new Error('Invalid value for Mode'));
  } else {
    if ((sortType !== 'ASC') && (sortType !== 'DESC')) {
      deferred.reject('Invalid value for Sort Type');
    } else {
      if ((path === '.') || (path[path.length - 1] === '*') || (path[path.length - 1] === '?')) {
        deferred.reject('Invalid path');
      } else {
        let result;
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
const checkDuplicates = function(fieldList, json, done, customError) {
  const deferred = Q.defer();
  let errorString = '';
  for (let i = 0; i < fieldList.length; i++) {
    const result = helper.checkDuplicates(fieldList[i], json);
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
  checkSortOrder,
  submitPostRequest,
  submitGetRequest,
  checkFieldPresent,
  checkJsonPresent,
  checkJsonLength,
  checkHeaderContains,
  checkJsonTypes,
  checkFieldNotPresent,
  compareJson,
  compareJsonWithMap,
  checkDuplicates,
};

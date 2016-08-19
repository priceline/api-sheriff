var Q = require('q');
var request = require('request');
var helper = require('./helpers/helperMethods.js');
var flatten = require('flat');

var submitPostRequest = function(url, body, headers, options, done, custom_error) {
	var deferred = Q.defer();
	var reqHeader = headers ? headers : { "content-type": "application/json" };
	var reqJson = {};
	reqJson["url"] = url;
	reqJson["method"] = "POST";
	reqJson["headers"] = headers;
	reqJson["body"] = body;
	reqJson["proxy"] = "";
	if (options) {
		for (var field in options) {
			reqJson[field] = options[field];
		}
	}
	request(reqJson, function(error, response, data) {
		if (!error) {
		    deferred.resolve(response);
		  } else {
			  console.log("ERROR");
			  if (typeof custom_error != "undefined")
				  deferred.reject(new Error(custom_error));
			  else if  (error) 
				  deferred.reject(new Error(error));
			  else
				  deferred.reject(new Error("Invalid request"));
		  }
		});
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var submitGetRequest = function(url, headers, options, done, custom_error) {
	var deferred = Q.defer();
	var reqHeader = headers ? headers : { "content-type": "application/json" };
	var reqJson = {};
	reqJson["url"] = url;
	reqJson["method"] = "GET";
	reqJson["headers"] = reqHeader;
	reqJson["rejectUnauthorized"] = false;
	//reqJson["requestCert"] = true;
    //reqJson["agent"]=false;
	reqJson["proxy"] = "";
	if (options) {
		for (var field in options) {
			reqJson[field] = options[field];
		}
	}
	request(reqJson, function(error, response, data) {
		  if (!error) {
		    deferred.resolve(response);
		  } else {
			  console.log("ERROR");
			  if (typeof custom_error != "undefined")
				  deferred.reject(new Error(custom_error));
			  else if  (error) 
				  deferred.reject(new Error(error));
			  else
				  deferred.reject(new Error("Invalid request"));
		  }
		});
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkJsonTypes = function(path, inputJson, json, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict_notnull")&&(mode != "relaxed_notnull")&&(mode != "strict_null")&&(mode != "relaxed_null"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		var result = helper.findJsonTypes(path, json, inputJson, mode, ".");
		if (result[0])
			deferred.resolve("OK");
		else
			deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+" did not match"));
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkJsonPresent = function(path, inputJson, json, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict_notnull")&&(mode != "relaxed_notnull")&&(mode != "strict_null")&&(mode != "relaxed_null"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		var result = helper.findJsonValues(path, json, inputJson, mode, ".");
		if (result[0])
			deferred.resolve("OK");
		else
			deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+" did not match"));
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkFieldNotPresent = function(path, fieldName, json, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		var result = helper.findJsonField(path, json, fieldName, mode, ".");
		if (!result[0])
			deferred.resolve("OK");
		else
			deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+ " is present"));
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkFieldPresent = function(path, fieldName, json, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		var result = helper.findJsonField(path, json, fieldName, mode, ".");
		if (result[0])
			deferred.resolve("OK");
		else
			deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+ " not present"));
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkJsonLength = function(path, json, expectedLength, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		if ((typeof expectedLength != "number")&&(!((Object.prototype.toString.call(expectedLength) === '[object Array]') && (typeof expectedLength[0] == "number") && (typeof expectedLength[1] == "number") && (expectedLength.length == 2))))
			deferred.reject(new Error("Expected length type incorrect"));
		else {
			var result = helper.findJsonLength(path, json, expectedLength, mode, ".");
			if (result[0])
				deferred.resolve("OK");
			else
				deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+ " did not match"));
		}
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkHeaderContains = function(headerJson, header, value, done, custom_error) {
	var deferred = Q.defer();
	if (headerJson[header.toLowerCase()].indexOf(value) > -1)
		deferred.resolve("OK");
	else
		deferred.reject(new Error("Not found"));
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var compareJson = function(json1, json2, fields, mode, done, custom_error) {
	var deferred = Q.defer();
	var error_string="";
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		if (typeof fields == "undefined") {
			fields = [];
		}
		if (fields.length!=0) {
			for (var i=0;i<fields.length;i++) {
				var field_parts = fields[i].split(".");
				if ((field_parts[field_parts.length]=="*")||(field_parts[field_parts.length]=="?"))
					deferred.reject("Invalid field at index "+i);
				else {
					var field = field_parts.pop();
					var fieldpath = field_parts.join(".");
					if (fieldpath.length==0)
						fieldpath=".";
					var result = helper.compareFields(fieldpath, json1, json2, field, mode, ".");
					if (!result[0]) {
						error_string+= result[1] + " - Field "+field+ ",";
					}
				}
			}
		} else {
			var flat1json = flatten(json1);
			for (var fieldStr in flat1json) {
				var field_parts = fieldStr.split(".");
				var field = field_parts.pop();
				var fieldpath = field_parts.join(".");
				if (fieldpath.length==0)
					fieldpath=".";
				var result = helper.compareFields(fieldpath, json1, json2, field, mode, ".");
				if (!result[0])
					error_string+= fieldStr + " did not match - "+result[1];
			}
		}
		if (error_string.length==0)
			deferred.resolve("OK");
		else
			deferred.reject(custom_error ? new Error(custom_error) : new Error(error_string));	
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var compareJsonWithMap = function(json1, json2, fieldmap, mode, done, custom_error) {
	var deferred = Q.defer();
	var error_string="", mapping;
	var valid = true;
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		if (typeof fieldmap == "undefined") {
			deferred.reject(new Error("Field map should be specified"));
		} else
			{
				if (fieldmap.length!=0) {
					if (typeof fieldmap == "string") {
						try {
							fieldmap = JSON.parse(fieldmap);
						} catch(err) {
							deferred.reject(new Error("Field map not valid JSON"));
							valid = false;
						}
					} else {
						try {
							fieldmap = JSON.parse(JSON.stringify(fieldmap));
						} catch(err) {
							deferred.reject(new Error("Field map not valid JSON"));
							valid = false;
						}
					}
					if (valid == true) {
						var res = helper.translateToFirstJson(json1, json2, fieldmap, mode);
						if (res[0]) {
							deferred.resolve("OK");
						} else
							deferred.reject(new Error(res[1]));
					} 
			} //fieldmap length not 0
				else {
				deferred.reject(new Error("Field map cannot be empty"));
			}
	     }
    }
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkSortOrder = function(path, sortType, json, mode, done, custom_error) {
	var deferred = Q.defer();
	mode = mode.toLowerCase();
	if ((mode != "strict")&&(mode != "relaxed"))
		deferred.reject(new Error("Invalid value for Mode"));
	else {
		if ((sortType!='ASC')&&(sortType!='DESC'))
			deferred.reject("Invalid value for Sort Type");
		else {
			if ((path==".")||(path[path.length-1]=="*")||(path[path.length-1]=="?"))
				deferred.reject("Invalid path");
			else {
				var result;
				if (sortType == 'DESC')
					result = helper.checkSort(path, json, sortType, mode, ".", Number.MAX_VALUE);
				else
					result = helper.checkSort(path, json, sortType, mode, ".", Number.MIN_VALUE);
				if (result[0])
					deferred.resolve("OK");
				else
					deferred.reject(custom_error ? new Error(custom_error) : new Error(result[1]+ " did not match sort type"));
			}
		}
	}
	deferred.promise.nodeify(done);
	return deferred.promise;
}

var checkDuplicates = function(field_list, json, done, custom_error) {
	var deferred = Q.defer();
	var error_string="";
	
	for (var i=0;i<field_list.length; i++) {
		result = helper.checkDuplicates(field_list[i], json);
		if (!result[0])
			error_string+= result[1];
	}
	if (error_string.length > 1)
		deferred.reject(custom_error ? new Error(custom_error) : new Error(error_string));
	else
		deferred.resolve("OK");
	deferred.promise.nodeify(done);
	return deferred.promise;
}

module.exports.checkSortOrder = checkSortOrder;
module.exports.submitPostRequest = submitPostRequest;
module.exports.submitGetRequest = submitGetRequest;
module.exports.checkFieldPresent = checkFieldPresent;
module.exports.checkJsonPresent = checkJsonPresent;
module.exports.checkJsonLength = checkJsonLength;
module.exports.checkHeaderContains = checkHeaderContains;
module.exports.checkJsonTypes = checkJsonTypes;
module.exports.checkFieldNotPresent = checkFieldNotPresent;
module.exports.compareJson = compareJson;
module.exports.compareJsonWithMap = compareJsonWithMap;
module.exports.checkDuplicates = checkDuplicates;
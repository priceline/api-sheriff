var flatten = require('flat');
var unflatten = require('flat').unflatten;

function isArray(what) {
	return Object.prototype.toString.call(what) === '[object Array]';
}

var findLength = function(jsonToCheck, expectedLength) {
	switch(typeof expectedLength) {
		case "number":
			if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
				return (jsonToCheck.length == expectedLength);
			} else if (typeof jsonToCheck == "object")
				return (Object.keys(jsonToCheck).length == expectedLength);
			else
				return (jsonToCheck.length == expectedLength);
		break;
		default:
			if (Object.prototype.toString.call(jsonToCheck) === '[object Array]') {
				return ((jsonToCheck.length >= expectedLength[0])&&(jsonToCheck.length <= expectedLength[1]));
			} else if (typeof jsonToCheck == "object")
				return ((Object.keys(jsonToCheck).length >= expectedLength[0])&&(Object.keys(jsonToCheck).length <= expectedLength[1]));
			else if (typeof jsonToCheck == "string")
				return ((jsonToCheck.length >= expectedLength[0])&&(jsonToCheck.length <= expectedLength[1]));
			else
				return ((jsonToCheck >= expectedLength[0])&&(jsonToCheck <= expectedLength[1]));
		break;
	}
}

var checkDuplicates = function(pathToField, jsonToCheck) {
	var flat_json = flatten(jsonToCheck);
	var bad_node_list = [], duplist = [];
	for (var value in flat_json) {
		if (value.match(pathToField)) {
			var field = pathToField.split(".").pop();
			for (var i=0; i < duplist.length; i++) {
				if (duplist[i] == flat_json[value])
					bad_node_list.push(value);
			}
			duplist.push(flat_json[value]);
		}
	}
	if (bad_node_list.length > 1)
		return [false, JSON.stringify(bad_node_list)+" are duplicates"];
	else
		return [true, "OK"];
}

var findJsonField = function(path, jsonToCheck, fieldName, mode, root) {
	if ((path.indexOf(".") < 0)||(path==".")) { 
		var bad_node_list=[];
		switch(path) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck.length;i++) {
				if (findField(jsonToCheck[i], fieldName))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck.length)
				return [true, "OK"];
			else 
				return [false, root+"("+bad_node_list+")"];
			break;
			case "?":
				var count=0;
				for (var i=0;i<jsonToCheck.length;i++) {
					if (findField(jsonToCheck[i], fieldName))
						count++;
				}
				if (count > 1)
					return [true, "OK"];
				else
					return [false, root+"(All)"];
				break;
			case ".":
				if (findField(jsonToCheck, fieldName))
					return [true, "OK"];
				else
					return [false, ""];
				break;
			default:
				if (findField(jsonToCheck[path], fieldName))
					return [true, "OK"];
				else
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr,restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonField(restofpathstr, jsonToCheck[j], fieldName, mode, root);
					if (!result[0]) {
						bad_node_list.push(root+"["+j+"] "+ result[1]);
					}
					else 
						count++;
				}
				if (count == jsonToCheck.length)
					return [true, "OK"];
				else 
					return [false, bad_node_list];
				break;
			case "?":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonField(restofpathstr, jsonToCheck[j], fieldName, mode, root);
					if (result[0])
						count++;
					else 
						bad_node_list.push(root+"["+j+"] "+ result[1]);
				}
				if (count < 1)
					return [false, bad_node_list];
				else
					return [true,"OK"];
				break;
			default:
				jsonToCheck = jsonToCheck[pathArr[0]];
				if ((typeof jsonToCheck == "undefined")&&(mode == 'strict')) {
					return [false, pathArr[0]+" not present"];
				}
				else if ((typeof jsonToCheck == "undefined")&&(mode == 'relaxed')) {
					return [true, "OK"];
				}
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = findJsonField(restofpathstr, jsonToCheck, fieldName, mode, root); 
					if (result[0])
						return [true,"OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

var findJsonLength = function(path, jsonToCheck, expectedLength, mode, root) {
	if ((path.indexOf(".") < 0)||(path==".")) { 
		var bad_node_list = [];
		switch(path) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck.length;i++) {
				if (findLength(jsonToCheck[i], expectedLength))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck.length)
				return [true, "OK"];
			else {
				return [false, root+"("+bad_node_list+")"];
			}
			break;
			case "?":
				var count=0;
				for (var i=0;i<jsonToCheck.length;i++) {
					if (findLength(jsonToCheck[i], expectedLength))
						count++;
				}
				if (count > 1)
					return [true, "OK"];
				else
					return [false, root+"(All)"];
				break;
			case ".":
				if (findLength(jsonToCheck, expectedLength))
					return [true, "OK"];
				else
					return [false, ""];
				break;
			default:
				if (findLength(jsonToCheck[path], expectedLength))
					return [true, "OK"];
				else
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr, restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonLength(restofpathstr, jsonToCheck[j], expectedLength, mode, root);
					if (!result[0])
						bad_node_list.push(root+"["+j+"] "+result[1]);
					else
						count++;
				}
				if (count == jsonToCheck.length)
					return [true, "OK"];
				else {
					return [false, bad_node_list];
				}
				break;
			case "?":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonLength(restofpathstr, jsonToCheck[j], expectedLength, mode, root);
					if (result[0])
						count++;
					else
						bad_node_list.push(root+"["+j+"] "+ result[1])
				}
				if (count < 1)
					return [false, bad_node_list];
				else
					return [true, "OK"];
				break;
			default:
				jsonToCheck = jsonToCheck[pathArr[0]];
				if ((typeof jsonToCheck == "undefined")&&(mode == 'strict')) {
					return [false, pathArr[0]+" not present"];
				}
				else if ((typeof jsonToCheck == "undefined")&&(mode == 'relaxed')) 
					return [true, "OK"];
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = findJsonLength(restofpathstr, jsonToCheck, expectedLength, mode, root);
					if (result[0])
						return [true, "OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

var findJsonValues = function(path, jsonToCheck, inputJson, mode, root) {
	if ((path.indexOf(".") < 0)||(path == ".")) { 
		var bad_node_list=[];
		switch(path) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck.length;i++) {
				if (findJson(jsonToCheck[i], inputJson, mode))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck.length)
				return [true, "OK"];
			else 
				return [false, root+"("+bad_node_list+")"];
			break;
			case "?":
				var count=0;
				for (var i=0;i<jsonToCheck.length;i++) {
					if (findJson(jsonToCheck[i], inputJson, mode))
						count++;
				}
				if (count > 1)
					return [true, "OK"];
				else
					return [false, root+"(All)"];
				break;
			case ".":
				if (findJson(jsonToCheck, inputJson, mode))
					return [true, "OK"];
				else
					return [false, ""];
				break;
			default:
				if (findJson(jsonToCheck[path], inputJson, mode))
					return [true, "OK"];
				else
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr,restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonValues(restofpathstr, jsonToCheck[j], inputJson, mode, root);
					if (!result[0]) {
						bad_node_list.push(root+"["+j+"] "+ result[1]);
					}
					else 
						count++;
				}
				if (count == jsonToCheck.length)
					return [true, "OK"];
				else 
					return [false, bad_node_list];
				break;
			case "?":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonValues(restofpathstr, jsonToCheck[j], inputJson, mode, root);
					if (result[0])
						count++;
					else 
						bad_node_list.push(root+"["+j+"] "+ result[1]);
				}
				if (count < 1)
					return [false, bad_node_list];
				else
					return [true,"OK"];
				break;
			default:
				jsonToCheck = jsonToCheck[pathArr[0]];
				if ((typeof jsonToCheck == "undefined")&&((mode == 'strict_notnull')||(mode == 'strict_null'))) {
					return [false, pathArr[0]+" not present"];
				}
				else if ((typeof jsonToCheck == "undefined")&&((mode == 'relaxed_notnull')||(mode == 'relaxed_null'))) {
					return [true, "OK"];
				}
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = findJsonValues(restofpathstr, jsonToCheck, inputJson, mode, root); 
					if (result[0])
						return [true,"OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

function find(json,key,value, mode) {
	var result = [], found = false;
	for (var property in json)
	{
	    if (json.hasOwnProperty(property)) {
	        if( property == key && json[property] == value)
	        {
	        	found = true;
	            return true;
	        }
	        if(isArray(json[property]))
	        {
	        	if (typeof json[property][0] != "Object") {
	        		return (json[property].toString() == value.toString());
	        	} else {
		            for(var child in json[property])
		            {
		                var res = find(json[property][child],key,value);
		                if(res) {
		                    return true;
		                }
		            }
	        	}
	        }
	    }
	}
	if ((found == false)&&((mode == 'strict_null')||(mode == 'relaxed_null')))
		return true;
	else if ((found==false)&&(typeof json == "undefined")&&((mode == "relaxed_null")||(mode == "relaxed_notnull")))
		return true;
	return false;
}

var translateToFirstJson = function(json1, json2, fieldmap, mode) {
	var error_string="", new_json;
	for (var i=0;i<fieldmap.length;i++) {
		new_json = {};
		var map = fieldmap[i];
		var field = Object.keys(map)[0];
		var mapvalue = map[Object.keys(map)[0]];
		var field_parts = field.split("*");
		mapping = {};
		var mapvalue_parts = mapvalue.split("*");
		if (field_parts.length != mapvalue_parts.length) {
			return [false, "Invalid mapping"];
			//deferred.reject(new Error("Invalid mapping"));
		}
		else {
			for (var part in field_parts) {
				if (field_parts[part].charAt(field_parts[part].length-1)==".")
					field_parts[part] = field_parts[part].substring(0, field_parts[part].length-1);
				if (field_parts[part].charAt(0)==".")
					field_parts[part] = field_parts[part].substring(1);
				if (mapvalue_parts[part].charAt(mapvalue_parts[part].length-1)==".")
					mapvalue_parts[part] = mapvalue_parts[part].substring(0, mapvalue_parts[part].length-1);
				if (mapvalue_parts[part].charAt(0)==".")
					mapvalue_parts[part] = mapvalue_parts[part].substring(1);
				mapping[part] = JSON.parse("{ \""+ mapvalue_parts[part] + "\": \""+ field_parts[part] + "\"}");
			}
			//console.log("Mapping "+ JSON.stringify(mapping));
			var json2flat = flatten(json2);
			var newstring, oldstring, level, match, checkifarray, checkjson = JSON.parse(JSON.stringify(json2));
			var json2flat_parts = [], copy_array = [], level_word = "", fieldpartsval, index=0, ind;
			for (var val in json2flat) {
				fieldpartsval = val.split(".");
				while (index < fieldpartsval.length) {
					if (isNaN(fieldpartsval[index])) {
						level_word+= fieldpartsval[index]+ ".";
					} else { //encountered a number
						level_word = level_word.substring(0, level_word.length-1);
						checkifarray = level_word.split(".");
						for (var k=0;k< checkifarray.length;k++) {
							checkjson = checkjson[checkifarray[k]];
						}
						if (checkjson instanceof Array) {
							json2flat_parts.push({"field": level_word});
							json2flat_parts.push({"number": fieldpartsval[index]});
							level_word="";
						} else {
							level_word+= "."+fieldpartsval[index]+ ".";
						}
					}
					index++;
					checkjson = JSON.parse(JSON.stringify(json2));
				}
				
				level_word = level_word.substring(0, level_word.length-1);
				json2flat_parts.push({"field": level_word});
				//console.log("JSON2FLATPARTS "+ JSON.stringify(json2flat_parts));
				ind=0;
				for (var pt in json2flat_parts) {
					//console.log("Key "+Object.keys(json2flat_parts[pt])[0]);
					if (Object.keys(json2flat_parts[pt])[0] =="number") {
						ind++;
						continue;
					} else {
						if (mapping[ind]) {
							if (json2flat_parts[pt][Object.keys(json2flat_parts[pt])[0]] == Object.keys(mapping[ind])[0]) {
								json2flat_parts[pt][Object.keys(json2flat_parts[pt])[0]] = mapping[ind][Object.keys(mapping[ind])[0]];
							}
						}
					}
				}
				
				for (var pt in json2flat_parts) {
					copy_array.push(json2flat_parts[pt][Object.keys(json2flat_parts[pt])[0]]);
				}
				
				newstring = copy_array.join(".");
				new_json[newstring] = json2flat[val];
				//console.log("New string "+newstring);
				newstring="";
				index=0;
				ind = 0;
				level_word="";
				copy_array = [];
				checkjson = JSON.parse(JSON.stringify(json2));
				json2flat_parts = [];
			}
			
			var field_parts = field.split(".");
			var topfield = field_parts.pop();
			var fieldpath = field_parts.join(".");
			if (fieldpath.length==0)
				fieldpath=".";
			//console.log(JSON.stringify(json1));
			//console.log("---------------------------------------------------------------------------------------------------------");
			//console.log(JSON.stringify(json2));
			//console.log("---------------------------------------------------------------------------------------------------------");
			//console.log(JSON.stringify(unflatten(new_json)));
			//console.log(fieldpath);
			//console.log(topfield);
			var result = compareFields(fieldpath, json1, unflatten(new_json), topfield, mode, ".");
			if (!result[0]) {
				error_string+= result[1] + " - Field "+field+ ",";
			}
	}
}
	if (error_string.length == 0) {
		return [true, JSON.stringify(new_json)];
	}
	else {
		return [false, error_string];
	}
}

var compareFieldValue = function(jsonToCheck1, jsonToCheck2, fieldName, mode) {
	
	if ((typeof jsonToCheck1 == "undefined")&&(typeof jsonToCheck2 == "undefined")&&(mode == "relaxed"))
		return true;
	else if ((typeof jsonToCheck1 == "undefined")&&(typeof jsonToCheck2 != "undefined"))
		return false;
	else if ((typeof jsonToCheck1 != "undefined")&&(typeof jsonToCheck2 == "undefined"))
		return false;
	
	if ((typeof jsonToCheck1[fieldName] == "undefined")&&(typeof jsonToCheck2[fieldName] == "undefined")&&(mode == "relaxed"))
		return true;
	else if ((typeof jsonToCheck1[fieldName] == "undefined")&&(typeof jsonToCheck2[fieldName] != "undefined"))
		return false;
	else if ((typeof jsonToCheck1[fieldName] != "undefined")&&(typeof jsonToCheck2[fieldName] == "undefined"))
		return false;
	else if ((typeof jsonToCheck1[fieldName] == "undefined")&&(typeof jsonToCheck2[fieldName] == "undefined")&&(mode == "strict"))
		return false;
	else {
		if (Object.prototype.toString.call(jsonToCheck1[fieldName]) === '[object Array]') {
			return (jsonToCheck1[fieldName].length == jsonToCheck2[fieldName].length);
		} else if (typeof jsonToCheck1[fieldName] == 'object') {
			return (Object.keys(jsonToCheck1[fieldName]).length == Object.keys(jsonToCheck2[fieldName]).length);
		} else {
			if ((!isNaN(jsonToCheck1[fieldName])) && (!isNaN(jsonToCheck2[fieldName])) ) {
				return (Number(jsonToCheck1[fieldName]) == Number(jsonToCheck2[fieldName]));
			} else
				return (jsonToCheck1[fieldName] == jsonToCheck2[fieldName]);
		}
	}
	
	return false;
}

var compareFields = function(path, jsonToCheck1, jsonToCheck2, fieldName, mode, root) {
	if ((path.indexOf(".") < 0)||(path==".")) { 
		var bad_node_list=[];
		switch(path) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck1.length;i++) {
				if (compareFieldValue(jsonToCheck1[i], jsonToCheck2[i], fieldName, mode))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck1.length)
				return [true, "OK"];
			else 
				return [false, root+"("+bad_node_list+")"];
			break;
			case "?":
				var count=0;
				for (var i=0;i<jsonToCheck1.length;i++) {
					if (compareFieldValue(jsonToCheck1[i], jsonToCheck2[i], fieldName, mode))
						count++;
				}
				if (count > 1)
					return [true, "OK"];
				else
					return [false, root+"(All)"];
				break;
			case ".":
				if (compareFieldValue(jsonToCheck1, jsonToCheck2, fieldName, mode))
					return [true, "OK"];
				else 
					return [false, ""];
				break;
			default:
				if (compareFieldValue(jsonToCheck1[path], jsonToCheck2[path], fieldName, mode))
					return [true, "OK"];
				else  
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr,restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				var minLength = jsonToCheck1.length, unequal=false;
				if (jsonToCheck1.length != jsonToCheck2.length) {
					if (jsonToCheck1.length > jsonToCheck2.length) {
						minLength = jsonToCheck2.length;
						if (mode == 'strict') {
							unequal = true;
							for (var j=jsonToCheck2.length;j<jsonToCheck1.length;j++) {
								bad_node_list.push(root+"["+j+"] "+ "not present in json 2");
							}
						}
					} else {
						minLength = jsonToCheck1.length;
						if (mode == 'strict') {
							unequal = true;
							for (var j=jsonToCheck1.length;j<jsonToCheck2.length;j++) {
								bad_node_list.push(root+"["+j+"] "+ "not present in json 1");
							}
						}
					}
				}
				for (var j=0;j<minLength;j++) {
					var result = compareFields(restofpathstr, jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root);
					if (!result[0]) {
						bad_node_list.push(root+"["+j+"] "+ result[1]);
					}
					else 
						count++;
				}
				if ((count == minLength)&&(!unequal))
					return [true, "OK"];
				else 
					return [false, bad_node_list];
				break;
			case "?":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				
				var minLength;
				if (jsonToCheck1.length != jsonToCheck2.length) {
					if (jsonToCheck1.length > jsonToCheck2.length) {
						minLength = jsonToCheck2.length;
					} else {
						minLength = jsonToCheck1.length;
					}
				}
				
				for (var j=0;j<minLength;j++) {
					var result = compareFields(restofpathstr, jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root);
					if (result[0])
						count++;
					else 
						bad_node_list.push(root+"["+j+"] "+ result[1]);
				}
				if (count < 1)
					return [false, bad_node_list];
				else
					return [true,"OK"];
				break;
			default:
				jsonToCheck1 = jsonToCheck1[pathArr[0]];
				jsonToCheck2 = jsonToCheck2[pathArr[0]];
				//console.log(JSON.stringify(jsonToCheck1));
				//console.log(JSON.stringify(jsonToCheck2));
				if ((typeof jsonToCheck1 == "undefined")&&(mode == 'strict')) {
					return [false, pathArr[0]+" not present in json 1"];
				} else if ((typeof jsonToCheck2 == "undefined")&&(mode == 'strict')) {
					return [false, pathArr[0]+" not present in json 2"];
				}
				else if ((typeof jsonToCheck1 == "undefined")&&(typeof jsonToCheck2 == "undefined")&&(mode == 'relaxed'))
					return [true,"OK"];
				else if ((typeof jsonToCheck1 == "undefined")&&(mode == 'relaxed')) {
					//return [false, pathArr[0]+" present in json 2 but not in json 1"];
					return [true, "OK"];
				}
				else if ((typeof jsonToCheck2 == "undefined")&&(mode == 'relaxed')) {
					//return [false, pathArr[0]+" present in json 1 but not in json 2"];
					return [true, "OK"];
				}
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = compareFields(restofpathstr, jsonToCheck1, jsonToCheck2, fieldName, mode, root);
					if (result[0])
						return [true,"OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

var compareFieldValueWithMap = function(json1, json2, fieldMap) {
	if (Object.prototype.toString.call(jsonToCheck1[Object.keys(fieldMap)[0]]) === '[object Array]') {
		return (jsonToCheck1[fieldName].length == jsonToCheck2[fieldName].length);
	}
	if (jsonToCheck1[Object.keys(fieldMap)[0]] == jsonToCheck2[fieldMap[Object.keys(fieldMap)[0]]])
		return true;
	return false;
}

var quickParser = function(json, path) {
	var pathParts = path.split(".");
	for (var pt in pathParts) {
		json = json[pathParts[pt]];
	}
	return json;
}

var compareFieldsWithMap = function(path1, path2, jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2) {
	if ((path1.indexOf(".") < 0)||(path1==".")) { 
		var bad_node_list=[];
		switch(path1) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck1.length;i++) {
				if (compareFieldValueWithMap(jsonToCheck1[i], jsonToCheck2[i], fieldMap))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck1.length)
				return [true, "OK"];
			else 
				return [false, root+"("+bad_node_list+")"];
			break;
			case ".":
				if (compareFieldValueWithMap(jsonToCheck1, jsonToCheck2, fieldMap))
					return [true, "OK"];
				else 
					return [false, ""];
				break;
			default:
				if (compareFieldValueWithMap(jsonToCheck1[path1], jsonToCheck2[path2], fieldMap))
					return [true, "OK"];
				else  
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr1,restofpath1 = [], restofpathstr2, restofpath2 = [];
		var pathArr1 = path1.split("*");
		var newPathArr = [];
		if (pathArr1.length > 1) {
			for (var i=0;i<pathArr1.length;i++) {
				if (pathArr1[i]!="")
					newPathArr.push(pathArr1[i]);
				if (i< pathArr1.length-1)
					newPathArr.push("*");
			}
			pathArr1 = newPathArr;
		}
		newPathArr = [];
		var pathArr2 = path2.split("*");
		if (pathArr2.length > 1) {
			for (var i=0;i<pathArr2.length;i++) {
				if (pathArr2[i]!="")
					newPathArr.push(pathArr2[i]);
				if (i< pathArr2.length-1)
					newPathArr2.push("*");
			}
			pathArr2 = newPathArr;
		}
		if ((pathArr1[0]!="*")&&(pathArr1[0]!="?"))
			root1 = pathArr1[0];
		if ((pathArr2[0]!="*")&&(pathArr2[0]!="?"))
			root2 = pathArr2[0];
		var bad_node_list = [];
			switch(pathArr1[0]) {
			case "*":
				var count=0;
				restofpath1 = [];
				for (var k=1;k<pathArr1.length;k++)
					restofpath1.push(pathArr1[k]);
				restofpathstr1 = restofpath1.join(".");
				for (var k=1;k<pathArr2.length;k++)
					restofpath2.push(pathArr2[k]);
				restofpathstr2 = restofpath2.join(".");
				var minLength = jsonToCheck1.length, unequal=false;
				if (jsonToCheck1.length != jsonToCheck2.length) {
					if (jsonToCheck1.length > jsonToCheck2.length) {
						minLength = jsonToCheck2.length;
						if (mode == 'strict') {
							unequal = true;
							for (var j=jsonToCheck2.length;j<jsonToCheck1.length;j++) {
								bad_node_list.push(root2+"["+j+"] "+ "not present in json 2");
							}
						}
					} else {
						minLength = jsonToCheck1.length;
						if (mode == 'strict') {
							unequal = true;
							for (var j=jsonToCheck1.length;j<jsonToCheck2.length;j++) {
								bad_node_list.push(root1+"["+j+"] "+ "not present in json 1");
							}
						}
					}
				}
				for (var j=0;j<minLength;j++) {
					var result = compareFieldsWithMap(restofpathstr1, restofpathstr2, jsonToCheck1[j], jsonToCheck2[j], fieldName, mode, root1, root2);
					if (!result[0]) {
						bad_node_list.push(root1+"["+j+"] "+ result[1]);
					}
					else 
						count++;
				}
				if ((count == minLength)&&(!unequal))
					return [true, "OK"];
				else 
					return [false, bad_node_list];
				break;
			default:
				jsonToCheck1 = quickParser(jsonToCheck1, pathArr1[0]);
				jsonToCheck2 = quickParser(jsonToCheck2, pathArr2[0]);
				//console.log(JSON.stringify(jsonToCheck1));
				//console.log(JSON.stringify(jsonToCheck2));
				if ((typeof jsonToCheck1 == "undefined")&&(mode == 'strict')) {
					return [false, pathArr1[0]+" not present in json 1"];
				} else if ((typeof jsonToCheck2 == "undefined")&&(mode == 'strict')) {
					return [false, pathArr2[0]+" not present in json 2"];
				}
				else if ((typeof jsonToCheck1 == "undefined")&&(typeof jsonToCheck2 == "undefined")&&(mode == 'relaxed'))
					return [true,"OK"];
				else if ((typeof jsonToCheck1 == "undefined")&&(mode == 'relaxed')) {
					//return [false, pathArr[0]+" present in json 2 but not in json 1"];
					return [true, "OK"];
				}
				else if ((typeof jsonToCheck2 == "undefined")&&(mode == 'relaxed')) {
					//return [false, pathArr[0]+" present in json 1 but not in json 2"];
					return [true, "OK"];
				}
				else {
					restofpath1 = [];
					restofpath2 = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = compareFieldsWithMap(restofpathstr1, restofpathstr2, jsonToCheck1, jsonToCheck2, fieldMap, mode, root1, root2);
					if (result[0])
						return [true,"OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

var findJson = function(parentJson, childJson, mode) {
	for (var field in childJson) {
		if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
			return findJson(parentJson[field], childJson[field], mode);
		}
		if (!find(parentJson, field, childJson[field], mode))
			return false;
	}
	return true;
}

var findField = function(parentJson, fieldName) {
	if (typeof parentJson[fieldName] != "undefined")
		return true;
	else
		return false;
}

function checkType(json, key, expectedType, mode) {
	var result = [], found=false;
	for (var property in json)
	{
	    if (json.hasOwnProperty(property)) {
	        if( property == key && (typeof json[property] == expectedType.toLowerCase()))
	        {
	        	found = true;
	            return true;
	        }
	        if(isArray(json[property]))
	        {
	        	if (typeof json[property][0] != "Object") {
	        		return (typeof json[property].toString() == expectedType.toLowerCase());
	        	} else {
		            for(var child in json[property])
		            {
		                var res = checkType(json[property][child],key,expectedType, mode);
		                if (res) {
		                    return true;
		                }
		            }
	        	}
	        }
	    }
	}
	if ((found == false)&&((mode == 'strict_null')||(mode == 'relaxed_null')))
		return true;
	else if ((found==false)&&(typeof json == "undefined")&&((mode == "relaxed_null")||(mode == "relaxed_notnull")))
		return true;
	return false;
}

var findJsonTypes = function(path, jsonToCheck, inputJson, mode, root) {
	if ((path.indexOf(".") < 0)||(path == ".")) { 
		var bad_node_list = [];
		switch(path) {
			case "*":
				var count=0;
			for (var i=0;i<jsonToCheck.length;i++) {
				if (findJsonType(jsonToCheck[i], inputJson, mode))
					count++;
				else
					bad_node_list.push(i);
			}
			if (count == jsonToCheck.length)
				return [true, "OK"];
			else 
				return [false, root+"("+bad_node_list+")"];
			break;
			case "?":
				var count=0;
				for (var i=0;i<jsonToCheck.length;i++) {
					if (findJsonType(jsonToCheck[i], inputJson, mode))
						count++;
				}
				if (count > 1)
					return [true, "OK"];
				else
					return [false, root+"(All)"];
				break;
			case ".":
				if (findJsonType(jsonToCheck, inputJson, mode))
					return [true, "OK"];
				else
					return [false, ""];
				break;
			default:
				if (findJsonType(jsonToCheck[path], inputJson, mode))
					return [true, "OK"];
				else
					return [false, ""];
				break;
		}
	} else {
		var restofpathstr, restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonTypes(restofpathstr, jsonToCheck[j], inputJson, mode, root);
					if (!result[0])
						bad_node_list.push(root+"["+j+"] "+ result[1]);
					else
						count++;
				}
				if (count == jsonToCheck.length)
					return [true, "OK"];
				else 
					return [false, bad_node_list];
				break;
			case "?":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = findJsonTypes(restofpathstr, jsonToCheck[j], inputJson, mode, root);
					if (result[0])
						count++;
					else
						bad_node_list.push(root+"["+j+"] "+result[1]);
				}
				if (count < 1)
					return [false, bad_node_list];
				else
					return [true, "OK"];
				break;
			default:
				jsonToCheck = jsonToCheck[pathArr[0]];
				if ((typeof jsonToCheck == "undefined")&&((mode == 'strict_notnull')||(mode == 'strict_null'))) {
					return [false, pathArr[0]+" not present"];
				}
				else if ((typeof jsonToCheck == "undefined")&&((mode == 'relaxed_notnull')||(mode == 'relaxed_null'))) {
					
					return [true, "OK"];
				}
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = findJsonTypes(restofpathstr, jsonToCheck, inputJson, mode, root);
					if (result[0])
						return [true, "OK"];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

var findJsonType = function(parentJson, childJson, mode) {
	for (var field in childJson) {
		if (Object.prototype.toString.call(childJson[field]) === '[object Object]') {
			return findJsonType(parentJson[field], childJson[field], mode);
		}
		if (!checkType(parentJson, field, childJson[field], mode)) {
			return false;
		}
	}
	return true;
}

var checkSort = function(path, jsonToCheck, sortType, mode, root, currValue) {
	if (path.indexOf(".") < 0) { 
		var bad_node_list = [];
		if ((Object.prototype.toString.call(jsonToCheck[path]) === '[object Object]')|| (Object.prototype.toString.call(jsonToCheck[path]) === '[object Array]')){
			return [false, ""];
		} else {
			if ((typeof jsonToCheck[path] == "undefined")&&(mode == 'relaxed'))
				return [true, currValue];
			else {
				switch(sortType) {
					case "ASC":
						if (Number(jsonToCheck[path]) >= Number(currValue)) {
							//console.log("true currValue "+currValue+ " "+ jsonToCheck[path]+ " "+(typeof jsonToCheck[path]));
							currValue = jsonToCheck[path];
						}
						else {
							//console.log("false currValue "+currValue+ " "+ jsonToCheck[path]+ " "+(typeof jsonToCheck[path]));
							return [false, ""];
						}
					break;
					case "DESC":
					
					if (Number(jsonToCheck[path]) <= Number(currValue)) {
						currValue = jsonToCheck[path];
					}
					else {
						return [false, ""];
					}
					break;
				}
				
				return [true, currValue];
			}
		}		
	} else {
		var restofpathstr, restofpath = [];
		var pathArr = path.split(".");
		if ((pathArr[0]!="*")&&(pathArr[0]!="?"))
			root = pathArr[0];
		var bad_node_list = [];
			switch(pathArr[0]) {
			case "*":
				var count=0;
				restofpath = [];
				for (var k=1;k<pathArr.length;k++)
					restofpath.push(pathArr[k]);
				restofpathstr = restofpath.join(".");
				for (var j=0;j<jsonToCheck.length;j++) {
					var result = checkSort(restofpathstr, jsonToCheck[j], sortType, mode, root, currValue);
					if (!result[0])
						bad_node_list.push(root+"["+j+"] "+result[1]);
					else {
						count++;
						currValue = result[1];
						
					}
				}
				if (count == jsonToCheck.length)
					return [true, currValue];
				else {
					return [false, bad_node_list];
				}
				break;
			default:
				jsonToCheck = jsonToCheck[pathArr[0]];
				if ((typeof jsonToCheck == "undefined")&&(mode == 'strict')) {
					return [false, pathArr[0]+" not present"];
				}
				else if ((typeof jsonToCheck == "undefined")&&(mode == "relaxed")) 
					return [true, currValue];
				else {
					restofpath = [];
					for (var k=1;k<pathArr.length;k++)
						restofpath.push(pathArr[k]);
					restofpathstr = restofpath.join(".");
					var result = checkSort(restofpathstr, jsonToCheck, sortType, mode, root, currValue);
					currValue = result[1];
					if (result[0])
						return [true, currValue];
					else
						return [false, result[1]+""];
				}
				break;
			}
	}
}

module.exports.findJsonTypes = findJsonTypes;
module.exports.findJson = findJson;
module.exports.find = find;
module.exports.findJsonValues = findJsonValues;
module.exports.findJsonLength = findJsonLength;
module.exports.findJsonField = findJsonField;
module.exports.findField = findField;
module.exports.checkSort = checkSort;
module.exports.compareFields = compareFields;
module.exports.translateToFirstJson = translateToFirstJson;
module.exports.checkDuplicates = checkDuplicates;
module.exports.compareFieldsWithMap = compareFieldsWithMap;
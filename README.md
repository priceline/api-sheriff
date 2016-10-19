# api-sheriff

Api-sheriff is an API testing framework that uses the NodeJS libraries "Q" and "request". It can be used to test contents of JSON responses by verifying the JSON structure and asserting on the types and values of certain fields. This initiative was inspired by Frisby.js, another tool for API Testing written by Vance Lucas (http://frisbyjs.com/). This tool was very useful for our testing needs, and so we wanted to enhance it by introducing more features and improving its flexibility. 

The following features make it unique when compared to other API testing frameworks - 

1. It is compatible with both Mocha and Jasmine-Node.
2. It allows writing of simple and flexible tests that require step by step analysis of the results. All the methods are synchronized through the use of promises.
3. It allows a user to inject custom code at any step within a test; making it very flexible and adaptable. 
4. It allows for customized error handling. An optional, custom error parameter can be passed to all functions.

Api-sheriff supports the following functions - 

* submitPostRequest
* submitGetRequest
* checkFieldPresent
* checkFieldNotPresent
* checkJsonTypes
* checkJsonPresent
* checkJsonLength
* checkHeaderContains
* checkSortOrder
* compareJson
* compareJsonWithMap
* checkDuplicates

All you need to do is include the module into your Mocha/Jasmine tests - 
```
var apisheriff = require('api-sheriff');

var first_resp;

describe("Compare 2 custom api endpoints", function() {
	var status_code;
	this.timeout(80000);

	it("Submit request to first endpoint", function(done) {
		apisheriff.submitGetRequest("http://imaginaryhost1:8080/getProperties/nyc", { "Content-Type": "application/json"}, { "json": true }, done, "Endpoint down").then(function(resp) {
			first_resp = resp;
		});
	}, 30000);
	
	it("Test Status Code", function(done) {
		apisheriff.checkJsonPresent(".", { "statusCode": 200}, first_resp, 'strict_notnull', done);
	});

});

```

### Method Syntax 


#### submitPostRequest - Submitting a POST request

Syntax - submitPostRequest(url, body, headers, options, done, error)

1. url (String) - URL of the API to submit the request to
2. body (JSON) - Body of the POST request
3. headers (String)- <span style="font-style:italic">(Type: JSON)</span> Headers for the request in JSON format. Default is application/json. If you want to use the default, pass null to this parameter.
4. options (JSON) - Optional parameters to pass in the request JSON. If your API is JSON based, pass {json: true}.
5. done - Done callback to call once the promise is resolved. Pass as is.
6. error (String)- Custom error object; optional

#### submitGetRequest - Submitting a GET request

Syntax - submitGetRequest(url, headers, options, done, error)

1. url (String) - URL of the API to submit the request to
2. headers (String) - <span style="font-style:italic">(Type: JSON)</span> Headers for the request in JSON format. Default is application/json. If you want to use the default, pass null to this parameter.
3. options (JSON) - Optional parameters to pass in the request JSON. If your API is JSON based, pass {json: true}.
4. done - Done callback to call once the promise is resolved. Pass as is.
5. error (String) - Custom error object; optional

#### checkFieldPresent - Check if a field is present in your input JSON.

Syntax - checkFieldPresent(path, fieldName, json, mode, done, custom_error)

1. path (String) - Path to the field in the JSON object under consideration.
2. fieldName (String) - Name of the field.
3. json (JSON) - Input JSON.
4. mode (String) - Strict or Relaxed. (Explained later)
5. done - Done callback to call once the promise is resolved. Pass as is.
5. error (String) - Custom error object; optional

#### checkFieldNotPresent - Check if a field is not present in your input JSON.

Syntax - checkFieldNotPresent(path, fieldName, json, mode, done, custom_error)

1. path (String) - Path to the field in the JSON object under consideration.
2. fieldName (String) - Name of the field.
3. json (JSON) - Input JSON.
4. mode (String) - Strict or Relaxed. 
5. done - Done callback to call once the promise is resolved. Pass as is.
5. error (String) - Custom error object; optional

#### checkJsonTypes - Check if the field types in the specified child JSON object are consistent with the corresponding field types in the parent JSON.

Syntax - checkJsonTypes(path, inputJson, json, mode, done, custom_error)

1. path (String) - Path to the root of the child JSON.
2. inputJson (JSON) - The child Json object.
3. json (JSON) - Parent JSON.
4. mode (String) - Strict_Null, Strict_NotNull, Relaxed_Null or Relaxed_NotNull. 
5. done - Done callback to call once the promise is resolved. Pass as is.
6. error (String) - Custom error object; optional

#### checkJsonPresent - Check if the field values in the specified child JSON object are consistent with the corresponding field values in the parent JSON.

Syntax - checkJsonPresent(path, inputJson, json, mode, done, error)

1. path (String) - Path to the root of the child JSON.
2. inputJson (JSON) - The child Json object.
3. json (JSON) - Parent JSON.
4. mode (String) - Strict_Null, Strict_NotNull, Relaxed_Null or Relaxed_NotNull. 
5. done - Done callback to call once the promise is resolved. Pass as is.
6. error (String) - Custom error object; optional

#### checkJsonLength - Check if the object in the given path of the JSON object has the required length. If the object is a basic type such as String or integer, the default length() method is used. If the object is an array, the number of objects in the array is returned. If the object is a JSON object, the number of fields in the JSON object is returned.

Syntax - checkJsonLength(path, json, expectedLength, mode, done, error)

1. path (String) - Path to the root of the child JSON.
2. json (JSON) - The parent Json object.
3. expectedLength (Integer) - Expected length of the object on the given path.
4. mode (String) - Strict or Relaxed.
5. done - Done callback to call once the promise is resolved. Pass as is.
6. error (String) - Custom error object; optional.

#### checkHeaderContains - Check if the field values in the specified child JSON object are consistent with the corresponding field values in the parent JSON.

Syntax - checkHeaderContains(headerJson, header, value, done, error)

1. headerJson (JSON) - The header JSON to check against.
2. header (String) - The header field to check.
3. value (String) - Value of the given header field.
4. done - Done callback to call once the promise is resolved. Pass as is.
5. error (String) - Custom error object; optional

#### checkSortOrder - Check the sort order of the JSON response on a given field

Syntax - checkSortOrder(path, sortType, json, mode, done, error)

1. path (String) - Path to the field in the JSON.
2. sortType (String) - ASC or DESC. ASC - Ascending order, DESC - Descending order.
3. json (JSON) - Input JSON.
4. mode (String) - Strict or Relaxed. 
5. error (String) - Custom error object; optional. 

#### compareJson - Compare 2 JSON objects based on a specified list of fields to compare against

Syntax - compareJson(json1, json2, fields, mode, done, error)

1. json1 (JSON) - First JSON object.
2. json2 (JSON) - Second JSON object.
3. fields (List) - List of strings that contain the full JSON Path to the fields to check against (including the field itself) 
4. mode (String) - Strict or Relaxed. 
5. error (String) - Custom error object; optional. 

#### compareJsonWithMap - Compare 2 differently structured JSON objects based on a provided mapping of fields between the 2 JSON's.

Syntax - compareJsonWithMap(json1, json2, fieldmap, mode, done, error)

1. json1 (JSON) - First JSON object.
2. json2 (JSON) - Second JSON object.
3. fieldmap (List) - List of JSON objects. Each JSON object is a map of a field from the 1st JSON to the corresponding field from the 2nd JSON. Eg: [{"node1.\*.node2.field1": "node1.node2.\*.field2"}], where node1.\*.node2.field1 is a valid path in JSON 1 and node1.node2.\*.field2 is a valid path in JSON 2. (Note: The number of \*'s in a mapping should be the same, otherwise there would be ambiguity in matching all the matching nodes)
4. mode (String) - Strict or Relaxed. 
5. error (String) - Custom error object; optional. 

#### checkDuplicates - Check a list of fields against a JSON object to see if each field is unique in all possible child nodes.

Syntax - checkDuplicates(field_list, json, done, error)

1. field_list (List) - List of fields 
2. JSON - The JSON object to check against.
3. error(String) - Custom error object; optional.

### Modes Explained

Api-sheriff modes are best explained with examples. For each mode, a bunch of apisheriff method calls are listed, explaining what each call does.

* #### Strict

``` 
checkFieldPresent("hotels.*.rates", "price", <json>, "strict" , done);
```
 Strict mode ensures that all children of "hotels" have a "rates" field. The overall method checks if the "rates" fields for all hotels have a "price" field.

```
checkFieldPresent("hotels.*.promos.*.discount", "condition", <json>, "strict" , done); 
```
Strict mode ensures that all hotels have a "promos" field, as well as all promos have a "discount" field. 

* #### Relaxed

```
checkFieldPresent("hotels.*.rates", "price", <json>, "relaxed" , done);
```
 Relaxed mode ignores the hotels child nodes that do not have a "rates" field. But the overall method call checks that the hotels that do have a "rates" field, have a "price" field inside them.

```
compareJsonWithMap(json1, json2, [{"hotels.*.ratesSummary.minPrice", "expressDeals.*.price"}], "relaxed", done);
```
Relaxed mode ignores those hotels that do not have a ratesSummary field. minPrice, however, should be present for all nodes that contain the given parent nodes in its path.

* #### Strict_notnull

```
checkJsonTypes("hotels.*.rates", { "price": "number" }, <json>, "strict_notnull", done);
```
Strict_notnull not only checks if all hotels have a rates field, but also ensures that the fields in the child JSON object are present in all of the child nodes of hotels. The overall method checks if the "price" attribute is a number for all hotels.

* #### Strict_null

```
checkJsonTypes("hotels.*.rates", { "price": "number" }, <json>, "strict_null", done);
```
Strict_null allows the "price" field to not be present in some or all of the nodes. However, if it is present, then the method checks if it is a number. Strict_null also checks if all hotels have a "rates" field.

* #### Relaxed_notnull

```
checkJsonTypes("hotels.*.rates", { "price": "number" }, <json>, "relaxed_notnull", done);
```
Relaxed_notnull allows some of the hotels to not have a "rates" field. If they do have it, then "price" should not be null, and it should be a number. 

* #### Relaxed_null

```
checkJsonTypes("hotels.*.rates", { "price": "number" }, <json>, "relaxed_null", done);
```
Relaxed_null allows some of the hotels to not have a "rates" field. If they do have it, then "price" can be null, but if not null, it should be a number.
 
# Development

all development should be done in the `/src` file and the task `gulp` should be run from the command line to update the production files

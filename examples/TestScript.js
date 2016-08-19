//Sample Mocha script

var apisheriff = require('api-sheriff');

var first_resp, second_resp;

/*Assume your request/response is something like this:
Req 1: http://imaginaryhost1:8080/getProperties/nyc
Req 2: http://imaginaryhost2:8080/getProperties/nyc

Response 1:
{
	"statusCode": 200,
	"message": "SUCCESS",
	"properties": [
		{
			"propertyId": 101,
			"propertyName": "ABC Apartments",
			"address": {
				"streetName": "102 XYZ St",
				"city": "New York",
				"zip": "10012"
			},
			"amenities": [
			{
				"name": "Swimming pool",
				"restrictions": "Residents only"
			},
			{
				"name": "Wifi",
				"restrictions": "Password protected"
			}
			]
		},
		{
			"propertyId": 102,
			"propertyName": "Redroof Inn",
			"address": {
				"streetName": "102 4th St",
				"city": "New York",
				"zip": "10002"
			},
			"amenities": [
			{
				"name": "Free breakfast",
				"restrictions": "7 to 10AM"
			},
			{
				"name": "Laundry",
				"restrictions": "Guests only"
			}
			]
		}
	]
}

Response 2:
{
	"statusCode": 200,
	"message": "SUCCESS",
	"properties": [
		{
			"propertyId": 101,
			"propertyName": "ABC Apartments",
			"address": {
				"streetName": "102 XYZ St",
				"city": "New York"
			},
			"amenities": [
			{
				"name": "Swimming pool",
				"restrictions": "Residents only"
			}
			]
		},
		{
			"propertyId": 102,
			"propertyName": "Redroof Inn",
			"address": {
				"streetName": "102 4th St",
				"city": "New York",
				"zip": "10002"
			},
			"amenities": [
			{
				"name": "Free breakfast",
				"restrictions": "7 to 9AM"
			},
			{
				"name": "Laundry",
				"restrictions": "Guests only"
			}
			]
		}
	]
}
*/

describe("Compare 2 custom api endpoints", function() {
	var status_code;
	this.timeout(80000);
	
	afterEach(function(done) {
		//Do something after each step
	});

	after(function(done) {
		//Do something after all steps are completed
	});

	it("Submit request to first endpoint", function(done) {
		apisheriff.submitSearchRequest("http://imaginaryhost1:8080/getProperties/nyc", { "Content-Type: application/json"}, { "json": true }, done, "Endpoint down").then(function(resp) {
			first_resp = resp;
		});
	}, 30000);
	
	it("Test Status Code", function(done) {
		apisheriff.checkJsonPresent(".", { "statusCode": 200}, first_resp, 'strict', done);
	});
	
	it("Check if all property Id s are numbers", function(done) {
		apisheriff.checkJsonTypes("properties.*", { "propertyId": "Number"}, first_resp, 'strict', done);
	});

	it("Submit request to second endpoint", function(done) {
		apisheriff.submitSearchRequest("http://imaginaryhost2:8080/getProperties/nyc", { "Content-Type: application/json"}, { "json": true }, done, "Endpoint down").then(function(resp) {
			second_resp = resp;
		});
	}, 30000);
	
	it("Test Status Code", function(done) {
		apisheriff.checkJsonPresent(".", { "statusCode": 200}, second_resp, 'strict', done);
	});
	
	it("Check if all property Id s are numbers", function(done) {
		apisheriff.checkJsonTypes("properties.*", { "propertyId": "Number"}, second_resp, 'strict', done);
	});

	it("Compare responses from both endpoints", function(done) {
		apisheriff.compareJson(first_resp, second_resp, [ "properties.*.propertyName", "properties.*.address.zip", "properties.*.amenities", "properties.*.amenities.*.restrictions"], 'strict', done);
	});

}); 

/* Result
The above tests will all pass, except for the last compare step.

The output will be
Error - properties[0] - Field zip, - Field amenities, properties[1] amenities[0] - Field restrictions

This indicates that there is a difference in zipcode for the first property - It happens to be missing in the second response. 
Also, the number of amenitiesfor properties[0] is different. 
There is a difference in the first restriction for the second property.
*/

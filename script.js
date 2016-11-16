var key = "63A41107-2F8B103E-38FE8B11-93746D11-95BE7BF4-60D94013-29A9FCF1-D6FBA2C6";
var bbox = [48.658447, 55.513082,49.757080,56.004524];
var getbyarea = "place.getbyarea";
var getbyid = "place.getbyid";
var coordsby = "bbox";
var jsonFormat = "json";
var language = "ru";
var countPerPage = "100"; 

function getObjectData(objectId, handler) {
	var urlParams = {
		key: key,
		"function": getbyid,
		id: objectId,
		format: jsonFormat,
		language: language,
		data_blocks: "comments"
	};

	var url = wikimapiaApiDomain + "?" + $.param(urlParams);

	$.getJSON(url, function(data) {
		handler(objectId, data);
	});
}

function addCommentCount(objectId, commentCount) {
	objectMap[objectId] = commentCount;
	processedObjectCount += 1;

	if (processedObjectCount == totalObjectCount) {
		console.log(objectMap);
	}
}

function processObjectList(request, data){
	var places = data.places;
	if (places === undefined){
		if (data.debug.code == 1706){
			console.log("Invalid page number: ", request);
			return;
		}
		console.log("cannot receive object list with request: ", request);
		setTimeout(function(){
			processObjectList(request, data);
		}, 3000);
	} else {
		$.each( data.places, function( key, val ) {
			objectIdQueue.push(val.id);
		});
	}
}

function getAllObjectOfArea(objectIdQueue) {
	var params = {
		key: key,
		"function": getbyarea,
		coordsby: coordsby,
		bbox: bbox.join(),
		format: jsonFormat,
		language: language,
		count: countPerPage,
	};

	wikimapiaApiDomain = "http://api.wikimapia.org";

	var resultUrl = wikimapiaApiDomain + "?" + $.param(params);

	$.getJSON(resultUrl, function( data ) {

		var totalObjectCount = data.found;

		if (totalObjectCount === undefined){
			console.log("cannot receive total count of objects");
			return;
		}

		processObjectList(resultUrl, data);

		var objectListHandler = function (){};

		urls = [];
		for (var i = 2; i < 1 + totalObjectCount / countPerPage; i++) {
			urls[i] = resultUrl + "&" + $.param({page : i});
			$.getJSON(urls[i], function( data ) {
				processObjectList(urls[i], data);
			});
		};

	});
}

allObjectsCommentCount = { };

function proccessObjectInformation(objectId, data)
{
	var comments = data.comments;
	if (comments === undefined) {
		objectIdQueue.push(objectId);
		console.log("unexpected data format", data);
		setTimeout(proccessObjectIdQueue(objectIdQueue), 3000);
	}
	else
	{
		allObjectsCommentCount[objectId] = comments.length;
		proccessObjectIdQueue(objectIdQueue);
	}
}

function proccessObjectIdQueue(objectIdQueue) {
	if (objectIdQueue.length > 0) {
		var id = objectIdQueue.shift();
		getObjectData(id, proccessObjectInformation);
	}
	else {
		console.log("objectIdQueue is empty. Finished");
	}
}

objectIdQueue = [];
getAllObjectOfArea(objectIdQueue);

setTimeout(function(){
	if (objectIdQueue.length == 0)
	{
		console.log("empty count of objects of area");
	}
	proccessObjectIdQueue(objectIdQueue);
}, 3000);

var express    = require("express"),
	 	app        = express(),
	 	request    = require("request"),
	 	bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

'use strict';

const subscriptionKey = process.env.SUBSCRIPTIONKEY;
const uriBase = process.env.URIBASE;

var imageUrl = "";

// Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,smile,facialHair,glasses,' +
        'emotion,hair,makeup'
};

var options = {
    uri: uriBase,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};

// Routes
app.get("/", function(req, res) {
	res.render("index");
});

app.get("/results", function(req, res) {
	imageUrl = req.query.image;
	options.body = '{"url": ' + '"' + imageUrl + '"}';
	request.post(options, (error, response, body) => {
  		if (error) {
    		console.log('Error: ', error);
    		res.redirect("/error");
    		return;
  		}
	  	let jsonResponse = JSON.parse(body);

	  	if (jsonResponse[0]) {
		  	var results = {
		  		emotion: emojiList(jsonResponse[0].faceAttributes.emotion),
		  		emojiText: findEmoji(jsonResponse[0].faceAttributes.emotion),
		  		emoji: "/images/" + findEmoji(jsonResponse[0].faceAttributes.emotion) + ".png",
		  		gender: jsonResponse[0].faceAttributes.gender,
		  		genderEmoji: "/images/" + jsonResponse[0].faceAttributes.gender + ".png",
		  		age: jsonResponse[0].faceAttributes.age
		  	}

		  	res.render("results", {imageUrl: imageUrl, results, results})
	  	} else {
	  		res.redirect("/error");
	  	}
	});
});

app.get("/error", function(req, res) {
	res.render("error");
});

// Function to find the dominant facial expression
function findEmoji(json) {
	var emoji = "";
	var max = 0;

	for (var key in json) {
		if (json[key] >= max) {
			max = json[key];
			emoji = key;
		}
	}

	return emoji;
}

// Function to round out emotion percentages
function emojiList(json) {
	for (var key in json) {
		json[key] = Math.round(json[key] * 100);
	}

	return json;
}

app.listen(process.env.PORT, process.env.IP, function() {
	console.log("ana-moji has started");
});
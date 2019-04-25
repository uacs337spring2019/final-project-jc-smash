/*
Name: Cade Marks, Jonah Little
Course: CSc 337
Description: Creates the web service for smashstats.html. Handles GET requests for retrieving
			 character names, images, and stats from the stats.txt file. Handles POST requests by
			 adding the character name and comment to the comments.txt file in the format
			 name|||comment.
*/

(function() {

	"use strict";

	const express = require("express");
	const app = express();
	const fs = require("fs");
	const bodyParser = require('body-parser');
	const jsonParser = bodyParser.json();

	app.use(express.static('public'));

	/**
	Retrieves the character's image address and stats from the stats.txt file and sends it as
	JSON.
	**/
	app.get('/', function (req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		let params = req.query;
		let mode = params.mode;
		let fileName = "stats.txt";
		let charFile = readFile(fileName);
		let commentFile = readFile("comments.txt");
		let json;
		if (mode == "all") {
			json = buildJson(charFile, mode, null);
		} else if (mode == "single") {
			let charName = params.name;
			json = buildJson(charFile, mode, charName);
		} else if (mode == "comments") {
			let charName = params.name;
			json = buildJson(commentFile, mode, charName);
		}
		res.send(JSON.stringify(json));
	});

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	/**
	Appends the comment to the end of the comments.txt file.
	**/
	app.post('/', jsonParser, function (req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		if (req.body.name && req.body.comment) {
			let name = req.body.name;
			let comment = req.body.comment;
			let commentLine = "\n"+name+"|||"+comment;
			let fileName = "comments.txt";
			console.log(commentLine);
			fs.appendFile(fileName, commentLine, function(err) {
				if(err) {
					return console.log(err);
				}
			});
			res.send(JSON.stringify("Message saved"));
		}
	});

	app.listen(process.env.PORT);

	/**
	Retrieves the contents of a file.
	**/
	function readFile(fileName) {
		let contents = 0;
		try {  
		    contents = fs.readFileSync(fileName, 'utf8');
		} catch(e) {
		    console.log('Error:', e.stack);
		}
		return contents;
	}

	/**
	Retrieves an array of the names of the folders or files in a directory.
	**/
	function readDirectory(directoryName) {
		let contents = 0;
		try {  
		    contents = fs.readdirSync(directoryName);  
		} catch(e) {
		    console.log('Error:', e.stack);
		}
		return contents;
	}

	/**
	Constructs the objects to be converted to json for the all, single, and comments modes.
	**/
	function buildJson(modeFile, mode, charName) {
		let json;
		let lines = modeFile.split("\n");
		if (mode == "all") {
			json = {"characters": []};
			for (let i = 0; i < lines.length; i++) {
				let stats = lines[i].split(",");
				let char = {"name": stats[0], "weight": stats[1], "runspeed": stats[2],
							"walkspeed": stats[3], "fallspeed": stats[4], "imageURL": stats[5]};
				json["characters"].push(char);
			}
		} else if (mode == "single") {
			for (let i = 0; i < lines.length; i++) {
				let stats = lines[i].split(",");
				if (stats[0] == charName) {
					json = {"name": stats[0], "weight": stats[1], "runspeed": stats[2], 
							 "walkspeed": stats[3], "fallspeed": stats[4], "imageURL": stats[5]};
				}
			}
		} else if (mode == "comments") {
			let lines = modeFile.split("\n");
			json = {"comments": []};
			for (let i = 0; i < lines.length; i++) {
				let splitLine = lines[i].split("|||");
				let name = splitLine[0];
				let comment = splitLine[1];
				let commentDict;
				if (name == charName) {
					commentDict = {"name": name, "comment": comment};
					json["comments"].push(commentDict);
				}
			}
		}
		return json;
	}

})();
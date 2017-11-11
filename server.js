const express = require('express');
const fs = require('fs');
const da = require('datejs');
app = express();
var ObjectId = require('mongodb').ObjectID;


// UI Part ---------------------------------------------------------------------------------------
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/Users', (err, db) => {
if (err) {
	return console.log('Unable to connect to MongoDB server');
}
console.log('Connected to MongoDB server');


var username;
var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

var urlencodedParser = bodyParser.urlencoded({ extended: false });


var hbs = require('hbs');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));

app.post('/userLogin', urlencodedParser, function(req, res) {
    username = req.body.username;
    var uname = req.body.username;
    var pass = req.body.password 

	console.log('Hello '+uname);
	console.log('World '+pass);

	db.collection('Users').find({username: uname},{password: pass}).toArray().then((docs) => {
	    console.log(JSON.stringify(docs, undefined, 3));
	    //res.json(docs);
	    if(docs.length >= 1) {
	    	res.redirect('/home');
	    }
	    else {
	    	res.render('log_in.hbs', {
	    		message: "Invalid Username / Password"
	    	});
	    }
	});

});

app.get('/', function(req, res){
    res.render('log_in.hbs');
});

app.get('/home', function(req, res){
	if(username === "")
    	res.render('error.hbs');
    else {
    	db.collection('CabRequest').find({$query: {}, $orderby: {$natural : -1}}).limit(3).toArray().then((docs) => {
    		//console.log(JSON.stringify(docs, undefined, 3));
	    	var data = JSON.stringify(docs, undefined, 3);
    		res.render('home.hbs', {"docs": data});
		});    	
    }
});

app.get('/logout', function(req, res){
	username = "";
    res.render('log_in.hbs');
});

app.get('/register', function(req, res){
    res.render('register.hbs');
});

app.get('/search', function(req, res){
    res.render('search.hbs');
});

app.get('/requests', function(req, res){

	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var urlStr = JSON.stringify(url_parts);
	var jsonUrl = JSON.parse(urlStr);

	var user2 = jsonUrl.query.username;
	var src = jsonUrl.query.source;
    var dest = jsonUrl.query.dest;
    var deptTime = jsonUrl.query.dept;
    var seats = jsonUrl.query.seats;
    var phone = jsonUrl.query.phone;
    var date = jsonUrl.query.date;
    
	db.collection('ReqMaster').insertOne({
    	username1: username,
    	username2: user2,
	    source: src,
	    destination: dest,
	    deptTime: deptTime,
	    seats: parseInt(seats),
	    phone: parseInt(phone),
	    date: date,
	    status: "Pending"
	 	}, (err, result) => {
	    if (err) {
	    	return console.log('Unable to insert request', err);
	   	}
	    console.log(result.ops);	    
	});
    res.render('search.hbs', {"msg": "Request Sent"});
});

app.get('/allRequests', function(req, res){
	var docs1 = [];
	var noOfReqs;

	db.collection('ReqMaster').find({}).forEach(function(data) {
	    db.collection('ReqMaster').update({
	        "$set": {
	            seats: parseInt(data.seats)
	        }
	    });
	});

	db.collection('ReqMaster').find({username1:username}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 3));
    	var data = JSON.stringify(docs, undefined, 3);
    	docs1 = data;
    	noOfReqs = docs.length;		
	});

	db.collection('ReqMaster').find({username2:username}).toArray().then((docs2) => {
		console.log(JSON.stringify(docs2, undefined, 3));
    	var data = JSON.stringify(docs2, undefined, 3);
    	var noOfReqsRecv = docs2.length;
		res.render('requests.hbs', {"docs1": docs1,
									"docs2": data, 
									"noOfReqs":noOfReqs,
									"noOfReqsRecv":noOfReqsRecv});
	});
});

app.post('/searchResults', function(req, res){
	var src = req.body.source;
	var dest = req.body.destination;
	var deptDateFrom = req.body.dept_time_init;
	var deptDateTo = req.body.dept_time_final;
	var date = req.body.date;

	console.log(deptDateFrom + " " + deptDateTo);

	var fromTime = new Date(date + "T" + deptDateFrom + ":00.000Z");
	var toTime = new Date(date + "T" + deptDateTo + ":00.000Z");
	
	db.collection('CabRequest').find({source:src, destination:dest, timestamp: {
										$gte: new Date(fromTime),
	        							$lt: new Date(toTime)
									}}).toArray().then((docs) => {

		var data = JSON.stringify(docs, undefined, 3);

		if(docs.length >= 1)
			res.render('results.hbs', {"docs":data});
		else
			res.render('search.hbs', {"msg":'No Results Found, Try Again'});
	});    
});

app.get('/history', function(req, res){
	var noOfRecords;
	db.collection('CabRequest').find({username: username}).toArray().then((docs) => {

	var data = JSON.stringify(docs, undefined, 3);
    console.log(data);
    noOfRecords = docs.length;	    
	res.render('history.hbs', {"docs":data,
							   "noOfReqs":noOfRecords
							   });
    }); 
});

app.listen(3000, () => {
	console.log('Server started at 3000...');
});

app.get('/delete', function(req, res) {

	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var urlStr = JSON.stringify(url_parts);
	var jsonUrl = JSON.parse(urlStr);

	var id = jsonUrl.query._id;

	console.log(jsonUrl.query);
	db.collection('CabRequest').findOneAndDelete({_id: ObjectId(id)}).then((results) => {
    	console.log(JSON.stringify(results, undefined, 2));
	});

	//res.render('history.hbs', {"msg" : "Request Deleted"});

	db.collection('CabRequest').find({username: username}).toArray().then((docs) => {
		var data = JSON.stringify(docs, undefined, 3);
	    console.log(data);
	    noOfRecords = docs.length;	    
		
	    res.render('history.hbs', {"docs":data,
								   "noOfReqs":noOfRecords,
								   "msg" : "Request Deleted"
								   });
    });
});

app.get('/deleteRequest', function(req, res) {

	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var urlStr = JSON.stringify(url_parts);
	var jsonUrl = JSON.parse(urlStr);

	var id = jsonUrl.query._id;

	console.log(jsonUrl.query);
	db.collection('ReqMaster').findOneAndDelete({_id: ObjectId(id)}).then((results) => {
    	console.log(JSON.stringify(results, undefined, 2));
	});

	//res.render('history.hbs', {"msg" : "Request Deleted"});

	var docs1 = [];
	var noOfReqs;
	db.collection('ReqMaster').find({username1:username}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 3));
    	var data = JSON.stringify(docs, undefined, 3);
    	docs1 = data;
    	noOfReqs = docs.length;		
	});

	db.collection('ReqMaster').find({username2:username}).toArray().then((docs2) => {
		console.log(JSON.stringify(docs2, undefined, 3));
    	var data = JSON.stringify(docs2, undefined, 3);
    	var noOfReqsRecv = docs2.length;
		res.render('requests.hbs', {"docs1": docs1,
									"docs2": data, 
									"noOfReqs":noOfReqs,
									"noOfReqsRecv":noOfReqsRecv});
	});
});

app.get('/approve', function(req, res) {

	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var urlStr = JSON.stringify(url_parts);
	var jsonUrl = JSON.parse(urlStr);

	var id = jsonUrl.query._id;

	console.log(jsonUrl.query);

	db.collection('ReqMaster').findOneAndUpdate({_id: ObjectId(id)}, {
		    $set: {
		    	status: 'Approved'
		    },
		    $inc: {
		    	seats: -1
		    }
	  	}, {
	    returnOriginal: false
	  	}).then((result) => {
	    console.log(result);
	});

	var user2 = jsonUrl.query.username;
	var src = jsonUrl.query.source;
    var dest = jsonUrl.query.dest;
    var deptTime = jsonUrl.query.dept;
    var seats = jsonUrl.query.seats;
    var phone = jsonUrl.query.phone;
    var date = jsonUrl.query.date;

    db.collection('CabRequest').findOneAndUpdate(
    								{ username:username, 
    								  source:src,
    								  destination:dest,
    								  deptTime:deptTime,
    								  date:date
    								}, {
					    		$inc: {
							    	seats: -1
							    }
						  	}, {
						    returnOriginal: false
						  	}).then((result) => {
	    					console.log(result);
	});


	var docs1 = [];
	var noOfReqs;
	db.collection('ReqMaster').find({username1:username}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 3));
    	var data = JSON.stringify(docs, undefined, 3);
    	docs1 = data;
    	noOfReqs = docs.length;		
	});

	db.collection('ReqMaster').find({username2:username}).toArray().then((docs2) => {
		console.log(JSON.stringify(docs2, undefined, 3));
    	var data = JSON.stringify(docs2, undefined, 3);
    	var noOfReqsRecv = docs2.length;
		res.render('requests.hbs', {"docs1": docs1,
									"docs2": data, 
									"noOfReqs":noOfReqs,
									"noOfReqsRecv":noOfReqsRecv});
	});


});

app.get('/deny', function(req, res) {

	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var urlStr = JSON.stringify(url_parts);
	var jsonUrl = JSON.parse(urlStr);

	var id = jsonUrl.query._id;

	console.log(jsonUrl.query);
	db.collection('ReqMaster').findOneAndUpdate({_id: ObjectId(id)}, {
		    $set: {
		    	status: 'Denied'
		    }
	  	}, {
	    returnOriginal: false
	  	}).then((result) => {
	    console.log(result);
	});

	var docs1 = [];
	var noOfReqs;
	db.collection('ReqMaster').find({username1:username}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 3));
    	var data = JSON.stringify(docs, undefined, 3);
    	docs1 = data;
    	noOfReqs = docs.length;		
	});

	db.collection('ReqMaster').find({username2:username}).toArray().then((docs2) => {
		console.log(JSON.stringify(docs2, undefined, 3));
    	var data = JSON.stringify(docs2, undefined, 3);
    	var noOfReqsRecv = docs2.length;
		res.render('requests.hbs', {"docs1": docs1,
									"docs2": data, 
									"noOfReqs":noOfReqs,
									"noOfReqsRecv":noOfReqsRecv});
	});
});

// DB Part ---------------------------------------------------------------------------------------



/*db.collection('Users').insertOne({
    username: 'rishabh',
    password: '2345'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }

    console.log(result.ops);
  });*/

// db.collection('Users').find({username: 'kaushik'}).toArray().then((docs) => {
//     console.log(JSON.stringify(docs, undefined, 2));
//   });

// Retrieve data from DB -------------------------------------------------------------------------



app.post('/registerUser', urlencodedParser, function(req, res) {
	var uname = req.body.username;
    var email = req.body.email;
    var pass1 = req.body.password;
    var pass2 = req.body.confirmPassword;
    var flag = 0;

    if(pass1 !== pass2) {
    	res.render('log_in.hbs');
    }
    else {
	   	db.collection('Users').find({username: uname},{password: pass1}).toArray().then((docs) => {
		    console.log(JSON.stringify(docs, undefined, 3));
		    //res.json(docs);
		    if(docs.length >= 1) {
		    	res.render('register.hbs', {
					name: uname,
					message: 'Username already exists'
				});
		    }
		    else {
		    	flag = 1;
		    }
		});
		
		if(flag === 1) {
	    	db.collection('Users').insertOne({
		    	username: uname,
		    	password: pass1,
		    	email: email
		  	}, (err, result) => {
		    if (err) {
		      return console.log('Unable to insert user', err);
		    }
			console.log(result.ops);
	    	res.render('register.hbs', {
				name: uname
			});
	    });
	    }
	}
});


app.get('/calendar', function(req, res){
	db.collection('CabRequest').find({}).toArray().then((docs) => { 
	var data = JSON.stringify(docs, undefined, 3);
	res.render('calendar.hbs', {"docs": data});
	});
});	


app.post('/newRequest', urlencodedParser, function(req, res) {
    var src = req.body.source;
    var dest = req.body.destination;
    var deptTime = req.body.dept_time;
    var seats = req.body.seats;
    var phone = req.body.telephone;
    var date = req.body.date;
    var preferences = req.body.preferences;

    console.log('Username'+username);
	console.log('Source '+src);
	console.log('dest '+dest);
	console.log('deptTime '+deptTime);
	console.log('seats '+seats);
	console.log('phone '+phone);

	var to = date + "T" + deptTime + ":00.000Z";
	var dateTo = new Date(to);
	
	    db.collection('CabRequest').insertOne({
	    	username: username,
		    source: src,
		    destination: dest,
		    deptTime: deptTime,
		    seats: parseInt(seats),
		    phone: parseInt(phone),
		    date: date,
		    timestamp: dateTo,
		    preferences: preferences
		 	}, (err, result) => {
		    if (err) {
		    	return console.log('Unable to insert user', err);
		   	}
		    console.log(result.ops);	    
		});
		res.render('register.hbs', {
			message: 'Request Accepted'
		});		
	});

	
});




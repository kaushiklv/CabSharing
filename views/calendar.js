// const express = require('express');
// const fs = require('fs');

// app = express();
// var hbs = require('hbs');

// const MongoClient = require('mongodb').MongoClient;
// MongoClient.connect('mongodb://localhost:27017/Users', (err, db) => {
// if (err) {
//     return console.log('Unable to connect to MongoDB server');
// }
// console.log('Connected to MongoDB server again');

    $('#calendar').fullCalendar({
        selectable: true,
        selectHelper: true,
        aspectRatio: 2,
        height: 600,
        defaultView: 'month',
        header: {
            left: 'prevYear,prev,next,nextYear today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listMonth'
        },

        events: function(start, end, timezone, callback) {
            $.ajax({
                url: 'events.json',
                type: "GET",
                datatype: 'json',
                success: function(doc) { 
                    var events = [];
                    if (doc != undefined && doc.length > 0) {
                        doc.forEach(function(entry) {
                            events.push({
                                title: entry.title,
                                start: entry.start,
                                end: entry.end
                            });
                        });
                    }
                    callback(events);
                },

                error: function(err) {
                    alert('Error in fetching data');
                }
            });
        },
        defaultView: 'month',
        eventClick: function(calEvent, jsEvent, view) {
            alert(calEvent.title);
        }
    });

    var newEvents = [
            {
                "title": "Test event",
                "id": "821",
                "start": "2017-11-26 06:00:00",
                "allDay": false
            },
            {
                "title": "Test event 2",
                "id": "822",
                "start": "2017-11-27 16:00:00",
                "allDay": false
            },
            {
                "title": "Test event 3",
                "id": "823",
                "start": "2017-11-28 16:00:00",
                "allDay": false
            }
        ];

    $('#calendar').fullCalendar('addEventSource', newEvents);

    // const MongoClient = require('mongodb').MongoClient;
    // MongoClient.connect('mongodb://localhost:27017/Users', (err, db) => {
    // if (err) {
    //     return console.log('Unable to connect to MongoDB server');
    // }
    // console.log('Connected to MongoDB server again');



//     db.collection('CabRequest').find({}).toArray().then((docs) => {
//         console.log(JSON.stringify(docs, undefined, 3));            
//         for(var i = 0; i < docs.length; i++) {
//             var obj = docs[i];

//             console.log(obj.id);
//             console.log(obj.source);
//             console.log(obj.destination);
//             console.log(obj.deptTime);
//             console.log(obj.seats);
//             console.log(obj.date);
//         }
        
//     });
// });



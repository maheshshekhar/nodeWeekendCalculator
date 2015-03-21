#!/bin/env node

var express = require('express');

var WeekendsCalculatorApp = function() {
    var self = this;

    /* CONFIG */
    self.setupVariables = function() {
/*
        self.ipaddress = null
        self.port      = process.env.PORT
*/
        self.ipaddress = 'localhost'
        self.port      = 8082
    };

    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    self.setupTerminationHandlers = function(){
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /* APP */
    self.createRoutes = function() {
        self.routes = { };
        self.putRoutes = { };

        self.routes['/dates/from/:from/to/:to/weekends'] = function (req, res) {
            var from = req.params.from
            var to = req.params.to

            if (Date.parse(from) && Date.parse(to)) {

                var fromDate = getDateAsLocal(from)
                var toDate = getDateAsLocal(to)

                var weekends = calculateWeekends(fromDate, toDate)

                res.statusCode = 200
                res.json({from: from, to: to, weekends: weekends})
            }
            else {
                res.statusCode = 400
                res.json({error: 'bad_request', cause: 'invalid date formats. Correct call: /dates/from/:from/to/:to/weekends'})   
            }
        }
    };


    function getDateAsLocal (date) {
        var localDate = new Date(date)
        return new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate())
    }


    function calculateWeekends (from, to) {
        return self.weekendCalculator.calculateWeekends(from, to);
    }



    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        self.weekendCalculator = new WeekendCalculator();
    };

    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        self.initializeServer();
    };


    self.start = function() {
        self.app.listen(self.port, /*self.ipaddress, */function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};


function WeekendCalculator () {
    this.weekLength = 7
    this.saturday = 6
    this.sunday = 0

    this.weekend = [this.saturday, this.sunday]

    this.calculateWeekends = function (start, end) {
        var weekends = 0

        if (end >= start) {
            var startDay = start.getDay()

            if (start.getTime() == end.getTime()) {
                if (isWeekendDay(startDay, this.weekend)) {
                    weekends = 1
                }
            }
            else {
                var endDay = end.getDay()

                var startWeek = getWeekOfYear(start)
                var endWeek = getWeekOfYear(end)

                var daysBetweenDates = (end - start) / 86400000
                var weeks = daysBetweenDates / this.weekLength
                var wholeWeeks = Math.floor(weeks)

                weekends = wholeWeeks
                if ( (isWeekendDay(startDay, this.weekend) || isWeekendDay(endDay, this.weekend)) || (startWeek != endWeek && startDay > endDay) ) {
                    weekends++
                }
            }
        }

        return weekends
    }

    function isWeekendDay (day, weekendDays) {
        return weekendDays.indexOf(day) != -1
    }

    function getWeekOfYear (date) {
        var januaryFirst = new Date(date.getFullYear(), 0, 1);
        return Math.ceil( (((date - januaryFirst) / 86400000) + januaryFirst.getDay() + 1) / 7 );
    }
}

var wcApp = new WeekendsCalculatorApp();
wcApp.initialize();
wcApp.start();

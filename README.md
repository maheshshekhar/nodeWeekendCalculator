# Weekend Calculator - node.js
======

To run 
* npm install
* node weekendCalculator.js

Call /dates/from/:from/to/:to/weekends

* 200 : {"from":":from","to":":to","weekends"::weekends} 
* 400 : {"error":"bad_request","cause":"invalid date formats. Correct call: /dates/from/:from/to/:to/weekends"}

======

* [See it LIVE!](https://weekend-calculator.herokuapp.com/dates/from/2014-01-01/to/2014-12-31/weekends)
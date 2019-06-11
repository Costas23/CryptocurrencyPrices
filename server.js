
var port = process.env.PORT || 8080;
var dbusername = process.env.DBUSERNAME;
var dbpassword = process.env.DBPASSWORD;
var dbnumber = process.env.DBNUMBER;
var dbname = process.env.DBNAME;



const mongoose = require('mongoose');

const url = 'mongodb://' + dbusername + ':' + dbpassword + '@ds1' + dbnumber + '.mlab.com:' + dbnumber + '/' + dbname;


const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const session = require('express-session');
const Schema = mongoose.Schema;

const app = express();


app.set('view engine', 'ejs');

app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set(('views', path.join(__dirname, 'views')));

var sess;

setInterval(function () {
  var shell = require('shelljs');
  shell.exec("python downloadcryptos.py", function (code, stdout, stderr) {
    console.log(stderr);

    strArr = stdout.split('\n');
    strArr2 = strArr.splice(0, 3);
    strArr.forEach(function (item) {
    })

  })
}, 
1000 * 60 * 60 * 24 * 7);



app.get('/', function (req, res) {
  res.render('index');
})



app.get('/crypto', function (req, res) {
  sess = req.session;
  if (sess.crypto || sess.crypto == "") {
    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      mongoose.connection.db.collection(sess.crypto, function (err, collection) {
        if (err) throw err;
        collection.find({}).sort({ title: 1 }).toArray(function (err, result) {



          if (err) throw err;
          var monthyears = [];
          var years = [];
          result.forEach(function (item) {
            monthyears.push({ year: item.title.substring(0, 4), month: item.title.substring(5, 7) });
          })
          monthyears.forEach(function (item) {
            if (!years.includes(item.year)) {
              years.push(item.year);
            }
          })
          res.render('crypto', { data: monthyears, years: years, crypto: sess.crypto, cryptonames: sess.cryptos });
          result.forEach(function (item) {
          })
          db.close();
        });
      });
    });
  }
  else {
    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      mongoose.connection.db.listCollections().toArray(function (err, result) {
        if (err) throw err;
        var cr = [];
        result.forEach(function (item) {
          if (!item.name.toString().includes("system")) {
            cr.push(item.name);
          }
        })
        cr.forEach(function (item) {
        })

        res.render('crypto', { cryptonames: cr, data: '' });
        result.forEach(function (item) {
        })
        db.close();
      });

    });
  }
});

app.post('/crypto', function (req, res) {
  sess = req.session;
  sess.crypto = req.body.crypto;
  sess.cryptos = req.body.cryptos;
  res.end('done');
})

app.get('/dates', function (req, res) {
  sess = req.session;
  if (sess.aggregation == "max") {


    sess.result.forEach(function (item) {
      item.date = new Date(item.date);
    })
    res.render('dates', { data: sess.result, crypto: sess.crypto, max: sess.dates, aggregation: sess.aggregation, column: sess.column });
  } else {
    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      mongoose.connection.db.collection(sess.crypto, function (err, collection) {
        if (err) throw err;
        collection.find({ 'title': sess.monthtitle }).toArray(function (err, result) {
          if (err) throw err;
          datesArr = [];

          // console.log('Prices dates');
          result.forEach(function (item) {
            item.dates.forEach(function (item2) {
              // item2.date.setDate(item2.date.getDate()-1);
              datesArr.push(item2);
              
              // console.log(item2.date);
            })
          })
          sess.result = datesArr;
          res.render('dates', { data: sess.result, crypto: sess.crypto, max: sess.dates, aggregation: sess.aggregation, column: sess.column });
          db.close();
        });
      });
    });

  }
})

app.post('/dates', function (req, res) {
  sess = req.session;
  sess.monthtitle = req.body.title;
  sess.aggregation = '';
  sess.dates = '';
  res.end('done');
})

app.post('/aggre', function (req, res) {
  sess = req.session;
  sess.aggregation = req.body.aggre;
  sess.column = req.body.column;

  if (sess.aggregation == 'max') {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.crypto, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, max: { $max: col } } },
          { $project: { max: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {


          arrRes.forEach(function (item) {
            sess.dates = item.max;
          })
          res.end('done');
        });
      });
    });
  } else if (sess.aggregation == 'min') {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.crypto, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, min: { $min: col } } },
          { $project: { min: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {

          arrRes.forEach(function (item) {
            sess.dates = item.min;
          })
          res.end('done');
        });
      });
    });
  } else {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.crypto, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, avg: { $avg: col } } },
          { $project: { avg: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {
          arrRes.forEach(function (item) {
            sess.dates = item.avg;
          })
          res.end('done');
        });
      });
    });
  }
})

app.get('/datasets', function (req, res) {
  sess = req.session;
  if (sess.dataset || sess.dataset == "") {

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.find({}).sort({ title: 1 }).toArray(function (err, result) {
          if (err) throw err;
          var monthyears = [];
          var years = [];
          result.forEach(function (item) {
            monthyears.push({ year: item.title.substring(0, 4), month: item.title.substring(5, 7) });
          })
          monthyears.forEach(function (item) {
            if (!years.includes(item.year)) {
              years.push(item.year);
            }
          })
          res.render('datasets', { data: monthyears, years: years, crypto: sess.dataset });
          result.forEach(function (item) {
          })
          db.close();
        });

      });

    });



  }
  else {

    res.render('datasets', { data: '', crypto: '' });

  }
});

app.post('/datasets', function (req, res) {
  sess = req.session;
  sess.dataset = req.body.crypto;

  res.end('done');
})

app.get('/ethdatasetdates', function (req, res) {
  sess = req.session;
  if (sess.aggregation == "max") {


    sess.result.forEach(function (item) {
      item.date = new Date(item.date);
    })
    res.render('ethdatasetdates', { data: sess.result, crypto: sess.dataset, max: sess.dates, aggregation: sess.aggregation, column: sess.column, text: sess.text });
  } else {
    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.findOne({ 'title': sess.monthtitle }, function (err, result) {
          if (err) throw err;
          datesArr = [];
          console.log('Ethereum Dataset dates');
          result.dates.forEach(function (item) {
            // item.date.setDate(item.date.getDate()-1);
            datesArr.push(item);
            
            
            console.log(item.date);
          })
          sess.result = datesArr;
          res.render('ethdatasetdates', { data: sess.result, crypto: sess.dataset, max: sess.dates, aggregation: sess.aggregation, column: sess.column, text: sess.text });
          db.close();
        });
      });
    });

  }
})

app.post('/ethdatasetdates', function (req, res) {
  sess = req.session;
  sess.monthtitle = req.body.title;
  sess.aggregation = '';
  sess.dates = '';
  res.end('done');
})

app.get('/bitdatasetdates', function (req, res) {
  sess = req.session;
  if (sess.aggregation == "max") {


    sess.result.forEach(function (item) {
      item.date = new Date(item.date);
    })
    res.render('bitdatasetdates', { data: sess.result, crypto: sess.dataset, max: sess.dates, aggregation: sess.aggregation, column: sess.column, text: sess.text });
  } else {
    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.findOne({ 'title': sess.monthtitle }, function (err, result) {
          if (err) throw err;

          datesArr = [];
          // console.log('Bitcoin Dataset dates');
          result.dates.forEach(function (item) {
            // item.date.setDate(item.date.getDate()-1);
            datesArr.push(item);
            
            // console.log(item.date);
          })
          sess.result = datesArr;

          res.render('bitdatasetdates', { data: sess.result, crypto: sess.dataset, max: sess.dates, aggregation: sess.aggregation, column: sess.column, text: sess.text });
          db.close();
        });
      });
    });

  }
})

app.post('/bitdatasetdates', function (req, res) {
  sess = req.session;
  sess.monthtitle = req.body.title;
  sess.aggregation = '';
  sess.dates = '';
  res.end('done');
})

app.post('/datasetaggre', function (req, res) {
  sess = req.session;
  sess.aggregation = req.body.aggre;
  sess.column = req.body.column;
  sess.text = req.body.text;

  if (sess.aggregation == 'max') {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, max: { $max: col } } },
          { $project: { max: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {


          arrRes.forEach(function (item) {
            sess.dates = item.max;
          })
          res.end('done');
        });
      });
    });
  } else if (sess.aggregation == 'min') {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, min: { $min: col } } },
          { $project: { min: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {
          arrRes.forEach(function (item) {
            sess.dates = item.min;
          })
          res.end('done');
        });
      });
    });
  } else {

    var col = '$dates.' + req.body.column;

    mongoose.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;

      mongoose.connection.db.collection(sess.dataset, function (err, collection) {
        if (err) throw err;
        collection.aggregate([
          { $match: { 'title': sess.monthtitle } },
          { $unwind: '$dates' },
          { $group: { _id: null, avg: { $avg: col } } },
          { $project: { avg: 1, _id: 0 } }

        ]).toArray(function (err, arrRes) {
          arrRes.forEach(function (item) {
            sess.dates = item.avg;
          })
          res.end('done');
        });
      });
    });
  }
})



app.listen(port, function () {
  console.log("now listening to localhost:" + port);
});

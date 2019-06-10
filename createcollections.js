var fs = require('fs');
var parse = require('csv-parse');
var csv = require('fast-csv');
let dateandtime = require('date-and-time');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var dbusername = process.env.DBUSERNAME;
var dbpassword = process.env.DBPASSWORD;
var dbnumber = process.env.DBNUMBER;
var dbname = process.env.DBNAME;
const url = 'mongodb://'+dbname+':'+dbpassword+'@ds1'+dbnumber+'.mlab.com:'+dbnumber+'/'+dbname;

const DateSchema = new Schema({
    date:Schema.Types.Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    marketcap: Number
});

const MonthSchema = new Schema({
    title: { type: String, required: true },
    dates: [DateSchema]

});


const BitDatasetDateSchema = new Schema({
    date: Schema.Types.Date,
    marketprice: Number,
    totalbitcoins: Number,
    marketcap: Number,
    tradevolume: Number,
    blockssize: Number,
    avgblocksize: Number,
    norphanedblocks: Number,
    ntransactionsperblock: Number,
    medianconfirmationtime: Number,
    hashrate: Number,
    difficulty: Number,
    minersrevenue: Number,
    transactionfees: Number,
    costpertransactionpercent: Number,
    costpertransaction: Number,
    nuniqueaddresses: Number,
    ntransactions: Number,
    ntransactionstotal: Number,
    ntransactionsexcludingpopular: Number,
    ntransactionsexcludingchainslongerthan100: Number,
    outputvolume: Number,
    estimatedtransactionvolume: Number,
    estimatedtransactionvolumeusd: Number
});

const BitDatasetMonthSchema = new Schema({
    title: { type: String, required: true },
    dates: [BitDatasetDateSchema]
});

const EthDatasetDateSchema = new Schema({
    date:Schema.Types.Date,
    unixtimestamp: Number,
    etherprice: Number,
    tx: Number,
    address: Number,
    supply: Number,
    marketcap: Number,
    hashrate: Number,
    difficulty: Number,
    blocks: Number,
    uncles: Number,
    blocksize: Number,
    blocktime: Number,
    gasprice: Number,
    gaslimit: Number,
    gasused: Number,
    ethersupply: Number,
    ensregister: Number

});
const EthDatasetMonthSchema = new Schema({
    title: { type: String, required: true },
    dates: [EthDatasetDateSchema]
});



const CrDate = mongoose.model('date', DateSchema);
const BitCrDate = mongoose.model('bdate', BitDatasetDateSchema);
const EthCrDate = mongoose.model('edate', EthDatasetDateSchema);


mongoose.connect(url, { useNewUrlParser: true }, function () {

    var arr = new Array();
    var arr2 = [];

    if (fs.existsSync('csvupdate.txt')) {

        fs.readFileSync('csvupdate.txt').toString().split('\n').forEach(function (line) { arr.push(line); })


        arr.forEach(function (index) {
            arr2.push(index.split(" ", 1));
        });
        arr2.splice(-1, 1);


        arr2.forEach(function (index) {

            createCollections(index);

        });






    } else {
        console.log("The file was deleted");

    }

    setTimeout(function () {
        mongoose.disconnect();
    }, 50000);

});







String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function capText(text) {
    return text.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');

}

function createCollections(item) {

    var months = [];
    var csvData = [];

    if (!(item.toString().includes("dataset"))) {

        var itemTitle = item.toString().replace("_price.csv", "");
        if (itemTitle.toString().includes('_')) {
            itemTitle = itemTitle.toString().replace('_', ' ');
        }
        var cappedTxt = capText(itemTitle);


        mongoose.connection.dropCollection(cappedTxt, function (err, result) {

            if (err) {
                console.log(err);

            }

        });


        var monthsColl = { months: [] };
        var csvStream = csv()
            .on("data", function (data) {

                csvData.push(data);
                var monString;

                var dt = new Date(data[0].toString());
                dt.setDate(dt.getDate() - 1);
                var cmonth = (dt.getMonth() + 1).toString();
                if ((dt.getMonth() + 1).toString().length == 1) {
                    cmonth = "0" + cmonth.toString();
                }
                var cyear = (dt.getYear() + 1900).toString();

                monString = cyear + "/" + cmonth;



                var bmpDigits = /[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0AE6\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/;
                var hasNumber = RegExp.prototype.test.bind(bmpDigits);
                if (hasNumber(monString)) {

                    var includeMon = false;
                    monthsColl.months.forEach(function (monthitem) {

                        if (monthitem.monthtitle == monString) {
                            includeMon = true;
                        }
                    })
                    if (!includeMon) {
                        monthsColl.months.push({ monthtitle: monString, dates: [] });
                    }






                }

            }).on("end", function () {


                monthsColl.months.forEach(function (monthItem) {

                    csvData.forEach(function (dat) {

                        var dt = new Date(dat[0].toString());

                        var cmonth = (dt.getMonth() + 1).toString();
                        if ((dt.getMonth() + 1).toString().length == 1) {
                            cmonth = "0" + cmonth.toString();
                        }
                        var cyear = (dt.getYear() + 1900).toString();


                        clast = cyear + "/" + cmonth;
                        if (monthItem.monthtitle == clast) {
                            monthItem.dates.push({ date: dat[0], open: dat[1], high: dat[2], low: dat[3], close: dat[4], volume: dat[5], marketcap: dat[6] });
                        }


                    })

                })

                monthsColl.months.forEach(function (ind) {
                    ind.dates.sort(compare);
                })
                function compare(a, b) {
                    var ad = dateandtime.parse(a.date, 'MMM DD, YYYY');
                    var bd = dateandtime.parse(b.date, 'MMM DD, YYYY');
                    if (ad.getDate() < bd.getDate()) {
                        return -1;

                    }
                    if (ad.getDate() > bd.getDate()) {
                        return 1;
                    }
                    return 0;
                }


                var Month = mongoose.model('month', MonthSchema, cappedTxt);

                monthsColl.months.forEach(function (mon) {


                    var month = new Month({
                        title: mon.monthtitle,
                        dates: []
                    });

                    month.save()

                        .then(function () {
                            Month.findOne({ title: mon.monthtitle }).then(function (record) {
                                mon.dates.forEach(function (dateItem) {

                                    var dt = new Date(dateItem.date.toString());

                                    var cmonth = (dt.getMonth() + 1).toString();
                                    if ((dt.getMonth() + 1).toString().length == 1) {
                                        cmonth = "0" + cmonth.toString();
                                    }
                                    var cyear = dt.getYear() + 1900;

                                    var monString = cyear + "/" + cmonth;
                                    if (mon.monthtitle == monString) {
                                        var dbdate = dateandtime.parse(dateItem.date, 'MMM DD, YYYY')
                                        dbdate.setDate(dbdate.getDate() + 1);
                                        var date = new CrDate({
                                            date: dbdate,
                                            open: parseFloat(dateItem.open),
                                            high: parseFloat(dateItem.high),
                                            low: parseFloat(dateItem.low),
                                            close: parseFloat(dateItem.close),
                                            volume: parseInt(dateItem.volume.replace(/,/g, "")),
                                            marketcap: parseInt(dateItem.marketcap.replace(/,/g, ""))


                                        });
                                        record.dates.push(date);

                                    }
                                })
                                record.save().then(function () {
                                    csvStream.resume();
                                });

                            });

                        });


                });

            });

        fs.createReadStream('crypto/' + item, { headers: false }).pipe(csvStream);




    }

    else if (item.toString().includes("bitcoin")) {
        var itemTitle = item.toString().replace(".csv", "");
        if (itemTitle.toString().includes('_')) {
            itemTitle = itemTitle.toString().replace('_', ' ');
        }
        var cappedTxt = capText(itemTitle);




        mongoose.connection.dropCollection(cappedTxt, function (err, result) {

            if (err) {

                console.log(err);

            }

        });



        var monthsColl = { months: [] };
        var csvStream = csv()
            .on("data", function (data) {

                csvData.push(data);
                var monString;
                if (data[0].toString().includes("-")) {
                    monString = data[0].toString().slice(0, 7);
                    monString = monString.replace("-", "/");

                }

                var bmpDigits = /[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0AE6\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/;
                var hasNumber = RegExp.prototype.test.bind(bmpDigits);
                if (hasNumber(monString)) {
                    var includeMon = false;
                    monthsColl.months.forEach(function (monthitem) {

                        if (monthitem.monthtitle == monString) {
                            includeMon = true;
                        }
                    })
                    if (!includeMon) {
                        monthsColl.months.push({ monthtitle: monString, dates: [] });
                    }

                }
            }).on("end", function () {


                monthsColl.months.forEach(function (monthItem) {

                    csvData.forEach(function (dat) {

                        var dt = new Date(dat[0].toString());

                        var cmonth = (dt.getMonth() + 1).toString();
                        if ((dt.getMonth() + 1).toString().length == 1) {
                            cmonth = "0" + cmonth.toString();
                        }
                        var cyear = (dt.getYear() + 1900).toString();

                        clast = cyear + "/" + cmonth;
                        if (monthItem.monthtitle == clast) {

                            monthItem.dates.push({
                                date: dat[0],
                                marketprice: dat[1],
                                totalbitcoins: dat[2],
                                marketcap: dat[3],
                                tradevolume: dat[4],
                                blockssize: dat[5],
                                avgblocksize: dat[6],
                                norphanedblocks: dat[7],
                                ntransactionsperblock: dat[8],
                                medianconfirmationtime: dat[9],
                                hashrate: dat[10],
                                difficulty: dat[11],
                                minersrevenue: dat[12],
                                transactionfees: dat[13],
                                costpertransactionpercent: dat[14],
                                costpertransaction: dat[15],
                                nuniqueaddresses: dat[16],
                                ntransactions: dat[17],
                                ntransactionstotal: dat[18],
                                ntransactionsexcludingpopular: dat[19],
                                ntransactionsexcludingchainslongerthan100: dat[20],
                                outputvolume: dat[21],
                                estimatedtransactionvolume: dat[22],
                                estimatedtransactionvolumeusd: dat[23]
                            });
                        }
                    })
                })




                var Month = mongoose.model('bmonth', BitDatasetMonthSchema, cappedTxt);

                monthsColl.months.forEach(function (mon) {


                    var month = new Month({
                        title: mon.monthtitle,
                        dates: []
                    });

                    month.save()

                        .then(function () {
                            Month.findOne({ title: mon.monthtitle }).then(function (record) {
                                mon.dates.forEach(function (dateItem) {
                                    var dt = new Date(dateItem.date.toString());
                                    var cmonth = (dt.getMonth() + 1).toString();
                                    if ((dt.getMonth() + 1).toString().length == 1) {
                                        cmonth = "0" + cmonth.toString();
                                    }
                                    var cyear = dt.getYear() + 1900;

                                    var monString = cyear + "/" + cmonth;
                                    dt = dateandtime.parse(dateItem.date, 'YYYY-MM-DD hh:mm:ss');
                                    dt.setDate(dt.getDate() + 1);

                                    if (record.title == monString) {
                                        var bdate = new BitCrDate({
                                            date: dt,
                                            marketprice: parseFloat(dateItem.marketprice),
                                            totalbitcoins: parseInt(dateItem.totalbitcoins),
                                            marketcap: parseFloat(dateItem.marketcap),
                                            tradevolume: parseFloat(dateItem.tradevolume),
                                            blockssize: parseFloat(dateItem.blockssize),
                                            avgblocksize: parseFloat(dateItem.avgblocksize),
                                            norphanedblocks: parseInt(dateItem.norphanedblocks),
                                            ntransactionsperblock: parseFloat(dateItem.ntransactionsperblock),
                                            medianconfirmationtime: parseFloat(dateItem.medianconfirmationtime),
                                            hashrate: parseFloat(dateItem.hashrate),
                                            difficulty: parseFloat(dateItem.difficulty),
                                            minersrevenue: parseFloat(dateItem.minersrevenue),
                                            transactionfees: parseFloat(dateItem.transactionfees),
                                            costpertransactionpercent: parseFloat(dateItem.costpertransactionpercent),
                                            costpertransaction: parseFloat(dateItem.costpertransaction),
                                            nuniqueaddresses: parseInt(dateItem.nuniqueaddresses),
                                            ntransactions: parseInt(dateItem.ntransactions),
                                            ntransactionstotal: parseInt(dateItem.ntransactionstotal),
                                            ntransactionsexcludingpopular: parseInt(dateItem.ntransactionsexcludingpopular),
                                            ntransactionsexcludingchainslongerthan100: parseInt(dateItem.ntransactionsexcludingchainslongerthan100),
                                            outputvolume: parseFloat(dateItem.outputvolume),
                                            estimatedtransactionvolume: parseInt(dateItem.estimatedtransactionvolume),
                                            estimatedtransactionvolumeusd: parseInt(dateItem.estimatedtransactionvolumeusd)
                                        });
                                        record.dates.push(bdate);

                                    }
                                })
                                record.save().then(function () {
                                    csvStream.resume();
                                });

                            });

                        });


                });

            });

        fs.createReadStream('crypto/' + item, { headers: false }).pipe(csvStream);


    } else if (item.toString().includes("ethereum")) {
        var itemTitle = item.toString().replace(".csv", "");
        if (itemTitle.toString().includes('_')) {
            itemTitle = itemTitle.toString().replace('_', ' ');
        }
        var cappedTxt = capText(itemTitle);



        mongoose.connection.dropCollection(cappedTxt, function (err, result) {

            if (err) {

                console.log(err);

            }
        });


        var monthsColl = { months: [] };
        var csvStream = csv()
            .on("data", function (data) {

                csvData.push(data);
                var monString;
                if (data[0].toString().includes("/")) {
                    var monArray = data[0].toString().split("/");

                    if (monArray[0].toString().length == 1) {
                        monString = monArray[2] + "/0" + monArray[0];
                    } else {
                        monString = monArray[2] + "/" + monArray[0];
                    }


                }

                var bmpDigits = /[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0AE6\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/;
                var hasNumber = RegExp.prototype.test.bind(bmpDigits);
                if (hasNumber(monString)) {
                    var includeMon = false;
                    monthsColl.months.forEach(function (monthitem) {

                        if (monthitem.monthtitle == monString) {
                            includeMon = true;
                        }
                    })
                    if (!includeMon) {
                        monthsColl.months.push({ monthtitle: monString, dates: [] });
                    }

                }
            }).on("end", function () {


                monthsColl.months.forEach(function (monthItem) {

                    csvData.forEach(function (dat) {
                        var splitArray = dat[0].toString().split("/");
                        if (typeof splitArray[2] != 'undefined') {

                            splitArray.forEach(function (ind) {
                            })
                            if (splitArray[0].toString().length == 1 && splitArray[1].toString().length == 1) {
                                dat[0] = "0" + splitArray[0].toString() + "/0" + splitArray[1].toString() + "/" + splitArray[2];
                            } else if (splitArray[0].toString().length == 1 && splitArray[1].toString().length != 1) {
                                dat[0] = "0" + splitArray[0].toString() + "/" + splitArray[1].toString() + "/" + splitArray[2];
                            } else if (splitArray[0].toString().length != 1 && splitArray[1].toString().length == 1) {
                                dat[0] = splitArray[0].toString() + "/0" + splitArray[1].toString() + "/" + splitArray[2];
                            }
                        }

                        var dt = new Date(dat[0].toString());

                        var cmonth = (dt.getMonth() + 1).toString();
                        if ((dt.getMonth() + 1).toString().length == 1) {
                            cmonth = "0" + cmonth.toString();
                        }
                        var cyear = (dt.getYear() + 1900).toString();

                        clast = cyear + "/" + cmonth;

                        if (monthItem.monthtitle == clast) {

                            monthItem.dates.push({
                                date: dat[0],
                                unixtimestamp: dat[1],
                                etherprice: dat[2],
                                tx: dat[3],
                                address: dat[4],
                                supply: dat[5],
                                marketcap: dat[6],
                                hashrate: dat[7],
                                difficulty: dat[8],
                                blocks: dat[9],
                                uncles: dat[10],
                                blocksize: dat[11],
                                blocktime: dat[12],
                                gasprice: dat[13],
                                gaslimit: dat[14],
                                gasused: dat[15],
                                ethersupply: dat[16],
                                ensregister: dat[17]
                            });
                        }
                    })
                })




                var Month = mongoose.model('emonth', EthDatasetMonthSchema, cappedTxt);

                monthsColl.months.forEach(function (mon) {


                    var month = new Month({
                        title: mon.monthtitle,
                        dates: []
                    });

                    month.save()

                        .then(function () {
                            Month.findOne({ title: mon.monthtitle }).then(function (record) {
                                mon.dates.forEach(function (dateItem) {

                                    var dt = new Date(dateItem.date.toString());
                                    var cmonth = (dt.getMonth() + 1).toString();
                                    if ((dt.getMonth() + 1).toString().length == 1) {
                                        cmonth = "0" + cmonth.toString();
                                    }
                                    var cyear = dt.getYear() + 1900;
                                    dt = dateandtime.parse(dateItem.date, 'MM/DD/YYYY');
                                    dt.setDate(dt.getDate() + 1);
                                    var monString = cyear + "/" + cmonth;
                                    if (record.title == monString) {
                                        var bdate = new EthCrDate({
                                            date: dt,
                                            unixtimestamp: parseInt(dateItem.unixtimestamp),
                                            etherprice: parseFloat(dateItem.etherprice),
                                            tx: parseInt(dateItem.tx),
                                            address: parseInt(dateItem.address),
                                            supply: parseFloat(dateItem.supply),
                                            marketcap: parseFloat(dateItem.marketcap),
                                            hashrate: parseFloat(dateItem.hashrate),
                                            difficulty: parseFloat(dateItem.difficulty),
                                            blocks: parseInt(dateItem.blocks),
                                            uncles: parseInt(dateItem.uncles),
                                            blocksize: parseInt(dateItem.blocksize),
                                            blocktime: parseFloat(dateItem.blocktime),
                                            gasprice: parseInt(dateItem.gasprice),
                                            gaslimit: parseInt(dateItem.gaslimit),
                                            gasused: parseInt(dateItem.gasused),
                                            ethersupply: parseFloat(dateItem.ethersupply),
                                            ensregister: parseInt(dateItem.ensregister)


                                        });
                                        record.dates.push(bdate);

                                    }
                                })
                                record.save().then(function () {
                                    csvStream.resume();
                                });

                            });

                        });


                });

            });

        fs.createReadStream('crypto/' + item, { headers: false }).pipe(csvStream);

    }


}
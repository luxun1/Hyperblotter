/**
 * Created by grahamclapham on 16/10/15.
 */
var staticData = require('./staticData');

var data = staticData.data;
var countryMap = staticData.countryMap;

//--- API on Static data
var _arrayGeneratorPrivate = {
    _privateFunction: function _privateFunction(){
        return "Array generator private function...";
    }
};

var arrayGeneratorProto = {
    _array: null,
    _staticArray: null,
    _arrayLength: 10,
    _sortArray: [],
    //------------
    _getStaticData:function _getStaticData(){
        if(_arrayGeneratorPrivate._staticArray && _arrayGeneratorPrivate._staticArray.length>0){
            return _arrayGeneratorPrivate._staticArray;
        }else {
            var count = data.NAME.length;
            var i = 0;
            _arrayGeneratorPrivate._staticArray = [];
            window.CC = {};
            for (i = 0; i < count; i++) {
                CC[data.COUNTRY[i]] = true;
                _arrayGeneratorPrivate._staticArray[i] = {
                    NAME: data.NAME[i],
                    TICKER: data.TICKER[i],
                    COUNTRY: data.COUNTRY[i],
                    ICB: data.ICB[i],
                    INDUS: data.INDUS[i],
                    SUP_SEC: data.SUP_SEC[i],
                    SEC: data.SEC[i],
                    SUB_SEC: data.SUB_SEC[i],
                    Date: new Date(),
                    Time: Date.now(),
                    Open: data.Open[i],
                    Close: data.Close[i],
                    getClose: data.Close[i],
                    PreviousClose: data.PreviousClose[i],
                    PreviousCloseDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
                    High: data.High[i],
                    Low: data.Low[i],
                    Last: data.Last[i],
                    Change: data.Change[i],
                    PercentChange: data.PercentChange[i],
                    Volume: Math.floor(data.Volume[i]),
                    BidQuantity: data.BidQuantity[i],
                    Bid: data.Bid[i],
                    Spread: data.Spread[i],
                    Ask: data.Ask[i],
                    AskQuantity: data.AskQuantity[i],
                    Today:this.createRandomSparkline(), //[0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0],
                    flash: 0,
                    flashColor: 'green',
                    countryCode: countryMap[data.COUNTRY[i]]
                }
            }
            // sort it on TICKER to start with..
            _arrayGeneratorPrivate._staticArray.sort(function(a,b){
                return a.TICKER < b.TICKER ? -1 : 1;
            });
        }
            return _arrayGeneratorPrivate._staticArray
    },
    _generateEmptyArr:function _generateArr(){
            if(!this._array || this._array.length != this.getArrayLength()) {
                this._array = [];
                for (var i = 0; i < this.getArrayLength(); i++) {
                    this._array.push(null);
                }
                return this._array;
            }else{
                return this._array;
            }
    },
        setArrayLength: function setArrayLength(val){
        if(isNaN(val)) return;
            this._arrayLength = val
        },
        getArrayLength: function getArrayLength(){
            return this._arrayLength;
        },
    _generateRandomNumberArray: function _generateRandomNumberArray(length, sampleLength){
        if( isNaN(parseInt(length)) || isNaN(parseInt(sampleLength)) ) {
            throw new Error("_generateRandomNumberArray requires a length shorter than the sampleLength.")
        }
        function addRandomNumber(arr){
            var _arr = arr || [];
            var _rand = Math.round( Math.random() * sampleLength );
            if(arr.length < length ){
                if(_arr.indexOf(_rand != -1)){
                    _arr.push(_rand);
                }
                addRandomNumber(_arr);
            }else{
                return _arr;
            }
            return _arr;
        }
        return addRandomNumber([]);
    },
    setSortArray: function(value){
        this._sortArray = value;
    },
    getSortArray: function(){
        return  this._sortArray;
    },
    getRandomArray: function getRandomArray(){
        var _this = this;
        if(this._arrayLength > data.NAME.length) throw new Error("Your Array length exceeds the data size.")
        var _numbers = this._generateRandomNumberArray(this.getArrayLength(),  data.NAME.length)
        return this._generateEmptyArr(this.getArrayLength())
            .map(function(d,i){
                return _this.createDataCell(_numbers[i]);
            });
    },
    createRandomSparkline:function(){
        var _arr = [];

        for(var i=0; i< 16 ;i++){
            _arr.push( _getSparklineRandomValue() )
        }
        return _arr;
    },
    createDataCell:function createDataCell(i){
        return {
            NAME: data.NAME[i],
            TICKER: data.TICKER[i],
            COUNTRY: data.COUNTRY[i],
            ICB: data.ICB[i],
            INDUS: data.INDUS[i],
            SUP_SEC: data.SUP_SEC[i],
            SEC: data.SEC[i],
            SUB_SEC: data.SUB_SEC[i],
            Date: new Date(),
            Time: Date.now(),
            Open: data.Open[i],
            Close: data.Close[i],
            PreviousClose: data.PreviousClose[i],
            PreviousCloseDate: new Date(Date.now() - 1000*60*60*24),
            x: data.High[i],
            Low: data.Low[i],
            Last: data.Last[i],
            Change: data.Change[i],
            PercentChange: data.PercentChange[i],
            Volume: Math.floor(data.Volume[i]),
            BidQuantity: data.BidQuantity[i],
            Bid: data.Bid[i],
            Spread: data.Spread[i],
            Ask: data.Ask[i],
            AskQuantity: data.AskQuantity[i],
            Today:this.createRandomSparkline(), //[0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0],
            flash: 0,
            flashColor: 'green',
            countryCode: countryMap[data.COUNTRY[i]]
        }
    },
    getStocks:function getStocks(){
        return this._getStaticData();
    },
    getMorphedStocks:function getStocks(){
        // Start with an array of random numbers...
        var _randomNumbers = this._generateRandomNumberArray(this.getArrayLength(), this._getStaticData().length);
        // update the staticData for the selected random numbers
        _randomNumbers.map(function(d,i){
            try{
                var _high = (6 + (Math.random() * 60) ).toFixed(2);
                var _low = (Math.random() * 6).toFixed(2);
                this._getStaticData()[d].High   = _high;
                this._getStaticData()[d].Low    = _low;
                randomizeTick(this._getStaticData()[d]);
            }catch(err){
                //---
            }
        }.bind(this));
        return this._getStaticData();
    },
    getDataWithRandomisation: function getDataWithRandomisation(from, to){
        //var _subSlice = this._getStaticData().slice(from, to)
        var _ascening;
        var _headings = ['TICKER','NAME','High','Low','Last','Today', 'Change'];
        var _header;
        this.getSortArray().map(function(d,i){
            if(d !== 0){
                _ascening =  d === 1 ? true : false;
                _header = _headings[i];
            }
        });

        var _subSlice = this._getStaticData().sort(
            function (a, b) {
                if(!_header){
                    if(_ascening){
                        return a.NAME < b.NAME ? -1 : 1;
                    }else{
                        return a.NAME > b.NAME ? -1 : 1;
                    }
                }else{
                    if(_ascening){
                        return a[_header] < b[_header] ? -1 : 1;
                    }else{
                        return a[_header] > b[_header] ? -1 : 1;
                    }
                }
            }
        ).slice(from, to);

        _subSlice.map(function(d,i){
            try{
                var _high = (6 + (Math.random() * 60) ).toFixed(2);
                var _low = (Math.random() * 6).toFixed(2);
                d.High   = _high;
                d.Low    = _low;
                randomizeTick(d);
                //console.log( this._getStaticData()[d] );
            }catch(err){
                //---
            }
        }.bind(this));

        return this._getStaticData();
    }
};

var arrayGenerator = function () {
    return Object.create(arrayGeneratorProto);
};

//////
var tickerTimerPrivate = {
    _lastTick:null,
    _functionCallsPerSecond: 10,
    _arrayGen: arrayGenerator(),
    _ticksExecuted: 1,

    onTick: function onTick(t){
        var _frame = 16;
        var second = _frame * 60;
        if(!this._lastTick) this._lastTick = t;
        if(t- this._lastTick > (second / tickerTimerPrivate._functionCallsPerSecond)){
            this._lastTick = t;
            tickerTimerPrivate._ticksExecuted ++;
            tickerTimerPrivate.tickFunction();
        }
        window.requestAnimationFrame(tickerTimerPrivate.onTick);
    },
    tickFunction: function tickFunction(){
        document.dispatchEvent( new CustomEvent('frame-updated') );
    }
};

var tickerTimerProto = {
    start: function start(){
        window.requestAnimationFrame(tickerTimerPrivate.onTick);
    },
    stop: function stop(){
    // TODO: add the stop() function...
    }
};


var timerGenerator = function () {
    return Object.create(tickerTimerProto);
};

var count = data.NAME.length;
var i = 0;
var stocks = [];
window.CC = {};
for (i = 0; i < count; i++) {
    CC[data.COUNTRY[i]] = true;
    stocks[i] = {
        NAME: data.NAME[i],
        TICKER: data.TICKER[i],
        COUNTRY: data.COUNTRY[i],
        ICB: data.ICB[i],
        INDUS: data.INDUS[i],
        SUP_SEC: data.SUP_SEC[i],
        SEC: data.SEC[i],
        SUB_SEC: data.SUB_SEC[i],
        Date: new Date(),
        Time: Date.now(),
        Open: data.Open[i],
        Close: data.Close[i],
        PreviousClose: data.PreviousClose[i],
        PreviousCloseDate: new Date(Date.now() - 1000*60*60*24),
        High: data.High[i],
        Low: data.Low[i],
        Last: data.Last[i],
        Change: data.Change[i],
        PercentChange: data.PercentChange[i],
        Volume: Math.floor(data.Volume[i]),
        BidQuantity: data.BidQuantity[i],
        Bid: data.Bid[i],
        Spread: data.Spread[i],
        Ask: data.Ask[i],
        AskQuantity: data.AskQuantity[i],
        Today:[0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0],
        flash: 0,
        flashColor: 'green',
        countryCode: countryMap[data.COUNTRY[i]]
    }
}

stocks.sort(function(a,b){
    return a.TICKER < b.TICKER ? -1 : 1;
});

var seed = 1;

var rnd = function() {
    var x = Math.sin(seed++)*10000;
    var r = x - Math.floor(x);
    return r;
};

var shuffle = function(arr){
    getRandomSelection(arr);
};

var getRandomSelection = function(arr, length){
    var _length = length || 200
    var _arr = [];
    for(var i=0; i<_length; i++){
        _arr.push( arr[Math.round(Math.random() * arr.length)] );
    }
    return _arr;
};

var toPickFrom = stocks.slice(0);
shuffle(toPickFrom);

var randomizeTicks = function() {
    if (toPickFrom.length < 200) {
        toPickFrom = stocks.slice(0);
        shuffle(toPickFrom);
    }
    for (i = 0; i < 200; i++) {
        var each = toPickFrom.shift();
        randomizeTick(each);
    }
};
var _getSparklineRandomValue = function(){
    return 5 + Math.floor(90 * rnd());
};

var randomizeTick = function(stock) {
    stock.Bid = (stock.Bid * 0.99) + (stock.Bid * 0.017 * rnd());
    stock.Spread = rnd()/10;
    stock.Ask = stock.Bid + stock.Spread;
    //trades don't always happen
    if (stock.Spread < 0.03) {
        stock.BidQuantity = Math.floor(12 * rnd()) * 100;
        stock.AskQuantity = Math.floor(12 * rnd()) * 100;
        stock.Volume = Math.floor(stock.Volume + stock.BidQuantity);
        stock.Change = stock.Bid - stock.Last
        stock.PercentChange = (stock.Change)/stock.Last*100;
        stock.Today.push( _getSparklineRandomValue() );
        if (stock.Today.length === 17) {
            stock.Today.shift();
        }
        stock.Last = stock.Bid;
        stock.flashColor = stock.Change > 0 ? 'green' : 'red';
        stock.High = Math.max(stock.High, stock.Last);
        stock.Low = Math.min(stock.Low, stock.Last);
        stock.Time = Date.now();

        if (stock.Time - stock.lastViewedTime < 100) {
            stock.flash = 40;
        }
    }
};

module.exports = {
    arrayGenerator: arrayGenerator,
    stocks: stocks,
    randomize: randomizeTicks,
    timerGenerator: timerGenerator
};

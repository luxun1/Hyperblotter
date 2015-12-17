var React = require('react'),
		ticker = require('../griddata/data_ticker.js'),
        numeral = require('numeral'),
        moment = require('moment'),
        _ = require('underscore'),
        excel = require("../vendor/ExcelAPI.js"),
        Excel,
        lastSelectedRow,
        _arrayGen = ticker.arrayGenerator();

var countries = ['GR','DK','ZA','RU','CO','IT','IN','BR','AE','AF','AG','AI','AM','AO','AS','AR','AT','AU','AX','BA','BB','BD','BE','BF','BH','BI','BJ','BM','BN','BS','BT','BV','BY','CA','CC','CD','CG','CH','CK','CL','CM','CN','CO','CR','CU','CV','CX','CY','CZ','DE','DM','DO','DZ','EE','EH','ES','FI','FJ','FK','FM','FR','GB','GE','GI','GL','GM','GN','GP','GQ','GS','GT','GU','GW','GY','HK','HM','HN','HR','HU','ID','IE','IL','IO','IQ','IR','JO','JP','KE','KG','KH','KM','KY','KZ','LC','LI','LK','LR','LS','LT','LU','LV','LY','MD','MH','MK','MM','MO','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PH','PK','PL','PM','PN','PR','PS','PW','PY','QA','RE','RO','RS','SA','SB','SD','SE','SG','SH','SJ','SM','SN','SO','SR','ST','SV','TC','TD','TH','TJ','TK','TL','TN','TO','TR','TT','TV','TW','UM','UY','UZ','VA','VE','VI','VN','WS','ZA','ZW','KR'];
var imageCache = {};

(function() {
    var each, img;
    for (var i = 0; i < countries.length; i++) {
        each = countries[i];
        img = new Image();
        img.src = 'images/famfamfam_flag_icons/png/' + each.toLowerCase() + '.png';
        imageCache[each] = img;
    }

    img = new Image();
    img.src = 'images/up-arrow.png';
    imageCache['up-arrow'] = img;

    img = new Image();
    img.src = 'images/down-arrow.png';
    imageCache['down-arrow'] = img;

})();

var typeAlignmentMap = {
    j: 'right',
    s: 'left',
    t: 'center',
    f: 'right',
    d: 'center'
};

var isInt = function(n){
        return Number(n)===n && n%1===0;
};

var isFloat = function(n){
        return   n===Number(n)  && n%1!==0
};

var format = function(data) {
    if (isInt(data)) {
        if (data > 1431446226436) { // this is a time
            return moment(data).format('HH:mm:ss.SSS');
        } else {
            return numeral(data).format('0,0');
        }
    } else if (isFloat(data)) {
        return numeral(data).format('0,0.00');
    } else {
        return data;
    }
};

function excelCallback(o){
    console.log("EXCEL CALLBACK ", o )
    //  console.log("THE SELECTED WORKSHEET IS ", getWorkSheet("hypergrid.xlsx", "Publisher"))

}



function OnCellSelectionChanged(){

};
///////////////////////////////////

var HyperGrid = React.createClass({
    componentDidMount: function(){

        fin.desktop.main(()=>{

            console.log("FIN IS INITIALISED IN THE GRID...")
            Excel = fin.desktop.Excel;
            Excel.init();
            Excel.getConnectionStatus(excelCallback);
            Excel.addEventListener("workbookAdded", excelCallback);
            Excel.addEventListener("workbookClosed", excelCallback);
            Excel.addEventListener("connected", excelCallback);
            Excel.addEventListener("workbookActivated", function(w){
                console.log("THERE HAS BEEN A WORKBOOK ADDED");
            });

            console.log("Called Excel ", Excel)
            fin.desktop.InterApplicationBus.subscribe("*", "excelResult", function(data) {
                console.log("excelResult ", data);
            });


            fin.desktop.InterApplicationBus.subscribe("*", "excelEvent", function(data) {
                console.log("excelEvent", data.workbookName);
            });

            //-- function tp split the data returned from the fin-hypergid selection venet into a 3d object
            function splitFlatArray(array, rows){
                var _returnArray = [];

                var _numArrays = Math.floor(array.length / rows );
                var _arrayLength = array.length / _numArrays

                for(var i = 0; i<=array.length; i+= _arrayLength) {
                    _returnArray.push(array.slice(i, i+(_arrayLength) ));
                }
                return _returnArray;
            }

            function createExcelCoordinates(a, b){
                if(isNaN(a) || isNaN(b)) return;
                var _xCoord;
                var _alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
                var _numberOfAlphabetsLength = Math.floor(a/_alphabet.length);
                if(_numberOfAlphabetsLength > _alphabet.length * _alphabet.length ){
                    throw new Error("There are too many columns to generate a coordinate.")
                }
                var _alphabetLength = a % _alphabet.length;
                var _letterOne = _alphabet[_numberOfAlphabetsLength-1] ? _alphabet[_numberOfAlphabetsLength-1] : "";
                var _letterTwo  = _alphabet[_alphabetLength-1];

                _xCoord = _letterOne+_letterTwo;
                return {x: _xCoord, y: b}

            }


            fin.desktop.InterApplicationBus.subscribe("*", "onSelect", function(data) {
                //console.log("onSelect -- ", data.selection[0]);
                console.log("onSelect -- region : ", data.selection[0].region[3]);
                console.log("onSelect -- values : ", data.selection[0].values);
                var _clearArray = function(){
                    var _retArr = []
                    var _arr = ["","","","","","","","","","","","","","","","","","","","","","",]
                    for(var i=0; i<20; i++){
                        _retArr.push(_arr.slice(0))
                    }
                    return _retArr;
                }
                var _rows = data.selection[0].region[3]

                var _arrData =  splitFlatArray(data.selection[0].values, data.selection[0].region[3]);

                fin.desktop.Excel.getWorkbooks(function(workbooks){
                    workbooks.filter(function(d, i){
                        return d.name === "hypergrid.xlsx"
                    }).map(function(d,i){
                        var _worksheet = d.getWorksheets(function(ws){
                            ws.filter(function(dd,ii){
                                return dd.name === "Publisher"
                            }).map(function(ddd,iii){
                                //console.log("DATA SELECTION : ",data.selection[0].region);
                                //console.log("createExcelCoordinates", createExcelCoordinates(data.selection[0].region[2], data.selection[0].region[0]))
                                var _coords = createExcelCoordinates(data.selection[0].region[1], data.selection[0].region[0]);
                                ddd.setCells(_clearArray(), "A1");
                                ddd.setCells(_arrData, _coords.x + _coords.y);
                            })
                        })
                    });
                });
            });
        });


        setTimeout(function(){
            try{
                fin.desktop.Window.getCurrent().bringToFront();
                console.log("Bringing HyperGrid to the front")
            }catch(err){
                //--
                console.log("Error with HyperGrid coming to the front ", err)
            }
        }, 1000);


        window.addEventListener('polymer-ready',function(){
            var jsonGrid = document.querySelector('#stock-example');
            var jsonModel = jsonGrid.getBehavior();

            jsonGrid.getRenderer().paint = function(gc) {
                if (!this.grid) {
                    return;
                }
                this.renderGrid(gc);
                //draw the thick blue line at the bottom of the header
                gc.beginPath();
                var fixedColumnsWidth = jsonModel.getFixedColumnsWidth();
                var viewWidth = this.getBounds().width() - 200; // look in fin-hypergrid and initializtion of fin-canvas            
                var height = this.getFixedRowHeight(0);
                gc.strokeStyle = '#3D77FE';//61,119,254
                gc.lineWidth = 4;
                gc.moveTo(0, height + 0.5);
                gc.lineTo(viewWidth, height + 0.5);
                gc.stroke();
                this.getGrid().gridRenderedNotification();
            };
            jsonGrid.getRenderer().paint.bind(jsonGrid);

            var cellProvider = jsonModel.getCellProvider();

            jsonModel.setData(_arrayGen.getStocks());
            jsonModel.setFixedColumnCount(1);
            jsonModel.setHeaders(['Symbol','Name','High','Low','Last','Today', 'Change','% Change','Volume','Bid Qty','Bid','Spread','Ask','Ask Qty','Country Code','Country','ICB','Industry','Super Sector','Sector','Sub Sector','Date','Time','Open','Cls','Previous Cls','Previous Cls Dt','Name']);
            jsonModel.setFields(['TICKER','NAME','High','Low','Last','Today', 'Change','PercentChange','Volume','BidQuantity','Bid','Spread','Ask','AskQuantity','countryCode', 'COUNTRY','ICB','INDUS','SUP_SEC','SEC','SUB_SEC','Date','Time','Open','Close','PreviousClose','PreviousCloseDate','NAME']);
            
            var bgColor = '#07071E';
            var fixedAreasBGColor = bgColor;

            var font = "16px Roboto Condensed";
            var headingFont = "18px Roboto Condensed";
            var headingFGColor = '#3D77FE';

            var lnfOverrides = {
                font: font,
                topLeftFont: headingFont,
                fixedRowFont: headingFont,
                fixedColumnFont: font,
                backgroundColor2: bgColor,
                backgroundColor: bgColor,
                topLeftBackgroundColor: fixedAreasBGColor,
                fixedColumnBackgroundColor: fixedAreasBGColor,
                fixedRowBackgroundColor: fixedAreasBGColor,
                color: 'white',
                topLeftColor: headingFGColor,
                fixedColumnColor: 'white',
                fixedRowColor: headingFGColor,
                lineColor: '#131C23',
                gridLinesV: false,
                gridLinesH: true,
                fixedColumnFGSelColor: 'white',
                fixedColumnBGSelColor: '#3D77FE',
                fixedRowFGSelColor: 'white',
                fixedRowBGSelColor: '#3D77FE',

                defaultFixedRowHeight: 40
            };
            jsonModel.defaultRowHeight = 57,

            //to apply to a specific table
            jsonGrid.addProperties(lnfOverrides);
            jsonGrid.editAt = function(){};
            jsonGrid.addFinEventListener('fin-click', function(event) {
                setTimeout(function(){
                    _arrayGen.setSortArray( jsonGrid.getState().sorted );
                }, 10);
            });

            jsonGrid.addFinEventListener('fin-selection-changed', function(event) {
                console.log("+++++++++++++ The selection has changed ", event)
                console.log("+++++++++++++ The selection has changed: this ", jsonGrid)
            });





            ticker.timerGenerator().start();
            document.addEventListener("frame-updated", function(e){
                jsonModel.setData(_arrayGen.getDataWithRandomisation(jsonGrid.getVScrollValue(), jsonGrid.getVScrollValue()+11));
                jsonModel.dataModified();
            });

            jsonModel.fixedColumnClicked = (grid, cellData) => {
                    lastSelectedRow =  cellData.gridCell.y;
                        var row = jsonModel.getRow(lastSelectedRow)
                        //require('./child-window.js').createChildWindow({
                        //    name: row.NAME,
                        //    url: 'chartiq/stx-advanced.html?row=' + lastSelectedRow,
                        //    autoShow: true,git
                        //    defaultWidth: 960,
                        //    maxWidth: 960,
                        //    minWidth: 960,
                        //    maxHeight: 594,
                        //    defaultHeight: 594,
                        //    minHeight: 594,
                        //    resizable:false,
                        //    frame: true,
                        //    maximizable: false,
                        //    saveWindowState: false
                        //})
            };

            jsonModel.highlightCellOnHover= function(isColumnHovered, isRowHovered) {
                return isRowHovered;
            };

            var flashMap = {
              red: function(v) {
                return 'rgba(255, 0, 0, '+ (1.0-(40-v)/40) +')';
              },
              green: function(v) {
                return 'rgba(0, 255, 0, '+ (1.0-(40-v)/40) +')';
              }
            };

            cellProvider.getCell = function(config) {
                var renderer = cellProvider.cellCache.simpleCellRenderer;
                config.halign = 'right';
                var x = config.x;
                var y = config.y;
                var row = jsonModel.getRow(y) || {
                  flash: 0,
                  flashColor: 'green'
                };

                if(x === 0){
                    config.halign = 'left';
                    config.bgColor = 'red';
                };

                if(x === 1){
                    config.halign = 'left';
                };

                if (x === 5) {
                    renderer = cellProvider.cellCache.sparklineCellRenderer;
                } else if (x === 5 || x === 6) {
                    config.value = format(config.value);
                    config.halign = 'center';
                    if (config.value.indexOf('-') === 0) {
                      config.value = '(' + config.value.substring(1) + ')';

                      config.fgColor = 'red';
                    } else {
                      config.fgColor = 'green';
                    }
                    //config.font = '24px Verdana';
                } else if (x === 3) {
                  config.value = format(config.value);
                  if (row.flash > 0) {
                    config.bgColor = flashMap[row.flashColor](row.flash);
                    config.fgColor = 'white';
                    row.flash = row.flash - 1;
                  }
                } else if (x === 13) {
                  config.value = [imageCache[config.value],config.value,null];
                } else {
                  config.value = format(config.value);
                }

                row.lastViewedTime = Date.now();

                renderer.config = config;
                return renderer;
            };

            var state = {"columnIndexes":[0,26,4,3,5,7,27,28],"fixedColumnIndexes":[],"hiddenColumns":[25,1,18,24,14,8,9,10,11,12,13,21,6,2,15,16,17,19,20,23,22],"columnWidths":[150,330,100,100,100,107.2890625,86.30078125,114.203125,95.01953125,95.01953125,64.50390625,95.01953125,79.76171875,92.306640625,86.5908203125,38.38671875,118.5322265625,167.72021484375,341.04296875,248.8876953125,266.775390625,177.84765625,49.4189453125,25.3046875,73.591796875,269.416015625,467.5234375,102.35546875,86.30078125],"fixedColumnWidths":[79.4453125],"rowHeights":{},"fixedRowHeights":{},"sorted":[]}
            jsonModel.setState(state);

            jsonModel.setImage('up-arrow', imageCache['up-arrow']);
            jsonModel.setImage('down-arrow', imageCache['down-arrow']);

            setTimeout(function() {
                jsonGrid.resetTextWidthCache();
                jsonModel.changed();
            }, 100);
            setTimeout(function() {
                jsonGrid.resetTextWidthCache();
                jsonModel.changed();
            }, 400);
            setTimeout(function() {
                jsonGrid.resetTextWidthCache();
                jsonModel.changed();
            }, 500);
            setTimeout(function() {
                jsonGrid.resetTextWidthCache();
                jsonModel.changed();
            }, 1000);

        });
            
    },
    openBidOffer: () => {
                console.log('start buddy')
                require('./child-window.js').createChildWindow({
                    name: 'orders',
                    url: 'order.html',
                    autoShow: true,
                    width: 960,
                    maxWidth: 960,
                    minWidth: 960,
                    height: 594 / 3,
                    maxHeight: 594 / 3,
                    minHeight: 594 / 3,
                    frame: false
                });
            },
            openOrders: () => {

                var jsonGrid = document.querySelector('#stock-example');
                var jsonModel = jsonGrid.getBehavior();

                lastSelectedRow = lastSelectedRow || 0;
                var row = jsonModel.getRow(lastSelectedRow);
                console.log("OPEN ORDERS --  ", row);
                require('./child-window.js').createChildWindow({
                    name: row.NAME,
                    url: 'row-view.html?row=' + lastSelectedRow,
                    autoShow: true,
                    width: 350,
                    maxWidth: 350,
                    frame: false,
                    maximizable: false,
                    height: 594 / 3,
                    maxHeight: 594 / 3,
                    minHeight: 594 / 3
                })
            },
    render: function (){
        return <div className="grid-contain">
                    <fin-hypergrid id="stock-example">
                        <fin-hypergrid-behavior-json></fin-hypergrid-behavior-json>
                        <fin-hypergrid-excel></fin-hypergrid-excel>
                    </fin-hypergrid>
                </div>
    }
});

module.exports = HyperGrid;

/*
Holding onto this code to be rolled in on a later release.
 <div className="actions-bg"></div>
 <div className="actions">
 <i onClick={this.openOrders} className="fa fa-plus-square"></i>
 <i onClick={this.openBidOffer} className="fa fa-file-text"></i>
 </div>
 */

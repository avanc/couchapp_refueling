/*!
 * Copyright (C) 2013, Sven Klomp
 * 
 * Released under the MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */

$(document).ready(function(){
    $("#tabs" ).tabs();
    $("#accordion").accordion();
    $("#datepicker" ).datepicker({ dateFormat: "yy-mm-dd", autoSize: true });

    

    
    updateStatistics();
    resetForm();
    
    $("#refuel_form").submit(sendFormData);


    
});

function sendFormData() {
    formdata={};
    formdata["type"]="refuel";
    formdata["date"]=$("#datepicker").val();
    formdata["odometer"]=parseFloat($("#odometer").val());
    formdata["amount"]=parseFloat($("#amount").val());
    formdata["costs"]=parseFloat($("#price").val());
                    
    $.ajax({
        type: "POST",
        url: "../../",
        data: JSON.stringify(formdata),
        success: dataTransmitted,
        dataType: "json", 
        contentType:"application/json; charset=utf-8"
    });

    return false; //Prevent form action
}


function updateStatistics() {
    $.ajax({
        type: "GET",
        url: "_view/by_date",
        dataType: "json",
        success: plotStatistics
    });
    
}


function getTimestamp(date) {
    return (new Date(date)).getTime();
    
}

function plotStatistics(data){
    var docs=data["rows"];

    var plotData={ consumption: [], price: [], distance: []};
    
    var distance
    var consumption
    var currdoc
    var prevdoc=docs[0]["value"]
    
    for (var i=0; i<docs.length; i++) {
        currdoc=docs[i]["value"];
        
        plotData["price"].push([getTimestamp(currdoc["date"]), currdoc["costs"]/currdoc["amount"]]);
        
        if (i>0)
        {
            distance = docs[i]["value"]["odometer"]-docs[i-1]["value"]["odometer"];
            consumption= docs[i]["value"]["amount"]/distance*100;
            plotData["consumption"].push([getTimestamp(docs[i-1]["value"]["date"]), consumption]);
            plotData["consumption"].push([getTimestamp(docs[i]["value"]["date"]), consumption]);

            if (docs[i]["value"]["date"]!=prevdoc["date"])
            {

                distance = docs[i]["value"]["odometer"]-prevdoc["odometer"];
                days=(getTimestamp(docs[i]["value"]["date"])-getTimestamp(prevdoc["date"]))/1000/60/60/24;
                distanceperday=distance/days;
                consumption= docs[i]["value"]["amount"]/distance*100;
            

                plotData["distance"].push([getTimestamp(prevdoc["date"]), distanceperday]);
                plotData["distance"].push([getTimestamp(docs[i]["value"]["date"]), distanceperday]);
                prevdoc=docs[i]["value"];

            }
        }
    }

    
    $.plot("#statistics_consumption", [plotData["consumption"]], {
        series: {
            lines: { show: true },
            points: { show: true }
        },
        xaxis: {
            mode: "time",
            //zoomRange: [0.1, 10],
            //panRange: [-10, 10],
            //font :  {
            //      size:10,
            //      color: "#000000"
            //}
        },
        yaxis: {
            //zoomRange: [1, 1],
            //panRange: [300, 400]
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
    });
    
    $.plot("#statistics_price", [plotData["price"]], {
        series: {
            lines: { show: true },
            points: { show: true }
        },
        xaxis: {
            mode: "time"
        },
        yaxis: {
            //zoomRange: [1, 1],
            //panRange: [300, 400]
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
    });

    $.plot("#statistics_distance", [plotData["distance"]], {
        series: {
            lines: { show: true },
            points: { show: true }
        },
        xaxis: {
            mode: "time"
        },
        yaxis: {
            //zoomRange: [1, 1],
            //panRange: [300, 400]
        },
        zoom: {
            interactive: true
        },
        pan: {
            interactive: true
        }
    });
}


var dataTransmitted = function (data, status) {
    if (status == "success")
    {
        if (data["ok"]) {
            resetForm();
            updateStatistics();
        }
        else {
            alert(data);
        }
            
    }
    else
    {
        alert(status);
    }  

    
}


function getHistory() {
    $.get(
        "diary.py",
        { "action" : "getHistory"},
        function(data, status) {
            if (status == "success")
            {
                var counter=0;
                while (data["entries"] && counter<10) {
                    addHistoryItem(data["entries"].shift(), true);
                    counter++;
                }
            }
            else
            {
                showError(status);
            }
        },
        "json"
    );
}


var addData = function (text, reverse) {
    var listitem;
    
    if (reverse)
    {
        $('#history').append(
            listitem = $('<li>').append(text)
        
        );
    }
    else
    {
        $('#history').prepend(
            listitem = $('<li>').append(text)
        
        );
    }
        
    listitem.hide();
    listitem.show("blind", 750);
}

var showError = function (text) {
    if ( typeof(text) == "undefined" ) {
        $("#error").hide("fold", 1000);
    }
    else {
        $("#error").html(text);
        $("#error").show("fold", 1000);
    }
}

function getIsoDate(date) {
    if ( typeof(date) == "undefined" ) {
        date= new Date();
    }

    var year = date.getFullYear();
    
    var month = date.getMonth()+1;
    if(month <= 9)
        month = '0'+month;

    var day= date.getDate();
    if(day <= 9)
        day = '0'+day;

    var isoDate = year +'-'+ month +'-'+ day;
    return isoDate;
}

function resetForm() {
    $("#datepicker").val(getIsoDate());
    $("#odometer").val("");
    $("#amount").val("");
    $("#price").val("");
    showError();
}
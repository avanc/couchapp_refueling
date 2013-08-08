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
    
    for (var i=0; i<docs.length; i++) {
        currdoc=docs[i]["value"];
        
        plotData["price"].push([getTimestamp(currdoc["date"]), currdoc["costs"]/currdoc["amount"]]);
        
        if (i>0)
        {
            prevdoc=docs[i-1]["value"];

            distance = currdoc["odometer"]-prevdoc["odometer"];
            days=(getTimestamp(currdoc["date"])-getTimestamp(prevdoc["date"]))/1000/60/60/24;
            distanceperday=distance/days;
            consumption= currdoc["amount"]/distance*100;
            
            plotData["consumption"].push([getTimestamp(prevdoc["date"]), consumption]);
            plotData["consumption"].push([getTimestamp(currdoc["date"]), consumption]);

            plotData["distance"].push([getTimestamp(prevdoc["date"]), distanceperday]);
            plotData["distance"].push([getTimestamp(currdoc["date"]), distanceperday]);
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
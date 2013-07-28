$(document).ready(function(){
    $("#tabs" ).tabs();
    $("#datepicker" ).datepicker({ dateFormat: "yy-mm-dd", autoSize: true });
    
    resetForm();
    
    $("#refuel_form").submit(function() {
        
        formdata={};
        formdata["type"]="refuel";
        formdata["date"]=$("#datepicker").val();
        formdata["odometer"]=$("#odometer").val();
        formdata["amount"]=$("#amount").val();
        formdata["price"]=$("#price").val();
        
        
                      
        $.ajax({
            type: "POST",
            url: "../../",
            data: JSON.stringify(formdata),
            success: dataTransmitted,
            dataType: "json", 
            contentType:"application/json; charset=utf-8"
        });

        return false; //Prevent form action
    });


    
});


var dataTransmitted = function (data, status) {
    if (status == "success")
    {
        if (data["ok"]) {
            resetForm();
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
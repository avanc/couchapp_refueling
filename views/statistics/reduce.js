function(keys, values, rereduce) {
	var value = {};
	value["earliest"]={ date: "9999-12-31", costs: 0.00, amount: 0.00 };
	value["latest"]={ date: "0000-01-01", costs: 0.00, amount: 0.00  };
	value["sum_costs"]=0;
	value["sum_amount"]=0;

	if (rereduce) {
		for (var i=0; i<values.length; i++) {
			value["sum_costs"]+=values[i]["sum_costs"];
			value["sum_amount"]+=values[i]["sum_amount"];
			if (values[i]["earliest"]["date"] < value["earliest"]["date"]) {
                                value["sum_costs"]+=value["earliest"]["costs"];
                                value["sum_amount"]+=value["earliest"]["amount"];
				value["earliest"]=values[i]["earliest"];
			}
			else {
                            value["sum_costs"]+=values[i]["earliest"]["costs"];
                            value["sum_amount"]+=values[i]["earliest"]["amount"];
                        }
			if (values[i]["latest"]["date"] > value["latest"]["date"]) {
				value["latest"]=values[i]["latest"];
			} 

		}
	}
	else {
		for (var i=0; i<values.length; i++) {
			
			if (values[i]["date"] < value["earliest"]["date"]) {
                                value["sum_costs"]+=value["earliest"]["costs"];
                                value["sum_amount"]+=value["earliest"]["amount"];
				value["earliest"]=values[i];
			}
			else {
                            value["sum_costs"]+=values[i]["costs"];
                            value["sum_amount"]+=values[i]["amount"];
                        }
			if (values[i]["date"] > value["latest"]["date"]) {
				value["latest"]=values[i];
			}
		}
	}

	value["average_price"]=value["sum_costs"]/value["sum_amount"];
        value["average_consumption"]=100*value["sum_amount"]/(value["latest"]["odometer"]-value["earliest"]["odometer"]);

	
	return value;

}

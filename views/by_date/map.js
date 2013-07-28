function(doc) {
	if (doc.type == "refuel") {
    emit(doc.date, doc);
  }
};

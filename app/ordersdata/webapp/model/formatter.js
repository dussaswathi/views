sap.ui.define([], function() {
    "use strict";
    return {
        // Formatter to format the date in dd-MM-yyyy format
        formatDate: function (date) {
			if (!date) {
				return "";
			}

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				// pattern: "dd/MM/yyyy"
				pattern: "dd-MM-yyyy"
			});

			return oDateFormat.format(date);
		},
		
		
		
		

    };
});

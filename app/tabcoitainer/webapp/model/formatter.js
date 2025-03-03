sap.ui.define([], function () {
    "use strict";

    return {
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            // Create a Date object from the input date string
            var oDate = new Date(sDate);
            // Ensure it's a valid date
            if (isNaN(oDate)) {
                return "";
            }
            // Format the date as DD-MM-YYYY
            var sDay = ("0" + oDate.getDate()).slice(-2); // Add leading zero if needed
            var sMonth = ("0" + (oDate.getMonth() + 1)).slice(-2); // Months are 0-indexed
            var sYear = oDate.getFullYear();
            return sDay + "-" + sMonth + "-" + sYear; // Format as DD-MM-YYYY
        }
    };
});

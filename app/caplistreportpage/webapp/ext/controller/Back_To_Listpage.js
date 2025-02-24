sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
           Onback: function(oEvent) {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } 
            else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this); // Fallback for extension controllers
                oRouter.navTo("OrdersList", {}, true); // Navigate to List Page if no history exists
            }
        }
    };
});


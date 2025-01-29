sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";
    var that;

    return Controller.extend("fclwithinitialtwoviews.controller.View2", {

        onInit: function () {
            that=this;
            // Get the EventBus and subscribe to the "setDetailPage" event
            var oBus = this.getOwnerComponent().getEventBus();
            oBus.subscribe("flexible", "setDetailPage", this.onDetailPageReceived, this);
        },
        onAfterRendering: function () {
        },
        onDetailPageReceived: function (sChannel, sEvent, oData) {
            var sOrderID = oData.OrderID;
            this.loadItemDetails(sOrderID);
        },

        loadItemDetails: function (sOrderID) {
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Ordersdata", {
                urlParameters: {
                    "$filter": "ID eq '" + sOrderID + "'"
                },
                success: function (oData) {
                    if (oData && oData.results.length>0) {
                        var odetailModel = new JSONModel(oData.results);
                        that.getView().setModel(odetailModel, "detailModel");
                    } else {
                        var odetailModel = new JSONModel(oData.results);
                        that.getView().setModel(odetailModel, "detailModel");
                        MessageToast.show("No data found for the specified OrderID.");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
            
        },
        

    });
});

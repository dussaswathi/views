sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";
    var that;

    return Controller.extend("ordersdata.controller.View2", {
        onInit: function () {
            that = this;
            this.bus = this.getOwnerComponent().getEventBus();
            this.bus.subscribe("flexible", "setDetailPage", this._onDetailPageReceived, this);

            // Create an empty model for the form data
            this.oModel = new JSONModel({
                ItemID: "",
                CustomerName: "",
                ID: "",
                Price: "",
                ProductName: "",
                Quantity: "",
                TotalAmount: ""
            });
            this.getView().setModel(this.oModel, "formData");
        },

        _onDetailPageReceived: function (sChannel, sEvent, oData) {
            // Update the model with the data received
            this.oModel.setData({
                ItemID: oData.ItemID,
                CustomerName: oData.CustomerName,
                ID: oData.ID,
                Price: oData.Price,
                ProductName: oData.ProductName,
                Quantity: oData.Quantity,
                TotalAmount: oData.TotalAmount
            });
        },

       
        handleClose: function () {
            this.bus.publish("flexible", "setListPage");
        }
    });
});

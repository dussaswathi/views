sap.ui.define([
    "sap/m/MessageToast",
      "sap/m/MessageBox"
], function(MessageToast,MessageBox) {
    'use strict';
var that;
    return {
        Onmultidelete: function () {
            that = this;
            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select atleast one orderitems to delete.");
                return;
            }
            var sMessage = "Are you sure you want to delete the selected orders?";
            MessageBox.confirm(sMessage, {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oModel = that.getModel("v2Model");

                        // Create an array of promises for each deletion
                        var aDeletePromises = aSelectedItems.map(function (oSelectedItem) {
                            var oContext = oSelectedItem.getBindingContext();
                            var ItemID = oContext.getProperty("ItemID");

                            // Return a promise for the delete operation
                            return new Promise(function (resolve, reject) {
                                oModel.remove("/OrderItems('" + ItemID + "')", {
                                    success: function () {
                                        resolve(ItemID); 
                                    },
                                    error: function (oError) {
                                        reject(new Error("Error deleting orderitems " + ItemID)); 
                                    }
                                });
                            });
                        });

                        Promise.all(aDeletePromises)
                            .then(function (aResults) {
                                MessageToast.show(aResults.length + " selected orderitems deleted successfully!");
                                 that.refresh();
                            })
                            .catch(function (oError) {
                                MessageToast.show(oError.message);
                            });
                    }
                }.bind(this)
            });
        }
    };
});

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";
    var that;

    return Controller.extend("fclwithinitialtwoviews.controller.View1", {
        onInit: function () {
            that = this;

            that.ReadAll();
        },
        onCreateopen:function(){
            if(!that.sample){
                that.sample = sap.ui.xmlfragment("fclwithinitialtwoviews.fragments.Createorder_Orderitems",that);
                that.getView().addDependent(that.sampleall);
            }
           that.sample.open();
        },
        OnClose:function(){
         that.sample.close();
        },
        // onsingleDelete: function (oEvent) {
        //     var oTable = this.byId("orderstable");
        //     var aSelectedItems = oTable.getSelectedItems();
            
           
        //     if (aSelectedItems.length === 0) {
        //         MessageToast.show("Please select an order to delete.");
        //         return;
        //     }
L
        //     // Get the context of the selected row
        //     var oContext = aSelectedItems[0].getBindingContext("ordersModel");
        //     var ID = oContext.getProperty("ID"); // Assuming ID is the unique identifier for the item

        //     var oModel = this.getOwnerComponent().getModel();

        //     // Confirm delete action
        //     MessageBox.confirm("Are you sure you want to delete this order?", {
        //         onClose: function (oAction) {
        //             if (oAction === MessageBox.Action.YES) {
        //                 // Perform deletion
        //                 oModel.remove("/Orders('" + ID + "')", {
        //                     success: function () {
        //                         MessageToast.show("Order deleted successfully!");
        //                         that.ReadAll(); // Refresh the model after deletion
        //                     },
        //                     error: function () {
        //                         MessageToast.show("Error deleting order.");
        //                     }
        //                 });
        //             }
        //         }
        //     });
        // },
        onsingleDelete: function (oEvent) {
            var oTable = this.byId("orderstable");
            var aSelectedItems = oTable.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select an order to delete.");
                return;
            }
            var oContext = aSelectedItems[0].getBindingContext("ordersModel");
            var sOrderID = oContext.getProperty("ID"); 
        
            var oModel = this.getOwnerComponent().getModel();
        
            // Confirm delete action
            MessageBox.confirm("Are you sure you want to delete this order?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        // Perform deletion based on the "ID" (order ID)
                        oModel.remove("/Orders('" + sOrderID + "')", {
                            success: function (res) {
                                MessageToast.show("Order deleted successfully!");
                                that.ReadAll(); 
                            },
                            error: function (err) {
                                MessageToast.show("Error deleting order.");
                            }
                        });
                    }
                }
            });
        },
        
        

        OnOrderCreate: function () {
            var sID = sap.ui.getCore().byId("idID").getValue();
            var sCustomerName = sap.ui.getCore().byId("idCustomerNames").getValue();
            var sItemID = sap.ui.getCore().byId("idItemIDinputs").getValue();
            var sProductName = sap.ui.getCore().byId("idProductNameinputs").getValue();
            var sQuantity = sap.ui.getCore().byId("idQuantityinputs").getValue();
            var sPrice = sap.ui.getCore().byId("idPriceinputs").getValue();
            var sOrderID = sap.ui.getCore().byId("idOrderIDinput").getValue();
            var currentDate = new Date();

            var newEntry1 = {
                ID: sID,
                OrderDate: currentDate,
                CustomerName: sCustomerName
            };

            var newEntry2 = {
                ItemID: sItemID,
                ProductName: sProductName,
                Quantity: sQuantity,
                Price: sPrice,
                OrderID_ID: sOrderID
            };

            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Orders('" + sID + "')", {      // Check if Order with the same ID exists
                success: function (res) {
                    // Order exists, no need to create a new one, just create the OrderItem
                    oModel.create("/OrderItems", newEntry2, {
                        success: function (res) {
                            MessageToast.show("Order Item saved successfully!");
                            that.OnClose(); 
                            that.ReadAll();
                        },
                        // error: function (err) {
                        //     MessageToast.show("Error saving order item.");
                        // }
                        error: function (err) {
                            const oErrorResponse = JSON.parse(err.responseText);
                            const sErrorMessage = oErrorResponse.error.message.value;
                            MessageToast.show(sErrorMessage);
                        }
                    });
                },
                error: function (err) {
                    // Order doesn't exist, so create both the Order and OrderItem
                    oModel.create("/Orders", newEntry1, {
                        success: function (res) {
                            MessageToast.show("Order saved successfully!");
                            // Now create the OrderItem
                            oModel.create("/OrderItems", newEntry2, {
                                success: function (res) {
                                    MessageToast.show("Order Item saved successfully!");
                                    that.OnClose(); 
                                    that.ReadAll();
                                },
                                error: function (err) {
                                    MessageToast.show("Error saving order item.");
                                }
                            });
                        },
                        // error: function (err) {
                        //     MessageToast.show("Error saving order.");
                        // }
                        error: function (err) {
                            const oErrorResponse = JSON.parse(err.responseText);
                            const sErrorMessage = oErrorResponse.error.message.value;
                            MessageToast.show(sErrorMessage);
                        }
                    });
                }
            });
        },
        onIDLiveChange: function (oEvent) {
            var sID = oEvent.getSource().getValue(); // Get the entered ID
            var oModel = this.getOwnerComponent().getModel();
            if (sID) {
                // Step 1: Check if Order with the entered ID exists
                oModel.read("/Orders('" + sID + "')", {
                    success: function (res) {
                        var sCustomerName = res.CustomerName;
                        var sOrderID = res.ID;

                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames");
                        var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput");

                        oCustomerNameInput.setValue(sCustomerName);
                        oOrderIDInput.setValue(sOrderID);

                        oCustomerNameInput.setEditable(false);
                        oOrderIDInput.setEditable(false);
                    },
                    error: function (err) {
                        // If order doesn't exist, clear the CustomerName and OrderID fields and make them editable
                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames");
                        var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput");

                        oCustomerNameInput.setValue("");
                        oOrderIDInput.setValue("");

                        oOrderIDInput.setValue(sID);

                        oCustomerNameInput.setEditable(true);
                        oOrderIDInput.setEditable(false);
                    }
                });
            } else {
                // If the ID is empty, reset the CustomerName and OrderID fields and make them editable
                var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames");
                var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput");

                oCustomerNameInput.setValue("");
                oOrderIDInput.setValue("");

                oCustomerNameInput.setEditable(true);
                oOrderIDInput.setEditable(true);
            }
        },
        onAfterRendering: function () {

            that.ReadAll();
        },

        ReadAll: function () {
            var oModel = this.getOwnerComponent().getModel(); 
            oModel.read("/Orders", {
                success: function (oData) {
                    // Sort the results by ID in ascending order
                    oData.results.sort(function (a, b) {
                        return a.ID - b.ID;
                    });
                    var oOrdersModel = new JSONModel(oData.results);
                    that.getView().setModel(oOrdersModel, "ordersModel");

                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
        },
        Onpressitemdetails: function (oEvent) {
            var sID = oEvent.getSource().getBindingContext("ordersModel").getProperty("ID");
            var oBus = this.getOwnerComponent().getEventBus();
            oBus.publish("flexible", "setDetailPage", { OrderID: sID });

        }
    });
});

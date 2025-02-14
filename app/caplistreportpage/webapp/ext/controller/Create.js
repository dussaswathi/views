sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
     "sap/ui/model/json/JSONModel"
], function(MessageToast,Fragment,JSONModel) {
    'use strict';
var that;
    return {
        Oncreate: function(oEvent) {
            that=this;
            if (!that.sample) {
                that.sample = sap.ui.xmlfragment("caplistreportpage.fragments.Createorder_Orderitems", that);
                // that.getView().addDependent(that.sample);
            }
            that.sample.open();  
        },

        onSubmit: function () {
            var sID = sap.ui.getCore().byId("idID").getValue();
            var sCustomerName = sap.ui.getCore().byId("idCustomerNames").getValue();
            var sItemID = sap.ui.getCore().byId("idItemIDinputs").getValue();
            var sProductName = sap.ui.getCore().byId("idProductNameinputs").getValue();
            var sQuantity = sap.ui.getCore().byId("idQuantityinputs").getValue();
            var sPrice = sap.ui.getCore().byId("idPriceinputs").getValue();
            var sOrderID = sap.ui.getCore().byId("idOrderIDinput").getValue();
            var currentDate = new Date();

            // Validation for empty or invalid fields
            if (!sID || isNaN(sID)) {
                MessageToast.show("ID field cannot be empty or invalid.");
                return;
            }
            if (!sItemID || isNaN(sItemID)) {
                MessageToast.show("Item ID must be a valid number.");
                return;
            }
            if (!sQuantity || isNaN(sQuantity)) {
                MessageToast.show("Quantity must be a valid number.");
                return;
            }
            if (!sPrice || isNaN(sPrice)) {
                MessageToast.show("Price must be a valid number.");
                return;
            }

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
            var oModel = that.getModel("v2Model");
            oModel.read("/Orders('" + sID + "')", {
                success: function (res) {
                    // Order exists, create the OrderItem and add it directly to the model
                    oModel.create("/OrderItems", newEntry2, {
                        success: function (res) {
                            MessageToast.show("Order Item saved successfully!");
                            that.refresh(); 
                            that.sample.close();                          
                        },
                        error: function (err) {
                            const oErrorResponse = JSON.parse(err.responseText);
                            const sErrorMessage = oErrorResponse.error.message.value;
                            if (sErrorMessage.includes("Entity already exists")) {
                                sap.m.MessageToast.show("Item ID already exists in the Order Items!");
                            } else {
                                sap.m.MessageToast.show(sErrorMessage);
                            }
                        }
                    });
                },
                error: function (err) {
                    // Order doesn't exist, create both the Order and OrderItem
                    oModel.create("/Orders", newEntry1, {
                        success: function (res) {
                            // MessageToast.show("Order saved successfully!");
                            oModel.create("/OrderItems", newEntry2, {
                                success: function (res) {
                                    MessageToast.show("Order Item saved successfully!");
                                       
                                    that.sample.close();  
                                    that.refresh();                                 
                                },
                                error: function (err) {
                                    const oErrorResponse = JSON.parse(err.responseText);
                                    const sErrorMessage = oErrorResponse.error.message.value;
                                    if (sErrorMessage.includes("Entity already exists")) {
                                        sap.m.MessageToast.show("Item ID already exists in the Order Items!");
                                    } else {
                                        sap.m.MessageToast.show(sErrorMessage);
                                    }
                                }
                            });
                        },
                        error: function (err) {
                            MessageToast.show("Error saving order.");
                        }
                    });
                }
            });
        },
       
        onIDLiveChange: function (oEvent) {
            var sID = oEvent.getSource().getValue();
            var oModel = that.getModel("v2Model");
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
        onClose: function() {
            that.sample.close();  
        }
         
    };
});



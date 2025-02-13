sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";
    var that;

    return Controller.extend("fclwithinitialtwoviews.controller.View1", {
        onInit: function () {         
            that = this;
            that.ReadAll();
        },
        onAfterRendering: function () {
            that.ReadAll();
        },
        ReadAll: function () {
            var oModel = that.getOwnerComponent().getModel();
            oModel.read("/Orders", {
                success: function (oData) {
                    var uniqueIDs = new Set();
                    var filteredData = oData.results.filter(function (item) {
                        if (uniqueIDs.has(item.ID)) {
                            return false;
                        } else {
                            uniqueIDs.add(item.ID);
                            return true;
                        }
                    });
                    filteredData.sort(function (a, b) {
                        return a.ID - b.ID;
                    });
                  
                    var oOrdersModel = new JSONModel({orders:[]});
                    that.byId("orderstable").setModel(oOrdersModel);
                    var oOrdersModel = new JSONModel({orders:filteredData});
                    // that.getView().setModel(oOrdersModel, "ordersModel");
                    var oTable = that.byId("orderstable");
                            oTable.destroyItems();
                            oTable.setModel(oOrdersModel);
               
                    // var oTable = that.byId("orderstable");
                    //         oTable.destroyItems();
                    //         var log = filteredData;
                    //         var model = oTable.getModel();
                    //         var newData = {
                    //             items :log
                    //         }
                    //         model.setProperty("/orders", newData.items);
                    //         oTable.bindItems({
                    //             path : "/orders",
                    //             template : new sap.m.ColumnListItem({
                    //                 cells:[
                    //                     new sap.m.ObjectIdentifier({ text:"{ID}"}),
                    //                     new sap.m.ObjectIdentifier({ text:"{CustomerName}"}),
                    //                     new sap.m.Button({icon:"sap-icon://edit",press:function(oEvent){that.onsingleUpdate(oEvent)} })
                    //                 ]
                    //             })
                    //         })
                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
        },
       
        
        onCreateopen: function () {
            if (!that.sample) {
                that.sample = sap.ui.xmlfragment("fclwithinitialtwoviews.fragments.Createorder_Orderitems", that);
                that.getView().addDependent(that.sampleall);
            }
            that.sample.open();
        },
        OnClose: function () {

            sap.ui.getCore().byId("idID").setValue("");
            sap.ui.getCore().byId("idCustomerNames").setValue("");
            sap.ui.getCore().byId("idItemIDinputs").setValue("");
            sap.ui.getCore().byId("idProductNameinputs").setValue("");
            sap.ui.getCore().byId("idQuantityinputs").setValue("");
            sap.ui.getCore().byId("idPriceinputs").setValue("");
            sap.ui.getCore().byId("idOrderIDinput").setValue("");
            that.sample.close();
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

            if (!sID || isNaN(sID)) {
                sap.m.MessageToast.show("ID field cannot be empty or invalid.");
                return;
            }
            if (!sItemID || isNaN(sItemID)) {
                sap.m.MessageToast.show("Item ID must be a valid number.");
                return;
            }
            if (!sQuantity || isNaN(sQuantity)) {
                sap.m.MessageToast.show("Quantity must be a valid number.");
                return;
            }
            if (!sPrice || isNaN(sPrice)) {
                sap.m.MessageToast.show("Price must be a valid number.");
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

            var oModel = this.getOwnerComponent().getModel();
            var that = this; 

            oModel.read("/Orders('" + sID + "')", {
                success: function (res) {
                    // Order exists, create the OrderItem and add it directly to the model
                    oModel.create("/OrderItems", newEntry2, {
                        success: function (res) {
                            MessageToast.show("Order Item saved successfully!");
                            that.OnClose();
                            that.ReadAll();
                           var oBus = that.getOwnerComponent().getEventBus();
                            oBus.publish("flexible", "setDetailPage", { OrderID: sID });
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
                            MessageToast.show("Order saved successfully!");
                            oModel.create("/OrderItems", newEntry2, {
                                success: function (res) {
                                    MessageToast.show("Order Item saved successfully!");
                                    that.OnClose();
                                     that.ReadAll();
                                    var oBus = that.getOwnerComponent().getEventBus();
                                    oBus.publish("flexible", "setDetailPage", { OrderID: sID });
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

       
        
    
//  onsingleUpdate: function (oEvent) {
//             var oSelectedItem = oEvent.getSource().getParent();
//             // var oContext = oSelectedItem.getBindingContext("oOrdersModel");
//             var oContext = oSelectedItem.getBindingContext();
//             if (!oContext) {
//                 MessageToast.show("Invalid selection.");
//                 return;
//             }
//             var oOrderData = oContext.getObject();
//             var orderID = oOrderData.ID;
//             var CustomerName = oOrderData.CustomerName;

//             // Ensure the fragment exists
//             if (!that.oMultiUpdateFragment) {
//                 that.oMultiUpdateFragment = sap.ui.xmlfragment("fclwithinitialtwoviews.fragments.Update", that);
//                 that.getView().addDependent(that.oMultiUpdateFragment);
//             }

//             var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1Update1");
//             var oOrderIDInput = sap.ui.getCore().byId("idOrderID4Update1");

//             oCustomerNameInput.setValue(CustomerName);
//             oOrderIDInput.setValue(orderID);

//             var oModel = that.getOwnerComponent().getModel();
//             oModel.read("/Ordersdata", {
//                 urlParameters: {
//                     // "$filter": "ID eq '" + orderID + "'"
//                     filters: [  new Filter( "ID", FilterOperator.EQ,  orderID  ) ],
//                 },
               
 
//                 success: function (oData) {
//                     if (oData && oData.results.length > 0) {
//                         var oUpdateModel = new JSONModel(oData.results);
//                         that.oMultiUpdateFragment.setModel(oUpdateModel);
//                         that.oMultiUpdateFragment.open();
//                     } else {
//                         var oUpdateModel = new JSONModel(oData.results);
//                         that.getView().setModel(oUpdateModel, "updateModel");
//                         MessageToast.show("No data found for the specified OrderID.");

//                     }
//                 },
//                 error: function (oError) {
//                     // console.error("Error fetching related items:", oError);
//                     MessageToast.show("Failed to load related order items.");
//                 }
//             });
//         },
//         onUpdateSubmit: function (oEvent) {
//             var oModel = that.getOwnerComponent().getModel();
//             var sID = sap.ui.getCore().byId("idOrderID4Update1").getValue();
//             var sCustomerName = sap.ui.getCore().byId("idCustomerName1Update1").getValue();

//             var UpdatenewEntry1 = {
//                 ID: sID,
//                 CustomerName: sCustomerName,
//             };
//             // Perform the update for the Order
//             oModel.update("/Orders('" + sID + "')", UpdatenewEntry1, {
//                 success: function () {
//                     var aOrderItems = that.oMultiUpdateFragment.getModel().getData();
//                     aOrderItems.forEach(function (oItem) {
//                         var sItemID = oItem.ItemID;
//                         var UpdatenewEntry2 = {
//                             ItemID: sItemID,
//                             ProductName: oItem.ProductName,
//                             Quantity: oItem.Quantity,
//                             Price: oItem.Price
//                         };
//                         oModel.update("/OrderItems('" + sItemID + "')", UpdatenewEntry2, {
//                             success: function (res) {
//                                 MessageToast.show("Order Item  updated successfully!");
//                                 that.oMultiUpdateFragment.close();
//                                 that.ReadAll();
//                                 // Refresh(); 
//                                 var oBus = that.getOwnerComponent().getEventBus();
//                                 oBus.publish("flexible", "setDetailPage", { OrderID: sID });

//                             },
//                             error: function (err) {
//                                 MessageToast.show("Error updating Order Item (" + sItemID + "): " + err.message);
//                             }
//                         });
//                     });
                   
//                     // that.ReadAll();
//                 },
//                 error: function (err) {
//                     MessageToast.show("Error updating Order: " + err.message);
//                 }
//             });
//         },


onsingleUpdate: function (oEvent) {
    var oSelectedItem = oEvent.getSource().getParent();
    var oContext = oSelectedItem.getBindingContext();

    if (!oContext) {
        MessageToast.show("Invalid selection.");
        return;
    }

    var oOrderData = oContext.getObject();
    var orderID = oOrderData.ID;
    var CustomerName = oOrderData.CustomerName;

    if (!that.oMultiUpdateFragment) {
        that.oMultiUpdateFragment = sap.ui.xmlfragment("fclwithinitialtwoviews.fragments.Update", that);
        that.getView().addDependent(that.oMultiUpdateFragment);
    }

    var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1Update1");
    var oOrderIDInput = sap.ui.getCore().byId("idOrderID4Update1");

    oCustomerNameInput.setValue(CustomerName);
    oOrderIDInput.setValue(orderID);

    
    that.oMultiUpdateFragment.open();
},

onUpdateSubmit: function (oEvent) {
    var oModel = this.getOwnerComponent().getModel(); 
    var sID = sap.ui.getCore().byId("idOrderID4Update1").getValue(); 
    var sCustomerName = sap.ui.getCore().byId("idCustomerName1Update1").getValue(); 

    
    var UpdatenewEntry1 = {
        ID: sID,
        CustomerName: sCustomerName,
    };

    oModel.update("/Orders('" + sID + "')", UpdatenewEntry1, {
        success: function (data) {
            MessageToast.show("Order updated successfully.");
            that.oMultiUpdateFragment.close();
            that.onAfterRendering();           
        },
        error: function (err) {
            MessageToast.show("Error updating Order: " + err.message);
        }
    });
},


        onMultiUpdateClose: function () {
            this.oMultiUpdateFragment.close();
        },

        Onorderscloseclose: function () {
            sap.ui.getCore().byId("idIDUpdate").setValue("");
            sap.ui.getCore().byId("idCustomerNameUpdate").setValue("");

            that.sampleupdatefragment.close();
        },

     
        onsingleDelete: function () {
            var oTable = this.getView().byId("orderstable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select orders to delete.");
                return;
            }
            var sMessage = "Are you sure you want to delete the selected orders?";
            MessageBox.confirm(sMessage, {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oModel = this.getOwnerComponent().getModel();

                        // Create an array of promises for each deletion
                        var aDeletePromises = aSelectedItems.map(function (oSelectedItem) {
                            // var oContext = oSelectedItem.getBindingContext("ordersModel");
                            var oContext = oSelectedItem.getBindingContext();
                            var ID = oContext.getProperty("ID");

                            // Return a promise for the delete operation
                            return new Promise(function (resolve, reject) {
                                oModel.remove("/Orders('" + ID + "')", {
                                    success: function () {
                                        resolve(ID);
                                    },
                                    error: function (oError) {
                                        reject(new Error("Error deleting order " + ID));
                                    }
                                });
                            });
                        });
                        // Wait for all delete promises to resolve or reject
                        Promise.all(aDeletePromises)
                            .then(function (aResults) {
                                MessageToast.show(" selected orders deleted successfully!");
                                this.ReadAll();
                            }.bind(this))
                            .catch(function (oError) {
                                MessageToast.show(oError.message);
                            });
                    }
                }.bind(this)
            });
        },


        Onpressitemdetails: function (oEvent) {
            // var sID = oEvent.getSource().getBindingContext("ordersModel").getProperty("ID");
            var sID = oEvent.getSource().getBindingContext().getProperty("ID");
            var oBus = this.getOwnerComponent().getEventBus();
            oBus.publish("flexible", "setDetailPage", { OrderID: sID });

        }
    });
});

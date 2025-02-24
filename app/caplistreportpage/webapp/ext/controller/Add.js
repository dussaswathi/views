// sap.ui.define([
//     "sap/m/MessageToast"
// ], function(MessageToast) {
//     'use strict';
// var that;
//     return {
//         OnAddrow: function(oEvent) {
//             that=this;
//             that=this;
//             if (!that.sampleorderiitems) {
//                 that.sampleorderiitems = sap.ui.xmlfragment("caplistreportpage.fragments.Orderitems", that);
//                 // that.getView().addDependent(that.sample);
//             }
//             that.sampleorderiitems.open();  
//             that.OrderID=oEvent.getObject().ID;
            
//         },
//         onAddNewRow: function () {
//             var oTable = sap.ui.getCore().byId("idOrderItemsTable");
//             var oItem = new sap.m.ColumnListItem({
//                 cells: [
//                     new sap.m.Input({
//                         value: "",
//                         type: sap.m.InputType.Number
//                     }),
//                     new sap.m.Input({
//                         value: ""
//                     }),
//                     new sap.m.Input({
//                         value: "",
//                         type: sap.m.InputType.Number
//                     }),
//                     new sap.m.Input({
//                         value: "",
//                         type: sap.m.InputType.Number
//                     }),
//                     // new sap.m.Input({
//                     //     value: that.OrderID,
//                     //     type: sap.m.InputType.Number,
//                     //     editable:false
                        
//                     // }),
//                     new sap.m.Button({
//                         icon: "sap-icon://delete",
//                         type: sap.m.ButtonType.Reject,
//                         press: function (oEvent) {
//                             var oTable = sap.ui.getCore().byId("idOrderItemsTable");
//                             oTable.removeItem(oEvent.getSource().getParent());
//                         }
//                     })
//                 ]
//             });
//             oTable.addItem(oItem);
//         },

//         onorderitemsClose: function () {
//             // var oTable = sap.ui.getCore().byId("idOrderItemsTable");
//             // oTable.destroyItems();
//             that.sampleorderiitems.close();
//         },
      
//         onOrderitemSubmit: function () {
//             var oTable = sap.ui.getCore().byId("idOrderItemsTable");
//             var aItems = oTable.getItems();        
//             var aOrderItemsData = [];
//             var bValid = true;
        
//             aItems.forEach(function (oItem) {
//                 var aCells = oItem.getCells();
//                 var sItemID = aCells[0].getValue();
//                 var sProductName = aCells[1].getValue();
//                 var sQuantity = aCells[2].getValue();
//                 var sPrice = aCells[3].getValue();
                     
//                 if (isNaN(sItemID) || sItemID <= 0) {
//                     MessageToast.show("Please enter a valid ItemID.");
//                     bValid = false;
//                     return; 
//                 }       
//                 if (isNaN(sQuantity) || sQuantity <= 0) {
//                     MessageToast.show("Please enter a valid quantity.");
//                     bValid = false;
//                     return; 
//                 }        
//                 if (isNaN(sPrice) || sPrice <= 0) {
//                     MessageToast.show("Please enter a valid price.");
//                     bValid = false;
//                     return; 
//                 }
//                 var oItemData = {
//                     OrderID_ID: that.OrderID,
//                     ItemID: sItemID,
//                     ProductName: sProductName,
//                     Quantity: sQuantity,
//                     Price: sPrice
//                 };       
//                 aOrderItemsData.push(oItemData);
//             });       
//             if (!bValid) {
//                 return;
//             }       
//             var oModel = this.getModel("v2Model");
//             aOrderItemsData.forEach(function(oItemData) {
//                 oModel.create("/OrderItems", oItemData, {  
//                     success: function (Res) {
//                         MessageToast.show("Order item submitted successfully!");
//                         that.sampleorderiitems.close(); 
//                         // // oTable.destroyItems();  
//                         // that.refresh();  

//                          // Clear input values in the table
//                 aItems.forEach(function (oItem) {
//                     var aCells = oItem.getCells();
//                     aCells.forEach(function (oCell) {
//                         if (oCell instanceof sap.m.Input) {
//                             oCell.setValue("");  // Clear the input fields
//                         }
//                     });
//                 });
//                     },
//                     error: function (err) {
//                         const oErrorResponse = JSON.parse(err.responseText);
//                         const sErrorMessage = oErrorResponse.error.message.value;
//                         if (sErrorMessage.includes("Entity already exists")) {
//                             sap.m.MessageToast.show("Item ID already exists in the Order Items!");
//                         } else {
//                             sap.m.MessageToast.show(sErrorMessage);
//                         }
//                     }
//                 });
//             });
//         }
        
        
//     };
// });
sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';
    var that;
    return {
        OnAddrow: function(oEvent) {
            that = this;
            if (!that.sampleorderiitems) {
                that.sampleorderiitems = sap.ui.xmlfragment("caplistreportpage.fragments.Orderitems", that);
            }
            that.sampleorderiitems.open();  
            that.OrderID = oEvent.getObject().ID;
        },

        onAddNewRow: function () {
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            var oItem = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Input({
                        value: "",
                        type: sap.m.InputType.Number
                    }),
                    new sap.m.Input({
                        value: ""
                    }),
                    new sap.m.Input({
                        value: "",
                        type: sap.m.InputType.Number
                    }),
                    new sap.m.Input({
                        value: "",
                        type: sap.m.InputType.Number
                    }),
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        type: sap.m.ButtonType.Reject,
                        press: function (oEvent) {
                            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
                            oTable.removeItem(oEvent.getSource().getParent());
                        }
                    })
                ]
            });

            // Add a custom data attribute to identify the dynamically added rows
            oItem.setBindingContext(null);
            oItem.data("isDynamicallyAdded", true); // Mark this row as dynamically added

            // Add the new item (row) to the table
            oTable.addItem(oItem);
        },

        
        onorderitemsClose: function () {
            // Close the fragment
            that.sampleorderiitems.close();
            sap.ui.getCore().byId("iditeminput").setValue("");
            sap.ui.getCore().byId("idproductnameinput").setValue("");
            sap.ui.getCore().byId("idquantityinput").setValue("");
            sap.ui.getCore().byId("idpriceinput").setValue("");
            // Get the table and loop through the items to clear the inputs
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");       
            var aTableItems = oTable.getItems();
            aTableItems.forEach(function(oItem) {
                // Check if the row is dynamically added
                if (oItem.data("isDynamicallyAdded")) {
                    oTable.removeItem(oItem);
                }
            });
        },
        
        onOrderitemSubmit: function () {
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            var aItems = oTable.getItems();        
            var aOrderItemsData = [];
            var bValid = true;

            // Loop through each row in the table and collect the data
            aItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                var sItemID = aCells[0].getValue();
                var sProductName = aCells[1].getValue();
                var sQuantity = aCells[2].getValue();
                var sPrice = aCells[3].getValue();

                // Validate inputs
                if (isNaN(sItemID) || sItemID <= 0) {
                    MessageToast.show("Please enter a valid ItemID.");
                    bValid = false;
                    return;
                }       
                if (isNaN(sQuantity) || sQuantity <= 0) {
                    MessageToast.show("Please enter a valid quantity.");
                    bValid = false;
                    return;
                }        
                if (isNaN(sPrice) || sPrice <= 0) {
                    MessageToast.show("Please enter a valid price.");
                    bValid = false;
                    return;
                }

                // Prepare item data for submission
                var oItemData = {
                    OrderID_ID: that.OrderID,
                    ItemID: sItemID,
                    ProductName: sProductName,
                    Quantity: sQuantity,
                    Price: sPrice
                };

                aOrderItemsData.push(oItemData);
            });

            // Exit if validation failed
            if (!bValid) {
                return;
            }

            // Create order items in the backend
            var oModel = this.getModel("v2Model");
            aOrderItemsData.forEach(function(oItemData) {
                oModel.create("/OrderItems", oItemData, {
                    success: function (Res) {
                        MessageToast.show("Order item submitted successfully!");

                        // Clear only dynamically added rows
                        var aTableItems = oTable.getItems();
                        aTableItems.forEach(function(oItem) {
                            // Check if the row is dynamically added
                            if (oItem.data("isDynamicallyAdded")) {
                                oTable.removeItem(oItem);
                            }
                        });
                        var aCells = aItems[0].getCells();
                        aCells.forEach(function(oCell) {
                            if (oCell instanceof sap.m.Input) {
                                oCell.setValue("");  
                            }
                        });
                        that.sampleorderiitems.close(); 
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
            });
        }
    };
});


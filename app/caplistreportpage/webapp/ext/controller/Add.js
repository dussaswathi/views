
sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';
    var that;
    return {
     /**
     * OnAddrow: Function to open the order items fragment and set the OrderID
     */
        OnAddrow: function(oEvent) {
            that = this;
            if (!that.sampleorderiitems) {
                that.sampleorderiitems = sap.ui.xmlfragment("caplistreportpage.fragments.Orderitems", that);
            }
            that.sampleorderiitems.open();  
            that.OrderID = oEvent.getObject().ID;
        },
        /**
         * onAddNewRow: Function to add a new row in the OrderItems table
         */
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
            // Mark this row as dynamically added
            oItem.setBindingContext(null);
            oItem.data("isDynamicallyAdded", true); 

            oTable.addItem(oItem);
        },
         /**
         * onOrderitemSubmit: Function to handle the form submission for order items
         * This validates the table data and creates new order items if validation is successful.
         */
        onOrderitemSubmit: function () {
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            var aItems = oTable.getItems();        
            var validationErrors = [];
            var existingItemIDs = [];
        
            // Loop through each row in the table and collect the data for validation
            aItems.forEach(function (oItem, index) {
                var aCells = oItem.getCells();
                var sItemID = aCells[0].getValue();
                var sProductName = aCells[1].getValue();
                var sQuantity = aCells[2].getValue();
                var sPrice = aCells[3].getValue();
                var errors = [];
                if (!sProductName || sProductName.trim() === "") {
                    errors.push("1. ProductName is required.");
                }
                if (isNaN(sItemID) || sItemID <= 0) {
                    errors.push("2. ItemID must be a valid number greater than 0.");
                }
                if (isNaN(sQuantity) || sQuantity <= 0) {
                    errors.push("3. Quantity must be a valid number greater than 0.");
                }
                if (isNaN(sPrice) || sPrice <= 0) {
                    errors.push("4. Price must be a valid number.");
                }        
                // If there are any errors, add them to the validationErrors array
                if (errors.length > 0) {
                    validationErrors.push("Row " + (index + 1) + ":\n" + errors.join("\n"));
                }
            });       
            if (validationErrors.length > 0) {
                sap.m.MessageBox.show(validationErrors.join("\n\n"), {
                    title: "Validation Errors",
                    icon: sap.m.MessageBox.Icon.ERROR
                        });
                        return; 
                    }
            var oModel = this.getModel("v2Model");       
            // var that = this;
            aItems.forEach(function (oItem, index) {
                var aCells = oItem.getCells();
                var sItemID = aCells[0].getValue();               
                // Check if ItemID already exists in OrderItems
                oModel.read("/OrderItems", {
                    filters: [new sap.ui.model.Filter("ItemID", sap.ui.model.FilterOperator.EQ, sItemID)],
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            existingItemIDs.push(sItemID);  
                        }        
                        // After checking for duplicates, proceed to create the entries if no duplicates were found
                        if (existingItemIDs.length === 0) {
                            var newEntry = {
                                ItemID: sItemID,
                                ProductName: aCells[1].getValue(),
                                Quantity: aCells[2].getValue(),
                                Price: aCells[3].getValue(),
                                OrderID_ID: that.OrderID  
                            };
        
                oModel.create("/OrderItems", newEntry, {
                    success: function () {
                        MessageToast.show("Order Item saved successfully!");
                        that.refresh();                                                                    
                        var aTableItems = oTable.getItems();
                        aTableItems.forEach(function(oItem) {
                            if (oItem.data("isDynamicallyAdded")) {
                                oTable.removeItem(oItem);
                            }
                        });       
                        // Clear the inbuilt row (the first row of the table)
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
                            MessageToast.show(sErrorMessage);
                        }
                            });
                        } else { // If there are any existing ItemIDs, show an error message
                            var errorMessage = "Item IDs already exist: " + existingItemIDs.join(", ");
                            MessageToast.show(errorMessage);
                        }
                    },
                    error: function (err) {
                        const oErrorResponse = JSON.parse(err.responseText);
                        const sErrorMessage = oErrorResponse.error.message.value;
                        MessageToast.show(sErrorMessage);
                    }
                });
            });
        },
        /**
         * onorderitemsClose: Function to close the OrderItems fragment and reset the form
         * This clears all input fields and dynamically added rows.
         */
        onorderitemsClose: function () {
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
        

        
      //fisrt
        // onOrderitemSubmit: function () {
        //     var oTable = sap.ui.getCore().byId("idOrderItemsTable");
        //     var aItems = oTable.getItems();        
        //     var aOrderItemsData = [];
        //     var validationErrors = []; // Initialize the validation errors array
           
        //     // Loop through each row in the table and collect the data
        //     aItems.forEach(function (oItem, index) {
        //         var aCells = oItem.getCells();
        //         var sItemID = aCells[0].getValue();
        //         var sProductName = aCells[1].getValue();
        //         var sQuantity = aCells[2].getValue();
        //         var sPrice = aCells[3].getValue();
                
        //         var errors = []; // Array to collect errors for the current row
        
        //         // Validation checks for each row
        //         if (!sProductName || sProductName.trim() === "") {
        //             errors.push("1. ProductName is required.");
        //         }
        //         if (isNaN(sItemID) || sItemID <= 0) {
        //             errors.push("2. ItemID must be a valid number greater than 0.");
        //         }
        //         if (isNaN(sQuantity) || sQuantity <= 0) {
        //             errors.push("3. Quantity must be a valid number greater than 0.");
        //         }
        //         if (isNaN(sPrice) || sPrice <= 0) {
        //             errors.push("4. Price must be a valid number.");
        //         }
        
        //         // If there are any errors, add them to the validationErrors array
        //         if (errors.length > 0) {
        //             validationErrors.push("Row " + (index + 1) + ":\n" + errors.join("\n"));
        //         } else {
        //             // If no errors, prepare the item data for submission
        //             var oItemData = {
        //                 OrderID_ID: that.OrderID,
        //                 ItemID: sItemID,
        //                 ProductName: sProductName,
        //                 Quantity: sQuantity,
        //                 Price: sPrice
        //             };
        //             aOrderItemsData.push(oItemData);
        //         }
        //     });
        
        //     // If there are validation errors, display them
        //     if (validationErrors.length > 0) {
        //         sap.m.MessageBox.show(validationErrors.join("\n\n"), {
        //             title: "Validation Errors",
        //             icon: sap.m.MessageBox.Icon.ERROR
        //         });
        //         return; // Exit the function if there are validation errors
        //     }
           
        //     // If validation passed, submit the order items
        //     var oModel = this.getModel("v2Model");
        //     aOrderItemsData.forEach(function(oItemData) {
        //         oModel.create("/OrderItems", oItemData, {
        //             success: function (Res) {
        //                 MessageToast.show("Order item submitted successfully!");
        
        //                 // Clear dynamically added rows
        //                 var aTableItems = oTable.getItems();
        //                 aTableItems.forEach(function(oItem) {
        //                     if (oItem.data("isDynamicallyAdded")) {
        //                         oTable.removeItem(oItem);
        //                     }
        //                 });
        
        //                 // Clear the inbuilt row (the first row of the table)
        //                 var aCells = aItems[0].getCells();
        //                 aCells.forEach(function(oCell) {
        //                     if (oCell instanceof sap.m.Input) {
        //                         oCell.setValue("");  
        //                     }
        //                 });
        //                 that.sampleorderiitems.close(); 
        //             },
        //             error: function (err) {
        //                 const oErrorResponse = JSON.parse(err.responseText);
        //                 const sErrorMessage = oErrorResponse.error.message.value;
        //                 if (sErrorMessage.includes("Entity already exists")) {
        //                     sap.m.MessageToast.show("Item ID already exists in the Order Items!");
        //                 } else {
        //                     sap.m.MessageToast.show(sErrorMessage);
        //                 }
        //             }
        //         });
        //     });
        // }
        
       
        
    };
});


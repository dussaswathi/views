sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (MessageToast,MessageBox, JSONModel) {
    'use strict';
    var that;
    return {           
        Onupdateorderitems: function(oEvent) {
            that=this;
            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
        
            if (!oTable) {
                MessageToast.show("Table not found.");
                return;
            }       
            var aSelectedItems = oTable.getSelectedItems();
            if (!that._oMultiUpdateFragment) {
                that._oMultiUpdateFragment = sap.ui.xmlfragment("caplistreportpage.fragments.Updateorderitems", that);
            }        
            var aItemsToUpdate = [];
            aSelectedItems.forEach(function(oSelectedItem) {
                var oItemData = oSelectedItem.getBindingContext();
                aItemsToUpdate.push(oItemData.getObject());
            });       
            // Set the model with the selected items to the fragment
            var oUpdateModel = new JSONModel(aItemsToUpdate);
            that._oMultiUpdateFragment.setModel(oUpdateModel, "updateModel");
        
            that._oMultiUpdateFragment.open();
        },
        // onMultiUpdateSubmit: function () {
        //     var oUpdateModel = that._oMultiUpdateFragment.getModel("updateModel");
        //     var aUpdatedItems = oUpdateModel.getData(); 
        //     var oModel = that.getModel("v2Model");
            
        //     var validationErrors = [];
        //     aUpdatedItems.forEach(function (oUpdatedItem, index) {
        //         var rowNumber = index + 1; // Get row number (starts from 1)
        //         var itemID = oUpdatedItem.ItemID; // Get the ItemID for the current row
        //         if (isNaN(oUpdatedItem.Quantity) || oUpdatedItem.Quantity <= 0) {
        //             validationErrors.push("Row " + rowNumber + " (ItemID: " + itemID + "): Quantity must be a valid number greater than 0.");
        //         }
        //         if (isNaN(oUpdatedItem.Price) || oUpdatedItem.Price <= 0) {
        //             validationErrors.push("Row " + rowNumber + " (ItemID: " + itemID + "): Price must be a valid number.");
        //         }
        //         if (!oUpdatedItem.ProductName || oUpdatedItem.ProductName.trim() === "") {
        //             validationErrors.push("Row " + rowNumber + " (ItemID: " + itemID + "): ProductName is required.");
        //         }
        //     });
        
        //     if (validationErrors.length > 0) {
        //         MessageBox.show(validationErrors.join("\n"), {
        //             title: "Validation Errors",
        //             icon: MessageBox.Icon.ERROR
        //         });
        //         return; 
        //     }
        //     // Proceed with the update after validation
        //     aUpdatedItems.forEach(function (oUpdatedItem) {
        //         var ItemID = oUpdatedItem.ItemID; 
        //         oModel.update("/OrderItems('" + ItemID + "')", oUpdatedItem, {
        //             success: function (Res) {
        //                 MessageToast.show("Item updated successfully!");
        //                 that._oMultiUpdateFragment.close();                      
        //                 var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
        //                 oTable.getBinding("items").refresh();
        //                 oTable.removeSelections(true);
        //             },
        //             error: function (Err) {
        //                 MessageToast.show("Error updating item " + oUpdatedItem.ItemID);
        //             }
        //         });
        //     });
        // },
      
        onMultiUpdateSubmit: function () {
            var oUpdateModel = that._oMultiUpdateFragment.getModel("updateModel");
            var aUpdatedItems = oUpdateModel.getData(); 
            var oModel = that.getModel("v2Model");
        
            var validationErrors = [];
            aUpdatedItems.forEach(function (oUpdatedItem, index) {
                var rowNumber = index + 1; // Get row number (starts from 1)
                var itemID = oUpdatedItem.ItemID; // Get the ItemID for the current row
                var errors = [];
                if (!oUpdatedItem.ProductName || oUpdatedItem.ProductName.trim() === "") {
                    errors.push("1. ProductName is required.");
                }
                // Check for validation errors and add them to the errors array
                if (isNaN(oUpdatedItem.Quantity) || oUpdatedItem.Quantity <= 0) {
                    errors.push("2. Quantity must be a valid number greater than 0.");
                }
                if (isNaN(oUpdatedItem.Price) || oUpdatedItem.Price <= 0) {
                    errors.push("3. Price must be a valid number.");
                }
               
        
                // If there are any errors for the row, format them as a numbered list
                if (errors.length > 0) {
                    validationErrors.push("Row " + rowNumber + " (ItemID: " + itemID + "):\n" + errors.join("\n"));
                }
            });
        
            if (validationErrors.length > 0) {
                MessageBox.show(validationErrors.join("\n\n"), {
                    title: "Validation Errors",
                    icon: MessageBox.Icon.ERROR
                });
                return; 
            }
        
            // Proceed with the update after validation
            aUpdatedItems.forEach(function (oUpdatedItem) {
                var ItemID = oUpdatedItem.ItemID; 
                oModel.update("/OrderItems('" + ItemID + "')", oUpdatedItem, {
                    success: function (Res) {
                        MessageToast.show("Item updated successfully!");
                        that._oMultiUpdateFragment.close();                      
                        var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
                        oTable.getBinding("items").refresh();
                        oTable.removeSelections(true);
                    },
                    error: function (Err) {
                        MessageToast.show("Error updating item " + oUpdatedItem.ItemID);
                    }
                });
            });
        },
        
        onMultiUpdateClose: function() {
            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
            oTable.getBinding("items").refresh(); 
            // Clear the selection after update
            oTable.removeSelections(true); 
            this._oMultiUpdateFragment.close();
        },
        
    };
});

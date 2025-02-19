sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (MessageToast, JSONModel) {
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
       
        onMultiUpdateSubmit: function () {
            var oUpdateModel = that._oMultiUpdateFragment.getModel("updateModel");
            var aUpdatedItems = oUpdateModel.getData(); 
            var oModel = that.getModel("v2Model");            
        
            aUpdatedItems.forEach(function (oUpdatedItem) {
                var ItemID = oUpdatedItem.ItemID; 
                oModel.update( "/OrderItems('" + ItemID + "')",oUpdatedItem,{
                        success: function (Res) {
                            MessageToast.show("Item updated successfully!");
                            that._oMultiUpdateFragment.close();
                            // that.refresh(); 
                            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersObjectPage--fe::table::Items::LineItem-innerTable");
                            oTable.getBinding("items").refresh(); 
                            // Clear the selection after update
                            oTable.removeSelections(true); 
                        },
                        error: function (Err) {
                            MessageToast.show("Error updating item " + oUpdatedItem.ItemID);
                        }
                    }
                );
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

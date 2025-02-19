
    sap.ui.define([
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel"
    ], function (MessageToast, Fragment, JSONModel) {
    'use strict';
var that;
    return {
        Onupdate: function(oEvent) {
            that = this;
            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersList--fe::table::Orders::LineItem-innerTable");
            var aSelectedItems = oTable.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select one record to update.");
                return;
            } else if (aSelectedItems.length > 1) {
                MessageToast.show("Please select only one record.");
                return;
            }
            var oSelectedItem = aSelectedItems[0];            
            // Get the context of the selected item
            var oContext = oSelectedItem.getBindingContext();           
            var oOrderData = oContext.getObject();
            var orderID = oOrderData.ID;
            var CustomerName = oOrderData.CustomerName; 
            var orderDate = oOrderData.OrderDate;      
            if (!that.oUpdateFragment) {
                that.oUpdateFragment = sap.ui.xmlfragment("caplistreportpage.fragments.Update", that);
                // that.getView().addDependent(that.oMultiUpdateFragment);
            }
            var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1Update1");
            var oOrderIDInput = sap.ui.getCore().byId("idOrderID4Update1");
            var oOrderDateInput = sap.ui.getCore().byId("idOrderDate1Update1"); 
        
            oCustomerNameInput.setValue(CustomerName);
            oOrderIDInput.setValue(orderID);
            oOrderDateInput.setValue(orderDate);
        
            that.oUpdateFragment.open();
        },
        onUpdateSubmit: function (oEvent) {
            // var oModel = this.getOwnerComponent().getModel(); 
            var oModel = that.getModel("v2Model");
            var sID = sap.ui.getCore().byId("idOrderID4Update1").getValue(); 
            var sCustomerName = sap.ui.getCore().byId("idCustomerName1Update1").getValue(); 
                   
            var UpdatenewEntry1 = {
                ID: sID,
                CustomerName: sCustomerName,
            };
        
            oModel.update("/Orders('" + sID + "')", UpdatenewEntry1, {
                success: function (data) {
                    MessageToast.show("Order updated successfully.");
                    that.oUpdateFragment.close();  
                    // that.refresh();      
                    var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersList--fe::table::Orders::LineItem-innerTable");
                    oTable.getBinding("items").refresh(); 
                    // Clear the selection after update
                    oTable.removeSelections(true);   
                },
                error: function (err) {
                    MessageToast.show("Error updating Order: " + err.message);
                }
            });
        },
        onUpdateClose:function(){
            var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersList--fe::table::Orders::LineItem-innerTable");
            oTable.getBinding("items").refresh(); 
            // Clear the selection after update
            oTable.removeSelections(true); 
            that.oUpdateFragment.close();
        }
    };
});
 
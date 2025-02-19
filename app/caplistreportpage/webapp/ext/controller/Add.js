sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';
var that;
    return {
        OnAddrow: function(oEvent) {
            that=this;
            that=this;
            if (!that.sampleorderiitems) {
                that.sampleorderiitems = sap.ui.xmlfragment("caplistreportpage.fragments.Orderitems", that);
                // that.getView().addDependent(that.sample);
            }
            that.sampleorderiitems.open();  
            that.OrderID=oEvent.getObject().ID;
            
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
                    new sap.m.Input({
                        value: that.OrderID,
                        type: sap.m.InputType.Number,
                        editable:false
                        
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
            oTable.addItem(oItem);
        },

        onorderitemsClose: function () {
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            oTable.destroyItems();
            that.sampleorderiitems.close();
        },
      
        onOrderitemSubmit: function () {
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            var aItems = oTable.getItems();        
            var aOrderItemsData = [];
            var bValid = true;
        
            aItems.forEach(function (oItem) {
                var aCells = oItem.getCells();
                var sItemID = aCells[0].getValue();
                var sProductName = aCells[1].getValue();
                var sQuantity = aCells[2].getValue();
                var sPrice = aCells[3].getValue();
                     
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
                var oItemData = {
                    OrderID_ID: that.OrderID,
                    ItemID: sItemID,
                    ProductName: sProductName,
                    Quantity: sQuantity,
                    Price: sPrice
                };       
                aOrderItemsData.push(oItemData);
            });       
            if (!bValid) {
                return;
            }       
            var oModel = this.getModel("v2Model");
            aOrderItemsData.forEach(function(oItemData) {
                oModel.create("/OrderItems", oItemData, {  
                    success: function (Res) {
                        MessageToast.show("Order item submitted successfully!");
                        that.sampleorderiitems.close(); 
                        oTable.destroyItems();  
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
            });
        }
        
        
    };
});

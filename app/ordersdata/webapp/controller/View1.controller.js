
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "../model/formatter"
], (Controller, JSONModel, MessageToast, MessageBox, Fragment, Sorter, formatter) => {
    "use strict";
    var that = this;
    return Controller.extend("ordersdata.controller.View1", {
        formatter: formatter,
        onInit() {
            this.bus = this.getOwnerComponent().getEventBus();
            
            // that.bus = this.getOwnerComponent().getEventBus();
        },
        onAfterRendering:function(){
            that = this;
            if (!that.sampleall) {
                that.sampleall = sap.ui.xmlfragment("ordersdata.fragments.CreateAll", that);
                that.getView().addDependent(that.sampleall);
            }
            if (!that.sampleMulticreate) {
                that.sampleMulticreate = sap.ui.xmlfragment("ordersdata.fragments.Multicreate", that);
                that.getView().addDependent(that.sampleMulticreate);
            }

            var oCurrentDate = new Date();
            var oInput = sap.ui.getCore().byId("idOrderDate1");
            // Set the date value of the input field
            oInput.setValue(oCurrentDate.toLocaleDateString('en-US'));

            that.ReadAll();

        },

    
        // OnpressDetailPgae: function(oEvent) {
        //     var sItemID=oEvent.getSource().getBindingContext("ordersModel").getProperty("ItemID")
            
        //         this.bus.publish("flexible", "setDetailPage", {
        //             ItemID: sItemID
        //         });
        
               
        //     },      

        OnpressDetailPgae: function(oEvent) {
            
            var orderdetailsobject=oEvent.getSource().getBindingContext("ordersModel").getObject();
                this.bus.publish("flexible", "setDetailPage", {
                    ItemID: orderdetailsobject.ItemID,
                    CustomerName:orderdetailsobject.CustomerName,
                    ID:orderdetailsobject.ID,
                    Price:orderdetailsobject.Price,
                   ProductName:orderdetailsobject.ProductName,
                  Quantity:orderdetailsobject.Quantity,
                  TotalAmount:orderdetailsobject.TotalAmount
                });
               
            },
        
        /**
        * ReadAll: Function to read the orders data from the backend model and bind it to the view.
        */
      
        ReadAll: function () {
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Ordersdata", {
                success: function (oData) {
        
                    var oOrdersModel = new JSONModel(oData.results);
                    that.getView().setModel(oOrdersModel, "ordersModel");
                    that.Onchangecolor()
                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
        },        
        
        OnmultipleCreate: function () {
            that.sampleMulticreate.open();
        },
        onMulticreateClose: function () {
            sap.ui.getCore().byId("idOrderID4").setValue("");
            sap.ui.getCore().byId("idCustomerName1").setValue("");
            var oTable = sap.ui.getCore().byId("idOrderItemsTable");
            oTable.destroyItems();
            that.sampleMulticreate.close();
        },
        /**
         * onAddRow: Function to add a new row to the order items table.
         * It creates a new rows with input fields 
         */
        onAddRow: function () {
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
            oTable.addItem(oItem);
        },
        /**
         * Onchangecolor: Function to change the style based on TotalAmount.
         */
        Onchangecolor: function () {
            var oTable = this.getView().byId("idviewtable");
            var aItems = oTable.getItems();

            aItems.forEach(function(oItem) {
                var totalAmount = oItem.getBindingContext("ordersModel").getProperty("TotalAmount");
                // Clear all styles first to avoid overlapping
                oItem.removeStyleClass("errorText");
                oItem.removeStyleClass("warningText");
                oItem.removeStyleClass("successText");
                oItem.removeStyleClass("informationText");
                oItem.removeStyleClass("defaultText");

                if (totalAmount >= 1 && totalAmount < 500) {
                    oItem.addStyleClass("errorText");
                } else if (totalAmount >= 500 && totalAmount < 1000) {
                    oItem.addStyleClass("warningText");
                } else if (totalAmount >= 1000 && totalAmount < 1500) {
                    oItem.addStyleClass("successText");
                } else if (totalAmount >= 1500 && totalAmount < 3000) {
                    oItem.addStyleClass("informationText");
                } else {
                    oItem.addStyleClass("defaultText");
                }
            });
        },
        /**
          * onMulticreateSubmit: Function to submit the order and order items data.
          * It validates the order and item fields, creates a new order if necessary, and submits order items.
          */
        onMulticreateSubmit: function () {
            var sID = sap.ui.getCore().byId("idOrderID4").getValue();
            var sCustomerName = sap.ui.getCore().byId("idCustomerName1").getValue();
            var oCurrentDate = new Date();
        
            if (!sID) {
                sap.m.MessageToast.show("ID field cannot be empty.");
                return;
            }
            if (!sID || !Number.isInteger(parseInt(sID))) {
                sap.m.MessageToast.show("ID must be a valid integer.");
                return;
            }
            if (!sCustomerName || sCustomerName.trim() === "") {
                sap.m.MessageToast.show("Customer Name cannot be empty.");
                return;
            }
            var newEntry1 = {
                ID: sID,
                OrderDate: oCurrentDate,
                CustomerName: sCustomerName
            };
            // Retrieve order items table and collect data
            var oOrderItemsTable = sap.ui.getCore().byId("idOrderItemsTable");
            var aOrderItems = [];
            var aEnteredItemIDs = []; 
        
            // Check if the order items table has any rows
            if (oOrderItemsTable.getItems().length === 0) {
                sap.m.MessageToast.show("Please add at least one Orderitem before submitting.");
                return;
            }
            oOrderItemsTable.getItems().forEach(function (oItem) {
                var aCells = oItem.getCells();
                var sItemID = aCells[0].getValue();
                var sProductName = aCells[1].getValue();
                var sQuantity = aCells[2].getValue();
                var sPrice = aCells[3].getValue();
        
                if (!sItemID || !Number.isInteger(parseInt(sItemID))) {
                    sap.m.MessageToast.show("ItemID must be a valid integer.");
                    return;
                }
                if (!sProductName) {
                    sap.m.MessageToast.show("ProductName field cannot be empty.");
                    return;
                }
                if (!sQuantity) {
                    sap.m.MessageToast.show("Quantity field cannot be empty.");
                    return;
                }
                if (!sQuantity || !Number.isInteger(parseInt(sQuantity))) {
                    sap.m.MessageToast.show("Quantity must be a valid integer.");
                    return;
                }
                if (!sPrice) {
                    sap.m.MessageToast.show("Price field cannot be empty.");
                    return;
                }
                if (!sPrice || !Number.isInteger(parseInt(sPrice))) {
                    sap.m.MessageToast.show("Price must be a valid integer.");
                    return;
                }
                aEnteredItemIDs.push(sItemID);
                aOrderItems.push({
                    ItemID: sItemID,
                    ProductName: sProductName,
                    Quantity: sQuantity,
                    Price: sPrice,
                    OrderID_ID: sID
                });
            });
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Orders('" + sID + "')", {
                success: function () {
                    // Order exists, now check if any entered ItemIDs already exist in the OrderItems
                    checkAndCreateOrderItems();
                },
                error: function () {
                    // Order does not exist, create order and then order items
                    oModel.create("/Orders", newEntry1, {
                        success: function () {
                            // After order is created, check if any entered ItemIDs already exist in the OrderItems
                            checkAndCreateOrderItems();
                            // that.onMulticreateClose();
                        },
                        error: function () {
                            sap.m.MessageToast.show("Error creating order.");
                        }
                    });
                }
            });
        
            function checkAndCreateOrderItems() {
                var aExistingItemIDs = [];
                oModel.read("/OrderItems", {
                    success: function (oData) {
                        // Collect all existing ItemIDs from the backend OrderItems
                        oData.results.forEach(function (oOrderItem) {
                            aExistingItemIDs.push(oOrderItem.ItemID);
                        });
                        // Check if any entered ItemID exists in the existing ones
                        var aDuplicateItems = aEnteredItemIDs.filter(function (sItemID) {
                            return aExistingItemIDs.includes(sItemID);
                           
                        });
                        if (aDuplicateItems.length > 0) {
                            sap.m.MessageToast.show("The following Item IDs already exist: " + aDuplicateItems.join(", "));
                            return;
                        }
                        // Proceed with creating new order items
                        aOrderItems.forEach(function (oOrderItem) {
                            oModel.create("/OrderItems", oOrderItem, {
                                success: function () {
                                    sap.m.MessageToast.show("Order item saved successfully!");
                                    that.onMulticreateClose();
                                    that.ReadAll();
                                },
                                error: function () {
                                    sap.m.MessageToast.show("Error saving order item.");
                                }
                            });
                        });
                        that.ReadAll();
                    },
                    error: function () {
                        sap.m.MessageToast.show("Error retrieving existing OrderItems.");
                    }
                });
            }
        },
        /**
         * onIDMultiLiveChange: This function is triggered when the value of the ID input field changes.
         * It reads the order data from the backend model based on the entered ID.
         * If the order exists, it sets the customer name and order ID fields as non-editable.
         * If the order does not exist, it clears the fields and makes them editable.
         */
        onIDMultiLiveChange: function (oEvent) {
            var sID = oEvent.getSource().getValue(); // Get the entered ID
            var oModel = this.getOwnerComponent().getModel();
            if (sID) {
                // Step 1: Check if Order with the entered ID exists
                oModel.read("/Orders('" + sID + "')", {
                    success: function (res) {
                        var sCustomerName = res.CustomerName;
                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1");
                        oCustomerNameInput.setValue(sCustomerName);
                        oCustomerNameInput.setEditable(false);
                    },
                    error: function (err) {
                        // If order doesn't exist, clear the CustomerName and OrderID fields and make them editable
                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1");
                        oCustomerNameInput.setValue("");
                        oCustomerNameInput.setEditable(true);
                    }
                });
            } else {
                // If the ID is empty, reset the CustomerName and OrderID fields and make them editable
                var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1");
                oCustomerNameInput.setValue("");
                oCustomerNameInput.setEditable(true);

            }
        },
        // /**
        //  * onMultiDelete: This function handles the deletion of multiple selected order items.
        //  * It checks whether any items are selected, and if so, it proceeds to delete them one by one.
        //  * A confirmation box is shown before proceeding with the deletion.
        //  */
        // onMultiDelete: function (oEvent) {
        //     var oTable = this.byId("idviewtable");
        //     // Check if oTable is defined
        //     if (!oTable) {
        //         MessageToast.show("Table not found.");
        //         return;
        //     }
        //     var aSelectedItems = oTable.getSelectedItems();
        //     if (aSelectedItems.length === 0) {
        //         MessageToast.show("Please select at least one item to delete.");
        //         return;
        //     }
        //     var oModel = this.getOwnerComponent().getModel();
        //     // Create an array to store the ItemIDs of the items to be deleted
        //     var aItemIDsToDelete = [];
        //     // Iterate over the selected items and collect their ItemIDs
        //     aSelectedItems.forEach(function (oItem) {
        //         var sItemID = oItem.getBindingContext("ordersModel").getProperty("ItemID");
        //         aItemIDsToDelete.push(sItemID); // Push the ItemID to the delete array
        //     });
        //     MessageBox.confirm("Are you sure you want to delete the selected items?", {
        //         title: "Confirm Deletion",
        //         onClose: function (sAction) {
        //             if (sAction === MessageBox.Action.OK) {
        //                 // Proceed with deletion of each selected item based on ItemID
        //                 aItemIDsToDelete.forEach(function (sItemID) {
        //                     var sDeletePath = "/OrderItems(ItemID='" + sItemID + "')";
        //                     oModel.remove(sDeletePath, {
        //                         success: function () {
        //                             MessageToast.show("Item with ItemID deleted successfully!");
        //                             that.ReadAll();
        //                         },
        //                         error: function () {
        //                             MessageToast.show("Error deleting the item with ItemID: " + sItemID);
        //                         }
        //                     });
        //                 });
        //             }
        //         }
        //     });
        // },
        onMultiDelete: function (oEvent) {
            var oTable = this.byId("idviewtable"); 
            if (!oTable) {
                MessageToast.show("Table not found.");
                return;
            }
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one item to delete.");
                return;
            }
            var oModel = this.getOwnerComponent().getModel();
            // Create an array to store the ItemIDs of the items to be deleted
            var aItemIDsToDelete = aSelectedItems.map(function (oItem) {
                return oItem.getBindingContext("ordersModel").getProperty("ItemID");
            });
            MessageBox.confirm("Are you sure you want to delete the selected items?", {
                title: "Confirm Deletion",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // Using Promise.all to delete all selected items concurrently
                        var deletePromises = aItemIDsToDelete.map(function (sItemID) {
                            var sDeletePath = "/OrderItems(ItemID='" + sItemID + "')";
                            return new Promise(function (resolve, reject) {
                                oModel.remove(sDeletePath, {
                                    success: function () {
                                        resolve("Item with ItemID  deleted successfully!");
                                    },
                                    error: function () {
                                        reject("Error deleting the item with ItemID: " + sItemID);
                                    }
                                });
                            });
                        });
                        // Wait for all deletions to complete
                        Promise.all(deletePromises)
                            .then(function (results) {
                                results.forEach(function (message) {
                                    MessageToast.show(message);
                                });
                                that.ReadAll(); 
                            })
                            .catch(function (error) {
                                MessageToast.show(error);
                            });
                    }
                }
            });
        },
        
        /**
         * onMultiUpdate: This function handles the update of multiple selected order items.
         * It checks if all selected items have the same Order ID and opens a dialog for updating them.
         */
        onMultiUpdate: function (oEvent) {
            var oTable = this.byId("idviewtable");
            if (!oTable) {
                MessageToast.show("Table not found.");
                return;
            }
            var aSelectedItems = oTable.getSelectedItems();
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one item to update.");
                return;
            }
            // Check if all selected items have the same ID
            var sID = aSelectedItems[0].getBindingContext("ordersModel").getObject().ID;
            for (var i = 1; i < aSelectedItems.length; i++) {
                var oItem = aSelectedItems[i].getBindingContext("ordersModel").getObject();
                if (oItem.ID !== sID) {
                    MessageToast.show("Multi-update can only be done for items with the same ID.");
                    return;
                }
            }
            if (!this._oMultiUpdateFragment) {
                this._oMultiUpdateFragment = sap.ui.xmlfragment("ordersdata.fragments.uuu", this);
                this.getView().addDependent(this._oMultiUpdateFragment);
            }
            // Clear any previous data in the fragment before opening
            var oModel = this.getOwnerComponent().getModel();
            var aItemsToUpdate = [];
            aSelectedItems.forEach(function (oItem) {
                var oItemData = oItem.getBindingContext("ordersModel").getObject();
                aItemsToUpdate.push(oItemData);
            });
            var orderID = aItemsToUpdate[0].ID;
            var CustomerName = aItemsToUpdate[0].CustomerName;
            var oOrderDate = aItemsToUpdate[0].OrderDate;

            var oCustomerNameInput = sap.ui.getCore().byId("idCustomerName1Update1");
            var oOrderIDInput = sap.ui.getCore().byId("idOrderID4Update1");
            var orderdateInput = sap.ui.getCore().byId("idOrderDate1Update1");

            oCustomerNameInput.setValue(CustomerName);
            oOrderIDInput.setValue(orderID);
            orderdateInput.setValue(oOrderDate);

            // Set the selected items data to the fragment model for binding
            var oUpdateModel = new JSONModel(aItemsToUpdate);
            this._oMultiUpdateFragment.setModel(oUpdateModel, "updateModel");

            this._oMultiUpdateFragment.open();
        },
        /**
         * onMultiUpdateSubmit: This function handles the submission of updates for multiple selected order items.
         * It sends the updates to the backend after validating the input fields.
         */
        onMultiUpdateSubmit: function () {
            var oModel = this.getOwnerComponent().getModel();
            var aUpdatedItems = this._oMultiUpdateFragment.getModel("updateModel").getData();
            var sID = sap.ui.getCore().byId("idOrderID4Update1").getValue();
            var sCustomerName = sap.ui.getCore().byId("idCustomerName1Update1").getValue();

            if (!sCustomerName) {
                sap.m.MessageToast.show("ID field cannot be empty.");
                return;
            }
            var UpdatenewEntry1 = {
                ID: sID,
                // OrderDate: sOrderDate,
                CustomerName: sCustomerName,
            };
            oModel.update("/Orders('" + sID + "')", UpdatenewEntry1, {
                success: function () {
                    MessageToast.show("Order Item updated successfully!");
                },
                error: function (err) {
                    MessageToast.show("Error updating Order Item: " + err.message);
                }
            });
            aUpdatedItems.forEach(function (oUpdatedItem) {
                var oFilteredItem = Object.keys(oUpdatedItem).reduce(function (acc, key) {
                    if (!["ID", "CustomerName", "OrderDate", "TotalAmount"].includes(key)) {
                        acc[key] = oUpdatedItem[key];
                    }
                    return acc;
                }, {});
                // Perform the OrderItems update
                var sUpdatePathItem = "/OrderItems(ItemID='" + oUpdatedItem.ItemID + "')";
                oModel.update(sUpdatePathItem, oFilteredItem, {
                    success: function () {
                        MessageToast.show("OrderItem with ItemID  updated successfully!");
                    },
                    error: function () {
                        MessageToast.show("Error updating OrderItem with ItemID: " + oUpdatedItem.ItemID);
                    }
                });
            });
            this._oMultiUpdateFragment.close();
            this.ReadAll();
        },

        onMultiUpdateClose: function () {
            this._oMultiUpdateFragment.close();
        },

        // single new  create function
        onCreateAll: function () {
            that.sampleall.open();
        },
        OnOrders_Orderitemsclose: function () {

            sap.ui.getCore().byId("idIDs1").setValue("");
            sap.ui.getCore().byId("idCustomerNames2").setValue("");
            sap.ui.getCore().byId("idItemIDinputs4").setValue("");
            sap.ui.getCore().byId("idProductNameinputs5").setValue("");
            sap.ui.getCore().byId("idQuantityinputs6").setValue("");
            sap.ui.getCore().byId("idPriceinputs7").setValue("");
            sap.ui.getCore().byId("idOrderIDinput8").setValue("");
            that.sampleall.close();
        },
        /**
         * OnOrders_OrderitemsSubmit: This function is triggered when the user submits the order and order item data.
         * It creates the order and the corresponding order item if the order exists or not.
         */
        OnOrders_OrderitemsSubmit: function () {
            var sID = sap.ui.getCore().byId("idIDs1").getValue();
            // var sOrderDate = sap.ui.getCore().byId("idOrderDateInput").getValue();
            var sCustomerName = sap.ui.getCore().byId("idCustomerNames2").getValue();
            // var sTotalAmount = sap.ui.getCore().byId("idTotalAmounts").getValue();
            var sItemID = sap.ui.getCore().byId("idItemIDinputs4").getValue();
            var sProductName = sap.ui.getCore().byId("idProductNameinputs5").getValue();
            var sQuantity = sap.ui.getCore().byId("idQuantityinputs6").getValue();
            var sPrice = sap.ui.getCore().byId("idPriceinputs7").getValue();
            var sOrderID = sap.ui.getCore().byId("idOrderIDinput8").getValue();
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
                            that.OnOrders_Orderitemsclose(); // Close the fragment
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
                                    that.OnOrders_Orderitemsclose(); // Close the fragment
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
        /**
         * onIDLiveChange: This function checks if an Order with the entered ID exists and updates the fields accordingly.
         * If the order exists, it fills in the Customer Name and Order ID fields and disables their editing.
         * If the order doesn't exist, it clears the fields and allows editing for the ID and Customer Name.
         */
        onIDLiveChange: function (oEvent) {
            var sID = oEvent.getSource().getValue(); // Get the entered ID
            var oModel = this.getOwnerComponent().getModel();
            if (sID) {
                // Step 1: Check if Order with the entered ID exists
                oModel.read("/Orders('" + sID + "')", {
                    success: function (res) {
                        var sCustomerName = res.CustomerName;
                        var sOrderID = res.ID;

                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames2");
                        var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput8");

                        oCustomerNameInput.setValue(sCustomerName);
                        oOrderIDInput.setValue(sOrderID);

                        oCustomerNameInput.setEditable(false);
                        oOrderIDInput.setEditable(false);
                    },
                    error: function (err) {
                        // If order doesn't exist, clear the CustomerName and OrderID fields and make them editable
                        var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames2");
                        var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput8");

                        oCustomerNameInput.setValue("");
                        oOrderIDInput.setValue("");

                        oOrderIDInput.setValue(sID);

                        oCustomerNameInput.setEditable(true);
                        oOrderIDInput.setEditable(false);
                    }
                });
            } else {
                // If the ID is empty, reset the CustomerName and OrderID fields and make them editable
                var oCustomerNameInput = sap.ui.getCore().byId("idCustomerNames2");
                var oOrderIDInput = sap.ui.getCore().byId("idOrderIDinput8");

                oCustomerNameInput.setValue("");
                oOrderIDInput.setValue("");

                oCustomerNameInput.setEditable(true);
                oOrderIDInput.setEditable(true);
            }
        },

        /**
         * onDeleteitemsPress: Deletes an order item after confirming with the user.
         * It prompts the user with a confirmation dialog before deleting the itemID.
         */
        onDeleteitemsPress: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel();
            var sObj = oEvent.getSource().getParent().getBindingContext("ordersModel").getObject();
            var sItemID = String(sObj.ItemID);

            var sPath = "/OrderItems(ItemID='" + sItemID + "')";
            MessageBox.confirm("Are you sure you want to delete the record with ItemID: " + sItemID + "?", {
                title: "Confirm Deletion",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: function (res) {
                                MessageToast.show("Order item deleted  " + sItemID + " successfully!");
                                that.ReadAll();
                            },
                            error: function (error) {
                                MessageToast.show("Error deleting the order item.");
                            }
                        });
                    }
                }
            });
        },
        /**
         * onUpdatePress: Opens the 'Update' fragment to allow the user to update an existing order and its order items.
         * It pre-fills the form with the existing data of the selected item.
         */
        onUpdatePress: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getParent();
            var oContext = oSelectedItem.getBindingContext("ordersModel");
            var selectedData = oContext.getObject();

            if (!that.sampleupdatefragment) {
                that.sampleupdatefragment = sap.ui.xmlfragment("ordersdata.fragments.Update", that);
                that.getView().addDependent(that.sampleupdatefragment);
            }
            sap.ui.getCore().byId("idID").setValue(selectedData.ID);
            var formattedOrderDate = this.formatter.formatDate(selectedData.OrderDate);
            sap.ui.getCore().byId("idOrderDate").setValue(formattedOrderDate);
            sap.ui.getCore().byId("idCustomerName").setValue(selectedData.CustomerName);
            sap.ui.getCore().byId("idItemIDinput").setValue(selectedData.ItemID);
            sap.ui.getCore().byId("idProductNameinput").setValue(selectedData.ProductName);
            sap.ui.getCore().byId("idQuantityinput").setValue(selectedData.Quantity);
            sap.ui.getCore().byId("idPriceinput").setValue(selectedData.Price);
            that.sampleupdatefragment.open();
        },
        Onorderscloseclose: function () {
            sap.ui.getCore().byId("idID").setValue("");
            sap.ui.getCore().byId("idOrderDate").setValue("");
            sap.ui.getCore().byId("idCustomerName").setValue("");
            sap.ui.getCore().byId("idItemIDinput").setValue("");
            sap.ui.getCore().byId("idProductNameinput").setValue("");
            sap.ui.getCore().byId("idQuantityinput").setValue("");
            sap.ui.getCore().byId("idPriceinput").setValue("");

            that.sampleupdatefragment.close();
        },

        /**
         * Function to handle the update of an order and its order items.
         * It submits the modified data to the backend.
         */

        OnordersUpdate: function () {
            var sID = sap.ui.getCore().byId("idID").getValue();
            // var formattedOrderDate = sap.ui.getCore().byId("idOrderDate").getValue();
            // var parts = formattedOrderDate.split("-"); // ['16', '01', '2025']
            // var sOrderDate = parts[2] + "-" + parts[1] + "-" + parts[0];
            // // var sOrderDate = this.formatter.formatDate(formattedOrderDate);
            var sCustomerName = sap.ui.getCore().byId("idCustomerName").getValue();
            var sItemID = sap.ui.getCore().byId("idItemIDinput").getValue();
            var sProductName = sap.ui.getCore().byId("idProductNameinput").getValue();
            var sQuantity = sap.ui.getCore().byId("idQuantityinput").getValue();
            var sPrice = sap.ui.getCore().byId("idPriceinput").getValue();

            var UpdatenewEntry1 = {
                ID: sID,
                // OrderDate: sOrderDate,
                CustomerName: sCustomerName,
            };

            var UpdatenewEntry2 = {
                ItemID: sItemID,
                ProductName: sProductName,
                Quantity: sQuantity,
                Price: sPrice,
                OrderID_ID: sID
            };
            var oModel = this.getOwnerComponent().getModel();
            // Update Orders based on ID
            oModel.update("/Orders('" + sID + "')", UpdatenewEntry1, {
                success: function () {
                    // Update OrderItems based on ItemID
                    oModel.update("/OrderItems('" + sItemID + "')", UpdatenewEntry2, {
                        success: function () {
                            MessageToast.show("Order Item updated successfully!");
                            that.Onorderscloseclose();
                            that.ReadAll();
                        },
                        error: function (err) {
                            MessageToast.show("Error updating Order Item: " + err.message);
                        }
                    });
                },
                error: function (err) {
                    MessageToast.show("Error updating Order: " + err.message);
                }
            });
        }


    });
});
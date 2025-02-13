sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
     "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast,Filter,FilterOperator) {
    "use strict";
    var that;

    return Controller.extend("fclwithinitialtwoviews.controller.View2", {

        onInit: function () {
            that = this;
            // Get the EventBus and subscribe to the "setDetailPage" event
            var oBus = this.getOwnerComponent().getEventBus();
            oBus.subscribe("flexible", "setDetailPage", this.onDetailPageReceived, this)
            that.loadOrders();
        },
        /**
         * loadOrders: Loads the orders data from the backend and binds it to the view.
         * It also loads the details of the first order.
         */
        loadOrders: function () {
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Ordersdata", {
                success: function (oData) {
                    if (oData && oData.results.length > 0) {
                        var oOrdersModel = new JSONModel(oData.results);
                        that.getView().setModel(oOrdersModel, "ordersModel");

                        var sFirstOrderID = oData.results[0].ID;
                        that.sORDERID = oData.results[0].ID;
                        that.loadItemDetails(sFirstOrderID);
                    } else {
                        MessageToast.show("No orders found.");
                    }
                },
                error: function () {
                    MessageToast.show("Error loading orders.");
                }
            });
        },

        /**
         * onDetailPageReceived: Handles the event when the 'setDetailPage' event is received.
         * Loads the details of the specified order.
         */

        onDetailPageReceived: function (sChannel, sEvent, oData) {
            var sOrderID = oData.OrderID;
            this.sORDERID = oData.OrderID;
            that.loadItemDetails(sOrderID);
        },

        /**
        * loadItemDetails: Loads the details of a specific order based on the given order ID.
        * It populates the 'detailModel' with the order item data.
        */
        loadItemDetails: function (sOrderID) {
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/Ordersdata", {
                urlParameters: {
                    "$filter": "ID eq '" + sOrderID + "'"
                },
                success: function (oData) {
                    if (oData && oData.results.length > 0) {
                        var odetailModel = new JSONModel(oData.results);
                        var existingData = odetailModel.getData();
                        existingData.forEach(function (row) {
                            row.editable = false;
                        });
                        var sortedData = odetailModel.getData().sort(function (a, b) {
                            return parseInt(a.ItemID) - parseInt(b.ItemID); // Sorting numerically in ascending order
                        });
                        odetailModel.setData(sortedData);
                        odetailModel.setData(existingData);
                        that.getView().setModel(odetailModel, "detailModel");
                        var oTable = that.byId("detailTable");
                        oTable.setMode(sap.m.ListMode.MultiSelect);

                    } else {
                        var odetailModel = new JSONModel(oData.results);
                        that.getView().setModel(odetailModel, "detailModel");
                        MessageToast.show("No data found for the specified OrderID.");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
        },      
        /**
         * onAddRow: Adds a new row to the table to allow users to input new order item details.
         * It switches the table mode to 'None' to disable selection mode.
         */
        onAddRow: function () {
            var oModel = this.getView().getModel("detailModel");
            var oData = oModel.getData();
            var newRow = {
                ItemID: "",
                ProductName: "",
                Quantity: "",
                Price: "",
                TotalAmount: "",
                editable: true,
                isNew: true  // Add this flag to mark it as a new row
            };
            oData.push(newRow);
            oModel.setData(oData);
            var oTable = this.byId("detailTable");
            oTable.setMode(sap.m.ListMode.None);
        },
      
        
        
        onDeleteRow: function (oEvent) {
            var oTable = this.byId("detailTable");
            var oRow = oEvent.getSource().getParent(); // Get the row of the button clicked
            var oModel = this.getView().getModel("detailModel");
            var oData = oModel.getData();
            var rowIndex = oTable.indexOfItem(oRow); 
            if (rowIndex !== -1) {
                var row = oData[rowIndex];
                if (row.isNew) {
                    // Only delete if the row is new
                    oData.splice(rowIndex, 1); // Remove the row from the model data
                    oModel.setData(oData); // Update the model with the modified data
                }
            }      
            var hasNewRows = oData.some(function(row) {
                return row.TotalAmount === ""; 
            });
            if (hasNewRows) {
                oTable.setMode(sap.m.ListMode.None);
            } else {
                oTable.setMode(sap.m.ListMode.MultiSelect);
            }
        },        
      

        /**
        * onSaveandupdatebutton: Handles the click event on the Save/Update button.
        * If the button text is 'Save', it calls the onSave function, otherwise calls onUpdate.
        */
        onSaveandupdatebutton: function (oEvent) {
            var buttontext = oEvent.getSource().getText();
            if (buttontext === "Save") {
                that.onSave();
            } else {
                that.onUpdate()
            }
        },
        /**
         * onSave: Handles the saving of new order items. It checks if all required fields are filled,
         * and then creates the new items in the backend.
         */
        onSave: function () {
            var itemsorderid = this.sORDERID;
            var newitemdata = this.getView().getModel("detailModel").getData();

            newitemdata.forEach(function (row) {
                if (!row.TotalAmount) {
                    var sItemID = row.ItemID;
                    var sProductName = row.ProductName;
                    var sQuantity = row.Quantity;
                    var sPrice = row.Price;

                    if (isNaN(sItemID) || sItemID <= 0) {
                        MessageToast.show("Please enter a valid  ItemID.");
                        return;
                    }
                    if (isNaN(sQuantity) || sQuantity <= 0) {
                        MessageToast.show("Please enter a valid  quantity.");
                        return;
                    }
                    if (isNaN(sPrice) || sPrice <= 0) {
                        MessageToast.show("Please enter a valid  price.");
                        return;
                    }
                    var newEntry2 = {
                        ItemID: sItemID,
                        ProductName: sProductName,
                        Quantity: sQuantity,
                        Price: sPrice,
                        OrderID_ID: itemsorderid
                    };
                    var oModel = this.getOwnerComponent().getModel();
                    oModel.create("/OrderItems", newEntry2, {
                        success: function (res) {
                            MessageToast.show("Order Item saved successfully!");
                            var sOrderID = itemsorderid;
                            that.loadItemDetails(sOrderID);
                        },
                        error: function (err) {
                            const oErrorResponse = JSON.parse(err.responseText);
                            const sErrorMessage = oErrorResponse.error.message.value;
                            if (sErrorMessage.includes("Entity already exists")) {
                                MessageToast.show("Item ID already exists in the Order Items!");
                            } else {
                                MessageToast.show(sErrorMessage);
                            }
                        }
                    });
                }
            }, this);
        },
     
        /**
        * onUpdate: Handles the update of an existing order item. It submits the modified data to the backend.
        * It also reloads the details of the order once the update is complete.
        */
        onUpdate: function () {
            var itemsorderid = this.sORDERID;
            var oTable = this.byId("detailTable");
            var selectedItems = oTable.getSelectedItems();
            selectedItems.forEach(function (selectedItem) {
                var oCells = selectedItem.getCells();
                var sItemID = oCells[0].getValue();
                var sProductName = oCells[1].getValue();
                var sQuantity = oCells[2].getValue();
                var sPrice = oCells[3].getValue();

                if (isNaN(sQuantity) || sQuantity <= 0) {
                    MessageToast.show("Please enter a valid  quantity.");
                    return;
                }
                if (isNaN(sPrice) || sPrice <= 0) {
                    MessageToast.show("Please enter a valid  price.");
                    return;
                }
                var updateentry = {
                    ItemID: sItemID,
                    ProductName: sProductName,
                    Quantity: sQuantity,
                    Price: sPrice,
                    OrderID_ID: itemsorderid
                }
                var oModel = that.getOwnerComponent().getModel();
                oModel.update("/OrderItems('" + sItemID + "')", updateentry, {
                    success: function (res) {
                        MessageToast.show("Order Item  updated successfully!");
                        var sOrderID = itemsorderid;
                        that.loadItemDetails(sOrderID);

                        that.byId("addButton").setEnabled(true);
                        that.byId("saveButton").setText("Save");
                    },
                    error: function (err) {
                        MessageToast.show("Error updating Order Item (" + sItemID + "): " + err.message);
                    }
                })
            });
        },
        /**
          * onSelectionChange: Handles the selection change event in the detail table.
          * It enables or disables the Add button and updates the Save button text based on the selection.
          */
        onSelectionChange: function (oEvent) {
            var oTable = this.byId("detailTable");
            var oSaveButton = this.byId("saveButton");
            var oAddButton = this.byId("addButton");
            var selectedItems = oTable.getSelectedItems();
            var allItems = oTable.getItems();

            if (selectedItems.length === 0) {
                oAddButton.setEnabled(true);
                oSaveButton.setText("Save");

                allItems.forEach(function (item) {
                    var oCells = item.getCells();
                    oCells[1].setEditable(false);
                    oCells[2].setEditable(false);
                    oCells[3].setEditable(false);
                });
            } else {

                oAddButton.setEnabled(false);
                oSaveButton.setText("Update");
                selectedItems.forEach(function (selectedItem) {
                    var oCells = selectedItem.getCells();
                    oCells[1].setEditable(true);
                    oCells[2].setEditable(true);
                    oCells[3].setEditable(true);
                });
                // Disable editing for unselected rows
                allItems.forEach(function (item) {
                    if (!item.getSelected()) {
                        var oCells = item.getCells();
                        oCells[1].setEditable(false);
                        oCells[2].setEditable(false);
                        oCells[3].setEditable(false);
                    }
                });
            }
        },

        Onexceldownload: function () {
            var oModel = this.getView().getModel("detailModel");
            var aTableData = oModel.getData();

            if (!aTableData || aTableData.length === 0) {
                MessageToast.show("No data available to download.");
                return;
            }

            // Create an array of objects with only the necessary fields
            var aExportData = aTableData.map(function (row) {
                return {
                    ItemID: row.ItemID,
                    ProductName: row.ProductName,
                    Quantity: row.Quantity,
                    Price: row.Price,
                    TotalAmount:row.TotalAmount

                };
            });

            var ws = XLSX.utils.json_to_sheet(aExportData);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Order_Items");
            var fileName = "OrderItems";
            // Download the file with the generated name
            XLSX.writeFile(wb, fileName + ".xlsx");
        },
        OnexcelUpload: function () {
            if (!that.fileupload) {
                that.fileupload = sap.ui.xmlfragment("fclwithinitialtwoviews.fragments.fileupload", that);
                that.getView().addDependent(that.fileupload);
            }
            that.fileupload.open();

        },
        onFileSelectionChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var oFile = oFileUploader.oFileUpload.files[0];
            var oReader = new FileReader();
            oReader.onload = function (e) {
                var data = new Uint8Array(e.target.result); 

                // Parse the Excel file using XLSX library
                var workbook = XLSX.read(data, { type: 'array' });
                var sheetName = workbook.SheetNames[0]; 
                var worksheet = workbook.Sheets[sheetName];
                var jsonData = XLSX.utils.sheet_to_json(worksheet);

                that.handleParsedData(jsonData);
            };
            oReader.readAsArrayBuffer(oFile);
        },

        handleParsedData: function (data) {
            var oModel = that.getOwnerComponent().getModel();
            data.forEach(function (row) {
                var newEntry = {
                    ItemID: String(row.ItemID),
                    ProductName: row.ProductName,
                    Quantity: row.Quantity,
                    Price: row.Price,
                    OrderID_ID: String(row.OrderID_ID) 
                };
                oModel.create("/OrderItems", newEntry, {
                    success: function () {
                        MessageToast.show("Order Item saved successfully!");
                        that.oncloseUploadFile();
                        that.loadItemDetails(this.sORDERID);
                    },
                    error: function (err) {
                        const oErrorResponse = JSON.parse(err.responseText);
                        const sErrorMessage = oErrorResponse.error.message.value;
                        if (sErrorMessage.includes("Entity already exists")) {
                            MessageToast.show("Item ID already exists in the Order Items!");
                        } else {
                            MessageToast.show(sErrorMessage);
                        }
                    }
                });
            });
        },
        OnEmptyexceldownload: function () {
            var aHeaders = [
                { "ItemID": "", "ProductName": "", "Quantity": "", "Price": "","OrderID_ID":"" }
            ];
            // Convert the header into a sheet format (with no actual data)
            var ws = XLSX.utils.json_to_sheet(aHeaders, { header: ["ItemID", "ProductName", "Quantity", "Price","OrderID_ID"] });
            // Create a workbook and append the sheet
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Order_Items");
            // File name for download
            var fileName = "Empty_Order_Items";      
            // Trigger the download of the file
            XLSX.writeFile(wb, fileName + ".xlsx");    
            // Display a success message
            MessageToast.show("Empty Excel file downloaded!");
        },
        
        
        oncloseUploadFile: function (oEvent) {
            that.fileupload.close();
        },
       
        onAfterRendering: function () {
        },
    });
});
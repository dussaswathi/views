sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(MessageToast,MessageBox) {
    'use strict';
var that;
    return {
        Onexcelupload: function(oEvent) {
            that=this;          
            if (!that.FileUploadFragment) {
                that.FileUploadFragment = sap.ui.xmlfragment("caplistreportpage.fragments.fileupload", that);
            }
            that.FileUploadFragment.open();
        },

        onFileSelectionChange: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var oFile = oFileUploader.oFileUpload.files[0];
            // if (!oFile) {
            //     MessageToast.show("No file selected!");
            //     return;
            // }
            var oReader = new FileReader();
            oReader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                // Parse the Excel file using XLSX library
                var workbook = XLSX.read(data, { type: 'array' });
                var sheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[sheetName];
                that.jsonData = XLSX.utils.sheet_to_json(worksheet);
                // this.handleParsedData(jsonData);
            }.bind(this); 
            oReader.readAsArrayBuffer(oFile);
        },
        onSubmitFile: function () {
            var oModel = that.getModel("v2Model");
            var data = that.jsonData;  // Use the JSON data from the file
            var currentDate = new Date();
        
            // Arrays to store duplicate IDs and ItemIDs
            var existingIDs = [];
            var existingItemIDs = [];
            var validationErrors = [];
       
         data.forEach(function (row, index) {
            if (isNaN(row.ID)) {
                validationErrors.push(`Row ${index + 1}: ID must be a valid number.`);
            }    
            if (isNaN(row.ItemID)) {
                validationErrors.push(`Row ${index + 1}: ItemID must be a valid number.`);
            }
            if (isNaN(row.Quantity)) {
                validationErrors.push(`Row ${index + 1}: Quantity must be a valid number.`);
            }   
            if (isNaN(row.Price)) {
                validationErrors.push(`Row ${index + 1}: Price must be a valid number.`);
            }
            if (!row.CustomerName || row.CustomerName.trim() === "") {
                validationErrors.push(`Row ${index + 1}: Customer Name is required and cannot be empty.`);
            }    
            // Validate ProductName
            if (!row.ProductName || row.ProductName.trim() === "") {
                validationErrors.push(`Row ${index + 1}: Product Name is required and cannot be empty.`);
            }
           
        });
        if (validationErrors.length > 0) {
            MessageToast.show(validationErrors.join("\n"));
            return;
        }
       
   


            // Check for existing IDs and ItemIDs before creating new entries
            data.forEach(function (row) {
                var orderID = String(row.ID);
                var itemID = String(row.ItemID);               
                // First, check if the Order ID already exists
                oModel.read("/Orders", {
                    filters: [new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, orderID)],
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            existingIDs.push(orderID);
                        }        
                        // Then, check if the Item ID already exists
                        oModel.read("/OrderItems", {
                            filters: [new sap.ui.model.Filter("ItemID", sap.ui.model.FilterOperator.EQ, itemID)],
                            success: function (oData) {
                                if (oData.results.length > 0) {
                                    existingItemIDs.push(itemID);
                                }       
                                // Proceed with creating the entries if no duplicates were found
                                if (existingIDs.length === 0 && existingItemIDs.length === 0) {
                                    var newEntry = {
                                        ID: orderID,
                                        OrderDate: currentDate,
                                        CustomerName: String(row.CustomerName)
                                    };
                                    var newEntry1 = {
                                        ItemID: itemID,
                                        ProductName: row.ProductName,
                                        Quantity: row.Quantity,
                                        Price: row.Price,
                                        OrderID_ID: String(row.OrderID_ID)
                                    };       
                                    // Create Order and OrderItem
                                    oModel.create("/Orders", newEntry, {
                                        success: function () {
                                            MessageToast.show("Order saved successfully!");
                                            oModel.create("/OrderItems", newEntry1, {
                                                success: function () {
                                                    MessageToast.show("Order Item saved successfully!");
                                                    that.refresh();
                                                    that.FileUploadFragment.close();
                                                    var oFileUploader = that.byId("fileUploader");  // Access the FileUploader control
                                            oFileUploader.clear();
                                                },
                                                error: function (err) {
                                                    const oErrorResponse = JSON.parse(err.responseText);
                                                    const sErrorMessage = oErrorResponse.error.message.value;
                                                    MessageToast.show(sErrorMessage);
                                                }
                                            });
                                        },
                                        error: function (err) {
                                            const oErrorResponse = JSON.parse(err.responseText);
                                            const sErrorMessage = oErrorResponse.error.message.value;
                                            MessageToast.show(sErrorMessage);
                                        }
                                    });
                                } else {
                                    // If there are any existing IDs or ItemIDs, show an error message
                                    var errorMessage = "";
                                    if (existingIDs.length > 0) {
                                        errorMessage += " Order IDs already exist: " + existingIDs.join(", ") + "\n";
                                    }
                                    if (existingItemIDs.length > 0) {
                                        errorMessage += " Item IDs already exist: " + existingItemIDs.join(", ");
                                    }
                                    MessageToast.show(errorMessage);
                                }
                            }
                        });
                    }
                });
            });
        },

        oncloseUploadFile: function () {    
            var oFileUploader = this.byId("fileUploader");
    if (oFileUploader) {
        oFileUploader.destroy(); // Destroys the file uploader control
    }     
                that.FileUploadFragment.close();           
        }
    }
    });

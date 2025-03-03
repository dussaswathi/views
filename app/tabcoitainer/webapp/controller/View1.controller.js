
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/Item"
], function (Controller, Fragment, MessageToast, Filter, MessageBox, FilterOperator, JSONModel,formatter,Item) {
    "use strict";
    var that;
    return Controller.extend("tabcoitainer.controller.View1", {
        formatter: formatter,
        onInit: function () {
            that = this;
            that.ReadAll();
            // that._createPriceRangeDropdown();
        },
        

        // onPriceRangeChange: function (oEvent) {
        //     var oSelect = oEvent.getSource();
        //     var selectedKey = oSelect.getSelectedKey();

        //     // Get the model for the order items table
        //     var oTable = this.byId("orderItemsTable");
        //     var oBinding = oTable.getBinding("items");

        //     // Define price ranges
        //     var priceRangeFilter;

        //     switch (selectedKey) {
        //         case "1-50":
        //             priceRangeFilter = new Filter("Price", FilterOperator.BT, 1, 50);
        //             break;
        //         case "50-100":
        //             priceRangeFilter = new Filter("Price", FilterOperator.BT, 50, 100);
        //             break;
        //         case "100-150":
        //             priceRangeFilter = new Filter("Price", FilterOperator.BT, 100, 150);
        //             break;
        //         default:
        //             priceRangeFilter = null;
        //     }

        //     // Apply the filter to the table binding
        //     if (priceRangeFilter) {
        //         oBinding.filter(priceRangeFilter);
        //     } else {
        //         // Clear the filter if no range is selected
        //         oBinding.filter([]);
        //     }
        // },
       
        onPriceRangeChange: function (oEvent) {
            var oSelect = oEvent.getSource();
            var selectedKey = oSelect.getSelectedKey();        
            // Get the model for the order items table
            var oTable = this.byId("orderItemsTable");
            var oBinding = oTable.getBinding("items");       
            // Define price ranges in an array of objects
            var priceRanges = [
                { key: "1-50", min: 0, max: 50 },
                { key: "50-100", min: 50, max: 100 },
                { key: "100-150", min: 100, max: 150 }
            ];       
            var priceRangeFilter = null;       
            // Loop through the priceRanges array and match the selected key
            priceRanges.forEach(function(range) {
                if (range.key === selectedKey) {
                   priceRangeFilter = new sap.ui.model.Filter("Price", sap.ui.model.FilterOperator.BT, range.min, range.max);
                }
            });       
            // Apply the filter to the table binding
            if (priceRangeFilter) {
                oBinding.filter(priceRangeFilter);
            } else {
                // Clear the filter if no range is selected or the selected key doesn't match any of the ranges
                oBinding.filter([]);
            }
        },
        
        ReadAll: function () {
            var oModel = that.getOwnerComponent().getModel();
            oModel.read("/Orders", {
                success: function (oData) {
                    var sortedOrders = oData.results.sort(function (a, b) {
                        return a.ID - b.ID; 
                    });
                    var oOrdersModel = new JSONModel(sortedOrders);
                    that.getView().setModel(oOrdersModel, "ordersModel");
                    
                    oModel.read("/OrderItems", {
                        success: function (oData) {
                            var sorteditemid = oData.results.sort(function (a, b) {
                                return a.ItemID - b.ItemID; 
                            });
                            var oOrderItemsModel = new JSONModel(sorteditemid);
                            that.getView().setModel(oOrderItemsModel, "orderItemsModel");
                            that.Onchangecolor();
                        },
                        error: function (oError) {
                            MessageToast.show("Error loading OrderItems data.");
                        }
                    });
                    
                },
                error: function (oError) {
                    MessageToast.show("Error loading Orders data.");
                }
            });
        },
        Onchangecolor: function () {
            var oTable = this.getView().byId("orderItemsTable");  
            var aItems = oTable.getItems();
            aItems.forEach(function(oItem) {
                var Price = oItem.getBindingContext("orderItemsModel").getProperty("Price");  
                // Clear all styles first to avoid overlapping
                oItem.removeStyleClass("errorText");
                oItem.removeStyleClass("warningText");
                oItem.removeStyleClass("successText");
                oItem.removeStyleClass("informationText");
                oItem.removeStyleClass("defaultText");

                if (Price >= 1 && Price < 100) {
                    oItem.addStyleClass("errorText");
                } else if (Price >= 100 && Price < 200) {
                    oItem.addStyleClass("warningText");
                } else if (Price >= 200 && Price < 300) {
                    oItem.addStyleClass("successText");
                } else if (Price >= 300 && Price < 3000) {
                    oItem.addStyleClass("informationText");
                } else {
                    oItem.addStyleClass("defaultText");
                }
            });
        },
        onLiveSearch: function (oEvent) {
            var OrderID = oEvent.getParameter("newValue");  
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
			if (OrderID) {
				var oFilter = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.StartsWith, OrderID);
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		},
        onLiveSearchitemid: function (oEvent) {
            var itemID = oEvent.getParameter("newValue");  
            var oTable = this.byId("orderItemsTable");
            var oBinding = oTable.getBinding("items");
			if (itemID) {
				var oFilter = new sap.ui.model.Filter("ItemID", sap.ui.model.FilterOperator.StartsWith, itemID);
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		},
    });
});
// _createPriceRangeDropdown: function () {
//     // Get the model data for order items
//     var oModel = this.getView().getModel("orderItemsModel");
//     var aOrderItems = oModel.getProperty("/"); // Assuming data is an array of order items

//     // Find the highest price in the dataset
//     var highestPrice = Math.max.apply(Math, aOrderItems.map(function (item) {
//         return item.Price; // Assuming each item has a 'Price' property
//     }));

//     // Generate price ranges based on the highest price (with an increment of 50)
//     var priceRangeSelect = this.byId("priceRangeSelect");
//     var rangeIncrement = 50;
//     var ranges = [];

//     for (var i = 0; i <= highestPrice; i += rangeIncrement) {
//         var startRange = i + 1;
//         var endRange = i + rangeIncrement;
//         if (endRange > highestPrice) {
//             endRange = highestPrice;
//         }
//         ranges.push({
//             text: startRange + " - " + endRange,
//             key: startRange + "-" + endRange
//         });
//     }

//     // Now populate the dropdown
//     var oSelect = this.byId("priceRangeSelect");
//     var oItemTemplate = new Item({
//         text: "{text}",
//         key: "{key}"
//     });

//     // Bind items to the Select dropdown
//     oSelect.removeAllItems();
//     oSelect.setModel(new sap.ui.model.json.JSONModel(ranges));
//     oSelect.bindItems({
//         path: "/",
//         template: oItemTemplate
//     });
// },

// // Function to handle price range selection
// onPriceRangeChange: function (oEvent) {
//     var oSelect = oEvent.getSource();
//     var selectedKey = oSelect.getSelectedKey();

//     // Get the model for the order items table
//     var oTable = this.byId("orderItemsTable");
//     var oBinding = oTable.getBinding("items");

//     // Extract the min and max price from the selected key
//     var priceRange = selectedKey.split("-");
//     var minPrice = parseFloat(priceRange[0]);
//     var maxPrice = parseFloat(priceRange[1]);

//     // Create the filter for the selected price range
//     var priceRangeFilter = new Filter("Price", FilterOperator.BT, minPrice, maxPrice);

//     // Apply the filter to the table binding
//     oBinding.filter(priceRangeFilter);
// },
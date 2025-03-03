// sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
// 	'use strict';

// 	return ControllerExtension.extend('caplistreportpage.ext.controller.Orderid_Accending_Order', {
// 		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
// 		override: {
// 			/**
//              * Called when a controller is instantiated and its View controls (if available) are already created.
//              * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
//              * @memberOf caplistreportpage.ext.controller.Orderid_Accending_Order
//              */
// 			onInit: function () {
// 				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
// 				var oModel = this.base.getExtensionAPI().getModel();
// 			}
// 		}
// 	});
// });
sap.ui.define(['sap/ui/core/mvc/ControllerExtension', 'sap/ui/model/Sorter'], function (ControllerExtension, Sorter) {
    'use strict';

    return ControllerExtension.extend('caplistreportpage.ext.controller.Orderid_Accending_Order', {
        override: {
            /**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf caplistreportpage.ext.controller.Orderid_Accending_Order
             */
            onInit: function () {
                var oExtensionAPI = this.base.getExtensionAPI(); // Get the extension API
                var oModel = oExtensionAPI.getModel(); // Get the OData model
                var oTable = sap.ui.getCore().byId("caplistreportpage::OrdersList--fe::table::Orders::LineItem-innerTable"); // Get the table from the view

                // Make sure the table is available
                if (oTable) {
                    var oListBinding = oTable.getBinding("items"); // Get the binding for the table's items

                    // Apply sorting for the OrderID field in ascending order
                    if (oListBinding) {
                        var aSorters = [
                            new Sorter("OrderID_ID", true) // false indicates ascending order
                        ];

                        // Apply the sorter to the list binding
                        oListBinding.sort(aSorters);
                    }
                }
            }
        }
    });
});



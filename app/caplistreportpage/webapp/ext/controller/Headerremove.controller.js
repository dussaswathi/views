sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('caplistreportpage.ext.controller.Headerremove', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf caplistreportpage.ext.controller.Headerremove
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				var oView = this.base.getView();
				// var objectpageheader=oView.byId("caplistreportpage::OrdersObjectPage--fe::ObjectPageDynamicHeaderTitle");
				// objectpageheader.setVisible(false);
				

			}
		}
	});
});






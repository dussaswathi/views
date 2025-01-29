// sap.ui.define([
//   "sap/ui/core/mvc/Controller"
// ], (BaseController) => {
//   "use strict";

//   return BaseController.extend("ordersdata.controller.App", {
//       onInit() {
//       }
//   });
// });



sap.ui.define([
  "sap/f/library",
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/mvc/XMLView"
], function (fioriLibrary,Controller, XMLView) {
  "use strict";

  var LayoutType = fioriLibrary.LayoutType;

  return Controller.extend("ordersdata.controller.App", {
    onInit: function () {
      this.bus = this.getOwnerComponent().getEventBus();
      this.bus.subscribe("flexible", "setListPage", this.setListPage, this);
      this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
     
      this.oFlexibleColumnLayout = this.byId("fcl");
    },


    setListPage: function () {
      this.oFlexibleColumnLayout.setLayout(LayoutType.OneColumn);
    },

    // Lazy loader for the mid page - only on demand (when the user clicks)
    setDetailPage: function () {
      this._loadView({
        id: "midView",
        viewName: "ordersdata.view.View2"
      }).then(function(detailView) {
        this.oFlexibleColumnLayout.addMidColumnPage(detailView);
        this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsBeginExpanded);
      }.bind(this));
    },

    // Helper function to manage the lazy loading of views
    _loadView: function(options) {
      var mViews = this._mViews = this._mViews || Object.create(null);
      if (!mViews[options.id]) {
        mViews[options.id] = this.getOwnerComponent().runAsOwner(function() {
          return XMLView.create(options);
        });
      }
      return mViews[options.id];
    }
  });
});



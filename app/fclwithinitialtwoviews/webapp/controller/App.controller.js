// sap.ui.define([
//   "sap/ui/core/mvc/Controller"
// ], (BaseController) => {
//   "use strict";

//   return BaseController.extend("fclwithinitialtwoviews.controller.App", {
//       onInit() {
//       }
//   });
// });

sap.ui.define([
  "sap/f/library", // For LayoutTypes
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/mvc/XMLView"
], function (fioriLibrary, Controller, XMLView) {
  "use strict";

  var LayoutType = fioriLibrary.LayoutType;

  return Controller.extend("fclwithinitialtwoviews.controller.App", {
    onInit: function () {
      this.oFlexibleColumnLayout = this.byId("fcl");
      this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsMidExpanded);

      this._loadViews();
    },

    _loadViews: function () {
      this._loadView({
        id: "beginView",
        viewName: "fclwithinitialtwoviews.view.View1"
      }).then(function (beginView) {
        this.oFlexibleColumnLayout.addBeginColumnPage(beginView);
      }.bind(this));

      this._loadView({
        id: "midView",
        viewName: "fclwithinitialtwoviews.view.View2"
      }).then(function (midView) {
        this.oFlexibleColumnLayout.addMidColumnPage(midView);
      }.bind(this));
    },
    // Function to load a view
    _loadView: function (options) {
      var mViews = this._mViews = this._mViews || Object.create(null);
      if (!mViews[options.id]) {
        mViews[options.id] = this.getOwnerComponent().runAsOwner(function () {
          return XMLView.create(options);
        });
      }
      return mViews[options.id];
    }
  });
});

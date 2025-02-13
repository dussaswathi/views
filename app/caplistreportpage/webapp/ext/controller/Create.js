sap.ui.define([
    "sap/m/MessageToast",
     "sap/ui/model/json/JSONModel"
], function(MessageToast,JSONModel) {
    'use strict';
var that;
    return {
        Oncreate: function(oEvent) {
            that=this;
            if (!that.sample) {
                that.sample = sap.ui.xmlfragment("caplistreportpage.fragments.Createorder_Orderitems", that);
                // that.getView().addDependent(that.sample);
            }
            that.sample.open();  
        },

        onSubmit: function() {
            var that = this; 
        
            var ID = sap.ui.getCore().byId("idInput").getValue();
            var Name = sap.ui.getCore().byId("nameInput").getValue();
            var EmailID = sap.ui.getCore().byId("emailInput").getValue();
        
            var newEntry = {
                ID: ID,
                Name: Name,
                Email: EmailID
            };
            // Access model using 'that' to correctly refer to the controller context
            var oModel = that.getModel("v2Model");  
     
            oModel.create("/Orders", newEntry, {
                success: function (res) {
                    MessageToast.show("Data Successfully Created");
                    that.sample.close(); 
                    that.refresh();   
                  
                },
                error: function (error) {
                    MessageToast.show("Data Not Successfully created");
                }
            });
        },        
            // MessageToast.show("Custom handler invoked.");
        // }
    };
});

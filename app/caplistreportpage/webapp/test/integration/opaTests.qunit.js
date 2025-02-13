sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'caplistreportpage/test/integration/FirstJourney',
		'caplistreportpage/test/integration/pages/OrdersList',
		'caplistreportpage/test/integration/pages/OrdersObjectPage',
		'caplistreportpage/test/integration/pages/OrderItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, OrdersList, OrdersObjectPage, OrderItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('caplistreportpage') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheOrdersList: OrdersList,
					onTheOrdersObjectPage: OrdersObjectPage,
					onTheOrderItemsObjectPage: OrderItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);
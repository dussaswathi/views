using orderstable from '../db/Data';
using { ORDERS  } from '../db/Data';

service OrderService {
    // @odata.draft.enabled
    entity Orders     as projection on orderstable.Orders;
    entity OrderItems as projection on orderstable.OrderItems;
    entity Ordersdata as projection on ORDERS;


}

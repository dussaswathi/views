context orderstable {

    entity Orders {
        key ID           : UUID;
            OrderDate    : Date;
            CustomerName : String(100);
            Items        : Composition of many OrderItems
                               on Items.OrderID = $self;
    }

    entity OrderItems {
        key ItemID      : UUID;
            ProductName : String(100);
            Quantity    : Integer;
            Price       : Decimal(15, 2);
            OrderID     : Association to Orders;
    }
}


@cds.persistence.exists
@cds.persistence.table
entity ORDERS {
    key ID           : UUID;
        OrderDate    : Date;
        CustomerName : String(100);
        ItemID       :UUID;
        ProductName  : String(100);
        Quantity     : Integer;
        Price        : Decimal(15, 2);
        TotalAmount:  Decimal(15, 2);
}
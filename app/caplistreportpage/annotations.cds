using OrderService as service from '../../srv/Data_srv';

annotate service.Orders with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'OrderItemsFacet',
            Label : 'Order Items',
            Target : 'Items/@UI.LineItem',
        }
    ],
    UI.LineItem : [
         {
            $Type : 'UI.DataField',
            Label : 'OrderID',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Order Date',
            Value : OrderDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Customer Name',
            Value : CustomerName,
        },
    ],
    UI.HeaderFacets : [
        
    ],
    UI.FieldGroup #Orderitems : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
);

annotate service.OrderItems with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Item ID',
            Value : ItemID,
            
        },
        {
            $Type : 'UI.DataField',
            Label : 'Product Name',
            Value : ProductName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantity',
            Value : Quantity,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Price',
            Value : Price,
        }
    ]
);



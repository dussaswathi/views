using OrderService as service from '../../srv/Data_srv';
annotate service.Orders with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'OrderDate',
                Value : OrderDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'CustomerName',
                Value : CustomerName,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'OrderDate',
            Value : OrderDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'CustomerName',
            Value : CustomerName,
        },
    ],
);


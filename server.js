
var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

var shipmentsData = [] ;

for(let i = 0; i < 30 ; i++){
    shipmentsData.push({
        id : i ,
        reference : 'REF-'+i,
        date : (new Date()).toString(),
        destinataire : i + ' rue de paris, 7500'+i,
        transporteur : 'DHL' 
    })
}
// GraphQL schema
var schema = buildSchema(`
    type Query {
        shipment(id: Int!): Shipment
        shipments(offset: Int, limit:Int): [Shipment]
    },
    type Mutation {
        updateShipment(id: Int!, newShipment: ShipmentUpdate!): Shipment
    },
    type Subscription {
        newShipmentAdded(newShipment: ShipmentUpdate!): Shipment
    }

    input ShipmentUpdate {
        id: Int
        reference: String
        destinataire: String
        transporteur: String
        date: String,
        list:[Int]
    }
    
    type Shipment {
        id: Int
        reference: String
        destinataire: String
        transporteur: String
        date: String,
        list:[Int]
    }
`);

var getShipment = (args) => {
    var id = args.id;
    return shipmentsData.filter(shipment => shipment.id == id)[0];
}

var getShipments = (args)=> {
    if(args.offset && args.limit){
        return shipmentsData.slice(args.offset, args.offset + args.limit)
    }else {
        return shipmentsData ;
    }
}

var updateShipment = function(args) {
    let newShipment = args.newShipment ;
    shipmentsData.filter(sh=> sh.id === args.id).map(shipment => {
        shipment.reference = newShipment.reference;
        shipment.date = newShipment.date;
        shipment.destinataire = newShipment.destinataire ;
        shipment.transporteur = newShipment.transporteur ;
    });
    return shipmentsData.filter(shipment => shipment.id === args.id) [0];
}

/*var newShipmentAdded = function(args) {
    let newShipment = {
        id : args.id,
        reference : args.reference,
        destinataire : args.destinataire
    }
    shipmentsData.push(newShipment) ;
    return shipmentsData ;
} */

var root = {
    shipment: getShipment,
    shipments: getShipments,
    updateShipment: updateShipment,
    newShipmentAdded : {
        newShipmentAdded :{
            subscribe : () => pubsub.asyncIterator('newShipmentAdded')
        }
    } 
};

// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));

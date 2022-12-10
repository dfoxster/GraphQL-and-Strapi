var { graphqlHTTP } = require('express-graphql');
var { buildSchema, assertInputType } = require('graphql');
var express = require('express');

// Construct a schema, using GraphQL schema language
var restaurants = [
  {
    "id": 1,
    "name": "WoodsHill ",
    "description": "American cuisine, farm to table, with fresh produce every day",
    "dishes": [
      {
        "name": "Swordfish grill",
        "price": 27
      },
      {
        "name": "Roasted Broccily ",
        "price": 11
      }
    ]
  },
  {
    "id": 2,
    "name": "Fiorellas",
    "description": "Italian-American home cooked food with fresh pasta and sauces",
    "dishes": [
      {
        "name": "Flatbread",
        "price": 14
      },
      {
        "name": "Carbonara",
        "price": 18
      },
      {
        "name": "Spaghetti",
        "price": 19
      }
    ]
  },
  {
    "id": 3,
    "name": "Karma",
    "description": "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    "dishes": [
      {
        "name": "Dragon Roll",
        "price": 12
      },
      {
        "name": "Pancake roll ",
        "price": 11
      },
      {
        "name": "Cod cakes",
        "price": 13
      }
    ]
  },
];

var maxRestaurantID = restaurants.length;

var schema = buildSchema(`
type Query{
  restaurant(id: Int): Restaurant
  restaurants: [Restaurant]
},
type Restaurant {
  id: Int
  name: String
  description: String
  dishes:[Dish]
}
type Dish{
  price: Int
  name: String
}
input DishInput {
  name: String
  price: Int
}
input RestaurantInput{
  id: Int
  name: String
  description: String
  dishes: [DishInput]
}
type DeleteResponse{
  ok: Boolean!
}
type Mutation{
  setRestaurant(input: RestaurantInput): Restaurant

  deleteRestaurant(id: Int!): DeleteResponse
  editRestaurant(id: Int!, data: RestaurantInput): Restaurant
}
`);
// The root provides a resolver function for each API endpoint


var root = {
  restaurant : (arg)=> {
    const index = restaurants.findIndex(item => item.id == arg.id);
    if (index < 0) {
        throw new Error("Restaurant doesn't exist");
    }
    else
        return restaurants[index];
},
  restaurants : ()=> restaurants,
  setRestaurant : ({input})=> {
    restaurants.push({id:++maxRestaurantID,name:input.name,description:input.description,dishes:input.dishes});
    return input
},
deleteRestaurant : ({id})=> {
  const index = restaurants.findIndex(item => item.id == id);
  const ok = Boolean(index > 0);
  if (ok) {
      let delr = restaurants[index];
      restaurants = restaurants.filter(item => item.id !== id);
      console.log(JSON.stringify(delr));
  }
  return {ok};
},
editRestaurant : ({id, ...restaurant}) => {
  const index = restaurants.findIndex(item => item.id == id);
  if( index < 0) {
      throw new Error("Restaurant doesn't exist");
  }
  restaurants[index] = {
      ...restaurants[index], ...restaurant.data
  }
  return restaurants[index];
}
}
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
var port = 5500
app.listen(5500,()=> console.log('Running Graphql on Port:'+port));
//import express
const express = require('express');
// import mangoose
const mongoose = require('mongoose');
// import the feed routes
const financesRoutes = require('./routes/finance_route');
const usersRoutes = require('./routes/user_route');
const shipmentRoutes = require('./routes/shipment_route');
// create the express app
const app = express();
// to parse incoming json
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Host');
  next();
});
app.use(express.json());
// forward any incoming request that starts with '/feed' to feedRoutes
app.use('/finances', financesRoutes);
app.use('/', usersRoutes);
app.use('/', shipmentRoutes);
// setup a database connection using mongoose
// past the connection string given from your atlas server
mongoose
  .connect(
    'mongodb+srv://user_base:strong.00@cluster0.o1jqdra.mongodb.net/?retryWrites=true&w=majority',
  )
  .then(result => {
    // listen to incoming requests on port 8080
    app.listen(3008, () => {
      console.log('Servidor Express rodando na porta 3008');
    });
  })
  .catch(err => console.log('err', err))
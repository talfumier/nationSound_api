import {Sequelize} from "sequelize";
import mongoose from "mongoose";
import express from "express";
import {defineMySqlModels} from "./models/mysqlModels.js";
import {environment} from "./config/environment.js";
import {routes} from "../api/index.js";

/*DEALING MITH MYSQL*/
const mySqlConnection = new Sequelize(
  environment.sql_db_name,
  environment.user,
  environment.userPwd,
  {
    dialect: "mysql",
    host: environment.sql_db_host,
    port: environment.sql_db_port,
    logging: false,
  }
);
//define models
const {Artist, Poi, Event} = defineMySqlModels(mySqlConnection); //all SQL models are defined but only 3 need to be returned for relationships
//define relationships
Artist.hasMany(Event, {foreignKey: "performer"});
Event.belongsTo(Artist, {foreignKey: "id"});
Poi.hasMany(Event, {foreignKey: "location"});
Event.belongsTo(Poi, {foreignKey: "id"});

let flg = 0; //error flag if any
mySqlConnection
  .authenticate()
  .then(() => {
    flg += 1; //indicates a successful connection
    console.log("[API]: successfully connected to MySQL server !");
    return mySqlConnection.sync({alter: true}); //returned promise should sync all tables and models, alter=true means update tables where actual model definition has changed
  })
  .then(() => {
    console.log("[API]: MySQL tables and models successfully synced !");
  })
  .catch((err) => {
    // at this stage, one error has occured
    let msg = "";
    switch (flg) {
      case 0: //connection failure
        msg = "[API]: failed to connect to MySQL server !";
        break;
      case 1: //connection succeeded but sync operation has failed
        msg = "[API]: MySQL tables and models syncing failed !";
    }
    console.log(msg, err.message);
  });
/*DEALING WITH MONGO DB*/
mongoose
  .connect(
    environment.mongo_db_connection
      .replace("user", environment.user)
      .replace("pwd", environment.userPwd)
  )
  .then(() => {
    console.log("[API]: successfully connected to MongoDB server !");
  })
  .catch((err) => {
    console.log("[API]: failed to connect to MongoDB server !", err.message);
  });
/*DEALING WITH EXPRESS*/
const app = express();
routes(app); //request pipeline including error handling

const port = process.env.PORT || 8000;
app.listen(port, () => {
  return console.log(
    `[API]: ${
      environment.production ? "production" : "development"
    } server is listening on port ${port} 🚀`
  );
});

require('dotenv').config()
const path = require('path');
const express = require('express');
const { createServer } = require('node:http');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');
const { Server } = require('socket.io');

const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// async function main(){

  //Socket IO 
  // const io = new Server()
  const app = express();

  const PORT = process.env.PORT || 3001;
  
  // Set up Handlebars.js engine with custom helpers
  const hbs = exphbs.create({ helpers });
  
  const sess = {
    secret: process.env.SESS_SECRET,
    cookie: {
      maxAge: 300000,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    },
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize
    })
  };
  
  app.use(session(sess));
  
  // Inform Express.js on which template engine to use
  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use(routes);
  
  // creating new http server 
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  io.on("connection", (socket)=>{
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
    });
  })
  sequelize.sync({ force: false }).then(() => {
    // app.listen(PORT, () => console.log('Now listening'));
    httpServer.listen(PORT,() => console.log(`Now listening at http://localhost:${PORT}`))  
  });
  
// }

// main();
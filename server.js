const http = require("http"); // standard http server
const express = require("express"); // express library
const fetch = require("node-fetch");
const cors = require('cors'); // cors middleware to have a great API experience
const path = require("path"); // express has a method for using local path. but now.sh doesn't like it.
const app = express(); // Express server (we seperate to introduce middleware) you could also do: app = require("express")()
const port = process.env.PORT || 5000; // use any port you want or use a enviromental PORT variable
const bodyParser = require('body-parser'); // to parse "POST"
app.use(bodyParser.urlencoded({ extended: false })); // Part of "parsing POST"
app.use(express.json()); // Now express no longer needs the body-parser middleware and has it's own.
app.use(cors()); // For APIS this allows CORS access

let cryptoReply = [];
let LastRequestedTime = new Date();
let FIVE_MIN=5*60*1000;

// root. when accessing http://localhost:5000
app.get("/",async (req,res)=> {
    let CurrentRequestTime = new Date();
    if (cryptoReply.length == 0 || ((CurrentRequestTime - LastRequestedTime) > FIVE_MIN)) {
      console.log("it's been 5 minutes")
      cryptoReply = [];
      cryptoReply.push(await getCoinbasePrice("BTC"));
      cryptoReply.push(await getCoinbasePrice("BSV"));
      cryptoReply.push(await getCoinbasePrice("BCH"));
      cryptoReply.push(await getCoinbasePrice("ETH"));
      cryptoReply.push(await getDogeCoinPrice());
    } else { console.log("not 5 minute")}

    res.json(cryptoReply);
  });


let getCoinbasePrice = async (cur) =>  {
    let url = `https://api.coinbase.com/v2/prices/${cur}-USD/spot`;
    let headers =  { 'Content-Type': 'application/json'};
    return await fetch(url,{headers:headers})
    .then(res => res.json())
    .then(json => {console.log(json.data); return {symbol: cur, price:twoDigits(json.data.amount.toLocaleString())}; });
}

let getDogeCoinPrice = async () =>  {
  let url = `https://sochain.com//api/v2/get_price/DOGE/USD`;
  let headers =  { 'Content-Type': 'application/json'};
  return await fetch(url,{headers:headers})
  .then(res => res.json())
  .then(json => {return {symbol: "doge", price:twoDigits(json.data.prices[0].price.toLocaleString())}; });
}



function twoDigits(num) {
  return (Math.round(num * 100) / 100).toLocaleString();
  }

// start the web server.
let server = http.createServer(app);
server.listen(port);
console.log("http server listening on http://localhost:%d", port); // this is a good idea and will remind you which port it's listening to.

/*
    IMPORTANTE
    
    Para cuando hagamos la web de verdad, hay que pensar bien el sistema de números, porque si hablasemos de dinero real
    con el sistema actual de redondear y dividir sin importar el resto y demás se pierde dinero y hay problemas de exactitud.
*/

let price = null;
let lastPrice = null;

let usd = 0;
let btc = 1;

let ws = null;

const priceText = document.getElementById("price");
const usdtext = document.getElementById("usd");
const btcText = document.getElementById("btc");
const title = document.getElementById("title");

const buyButton = document.getElementById("buyButton");
const sellButton = document.getElementById("sellButton");

const buyInput = document.getElementById("buyInput");
const sellInput = document.getElementById("sellInput");

document.getElementById("yearSpan").innerText = new Date().getFullYear();

buyButton.onclick = buyBitcoin;
sellButton.onclick = sellBitcoin;

function connectBinance() {
  console.log("Trying to make connection to Binance...");
  ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
  ws.onmessage = (event) => {
    let stockObject = JSON.parse(event.data);

    price = parseFloat(stockObject.p);
    displayPrice();
  };

  ws.onclose = function () {
    console.log("Connection to Binance lost...");
    setTimeout(function () {
      connectBinance();
    }, 5000);
  };
}

function getPrice() {
  return price === null ? "-" : price.toFixed(2);
}

function displayPrice() {
  priceText.style.color =
    !lastPrice || lastPrice === price
      ? "black"
      : price > lastPrice
        ? " green"
        : "red";
  priceText.textContent = "Bitcoin: " + getPrice() + " $";
  title.textContent = "BTCUSD " + getPrice();
  lastPrice = price;
}

function displayMoney() {
  usdtext.textContent = "Saldo dólares: " + usd.toFixed(2) + " $";
  btcText.textContent = "Saldo Bitcoin: " + btc.toFixed(8) + " BTC";
}

function buyBitcoin() {
  if (price !== null) {
    amount = parseFloat(buyInput.value);

    if (!isNaN(amount)) {
      amount = amount.toFixed(2);
      if (amount > 0) {
        if (amount <= parseFloat(usd.toFixed(2))) {
          usd -= amount;
          btc += parseFloat((amount / price).toFixed(8));

          displayMoney();
        } else {
          alert("Saldo de dólares insuficiente.");
        }
      } else {
        alert("La cantidad a comprar debe ser mayor a 0.");
      }
    } else {
      alert("Has introducido una cantidad inválida de dólares.");
    }
  }

  buyInput.value = "";
}

function sellBitcoin() {
  if (price !== null) {
    amount = parseFloat(sellInput.value);

    if (!isNaN(amount)) {
      amount = amount.toFixed(8);
      if (amount > 0) {
        if (amount <= parseFloat(btc.toFixed(8))) {
          btc -= amount;
          usd += parseFloat((amount * price).toFixed(2));

          displayMoney();
        } else {
          alert("Saldo de Bitcoin insuficiente.");
        }
      } else {
        alert("La cantidad a comprar debe ser mayor a 0.");
      }
    } else {
      alert("Has introducido una cantidad inválida de Bitcoin.");
    }
  }

  sellInput.value = "";
}

connectBinance();
displayPrice();
displayMoney();

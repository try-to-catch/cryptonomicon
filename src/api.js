const API_KEY =
  "332085343d8a65df11a3cd19b5de67a1eec48fca7b634bf58c2f8e77a8e7c88d";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

socket.addEventListener("message", (e) => {
  const parsedData = JSON.parse(e.data);
  const { TYPE: code, FROMSYMBOL: tickerName, PRICE: newPrice } = parsedData;

  if (code === "5" && newPrice !== undefined) {
    const handlers = tickersHandlers.get(tickerName);
    handlers.forEach((fn) => fn(newPrice));
  }
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) ?? [];
  const message = {
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  };

  tickersHandlers.set(ticker, [...subscribes, cb]);

  sendToWebSocket(message);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);

  const message = {
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  };

  sendToWebSocket(message);
};

export const getAllCurrencies = async () => {
  const allCurrenciesData = await (
    await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    )
  ).json();

  return allCurrenciesData.Data;
};

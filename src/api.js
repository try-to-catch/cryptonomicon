const API_KEY =
  "332085343d8a65df11a3cd19b5de67a1eec48fca7b634bf58c2f8e77a8e7c88d";

const tickersHandlers = new Map();

export const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?api_key=${API_KEY}&tsyms=USD&fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}`
  )
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribes = tickersHandlers.get(ticker) ?? [];

  tickersHandlers.set(ticker, [...subscribes, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

export const getAllCurrencies = async () => {
  const allCurrenciesData = await (
    await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    )
  ).json();

  return allCurrenciesData.Data;
};

setInterval(loadTickers, 5000);

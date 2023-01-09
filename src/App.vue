<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      :class="{
        hidden: !isPageLoading,
      }"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-ticker
        @add-ticker="addNewTicker"
        :possibleCurrencies="possibleCurrencies"
        :selectedTickers="tickerList"
      />
      <hr class="w-full border-t border-gray-600 my-4" />

      <section>
        <span>Фильтр</span>
        <input v-model="filter" @input="page = 1" type="text" class="mx-2" />

        <div>
          <button
            type="button"
            @click="page -= 1"
            v-if="page > 1"
            class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>

          <button
            type="button"
            @click="page += 1"
            v-if="hasNextPage"
            class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
        </div>
      </section>

      <template v-if="tickerList.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in paginatedTickers"
            :key="ticker.name"
            @click="selectedTicker = ticker"
            :class="{
              'border-4': selectedTicker === ticker,
              'bg-red-100': ticker.price === '-',
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(ticker.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="deleteTicker(ticker)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <currency-graph
        @close-graph="selectedTicker = ''"
        :currency="selectedTicker.name"
        :graphList="graphList"
      />
    </div>
  </div>
</template>

<script>
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  getAllCurrencies,
} from "./api";
import AddTicker from "./components/AddTicker.vue";
import CurrencyGraph from "./components/CurrencyGraph.vue";

export default {
  name: "App",
  components: {
    AddTicker,
    CurrencyGraph,
  },
  data() {
    return {
      ticker: "",
      filter: "",

      tickerList: [],
      graphList: [],
      possibleCurrencies: [],

      isPageLoading: false,

      selectedTicker: "",

      page: 1,
      currencyPerPage: 6,
    };
  },
  computed: {
    startIndex() {
      return (this.page - 1) * this.currencyPerPage;
    },

    endIndex() {
      return this.currencyPerPage * this.page;
    },

    filteredTickers() {
      return this.tickerList.filter((ticker) => {
        return ticker.name.includes(this.filter);
      });
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  created: async function () {
    this.isPageLoading = true;

    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["page", "filter"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickerList = JSON.parse(tickersData);

      this.tickerList.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice) => {
          this.updateTicker(ticker.name, newPrice);
        });
      });
    }

    const data = await getAllCurrencies();

    for (let item in data) {
      this.possibleCurrencies.push(data[item].Symbol);
    }
    this.isPageLoading = false;
  },

  methods: {
    formatPrice(price) {
      if (price == "-") {
        return price;
      }

      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    async updateTicker(tickerName, price) {
      this.tickerList
        .filter((ticker) => ticker.name === tickerName)
        .forEach((t) => (t.price = price));

      if (this.selectedTicker?.name == tickerName) {
        this.graphList.push(price);
      }
    },

    addNewTicker(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase(),
        price: "-",
      };

      this.filter = "";

      this.tickerList = [currentTicker, ...this.tickerList];

      subscribeToTicker(currentTicker.name, (newPrice) => {
        this.updateTicker(currentTicker.name, newPrice);
      });
    },

    deleteTicker(ticker) {
      this.tickerList = this.tickerList.filter((t) => t !== ticker);

      unsubscribeFromTicker(ticker);

      if (this.selectedTicker?.name == ticker.name) {
        this.selectedTicker = "";
      }
    },
  },

  watch: {
    filter: function () {
      this.page = 1;
    },

    pageStateOptions: function (value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },

    selectedTicker: function () {
      this.graphList = [];
    },

    tickerList() {
      localStorage.setItem(
        "cryptonomicon-list",
        JSON.stringify(this.tickerList)
      );
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
  },
};
</script>

<style src="./app.css"></style>

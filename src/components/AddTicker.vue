<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>

        <suggested-currencies
          @selected-currency="addSelectedCurrency"
          :possibleCurrencies="possibleCurrencies"
          :ticker="ticker"
        />

        <div v-if="isCurrencyExist" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button @click="add" />
  </section>
</template>

<script>
import AddButton from "./AddButton"; //check without .vue
import SuggestedCurrencies from "./SuggestedCurrencies"; //check without .vue

export default {
  name: " AddTicker",

  components: {
    AddButton,
    SuggestedCurrencies,
  },

  props: {
    possibleCurrencies: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },

    selectedTickers: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0,
    "ticker-input-change": (value) => typeof value === "string",
  },

  data() {
    return {
      ticker: "",
      isCurrencyExist: false,
      selectedCurrencies: [],
    };
  },

  methods: {
    add() {
      if (
        this.ticker.length &&
        this.possibleCurrencies.includes(this.ticker.toUpperCase()) &&
        !this.isCurrencyExist
      ) {
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
      }
    },

    addSelectedCurrency(currency) {
      this.ticker = currency;
      this.add();
    },
  },
  watch: {
    ticker() {
      this.isCurrencyExist = this.selectedCurrencies.includes(
        this.ticker.toUpperCase()
      );
    },
    selectedTickers() {
      this.selectedCurrencies = this.selectedTickers.map(
        (ticker) => ticker.name
      );
    },
  },
};
</script>

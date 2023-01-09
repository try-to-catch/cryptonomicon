<template>
  <div
    v-if="suggestedCurrencies.length"
    class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
  >
    <span
      v-for="currency in suggestedCurrencies"
      :key="currency"
      @click="selectedCurrency(currency)"
      class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
    >
      {{ currency }}
    </span>
  </div>
</template>

<script>
export default {
  name: "SuggestedCurrencies",

  props: {
    possibleCurrencies: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },

    ticker: {
      type: String,
      required: true,
      default: "",
    },
  },

  emits: {
    "selected-currency": (value) => typeof value === "string",
  },

  computed: {
    suggestedCurrencies() {
      if (this.ticker) {
        return this.possibleCurrencies
          .filter((coin) => {
            return String(coin).includes(this.ticker.toUpperCase());
          })
          .slice(0, 4);
      }
      return [];
    },
  },

  methods: {
    selectedCurrency(currency) {
      this.$emit("selected-currency", currency);
    },
  },
};
</script>

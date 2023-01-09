<template>
  <section class="relative" v-if="currency">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ currency }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        :style="{
          height: bar + '%',
          width: graphWidth + 'px',
        }"
        class="bg-purple-800 border"
      ></div>
    </div>
    <CloseButton @click="closeGraph" />
  </section>
</template>

<script>
import CloseButton from "./CloseButton";
export default {
  name: "CurrencyGraph",

  components: {
    CloseButton,
  },
  props: {
    currency: {
      type: String,
      required: true,
      default: "",
    },
    graphList: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
  },

  data() {
    return {
      graphWidth: 38,
      maxGraphElements: 0,
    };
  },

  mounted: function () {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },

  beforeUnmount: function () {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },

  computed: {
    normalizedGraph() {
      const [min, max] = [
        Math.min(...this.graphList),
        Math.max(...this.graphList),
      ];

      return this.splicedGraph.map((price) => {
        if (min === max) {
          return 50;
        }
        return 5 + ((price - min) / (max - min)) * 95;
      });
    },

    splicedGraph() {
      const offset = this.graphList.length - this.maxGraphElements;
      if (offset > 0) {
        return this.graphList.slice(offset);
      }
      return this.graphList;
    },
  },
  methods: {
    calculateMaxGraphElements() {
      if (this.$refs.graph) {
        this.maxGraphElements = Math.round(
          this.$refs.graph.clientWidth / this.graphWidth
        );
      }
    },
    closeGraph() {
      this.$emit("close-graph");
    },
  },

  watch: {
    currency() {
      this.$nextTick().then(this.calculateMaxGraphElements);
    },
    //   maxGraphElements() {},
  },
};
</script>

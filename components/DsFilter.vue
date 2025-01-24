<template>
    <v-menu v-model="show" :close-on-content-click="false" offset-x tile>
      <template #activator="{ attrs, on }">
        <span v-bind="attrs" v-on="on" class="filter-trigger">
          {{ name }}
          <v-badge v-if="selected.length" class="badge" :content="selected.length" 
            offset-y="5" offset-x="9" color="orange" dark>
            <v-icon small color="error">{{mdiFilter}}</v-icon>
          </v-badge>
          <v-icon v-else small>{{mdiFilter}}</v-icon>
        </span>
      </template>
      <v-autocomplete 
        v-model="selected"
        :items="formattedItems"
        clearable
        dark
        color="error"
        class="autocomplete"
        hide-details
        autofocus
        multiple
        dense
        @focus="$event.target.click()"
        style="max-width:200px;"
      />
    </v-menu>
</template>

<script>
import { mdiFilter } from '@mdi/js'
export default {
    name: 'DsFilter',
    props: {
      inItems: {
        type: Array,
        default: () => [],
      },
      name: {
        type: String,
        required: true,
      },
    },
    watch: {
      selected(n) {
        this.$emit('changed', n)
      },
    },
    data() {
      return {
        show: false,
        selected: [],
        mdiFilter,
      }
    },
    computed: {
        formattedItems() {
            return this.inItems.map(item => {
                if (item === null || item === '') return 'N/A';
                return item.toString();
            });
        }
    },
    methods: {
      reset() {
        this.selected = [];
        this.$emit('changed', []);
      }
    }
}
</script>

<style scoped>
.filter-trigger {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    transition: background-color 0.2s;
}

.filter-trigger:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.badge {
    margin-left: 4px;
}

.autocomplete {
    padding: 8px;
    min-width: 200px;
}

::v-deep .v-input__slot {
    background-color: transparent !important;
}
</style>

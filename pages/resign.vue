<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="5" width="100%" :loading="loading">
                <v-app-bar color="teal darken-4" dense dark class="px-2">
                    <v-toolbar-title>
                        <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                        {{ $t("Resignation listing") }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-col cols="2" class="px-2">
                        <v-text-field v-model="search" append-icon="mdi-magnify" :label="$t('Search')" outlined dense
                            hide-details clearable class="search-field"></v-text-field>
                    </v-col>
                    <v-btn dark class="ml-2 btn-hover" color="error" @click="dialog = true">
                        <v-icon left>mdi-plus</v-icon>
                        {{ $t("Input resign") }}
                    </v-btn>
                    <v-btn dark class="ml-2 btn-hover" color="success" to="/resign-report">
                        <v-icon left>mdi-export</v-icon>
                        {{ $t("Report") }}
                    </v-btn>
                    <v-menu v-model="menuOpen" offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn dark class="ml-2 btn-hover" color="primary" v-bind="attrs" v-on="on">
                                <v-icon left>mdi-eye</v-icon>
                                {{ $t("Toggle Columns") }}
                            </v-btn>
                        </template>
                        <v-list dense>
                            <v-list-item @click.stop>
                                <v-list-item-action>
                                    <v-checkbox
                                        v-model="selectAll"
                                        @change="toggleAllColumns"
                                        hide-details
                                        dense
                                    ></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t("Select All") }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item 
                                v-for="header in headers" 
                                :key="header.value"
                                @click.stop
                            >
                                <v-list-item-action>
                                    <v-checkbox
                                        v-model="visibleColumns"
                                        :value="header.value"
                                        hide-details
                                        dense
                                        multiple
                                    ></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t(header.text) }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-app-bar>
                <v-card-text>
                    <v-row dense class="mb-2">
                        <v-col cols="1">
                            <v-select v-model="filters.deptid" :items="deptOptions" item-text="text" item-value="value"
                                :label="$t('Dept')" outlined dense clearable hide-details
                                ></v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-select v-model="filters.reason" :items="localizedReasonOptions" :label="$t('Reasons')"
                                item-text="text" item-value="value" outlined dense clearable hide-details
                                ></v-select>
                        </v-col>
                        <v-col cols="1">
                            <v-select v-model="filters.age" :items="ageRanges" :label="$t('Age')" outlined dense
                                clearable hide-details ></v-select>
                        </v-col>
                        <v-col cols="1">
                            <v-select v-model="filters.seniority" :items="seniorityRanges" :label="$t('Seniority')"
                                outlined dense clearable hide-details ></v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-select v-model="filters.position" :items="positionOptions" item-text="text"
                                item-value="value" :label="$t('Position')" outlined dense clearable hide-details
                                ></v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-menu v-model="dateMenu" :close-on-content-click="false" max-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field :value="formatDateRange" :label="$t('Resignation Date')" readonly
                                        v-bind="attrs" v-on="on" outlined dense clearable hide-details
                                        @click:clear="clearDateRange"></v-text-field>
                                </template>
                                <v-date-picker v-model="filters.dateRange" range 
                                    header-color="teal darken-4" color="teal darken-4"
                                    :locale="$i18n.locale == 'cn' ? 'zh' : $i18n.locale"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="3">
                            <v-btn color="error" dark @click="clearFilters" outlined>
                                <v-icon left>mdi-filter-remove</v-icon>
                                {{ $t("Clear filters") }}
                            </v-btn>
                            <v-btn color="primary" dark @click="printData" outlined class="ml-2">
                                <v-icon left>mdi-printer</v-icon>
                                {{ $t("Print") }}
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-data-table 
                        :headers="visibleHeaders" 
                        :items="filteredData"
                        :items-per-page="10" 
                        :loading="loading"
                        :search="search"
                        :custom-filter="filterBy"
                        loading-text="Loading data... Please wait" class="elevation-3 data-table" :footer-props="{
                            'items-per-page-options': [10, 25, 50, -1],
                            'items-per-page-text': 'Rows per page:'
                        }">
                        <template v-slot:[`item.action`]="{ item }">
                            <v-btn icon color="teal darken-4" @click="editDataResign(item)">
                                <v-icon color="error">mdi-square-edit-outline</v-icon>
                            </v-btn>
                        </template>
                        <template v-slot:[`item.er_name`]="{ item }">
                            <span class="name-link" @click="editDataResign(item)">
                                {{ item.er_name }}
                            </span>
                        </template>
                        <template v-slot:[`item.er_reason`]="{ item }">
                            {{ getLocalizedReason(item.er_reason) }}
                        </template>
                        <template v-slot:[`item.er_indate`]="{ item }">
                            <v-chip small label color="success" outlined>
                                {{ item.er_indate }}
                            </v-chip>
                        </template>

                        <template v-slot:[`item.er_resigndate`]="{ item }">
                            <v-chip small label color="error" outlined>
                                {{ item.er_resigndate }}
                            </v-chip>
                        </template>
                        <template v-slot:[`item.er_type_resign`]="{ item }">
                            {{ getLocalizedTypeResign(item.er_reason) }}
                        </template>
                        <template #[`footer.prepend`]>
                            <v-btn color="success" dark @click="exportExcel">
                                <v-icon left>mdi-file-excel</v-icon>
                                {{ $t("Export to Excel") }}
                            </v-btn>
                        </template>
                        <template v-slot:[`header.er_empid`]="{ header }">
                            {{ $t("Empno") }}
                        </template>
                        <template v-slot:[`header.er_name`]="{ header }">
                            {{ $t("Name") }}
                        </template>
                        <template v-slot:[`header.er_deptid`]="{ header }">
                            {{ $t("Dept") }}
                        </template>
                        <template v-slot:[`header.er_indate`]="{ header }">
                            {{ $t("In date") }}
                        </template>
                        <template v-slot:[`header.er_deptname`]="{ header }">
                            {{ $t("Dept name") }}
                        </template>
                        <template v-slot:[`header.er_joblevel`]="{ header }">
                            {{ $t("Job level") }}
                        </template>
                        <template v-slot:[`header.er_age`]="{ header }">
                            {{ $t("Age") }}
                        </template>
                        <template v-slot:[`header.er_seniority`]="{ header }">
                            {{ $t("Seniority") }}
                        </template>
                        <template v-slot:[`header.er_bus`]="{ header }">
                            {{ $t("Bus") }}
                        </template>
                        <template v-slot:[`header.er_gender`]="{ header }">
                            {{ $t('Gender') }}
                        </template>
                        <template v-slot:[`header.er_hometown`]="{ header }">
                            {{ $t('Home town') }}
                        </template>
                        <template v-slot:[`header.er_reason`]="{ header }">
                            {{ $t('Reasons') }}
                        </template>
                        <template v-slot:[`header.er_note`]="{ header }">
                            {{ $t('Note') }}
                        </template>
                        <template #[`header.er_resigndate`]>
                            <DsFilter :name="$t('Resign date')" :in-items="filterItems.er_resigndate"
                                @changed="updateFilter('er_resigndate', $event)" />
                        </template>

                        <template v-slot:[`header.action`]="{ header }">
                            {{ $t('Action') }}
                        </template>
                        <template v-slot:[`header.er_numberid`]="{ header }">
                            {{ $t('IC no') }}
                        </template>
                        <template #[`header.er_empid`]>
                            <DsFilter :name="$t('Empno')" :in-items="filterItems.er_empid"
                                @changed="updateFilter('er_empid', $event)" />
                        </template>

                        <template #[`header.er_name`]>
                            <DsFilter :name="$t('Name')" :in-items="filterItems.er_name"
                                @changed="updateFilter('er_name', $event)" />
                        </template>

                        <template #[`header.er_deptid`]>
                            <DsFilter :name="$t('Dept')" :in-items="filterItems.er_deptid"
                                @changed="updateFilter('er_deptid', $event)" />
                        </template>

                        <template #[`header.er_indate`]>
                            <DsFilter :name="$t('In date')" :in-items="filterItems.er_indate"
                                @changed="updateFilter('er_indate', $event)" />
                        </template>

                        <template #[`header.er_deptname`]>
                            <DsFilter :name="$t('Dept name')" :in-items="filterItems.er_deptname"
                                @changed="updateFilter('er_deptname', $event)" />
                        </template>

                        <template #[`header.er_joblevel`]>
                            <DsFilter :name="$t('Job level')" :in-items="filterItems.er_joblevel"
                                @changed="updateFilter('er_joblevel', $event)" />
                        </template>

                        <template #[`header.er_age`]>
                            <DsFilter :name="$t('Age')" :in-items="filterItems.er_age"
                                @changed="updateFilter('er_age', $event)" />
                        </template>

                        <template #[`header.er_seniority`]>
                            <DsFilter :name="$t('Seniority')" :in-items="filterItems.er_seniority"
                                @changed="updateFilter('er_seniority', $event)" />
                        </template>

                        <template #[`header.er_bus`]>
                            <DsFilter :name="$t('Bus')" :in-items="filterItems.er_bus"
                                @changed="updateFilter('er_bus', $event)" />
                        </template>

                        <template #[`header.er_gender`]>
                            <DsFilter :name="$t('Gender')" :in-items="filterItems.er_gender"
                                @changed="updateFilter('er_gender', $event)" />
                        </template>

                        <template #[`header.er_hometown`]>
                            <DsFilter :name="$t('Home town')" :in-items="filterItems.er_hometown"
                                @changed="updateFilter('er_hometown', $event)" />
                        </template>

                        <template #[`header.er_reason`]>
                            <DsFilter :name="$t('Reasons')" :in-items="filterItems.er_reason"
                                @changed="updateFilter('er_reason', $event)" />
                        </template>

                        <template #[`header.er_note`]>
                            <DsFilter :name="$t('Note')" :in-items="filterItems.er_note"
                                @changed="updateFilter('er_note', $event)" />
                        </template>

                        <template #[`header.er_numberid`]>
                            <DsFilter :name="$t('IC no')" :in-items="filterItems.er_numberid"
                                @changed="updateFilter('er_numberid', $event)" />
                        </template>
                        <!-- er_type_resign -->
                        <template #[`header.er_type_resign`]>
                            <DsFilter :name="$t('Type resign')" :in-items="filterItems.er_type_resign"
                                @changed="updateFilter('er_type_resign', $event)" />
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-col>
        <v-dialog v-model="dialog" max-width="900px">
            <v-card class="resign-dialog">
                <v-card-title class="headline py-4 teal darken-4 white--text">
                    <v-icon large left color="white">mdi-account-arrow-right</v-icon>
                    {{ $t("Input Resignation") }}
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text class="pt-6">
                    <v-form ref="form" v-model="valid">
                        <v-row>
                            <v-col cols="12">
                                <div class="text-h6 mb-4">
                                    <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                                    <span class="text-h6">[{{ $t("Personal Information") }}]</span>
                                </div>
                                <v-row dense>
                                    <v-col cols="2">
                                        <v-text-field v-model="displayEmpno" v-mask="'######'" outlined dense
                                            hide-details="auto" :rules="empnoRules" :error-messages="empnoErrorMessage" :label="$t('Empno')"
                                            @change="checkEmpno()" prepend-inner-icon="mdi-card-account-details"
                                            autofocus></v-text-field>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field v-model="name" :label="$t('Full Name')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="numid" :label="$t('Numid')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="gender" :items="itemGender" :label="$t('Gender')" outlined
                                            dense disabled hide-details="auto"></v-select>
                                    </v-col>
                                    <v-col cols="1">
                                        <v-text-field v-model="age" :label="$t('Age')" outlined dense
                                            hide-details="auto" disabled type="number"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="12">
                                <div class="text-h6 mb-4">
                                    <v-icon color="amber darken-2" class="mr-2">mdi-briefcase</v-icon>
                                    <span class="text-h6">[{{ $t("Work Information") }}]</span>
                                </div>
                                <v-row dense>
                                    <v-col cols="4">
                                        <v-text-field v-model="inDate" :label="$t('In date')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="dept" :label="$t('Dept')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="deptName" :label="$t('Dept name')" outlined dense
                                            disabled hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="position" :label="$t('Position')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="seniority" :label="$t('Seniority (Years)')" outlined
                                            dense disabled hide-details="auto" type="number"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-select v-model="vehicle" :items="['Tự túc', 'Xe đưa rước']"
                                            :label="$t('Vehicle')" outlined dense hide-details="auto"
                                            :rules="vehicleRules" clearable></v-select>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="hometown" :label="$t('Hometown')" outlined dense disabled
                                            hide-details="auto"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="address" :label="$t('Current Address')" outlined dense
                                            disabled hide-details="auto"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <v-col cols="12">
                                <div class="text-h6 mb-4">
                                    <v-icon color="red darken-2" class="mr-2">mdi-exit-run</v-icon>
                                    <span class="text-h6">[{{ $t("Resignation Details") }}]</span>
                                </div>
                                <v-row dense>
                                    <v-col cols="3">
                                        <v-menu v-model="birthMenu" :close-on-content-click="false">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-text-field v-model="dateResign" :label="$t('Resignation Date')"
                                                    readonly v-bind="attrs" v-on="on" outlined dense :rules="dateRules"
                                                    hide-details="auto"
                                                    prepend-inner-icon="mdi-calendar"></v-text-field>
                                            </template>
                                            <v-date-picker v-model="dateResign" @input="birthMenu = false"
                                                header-color="teal darken-4" color="teal darken-4"
                                                :locale="$i18n.locale == 'cn' ? 'zh' : $i18n.locale">
                                            </v-date-picker>
                                        </v-menu>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-select v-model="reason" :items="localizedReasons"
                                            :label="$t('Reason for Resignation')" outlined dense hide-details="auto"
                                            :rules="reasonRules"></v-select>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field 
                                            v-model="localizedTypeResign" 
                                            :label="$t('Type resign')" 
                                            outlined 
                                            dense 
                                            clearable
                                            hide-details="auto" 
                                            disabled
                                        ></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="note" :label="$t('Additional Notes')" outlined dense clearable
                                            hide-details="auto" rows="3"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-4">
                    <v-btn color="error" text dark @click="dialog = false" :disabled="saving" outlined>
                        <v-icon left>mdi-close</v-icon>
                        {{ $t("Cancel") }}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="teal darken-4" dark @click="saveResign" :loading="saving" class="px-4">
                        <v-icon left>mdi-content-save</v-icon>
                        {{ $t("Save") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import DSFilter from '@/components/DsFilter.vue'
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { mask } from 'v-mask'

export default {
    directives: {
        mask
    },
    components: { DSFilter },
    data() {
        return {
            search: '', 
            api: 'http://gmo021.cansportsvg.com/api/aw-recuitingReport/',
            today: dayjs().format('YYYY-MM-DD'),
            dialog: false,
            saving: false,
            loading: false,
            birthMenu: false,
            dateMenu: false,
            menuOpen: false, // Add this to control menu state
            filters: {
                text: '',
                columns: {
                    er_empid: [],
                    er_name: [],
                    er_numberid: [],
                    er_indate: [],
                    er_resigndate: [],
                    er_deptid: [],
                    er_deptname: [],
                    er_joblevel: [],
                    er_age: [],
                    er_seniority: [],
                    er_bus: [],
                    er_gender: [],
                    er_hometown: [],
                    er_reason: [],
                    er_note: [],
                    er_type_resign: []
                }
            },
            ageRanges: [
                '18-25',
                '26-35',
                '36-45',
                '46+'
            ],
            seniorityRanges: [
                '0-1',
                '1-3',
                '3-5',
                '5+'
            ],
            reasons: [], // Đảm bảo khởi tạo mảng rỗng
            filterItems: {
                er_empid: [],
                er_name: [],
                er_numberid: [],
                er_indate: [],
                er_resigndate: [],
                er_deptid: [],
                er_deptname: [],
                er_joblevel: [],
                er_age: [],
                er_seniority: [],
                er_bus: [],
                er_gender: [],
                er_hometown: [],
                er_reason: [],
                er_note: [],
                er_type_resign: []

            },
            id: '',
            empno: '',
            name: '',
            gender: '',
            age: null,
            dept: '',
            deptName: '',
            position: '',
            seniority: null,
            vehicle: '',
            dateResign: '',
            hometown: '',
            address: '',
            reason: '',
            note: '',
            inDate: '',
            itemGender: ['Nam', 'Nữ'],
            type_resign: '',
            localizedTypeResign: '',
            empnoRules: [
                v => !!v || 'Employee number is required',
                v => v.length === 6 || 'Employee number must be 6 digits',
                v => !this.isEmployeeExists || this.$t('Employee already exists in resignation list')
            ],
            dateRules: [
                v => !!v || 'Resignation date is required',
            ],
            reasonRules: [v => !!v || 'Reason is required'],
            vehicleRules: [v => !!v || 'Vehicle is required'],
            valid: false,
            headers: [
                { text: 'Empno', value: 'er_empid', sortable: false },
                { text: 'Name', value: 'er_name', class: 'clickable-cell', sortable: false }, 
                { text: 'In date', value: 'er_indate', sortable: false },
                { text: 'Resign date', value: 'er_resigndate', sortable: false },
                { text: 'IC no', value: 'er_numberid', sortable: false },
                { text: 'Dept', value: 'er_deptid', sortable: false },
                { text: 'Dept name', value: 'er_deptname', sortable: false },
                { text: 'Job level', value: 'er_joblevel', sortable: false }, 
                { text: 'Age', value: 'er_age', sortable: false, align: 'center' }, 
                { text: 'Seniority', value: 'er_seniority', sortable: false, align: 'center' },
                { text: 'Bus', value: 'er_bus', sortable: false },
                { text: 'Gender', value: 'er_gender', sortable: false },
                { text: 'Home town', value: 'er_hometown', sortable: false },
                { text: 'Reasons', value: 'er_reason', sortable: false },
                {text: 'Type resign', value: 'er_type_resign', sortable: false },
                { text: 'Note', value: 'er_note', sortable: false },
                { text: 'Action', value: 'action', sortable: false },
            ],
            data: [],
            resignData: [],
            numid: '',
            visibleColumns: [], // Will store visible column values
            selectAll: true,
        }
    },
    computed: {
        formatDateRange() {
            if (!this.filters.dateRange || this.filters.dateRange.length !== 2) return '';
            return `${this.filters.dateRange[0]} ~ ${this.filters.dateRange[1]}`;
        },
        filteredData() {
            let data = [...this.resignData];
            
            // Apply search filter if exists
            if (this.search) {
              const searchTerm = this.normalizeText(this.search);
              data = data.filter(item => {
                return Object.entries(item).some(([key, value]) => {
                  // Handle special cases
                  if (key === 'er_reason') {
                    return this.normalizeText(this.getLocalizedReason(value)).includes(searchTerm);
                  }
                  if (key === 'er_type_resign') {
                    return this.normalizeText(this.getLocalizedTypeResign(item.er_reason)).includes(searchTerm);
                  }
                  return this.normalizeText(String(value)).includes(searchTerm);
                });
              });
            }
        
            // Apply column filters
            if (this.filters.columns) {
              Object.entries(this.filters.columns).forEach(([column, filterValues]) => {
                if (filterValues && filterValues.length > 0) {
                  data = data.filter(item => {
                    // Special handling for reason and type_resign
                    if (column === 'er_reason') {
                      const localizedReason = this.normalizeText(this.getLocalizedReason(item[column]));
                      return filterValues.some(value => this.normalizeText(value).includes(localizedReason));
                    }
                    if (column === 'er_type_resign') {
                      const localizedType = this.normalizeText(this.getLocalizedTypeResign(item.er_reason));
                      return filterValues.some(value => this.normalizeText(value).includes(localizedType));
                    }
                    return filterValues.includes(String(item[column]));
                  });
                }
              });
            }
        
            // Apply department filter
            if (this.filters.deptid) {
              data = data.filter(item => item.er_deptid === this.filters.deptid);
            }
        
            // Apply reason filter
            if (this.filters.reason) {
              data = data.filter(item => String(item.er_reason) === String(this.filters.reason));
            }
        
            // Apply age range filter
            if (this.filters.age) {
              const [minAge, maxAge] = this.filters.age.split('-').map(Number);
              data = data.filter(item => {
                const age = Number(item.er_age);
                if (maxAge === null) {
                  return age >= minAge;
                }
                return age >= minAge && age <= maxAge;
              });
            }
        
            // Apply seniority range filter
            if (this.filters.seniority) {
              const [minYear, maxYear] = this.filters.seniority.split('-').map(Number);
              data = data.filter(item => {
                const seniority = Number(item.er_seniority);
                if (maxYear === null) {
                  return seniority >= minYear;
                }
                return seniority >= minYear && seniority <= maxYear;
              });
            }
        
            // Apply position filter
            if (this.filters.position) {
              data = data.filter(item => item.er_joblevel === this.filters.position);
            }
        
            // Apply date range filter
            if (this.filters.dateRange && this.filters.dateRange.length === 2) {
              const [startDate, endDate] = this.filters.dateRange;
              data = data.filter(item => {
                const resignDate = new Date(item.er_resigndate);
                return resignDate >= new Date(startDate) && resignDate <= new Date(endDate);
              });
            }
        
            return data;
          },
        displayEmpno: {
            get() {
                return this.empno.toString().padStart(6, '0');
            },
            set(value) {
                this.empno = value.replace(/^0+/, ''); 
            }
        },
        localizedReasons() {
            return this.reasons.map(item => {
                try {
                  // Assuming item.reason is already parsed in getReasons method
                  return {
                    value: item.id,
                    text: item.reason[this.$i18n.locale] || item.reason.en
                  };
                } catch (e) {
                  console.error('Error processing reason:', e);
                  return {
                    value: item.id,
                    text: 'Error loading reason'
                  };
                }
              });
        },
        localizedReasonOptions() {
            // Kiểm tra reasons có tồn tại không
            if (!this.reasons || !Array.isArray(this.reasons)) return [];
            
            return this.reasons.map(item => {
              try {
                // Kiểm tra nếu reason đã là object
                if (typeof item.reason === 'object') {
                  return {
                    value: item.id,
                    text: item.reason[this.$i18n.locale] || item.reason.en || ''
                  };
                }
                // Nếu là string thì parse
                const reasonObj = JSON.parse(item.reason);
                return {
                  value: String(item.id),
                  text: reasonObj[this.$i18n.locale] || reasonObj.en || ''
                };
              } catch (e) {
                console.error('Error parsing reason:', e);
                return {
                  value: String(item.id),
                  text: item.reason || ''
                };
              }
            });
          },
        isEmployeeExists() {
            const paddedEmpno = this.padEmpno(this.empno);
            return this.resignData.some(item => item.er_empid === paddedEmpno);
        },
        empnoErrorMessage() {
            if (this.isEmployeeExists) {
                return this.$t('Employee already exists in resignation list');
            }
            return '';
        },
        visibleHeaders() {
            if (this.visibleColumns.length === 0) {
                return this.headers;
            }
            return this.headers.filter(header => 
                this.visibleColumns.includes(header.value)
            );
        },
        deptOptions() {
          const uniqueDepts = [...new Set(this.resignData.map(item => item.er_deptid))]
            .filter(Boolean)
            .sort();
          
          return uniqueDepts.map(deptId => {
            const deptItem = this.resignData.find(item => item.er_deptid === deptId);
            return {
              text: `${deptId} - ${deptItem?.er_deptname || ''}`,
              value: deptId
            };
          });
        },
    
        positionOptions() {
          return [...new Set(this.resignData.map(item => item.er_joblevel))]
            .filter(Boolean)
            .sort()
            .map(position => ({
              text: position,
              value: position
            }));
        },
    },
    methods: {
        async getReasons() {
            try {
                const res = await this.$axios.get(this.api + 'getDataReasonResign');
                if (res.status === 200 && res.data.dataReasonResign) {
                  // Parse JSON khi nhận data
                  this.reasons = res.data.dataReasonResign.map(r => ({
                    ...r,
                    reason: typeof r.reason === 'string' ? JSON.parse(r.reason) : r.reason,
                    type_resign: typeof r.type_resign === 'string' ? JSON.parse(r.type_resign) : r.type_resign
                  }));
                  
                  console.log('Loaded reasons:', this.reasons); // Debug
                }
              } catch (error) {
                console.error('Error loading reasons:', error);
                this.$notify({
                  title: 'Error',
                  text: 'Failed to load reasons',
                  type: 'error'
                });
              }
        },
        clearDateRange() {
            this.filters.dateRange = [];
            // this.applyFilters();
        },
        applyFilters() {
            console.log('Current filters:', this.filters);
            console.log('Selected reason:', this.filters.reason);
        },
        normalizeText(text) {
            if (!text) return '';
            return String(text).toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') 
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D');
        },
        async saveResign() {
            if (!this.$refs.form.validate()) {
                this.$notify({
                    title: 'Error',
                    text: 'Please fill in all required fields',
                    type: 'error'
                })
                return;
            }

            if (this.isEmployeeExists) {
                this.$notify({
                    title: 'Error',
                    text: this.$t('Employee already exists in resignation list'),
                    type: 'error'
                });
                return;
            }

            this.saving = true; 
            const paddedEmpId = this.empno.toString().padStart(6, '0');
            let params = {
                id: this.id,
                er_empid: paddedEmpId, 
                er_numberid: this.numid,
                er_name: this.name,
                er_deptid: this.dept,
                er_deptname: this.deptName,
                er_joblevel: this.position,
                er_indate: this.inDate,
                er_age: this.age,
                er_seniority: this.seniority,
                er_bus: this.vehicle,
                er_gender: this.gender,
                er_hometown: this.hometown,
                er_reason: this.reason,
                er_note: this.note,
                er_resigndate: this.dateResign,
                er_keyindate: this.today,
                er_address: this.address,
                er_type_resign: this.type_resign
            };
            try {
                let res = await this.$axios.post(this.api + 'saveResign', params);
                if (res.status === 200) {

                    this.$notify({
                        title: 'Success',
                        text: 'Save successfully',
                        type: 'success'
                    });
                    await this.getAllData();
                    this.resetForm();
                }
            } catch (error) {
                console.error('Save error:', error);
                this.$notify({
                    title: 'Error',
                    text: 'Failed to save data',
                    type: 'error'
                });
            } finally {
                this.saving = false;
            }
        },

        resetForm() {
            this.empno = '';
            this.name = '';
            this.gender = '';
            this.age = null;
            this.inDate = '';
            this.numid = '';
            this.dept = '';
            this.deptName = '';
            this.position = '';
            this.seniority = null;
            this.vehicle = '';
            this.dateResign = '';
            this.hometown = '';
            this.address = '';
            this.reason = '';
            this.note = '';
            this.type_resign = '';
            this.localizedTypeResign = '';

            if (this.$refs.form) {
                this.$refs.form.resetValidation();
            }
        },
        padEmpno(empno) {
            return empno.toString().padStart(6, '0');
        },

        async checkEmpno() {
            const paddedEmpno = this.padEmpno(this.empno);

            let params = {
                empno: paddedEmpno
            };

            try {
                let res = await this.$axios.post(this.api + 'postByEmpNoHRM', params);
                if (res.status === 200) {
                    this.data = res.data;
                    this.numid = this.data.ic_no;
                    this.name = this.data.name;
                    this.gender = this.data.sex;
                    this.inDate = this.data.in_date;
                    this.dept = this.data.dept_code;
                    this.deptName = this.data.dept_name;
                    this.address = this.data.address;
                    this.hometown = this.data.country;
                    this.position = this.data.duty;
                    this.age = this.data.age;
                    this.dateResign = this.data.dismiss;
                    this.seniority = this.data.seniority;
                }
            } catch (error) {
                console.log(error);
                this.$notify({
                    title: 'Error',
                    text: 'Employee not found or error occurred',
                    type: 'error'
                });
            }
        },
        async getAllData() {
            this.loading = true; 
            try {
                let res = await this.$axios.get(this.api + 'getResignData');
                if (res.status === 200) {
                    await this.getReasons();

                    const processedData = res.data.map(item => {
                        const reasonId = item.er_reason;
                        const reason = this.reasons.find(r => r.id === parseInt(reasonId));
                        return {
                            ...item,
                            originalReasonId: reasonId,
                            displayReason: reason ? reason.reason[this.$i18n.locale] || reason.reason.en : reasonId,
                            er_type_resign: reason ? reason.type_resign[this.$i18n.locale] || reason.type_resign.en : ''
                        };
                    });

                    this.resignData = processedData;

                    // Update filterItems with localized type_resign values
                    this.filterItems = {
                        ...this.filterItems,
                        er_reason: this.reasons.map(r => r.reason[this.$i18n.locale] || r.reason.en).sort(),
                        er_type_resign: [...new Set(this.reasons
                            .map(r => r.type_resign[this.$i18n.locale] || r.type_resign.en)
                            .filter(val => val != null && val !== '')
                        )].sort()
                    };

                    // Cập nhật các filter items khác
                    const otherFields = Object.keys(this.filterItems)
                        .filter(key => !['er_reason', 'er_type_resign'].includes(key));

                    otherFields.forEach(key => {
                        this.filterItems[key] = [...new Set(processedData
                            .map(item => item[key])
                            .filter(val => val != null && val !== '')
                        )].sort((a, b) => {
                            if (key.includes('date')) {
                                return new Date(b) - new Date(a);
                            }
                            if (key === 'er_age' || key === 'er_seniority') {
                                return a - b;
                            }
                            return String(a).localeCompare(String(b));
                        });
                    });
                }
            } catch (error) {
                console.error('Error loading data:', error);
                this.$notify({
                    title: 'Error',
                    text: 'Failed to load data',
                    type: 'error'
                });
            } finally {
                this.loading = false;
            }
        },
        editDataResign(item) {
            this.id = item.id;
            this.dialog = true;
            this.numid = item.er_numberid;
            this.empno = item.er_empid;
            this.name = item.er_name;
            this.gender = item.er_gender;
            this.inDate = item.er_indate;
            this.dept = item.er_deptid;
            this.deptName = item.er_deptname;
            this.position = item.er_joblevel;
            this.age = item.er_age;
            this.seniority = item.er_seniority;
            this.vehicle = item.er_bus;
            this.dateResign = item.er_resigndate;
            this.hometown = item.er_hometown;
            this.reason = parseInt(item.originalReasonId); // Sử dụng ID gốc cho form edit
            this.address = item.er_address;
            this.note = item.er_note;
        },
        formatExcelData() {
            return this.filteredResignData.map(item => {
                return {
                    ...item,
                    er_resigndate: dayjs(item.er_resigndate).format('YYYY-MM-DD'),
                    er_seniority: item.er_seniority,
                    er_reason: this.getReasonText(item.er_reason) 
                }
            });
        },
        exportExcel() {
            try {
                const colWidths = [
                    { wch: 10 }, 
                    { wch: 20 }, 
                    { wch: 10 },
                    { wch: 10 },
                    { wch: 15 }, 
                    { wch: 10 }, 
                    { wch: 25 }, 
                    { wch: 15 }, 
                    { wch: 8 },  
                    { wch: 12 }, 
                    { wch: 15 }, 
                    { wch: 10 }, 
                    { wch: 20 }, 
                    { wch: 30 }, 
                    { wch: 30 }, 
                    { wch: 40 },
                    { wch: 30 }, 
                ];

                const headers = [
                    'Employee ID', 'Full Name', 'IC no', 'Indate', 'Resignation Date', 'Department', 'Department Name',
                    'Position', 'Age', 'Seniority', 'Transportation', 'Gender',
                    'Hometown', 'Reason', 'Note', 'Address', 'Type resign'
                ];

                const data = this.filteredResignData.map(item => [
                    { v: item.er_empid, t: 's', z: '@' }, 
                    item.er_name,
                    item.er_numberid,
                    dayjs(item.er_indate).format('YYYY-MM-DD'),
                    dayjs(item.er_resigndate).format('YYYY-MM-DD'),
                    item.er_deptid,
                    item.er_deptname,
                    item.er_joblevel,
                    item.er_age,
                    item.er_seniority,
                    item.er_bus,
                    item.er_gender,
                    item.er_hometown,
                    this.getReasonText(item.er_reason),
                    item.er_note,
                    item.er_address,
                    this.getLocalizedTypeResign(item.er_reason)
                ]);
                const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

                ws['!cols'] = colWidths;

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Resignation List');

                let filename = 'Resignation_Report';
                if (this.filters.deptid) filename += `_Dept${this.filters.deptid}`;
                if (this.filters.reason) filename += `_${this.filters.reason.substring(0, 10)}`;
                if (this.filters.dateRange && this.filters.dateRange.length === 2) {
                    filename += `_${this.filters.dateRange[0]}_${this.filters.dateRange[1]}`;
                }
                filename += `_${this.today}.xlsx`;

                XLSX.writeFile(wb, filename);

                this.$notify({
                    title: 'Success',
                    text: `Exported ${data.length} records successfully`,
                    type: 'success'
                });
            } catch (error) {
                console.error('Export error:', error);
                this.$notify({
                    title: 'Error',
                    text: 'Failed to export Excel file',
                    type: 'error'
                });
            }
        },
        clearFilters() {
            // Reset text search
            this.search = '';
            
            // Reset main filters
            this.filters = {
              deptid: null,
              reason: null,
              age: null,
              seniority: null,
              position: null,
              dateRange: [],
              columns: Object.keys(this.filters.columns).reduce((acc, key) => {
                acc[key] = [];
                return acc;
              }, {})
            };
      
            // Reset date menu
            this.dateMenu = false;
      
            // Reset all DsFilter components
            // Emit empty arrays to all DsFilter components
            Object.keys(this.filterItems).forEach(key => {
              this.updateFilter(key, []);
            });
      
            // Force re-render of DsFilter components (optional)
            this.$nextTick(() => {
              // Trigger a re-render if needed
              this.$forceUpdate();
            });
      
            // Trigger data refresh
            this.getAllData();
      
            // Notify user
            this.$notify({
              title: 'Success',
              text: this.$t('All filters have been cleared'),
              type: 'success'
            });
          },
        getReasonText(reasonId) {
            const reason = this.reasons.find(r => r.id === parseInt(reasonId));
            if (reason) {
              try {
                // Ưu tiên lấy tiếng Việt, nếu không có thì lấy ngôn ngữ hiện tại, sau đó mới đến tiếng Anh
                return reason.reason[this.$i18n.locale] || reason.reason.en || '';
              } catch (e) {
                console.error('Error parsing reason:', e);
                return reason.reason;
              }
            }
            return reasonId; 
          },
        printData() {
            try {
                // Thay thế filteredResignData bằng filteredData
                const printData = this.filteredData.map(item => ({
                    ...item,
                    er_reason: this.getReasonText(item.er_reason),
                    er_type_resign: this.getLocalizedTypeResign(item.er_reason)
                }));
                
                const printKey = `resign-print-data-${Date.now()}`;
                localStorage.setItem(printKey, JSON.stringify(printData));

                const route = this.$router.resolve({
                    path: '/template-print/resign',
                    query: { key: printKey }
                });

                window.open(route.href, '_blank');
            } catch (error) {
                console.error('Print error:', error);
                this.$notify({
                    title: 'Error', 
                    text: 'Failed to open print view',
                    type: 'error'
                });
            }
        },
        updateFilter(field, value) {
            // Add a check for clearing filters
            if (!value || value.length === 0) {
              this.$set(this.filters.columns, field, []);
              // Also update the corresponding filterItems if needed
              if (this.filterItems[field]) {
                this.$set(this.filterItems, field, 
                  [...new Set(this.resignData
                    .map(item => item[field])
                    .filter(val => val != null && val !== '')
                  )].sort()
                );
              }
              return;
            }
      
            // Rest of the existing updateFilter logic
            if (field === 'er_type_resign' || field === 'er_reason') {
              const normalizedValues = value.map(v => this.normalizeText(v));
              this.$set(this.filters.columns, field, normalizedValues);
            } else {
              this.$set(this.filters.columns, field, Array.isArray(value) ? value : [value]);
            }
          },
        toggleColumn(columnValue) {
            const index = this.visibleColumns.indexOf(columnValue);
            if (index === -1) {
                this.visibleColumns.push(columnValue);
            } else {
                this.visibleColumns.splice(index, 1);
            }
        },
        toggleAllColumns(value) {
            if (value) {
                this.visibleColumns = this.headers.map(header => header.value);
            } else {
                this.visibleColumns = [];
            }
        },
        updateTypeResign(reasonId) {
            if (reasonId) {
                const selectedReason = this.reasons.find(r => r.id === parseInt(reasonId));
                if (selectedReason && selectedReason.type_resign) {
                    this.type_resign = selectedReason.type_resign;
                    this.localizedTypeResign = selectedReason.type_resign[this.$i18n.locale] || 
                                             selectedReason.type_resign.en;
                }
            } else {
                this.type_resign = '';
                this.localizedTypeResign = '';
            }
        },
        getLocalizedReason(reasonId) {
            const reason = this.reasons.find(r => r.id === parseInt(reasonId));
            if (reason) {
              try {
                // Sử dụng reason object đã được parse
                return reason.reason[this.$i18n.locale] || reason.reason.en;
              } catch (e) {
                console.error('Error getting localized reason:', e);
                return 'Unknown reason';
              }
            }
            return reasonId;
          },
        getLocalizedTypeResign(reasonId) {
            const reason = this.reasons.find(r => r.id === parseInt(reasonId));
            if (reason) {
              try {
                // Sử dụng type_resign object đã được parse
                return reason.type_resign[this.$i18n.locale] || reason.type_resign.en;
              } catch (e) {
                console.error('Error getting localized type resign:', e);
                return 'Unknown type';
              }
            }
            return '';
          },
        getLocalizedValue(jsonString, defaultLocale = 'vi') {
            try {
              // Check if already parsed
              if (typeof jsonString === 'object') {
                return jsonString[this.$i18n.locale] || jsonString[defaultLocale] || jsonString.en;
              }
              // Parse JSON string
              const parsed = JSON.parse(jsonString);
              return parsed[this.$i18n.locale] || parsed[defaultLocale] || parsed.en;
            } catch (e) {
              console.error('Error parsing JSON:', e);
              return jsonString;
            }
          },
        filterBy(value, search, item) {
            if (!search || search.trim() === '') return true;
            if (value === null || value === undefined) return false;
            
            const searchTerm = this.normalizeText(String(search));
            
            // Special handling for specific columns
            if (item) {
                if (item.key === 'er_reason') {
                    const reason = this.getLocalizedReason(value);
                    return this.normalizeText(String(reason)).includes(searchTerm);
                }
                if (item.key === 'er_type_resign') {
                    const typeResign = this.getLocalizedTypeResign(item.er_reason);
                    return this.normalizeText(String(typeResign)).includes(searchTerm);
                }
            }
            
            return this.normalizeText(String(value)).includes(searchTerm);
        },
        handleFilterChange(column, values) {
            this.updateFilter(column, values);
        },
    },
    async created() { 
        // Gọi getReasons() trước khi getAllData()
        await this.getReasons();
        await this.getAllData();
        // Initialize all columns as visible
        this.visibleColumns = this.headers.map(header => header.value);
        // Restore filters from localStorage if they exist
        const savedFilters = localStorage.getItem('tableFilters');
        if (savedFilters) {
          this.filters = JSON.parse(savedFilters);
        }
    },
    mounted() {
        this.getReasons();
    },
    watch: {
        visibleColumns(val) {
            this.selectAll = val.length === this.headers.length;
        },
        reason(newValue) {
            this.updateTypeResign(newValue);
        },
        '$i18n.locale'() {
            if (this.reasons.length > 0) {
                // Update both reason and type_resign filter items when locale changes
                this.$set(this.filterItems, 'er_reason', 
                    this.reasons.map(r => r.reason[this.$i18n.locale] || r.reason.en).sort()
                );
                this.$set(this.filterItems, 'er_type_resign',
                    [...new Set(this.reasons
                        .map(r => r.type_resign[this.$i18n.locale] || r.type_resign.en)
                        .filter(val => val != null && val !== '')
                    )].sort()
                );
            }
            this.updateTypeResign(this.reason);
        },
        filters: {
            handler(newFilters) {
              localStorage.setItem('tableFilters', JSON.stringify(newFilters));
            },
            deep: true
          }
    }
}
</script>

<style scoped>
.resign-dialog {
    border-radius: 8px;
}

.resign-dialog .v-input {
    transition: all 0.3s;
}

.resign-dialog .v-input:hover {
    transform: translateY(-2px);
}

.v-btn {
    text-transform: none;
    letter-spacing: 0.5px;
}

.text-h6 {
    color: #1976d2;
    font-size: 1.1rem;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.excel-export-btn {
    text-decoration: none;
}

.search-field {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    transition: all 0.3s ease;
}

.name-link {
    color: #1976d2;
    cursor: pointer;
    text-decoration: none;
}

.name-link:hover {
    text-decoration: underline;
}
.v-data-table {
  border: 1px solid #e0e0e0;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-y: auto;
}

.v-data-table ::v-deep thead th {
  font-weight: 600 !important;
  color: #004D40 !important;
  background: white;
  position: sticky;
  top: 0;
  z-index: 1;
  text-transform: uppercase;
}

.v-data-table ::v-deep tbody tr:hover {
    background-color: #f3fd99 !important;
}
.v-list-item {
  min-height: 35px !important;
  cursor: pointer;
}
.filter-menu {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .filter-chip {
    margin: 2px;
  }
</style>
<i18n>
    {
        "en": {
            "Resignation listing": "Resignation listing",
            "Search": "Search",
            "Input resign": "Input resign",
            "Export to Excel": "Export to Excel",
            "Empno": "Empno",
            "Name": "Name",
            "Dept": "Dept",
            "Dept name": "Dept Name",
            "Job level": "Position",
            "Age": "Age",
            "Seniority": "Seniority",
            "Bus": "Transportation",
            "Gender": "Gender",
            "Home town": "Home town",
            "Reasons": "Reasons",
            "Note": "Note",
            "Resign date": "Resign date",
            "Action": "Action",
            "Input Resignation": "Input Resignation",
            "Personal Information": "Personal Infor",
            "Full Name": "Full Name",
            "Work Information": "Work Infor",
            "Position": "Position",
            "Seniority (Years)": "Seniority (Years)",
            "Vehicle": "Transportation",
            "Resignation Details": "Resignation Details",
            "Resignation Date": "Resignation Date",
            "Reason for Resignation": "Reason for Resignation",
            "Hometown": "Hometown",
            "Current Address": "Current Address",
            "Additional Notes": "Additional Notes",
            "Cancel": "Cancel",
            "Save": "Save",
            "Report": "Report",
            "Resignation Date": "Resignation Date",
            "Clear filters": "Clear filters",
            "IC no": "IC no",
            "Print": "Print Resignation List",
            "Numid": "Number id",
            "In date": "In date",
            "Employee already exists in resignation list": "Employee already exists in resignation list",
            "Toggle Columns": "Show Columns",
            "Show All": "Show All",
            "Hide All": "Hide All",
            "Select All": "Select All",
            "Type resign": "Type of Resignation"
        },
        "vi": {
            "Resignation listing": "Danh sách nghỉ việc",
            "Search": "Tìm kiếm",
            "Input resign": "Nhập thông tin nghỉ việc",
            "Export to Excel": "Xuất Excel",
            "Empno": "Mã NV",
            "Name": "Họ tên",
            "Dept": "Bộ phận",
            "Dept name": "Tên BP",
            "Job level": "Chức vụ",
            "Age": "Tuổi",
            "Seniority": "Thâm niên",
            "Bus": "Xe đưa rước",
            "Gender": "Giới tính",
            "Home town": "Quê quán",
            "Reasons": "Lý do",
            "Note": "Ghi chú",
            "Resign date": "N.thôi việc",
            "Action": "Thao tác",
            "Input Resignation": "Nhập thông tin nghỉ việc",
            "Personal Information": "Thông tin cá nhân",
            "Full Name": "Họ và tên",
            "Work Information": "Thông tin công việc",
            "Position": "Chức vụ",
            "Seniority (Years)": "Thâm niên (Năm)",
            "Vehicle": "Phương tiện",
            "Resignation Details": "Chi tiết nghỉ việc",
            "Resignation Date": "Ngày nghỉ việc",
            "Reason for Resignation": "Lý do",
            "Hometown": "Quê quán",
            "Current Address": "Địa chỉ hiện tại",
            "Additional Notes": "Ghi chú",
            "Cancel": "Hủy",
            "Save": "Lưu",
            "Report": "Báo cáo",
            "Resignation Date": "N.nghỉ việc",
            "Clear filters": "Xóa lọc",
            "IC no": "Số CCCD",
            "Print": "In DS nghỉ việc",
            "Numid": "Số CCCD",
            "In date": "Ngày vào",
            "Employee already exists in resignation list": "Nhân viên đã có trong danh sách nghỉ việc",
            "Toggle Columns": "Ẩn/Hiện Cột",
            "Show All": "Hiện Tất Cả",
            "Hide All": "Ẩn Tất Cả",
            "Select All": "Chọn tất cả",
            "Type resign": "Loại nghỉ việc"
        },
        "cn": {
            "Resignation listing": "离职列表",
            "Search": "搜索",
            "Input resign": "输入离职信息",
            "Export to Excel": "导出Excel",
            "Empno": "员工编号",
            "Name": "姓名",
            "Dept": "部门",
            "Dept name": "部门名称",
            "Job level": "职位",
            "Age": "年龄",
            "Seniority": "工龄",
            "Bus": "交通",
            "Gender": "性别",
            "Home town": "籍贯",
            "Reasons": "原因",
            "Note": "备注",
            "Resign date": "离职日期",
            "Action": "操作",
            "Input Resignation": "输入离职信息",
            "Personal Information": "个人信息",
            "Full Name": "全名",
            "Work Information": "工作信息",
            "Position": "职位",
            "Seniority (Years)": "工龄（年）",
            "Vehicle": "交通工具",
            "Resignation Details": "离职详情",
            "Resignation Date": "离职日期",
            "Reason for Resignation": "离职原因",
            "Hometown": "籍贯",
            "Current Address": "现居地址",
            "Additional Notes": "附加说明",
            "Cancel": "取消",
            "Save": "保存",
            "Report": "报告",
            "Resignation Date": "离职日期",
            "Clear filters": "清除过滤器",
            "IC no": "身份证号",
            "Print": "打印离职列表",
            "Numid": "身份证号",
            "In date": "入职日期",
            "Employee already exists in resignation list": "员工已存在于离职名单中",
            "Toggle Columns": "显示/隐藏列",
            "Show All": "显示全部",
            "Hide All": "隐藏全部",
            "Select All": "全选",
            "Type resign": "离职类型"
        }    }</i18n>
<template>
    <v-row>
        <v-col cols="12">
            <v-card class="demand-card">
                <v-app-bar color="teal darken-4" dense dark class="px-6 elevation-2">
                    <v-toolbar-title class="d-flex align-center">
                        <v-icon class="mr-3">mdi-file-document-outline</v-icon>
                        <span class="text-h6 font-weight-medium">{{ $t("Demand management") }}</span>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" :label="$t('Search')" single-line
                    hide-details filled rounded dense class="search-field mx-4" style="max-width: 300px"
                    clearable></v-text-field>
                    
                    <v-btn color="error" @click="showDialog = true" class="elevation-1 animate-button"
                    :loading="loading">
                    <v-icon left dark>mdi-plus</v-icon>
                    <span class="text-teal-darken-4">{{ $t("Add demand") }}</span>
                </v-btn>
                <v-menu offset-y :close-on-content-click="false" ref="menu">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn  v-bind="attrs" v-on="on" icon class="ml-2" title="Show/Hide Columns">
                    <v-icon>mdi-cog-outline</v-icon>
                </v-btn>
                        </template>
                        <v-card min-width="300">
                            <v-card-title class="subtitle-1 font-weight-bold">
                                {{ $t('Column Settings') }}
                                <v-spacer></v-spacer>
                                <v-btn icon x-small @click="saveColumnSettings">
                                    <v-icon>mdi-content-save</v-icon>
                                </v-btn>
                                <v-btn icon x-small @click="closeMenu" class="ml-2">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-divider></v-divider>
                            <v-card-text class="pa-0">
                                <v-list dense>
                                    <v-list-item>
                                        <v-checkbox
                                            v-model="selectAllColumns"
                                            :label="$t('Select All')"
                                            @change="toggleAllColumns"
                                            dense
                                            hide-details
                                        ></v-checkbox>
                                    </v-list-item>
                                    <v-divider></v-divider>
                                    <v-list-item v-for="header in headers" :key="header.value">
                                        <v-checkbox
                                            v-model="visibleColumns"
                                            :value="header.value"
                                            :label="$t(header.text)"
                                            :disabled="header.value === 'actions'"
                                            dense
                                            hide-details
                                        ></v-checkbox>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-menu>
               
            </v-app-bar>
            
            <v-card-text class="pa-1">
                <v-col cols="12">
                    <v-row align="center" justify="start" class="grey lighten-5 pa-1 rounded-lg">
                        <v-col cols="12" md="2">
                            <v-autocomplete v-model="selectDept" :items="itemsSelectDept" :label="$t('Department')"
                            hide-details outlined dense background-color="white" prepend-inner-icon="mdi-domain"
                            class="rounded-lg" clearable @change="filterData"></v-autocomplete>
                        </v-col>
                        <v-col cols="12" md="6">
                            <p class="font-weight-medium teal--text text--darken-4 mb-1">{{ $t('Position Apply') }}
                            </p>
                            <v-chip-group v-model="selectedPositions" show-arrows multiple>
                                <v-chip v-for="position in itemsPos" :key="position" filter
                                class="font-weight-medium" outlined color="teal darken-4" :value="position"
                                :input-value="selectedPositions.includes(position)"
                                :class="{ 'v-chip--selected': selectedPositions.includes(position) }"
                                @click="handlePositionSelect(position)">
                                {{ position }}
                            </v-chip>
                        </v-chip-group>
                    </v-col>
                </v-row>
            </v-col>
            <v-data-table :headers="visibleHeaders" :items="mappedDemandData" :items-per-page="10" :loading="loading"
            :search="search" class="elevation-1 rounded-lg data-table"  :footer-props="{
                'items-per-page-options': [10, 15, 30, 100],
                'show-current-page': true,
                'show-first-last-page': true
            }" >
            <template v-slot:[`item.actions`]="{ item }">
                <div class="action-buttons">
                    <v-icon color="warning" outline class="mr-1 action-icon"
                    @click="editItem(item)">mdi-square-edit-outline</v-icon>
                    <!-- thêm chức năng xóa dữ liệu-->
                    <v-icon color="error" outline class="mr-2 action-icon"
                    @click="deleteItem(item)">mdi-delete</v-icon>
                </div>
            </template>
            <template v-slot:[`item.dem_fulfilled`]="{ item }">
                <v-chip
                x-small
                :color="item.dem_fulfilled === 'yes' ? 'success' : 'error'"
                :text-color="item.dem_fulfilled === 'yes' ? 'white' : 'white'"
                label
                >
                {{ item.dem_fulfilled === 'yes' ? $t('Yes') : $t('No') }}
            </v-chip>
        </template>
        <template v-slot:[`item.dem_fullfilldate`]="{ item }">
            <v-chip v-if="item.dem_fullfilldate" x-small outlined color="success" class="table-chip" label>
                {{ item.dem_fullfilldate }}
            </v-chip>
        </template>
        <template v-slot:[`item.dem_inputdate`]="{ item }">
            <v-chip x-small outlined color="error" class="table-chip" label>
                {{ item.dem_inputdate || '' }}
            </v-chip>
        </template>
        <template v-slot:[`item.dem_note`]="{ item }">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon class="note-icon" v-bind="attrs" v-on="on" @click="showNoteDialog(item)">
                        mdi-information
                    </v-icon>
                </template>
                <span>View note</span>
            </v-tooltip>
        </template>
        <template v-slot:[`item.dem_candidates`]="{ item }">
            <div class="d-flex align-center">
                <v-chip small color="orange" outlined class="table-chip" label dark
                @click="showCandidatesDialog(item.dem_candidates)" >
                {{ getCandidatesCount(item.dem_candidates) }}
            </v-chip>
        </div>
    </template>
    <template v-slot:[`item.dem_recruited`]="{ item }">
        <nuxt-link
        :to="{ path: '../candidate-listing', query: { id: item.id, act_en_date: item.dem_fullfilldate } }"
        class="candidate-link">
        {{ item.dem_recruited || '' }}
    </nuxt-link>
</template>
<template #[`footer.prepend`]>
    <v-btn color="success" small dark @click="exportToExcel">
        <v-icon left>mdi-file-excel</v-icon>
        {{ $t('Export excel') }}
    </v-btn>
</template>
<template #[`header.dem_dept`]>
    <DsFilter :name="$t('Division')" :in-items="filterItems.dem_dept"
    @changed="updateFilter('dem_dept', $event)" />
</template>
<template #[`header.dem_sub_department`]>
    <DsFilter :name="$t('Department')" :in-items="filterItems.dem_sub_department"
    @changed="updateFilter('dem_sub_department', $event)" />
</template>
<template #[`header.dem_unit`]>
    <DsFilter :name="$t('Unit')" :in-items="filterItems.dem_unit"
    @changed="updateFilter('dem_unit', $event)" />
</template>
<template #[`header.dem_position`]>
    <DsFilter :name="$t('Position')" :in-items="filterItems.dem_position"
    @changed="updateFilter('dem_position', $event)" />
</template>
<template #[`header.dem_sub_position`]>
    <DsFilter :name="$t('Sub Position')" :in-items="filterItems.dem_sub_position"
    @changed="updateFilter('dem_sub_position', $event)" />
</template> 
<template #[`header.dem_amount`]>
    <DsFilter :name="$t('Amount')" :in-items="filterItems.dem_amount"
    @changed="updateFilter('dem_amount', $event)" />
</template>
<template #[`header.dem_inputdate`]>
    <DsFilter :name="$t('Request date')" :in-items="filterItems.dem_inputdate"
    @changed="updateFilter('dem_inputdate', $event)" />
</template>
<template #[`header.dem_recruited`]>
    <DsFilter :name="$t('Recruited')" :in-items="filterItems.dem_recruited"
    @changed="updateFilter('dem_recruited', $event)" />
</template>
<template #[`header.dem_fulfilled`]>
    <DsFilter :name="$t('Full filled')" :in-items="filterItems.dem_fulfilled"
    @changed="updateFilter('dem_fulfilled', $event)" />
</template>
<template #[`header.dem_fullfilldate`]>
    <DsFilter :name="$t('Full filled date')" :in-items="filterItems.dem_fullfilldate"
    @changed="updateFilter('dem_fullfilldate', $event)" />
</template>
<template #[`header.stocknumber`]>
    <DsFilter :name="$t('Still in need')" :in-items="filterItems.stocknumber"
    @changed="updateFilter('stocknumber', $event)" />
</template>
<template #[`header.dem_note`]>
    <DsFilter :name="$t('Note')" :in-items="filterItems.dem_note"
    @changed="updateFilter('dem_note', $event)" />
</template>
<template #[`header.dem_candidates`]>
    <DsFilter :name="$t('Candidates')" :in-items="filterItems.dem_candidates"
    @changed="updateFilter('dem_candidates', $event)" />
</template>
<template #[`header.dem_pause_start_at`]>
    <DsFilter :name="$t('On hold start')" :in-items="filterItems.dem_pause_start_at"
    @changed="updateFilter('dem_pause_start_at', $event)" />
</template>
<template #[`header.dem_pause_end_at`]>
    <DsFilter :name="$t('On hold end')" :in-items="filterItems.dem_pause_end_at"
    @changed="updateFilter('dem_pause_end_at', $event)" />
</template>

<template v-slot:[`header.actions`]="{ header }">
    {{ $t('Actions') }}
</template>
<template v-slot:body.append>
    <tr class="total-row">
        <td colspan="5" class="text-center"> {{$t('Total')}}</td>
        <td v-for="header in headers.slice(5)" :key="header.value">
            <span v-if="header.value === 'dem_fulfilled'">
                {{ $t('Yes') }}: {{ totalSum[header.value].yes }} <br>
                {{ $t('No') }}: {{ totalSum[header.value].no }}
            </span>
            <span v-else-if="!['dem_dept', 
            'dem_sub_department', 'dem_unit', 'dem_position',
            'dem_sub_position', 'dem_inputdate', 'dem_fulfilled', 
            'dem_fullfilldate', 'dem_inputdate', 'dem_note', 
            'dem_pause_start_at', 'dem_pause_end_at', 'actions'].includes(header.value)">
            {{ totalSum[header.value] || 0 }}
        </span>
    </td>
</tr>    
</template>
</v-data-table>
</v-card-text>
</v-card>
</v-col>

<v-dialog v-model="showDialog" max-width="800" transition="dialog-bottom-transition">
    <v-card class="form-card">
        <v-card-title class="teal darken-4 white--text px-6 py-4">
            <v-icon dark class="mr-2">{{ id ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
            <span class="text-h6">{{ id ? $t("Edit demand") : $t("Add demand") }}</span>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="showDialog = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
            <v-form ref="form" v-model="formValid">
                
                <v-row>
                    <!-- Basic Information -->
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-3 primary--text">{{ $t("Basic Information") }}
                        </div>
                        <v-row>
                         <v-col cols="12" md="3">
                            <v-text-field 
                                v-model="demand.dem_id" 
                                :label="$t('Demand ID') + '*'" 
                                :error-messages="demIdError"
                                @input="validateDemId"
                                outlined 
                                dense 
                                :rules="[rules.required]"
                                prepend-inner-icon="mdi-identifier"
                            ></v-text-field>
                        </v-col>
                            <v-col cols="12" md="3">
                                <v-autocomplete v-model="demand.department" :items="itemsSelectDept"
                                :label="$t('Division') + '*'" :rules="[rules.required]" outlined dense
                                hide-details class="mb-3" prepend-inner-icon="mdi-domain"></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-autocomplete v-model="demand.sub_department" :items="filteredUnits"
                                :label="$t('Department') + '*'" :rules="[rules.required]" outlined dense
                                hide-details class="mb-3" prepend-inner-icon="mdi-domain"></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-autocomplete v-model="demand.sub_division" :items="itemsDiv"
                                :label="$t('Unit') + '*'" :rules="[rules.required]" outlined dense
                                hide-details class="mb-3" prepend-icon="mdi-domain"></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-autocomplete v-model="demand.position" :items="itemsPos"
                                :label="$t('Position') + '*'" :rules="[rules.required]" outlined dense
                                hide-details class="mb-3"
                                prepend-inner-icon="mdi-account-tie"></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-autocomplete v-model="demand.sub_position" :items="getSubPositionItems"
                                :label="$t('Sub Position') + '*'" outlined dense hide-details="auto"
                                prepend-inner-icon="mdi-account-details"
                                :disabled="!['Staff', 'Staff (lang)', 'Translator'].includes(demand.position)"
                                :hint="getSubPositionHint" persistent-hint></v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="demand.quantity" :label="$t('Quantity') + '*'"
                                :rules="[rules.required, rules.number]" outlined dense hide-details
                                type="number" min="1" prepend-inner-icon="mdi-numeric"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                    
                    <!-- Dates Section -->
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-3 primary--text">{{ $t("Time Period") }}
                        </div>
                        <v-row>
                            <v-col cols="12" md="3">
                                <v-menu v-model="dateCreate" :close-on-content-click="false"
                                transition="scale-transition" max-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="createoDate" :label="$t('Start date')" readonly
                                    outlined dense hide-details v-bind="attrs" v-on="on"
                                    prepend-inner-icon="mdi-calendar-plus" clearable
                                    @click:clear="createoDate = ''"
                                    ></v-text-field>
                                </template>
                                <v-date-picker v-model="createoDate" @input="dateCreate = false"
                                color="teal darken-4"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-menu v-model="date" :close-on-content-click="false"
                            transition="scale-transition" max-width="290px">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="fromDate" :label="$t('On hold start') + '*'" readonly
                                outlined dense hide-details v-bind="attrs" v-on="on"
                                prepend-inner-icon="mdi-calendar-start" clearable
                                @click:clear="fromDate = ''"></v-text-field>
                            </template>
                            <v-date-picker v-model="fromDate" @input="date = false"
                            color="teal darken-4"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-menu v-model="dateTo" :close-on-content-click="false"
                        transition="scale-transition" max-width="290px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="toDate" :label="$t('On hold end')" readonly outlined
                            dense hide-details v-bind="attrs" v-on="on"
                            prepend-inner-icon="mdi-calendar-end" clearable
                            @click:clear="toDate = ''"></v-text-field>
                        </template>
                        <v-date-picker v-model="toDate" @input="dateTo = false"
                        color="teal darken-4" :min="fromDate"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col cols="12" md="3">
                    <v-menu v-model="s_fullfiledate" :close-on-content-click="false"
                    transition="scale-transition" max-width="290px">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="fullfilldate" :label="$t('Full fill date')" readonly
                        outlined dense hide-details v-bind="attrs" v-on="on"
                        prepend-inner-icon="mdi-calendar-plus" clearable
                        @click:clear="fullfilldate = ''"></v-text-field>
                    </template>
                    <v-date-picker v-model="fullfilldate" @input="s_fullfiledate = false"
                    color="teal darken-4"></v-date-picker>
                    </v-menu>
            </v-col>
        </v-row>
    </v-col>
    <!-- Note Section -->
    <v-col cols="12">
        <div class="text-subtitle-1 font-weight-bold mb-3 primary--text">{{ $t("Additional Information")}}
        </div>
        <v-textarea v-model="demand.content" :label="$t('Content') + '*'" outlined
        hide-details="auto" rows="3" counter prepend-inner-icon="mdi-text-box"></v-textarea>
    </v-col>
</v-row>
</v-form>
</v-card-text>
<v-divider></v-divider>
<v-card-actions class="pa-6">
    <v-btn color="error" @click="showDialog = false" class="px-6" :disabled="loading" elevation="2">
        <v-icon left>mdi-close</v-icon>
        {{ $t("Cancel") }}
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn color="success" @click="saveDemand" class="px-6" :loading="loading" elevation="2">
        <v-icon left>mdi-content-save</v-icon>
        {{ $t("Save") }}
    </v-btn>
</v-card-actions>
</v-card>
</v-dialog>

<!-- Note Detail Dialog -->
<v-dialog v-model="noteDialog" max-width="700">
    <v-card>
        <v-card-title class="teal darken-4 white--text">
            <span>{{ $t("Note Details") }}</span>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="noteDialog = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
            <div class="note-content">{{ selectedNote }}</div>
        </v-card-text>
    </v-card>
</v-dialog>

<!-- Candidates Detail Dialog -->
<v-dialog v-model="candidatesDialog" max-width="700">
    <v-card>
        <v-card-title class="teal darken-4 white--text">
            <span>{{ $t("Candidates Details") }}</span>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="candidatesDialog = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text class="pt-4">
            <v-data-table :headers="candidateHeaders" :items="parsedCandidates" :items-per-page="10" :loading="loading"
          fixed-header class="elevation-4 rounded-lg" :footer-props="{
            'items-per-page-options': [10, 15, 30, 100],
            'show-current-page': true,
            'show-first-last-page': true
          }">
            <template v-slot:[`item.empno`]="{ item }">
                <div class="d-flex align-center">
                    <v-icon small class="mr-1">mdi-card-account-details</v-icon>
                    {{ item.empno }}
                </div>
            </template>
            <template v-slot:[`item.name`]="{ item }">
                <div class="d-flex align-center">
                    <v-icon small class="mr-1">mdi-account</v-icon>
                    {{ item.name }}
                </div>
            </template>
            <template v-slot:[`item.date`]="{ item }">
                <div class="d-flex align-center">
                    <v-icon small class="mr-1">mdi-calendar-clock</v-icon>
                    {{ formatDate(item.date) }}
                </div>
            </template>
            
        </v-data-table>
    </v-card-text>
</v-card>
</v-dialog>

<!-- Add this confirmation dialog -->
<v-dialog v-model="confirmDialog" max-width="400">
    <v-card>
        <v-card-title class="text-h5">{{ $t('Warning') }}</v-card-title>
        <v-card-text>{{ $t('Do you want to delete this demand?') }}</v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey darken-1" text @click="confirmDialog = false">
                {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="red darken-1" text @click="confirmDelete">
                {{ $t('OK') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</v-row>
</template>

<script>
    import dayjs from 'dayjs';
    import * as XLSX from 'xlsx';
        import DSFilter from '@/components/DsFilter.vue'
    
    export default {
        components: { DSFilter },
        data() {
            return {
                api: 'http://gmo021.cansportsvg.com/api/aw-recuitingReport/',
                demand: {
                    department: '',
                    sub_department: '',
                    sub_division: '',
                    position: '',
                    sub_position: '',
                    quantity: '',
                    content: ''
                },
                itemsPos: ['All', 'Worker', 'Staff', 'Staff (lang)', 'Leader', 'Translator', 'Engineer'],
                itemsSub_staff: ['HR Assistant', 'Prod assistant', 'Maintenace', 'Technical', 'Officer'],
                itemsSub_Pos: ['HR Assistant', 'Prod assistant', 'Maintenace', 'Technical', 'Officer'],
                itemsSub_Pos_cn: ['Chinese 2 Skills', 'Chinese 4 Skills', 'English 2 Skills', 'English 4 Skills'],
                headers: [
                { text: 'ID', value: 'dem_id',sortable:false },
                { text: 'Division', value: 'dem_dept',sortable:false},
                { text: 'Dept', value: 'dem_sub_department' ,sortable:false},
                { text: 'Unit', value: 'dem_unit' ,sortable:false},
                { text: 'Position', value: 'dem_position' ,sortable:false},
                { text: 'Sub Position', value: 'dem_sub_position' ,sortable:false},
                { text: 'Amount', value: 'dem_amount' ,sortable:false, align: 'center'},
                { text: 'Request date', value: 'dem_inputdate' ,sortable:false},
                { text: 'Recruited', value: 'dem_recruited' ,sortable:false,align: 'center'},
                { text: 'Full filled', value: 'dem_fulfilled' ,sortable:false},
                { text: 'Full filled date', value: 'dem_fullfilldate' ,sortable:false},
                { text: 'Still in need', value: 'stocknumber' ,sortable:false,align: 'center'},
                { text: 'Note', value: 'dem_note', sortable: false },
                { text: 'Candidates', value: 'dem_candidates' ,sortable:false,align: 'center'},
                { text: 'On hold start', value: 'dem_pause_start_at' ,sortable:false},
                { text: 'On hold end', value: 'dem_pause_end_at' ,sortable:false},
                { text: 'Actions', value: 'actions' }
                ],
                showDialog: false,
                date: false,
                dateTo: false,
                fromDate: '',
                toDate: '',
                loading: false,
                search: '',
                demandRules: {
                    required: v => !!v || 'This field is required',
                    number: v => Number.isInteger(Number(v)) && Number(v) > 0 || 'Must be a positive number'
                },
                createoDate: dayjs().format('YYYY-MM-DD'),
                dateCreate: false,
                demandData: [],
                dept: [],
                id: '',
                noteDialog: false,
                selectedNote: '',
                candidatesDialog: false,
                selectedCandidates: '',
                selectDept: '',
                itemsSelectDept: [], // giữ nguyên để tương thích với code cũ
                itemsSelectUnit: [], // giữ nguyên để tương thích với code cũ
                departmentData: [], // thêm mới để lưu trữ cấu trúc dữ liệu phòng ban
                itemsDiv: [], // thêm mới để lưu trữ cấu trúc dữ liệu đơn vị
                selectedPositions: [],
                originalDemandData: [],
                parsedCandidates: [],
                candidateHeaders: [
                { text: 'Empno', value: 'empno', align: 'start' },
                { text: 'Name', value: 'name' },
                { text: 'In date', value: 'date' }
                ],
                formValid: false,
                rules: {
                    required: v => !!v || this.$t('This field is required'),
                    number: v => (!!v && Number(v) > 0) || this.$t('Must be greater than 0')
                },
                fullfilldate: '',
                s_fullfiledate: false,
                confirmDialog: false,
                selectedItem: null,
                filters: {
                    dem_dept: [],
                    dem_sub_department: [],
                    dem_unit: [],
                    dem_position: [],
                    dem_sub_position: [],
                    dem_amount: [],
                    dem_inputdate: [],
                    dem_recruited: [],
                    dem_fulfilled: [],
                    dem_fullfilldate: [],
                    stocknumber: [],
                    dem_note: [],
                    dem_candidates: [],
                    dem_pause_start_at: [],
                    dem_pause_end_at: []
                },
                filterItems: {
                    dem_dept: [],
                    dem_sub_department: [],
                    dem_unit: [],
                    dem_position: [],
                    dem_sub_position: [],
                    dem_amount: [],
                    dem_inputdate: [],
                    dem_recruited: [],
                    dem_fulfilled: [],
                    dem_fullfilldate: [],
                    stocknumber: [],
                    dem_note: [],
                    dem_candidates: [],
                    dem_pause_start_at: [],
                    dem_pause_end_at: []
                },
                visibleColumns: [], // Store visible column values
                selectAllColumns: true,
                selectedColumns: [], // Add this for multiple selection tracking
                demIdError: '', // Add this for ID validation error message
                requiredFields: [
                    {field: 'dem_id', label: 'Demand ID'},
                    {field: 'dem_dept', label: 'Division'},
                    {field: 'dem_sub_department', label: 'Department'},
                    {field: 'dem_unit', label: 'Unit'},
                    {field: 'dem_position', label: 'Position'},
                    {field: 'dem_amount', label: 'Amount'}
                ]
            }
        },
        computed: {
            totalSum() {
                const totals = this.headers.reduce((acc, header) => {
                    acc[header.value] = 0;
                    return acc;
                }, {});
                
                this.mappedDemandData.forEach(item => {
                    Object.keys(totals).forEach(key => {
                        if (key === 'dem_candidates') {
                            totals[key] += this.getCandidatesCount(item[key]);
                        } else if (key === 'dem_fulfilled') {
                        } else {
                            totals[key] += parseInt(item[key]) || 0;
                        }
                    });
                });
                totals['dem_fulfilled'] = {
                    yes: this.countFulfilled(this.mappedDemandData, 'yes'),
                    no: this.countFulfilled(this.mappedDemandData, 'no')
                };
                return totals;
            },
            mappedDemandData() {
                let filteredData = [...this.demandData];
                if (this.selectDept) {
                    const deptId = this.getDepartmentId(this.selectDept);
                    filteredData = filteredData.filter(item =>
                    parseInt(item.dem_dept) === deptId
                    );
                }
                if (this.selectedPositions.length > 0) {
                    if (this.selectedPositions.includes('All')) {
                        this.selectedPositions = ['All'];
                        
                    } else {
                        filteredData = filteredData.filter(item =>
                        this.selectedPositions.includes(item.dem_position)
                        );
                    }
                }
                Object.entries(this.filters).forEach(([key, values]) => {
                    if (values && values.length > 0) {
                        filteredData = filteredData.filter(item => {
                            if (key === 'dem_dept') {
                                return values.includes(this.getDepartmentName(item[key]));
                            }
                            if (key === 'dem_candidates') {
                                return values.includes(this.getCandidatesCount(item[key]).toString());
                            }
                            if (['dem_amount', 'stocknumber', 'dem_recruited'].includes(key)) {
                                return values.includes(item[key]?.toString());
                            }
                            return values.includes(item[key]);
                        });
                    }
                });
                
                return filteredData.map(item => ({
                    ...item,
                    dem_dept_raw: item.dem_dept, // Store the original department ID
                    dem_dept: this.getDepartmentName(item.dem_dept) // Map the department name for display
                }));
            },
            getSubPositionItems() {
                switch (this.demand.position) {
                    case 'Staff':
                    return this.itemsSub_staff;
                    case 'Staff (lang)':
                    return this.itemsSub_Pos;
                    case 'Translator':
                    return this.itemsSub_Pos_cn;
                    default:
                    return [];
                }
            },
            getSubPositionHint() {
                if (!['Staff', 'Staff (lang)', 'Translator'].includes(this.demand.position)) {
                    return this.$t('Only available for Staff, Staff (lang) and Translator');
                }
                return '';
            },
            // Sửa computed property filteredUnits
            filteredUnits() {
                if (!this.demand.department) return [];
                
                const selectedDept = this.departmentData.find(
                dept => dept.department === this.demand.department
                );
                // Trả về mảng tên của các units thay vì object
                return selectedDept ? selectedDept.units.map(unit => unit.name) : [];
            },
            // Add new computed property for sub_division options
            filteredSubUnits() {
                if (!this.demand.department || !this.demand.sub_department) return [];
                
                const selectedDept = this.departmentData.find(
                dept => dept.department === this.demand.department
                );
                
                if (!selectedDept) return [];
                
                const selectedUnit = selectedDept.units.find(
                unit => unit.name === this.demand.sub_department
                );
                
                return selectedUnit ? selectedUnit.sub_units : [];
            },
            visibleHeaders() {
                return this.headers.filter(header => 
                    this.visibleColumns.includes(header.value) || header.value === 'actions'
                );
            },
            
        },
        methods: {
            countFulfilled(data, value) {
                return data.filter(item => item.dem_fulfilled === value).length;
            },
            getDepartmentName(deptId) {
                const department = this.dept.find(d => d.id === parseInt(deptId));
                return department ? department.department : deptId;
            },
            getDepartmentId(deptName) {
                const department = this.dept.find(d => d.department === deptName);
                return department ? department.id : null;
            },
            getCandidatesCount(candidates) {
                try {
                    const parsedCandidates = JSON.parse(candidates || '[]');
                    return parsedCandidates.length;
                } catch (error) {
                    console.error("Error parsing candidates:", error);
                    return 0;
                }
            },
            async fetchDemand() {
                this.loading = true;
                try {
                    const res = await this.$axios.get(this.api + 'getAllDemandData');
                    this.demandData = res.data;
                    this.originalDemandData = [...res.data];
                    this.updateFilterItems(); // Update filter options after fetching data
                } catch (err) {
                    console.log(err);
                } finally {
                    this.loading = false;
                }
            },
            async editItem(item) {
                console.log(item);
                this.id = item.id;
                this.demand.department = this.getDepartmentName(item.dem_dept);
                await this.$nextTick();
                this.demand.sub_department = item.dem_sub_department;
                await this.$nextTick();
                
                
                this.demand = {
                    ...this.demand,
                    dem_id: item.dem_id,
                    position: item.dem_position,
                    sub_position: item.dem_sub_position,
                    quantity: item.dem_amount,
                    content: item.dem_note,
                    sub_division: item.dem_unit
                };
                
                this.fromDate = item.dem_pause_start_at;
                this.toDate = item.dem_pause_end_at;
                this.createoDate = dayjs(item.dem_inputdate).format('YYYY-MM-DD');
                this.fullfilldate = item.dem_fullfilldate;
                
                this.showDialog = true;
            },
            async deleteItem(item) {
                this.selectedItem = item;
                this.confirmDialog = true;
            },
            
            async confirmDelete() {
                if (!this.selectedItem) return;
                
                try {
                    this.loading = true;
                    this.confirmDialog = false;
                    const res = await this.$axios.post(this.api + 'deleteDemandById', {
                        id: this.selectedItem.id
                    });
                    
                    if (res.status === 200) {
                        this.$notify({
                            title: 'Success',
                            text: this.$t('Demand deleted successfully'),
                            type: 'success'
                        });
                        this.fetchDemand();
                    }
                } catch (error) {
                    console.error("Error deleting demand:", error);
                    this.$notify({
                        title: 'Error',
                        text: error.response?.data?.message || this.$t('Failed to delete demand'),
                        type: 'error' 
                    });
                } finally {
                    this.loading = false;
                    this.selectedItem = null;
                }
            },
            updateFulfilled(value, item) {
                item.dem_fulfilled = value ? 'yes' : 'no';
            },
            async getAllDept() {
                try {
                    const response = await this.$axios.get(this.api + 'getDataDeptCode');
                    this.dept = response.data.dataDeptCode;
                    
                    const deptMap = new Map();
                    
                    // Bước 1: Thu thập tất cả departments, bất kể end_date
                    this.dept.forEach(item => {
                        if (!deptMap.has(item.department)) {
                            deptMap.set(item.department, {
                                department: item.department,
                                units: new Map(),
                            });
                        }
                        
                        // Khởi tạo unit nếu chưa tồn tại
                        const deptData = deptMap.get(item.department);
                        if (!deptData.units.has(item.sub_department)) {
                            deptData.units.set(item.sub_department, new Set());
                        }
                        
                        // Chỉ thêm sub_division khi end_date là null
                        if (!item.end_date && item.sub_division) {
                            deptData.units.get(item.sub_department).add(item.sub_division);
                        }
                    });
                    
                    // Chuyển đổi cấu trúc dữ liệu để sử dụng
                    this.departmentData = Array.from(deptMap.values()).map(dept => ({
                        department: dept.department,
                        units: Array.from(dept.units.entries()).map(([unitName, subUnits]) => ({
                            name: unitName,
                            sub_units: Array.from(subUnits)
                        })),
                    }));
                    
                    // Cập nhật danh sách departments cho select box
                    this.itemsSelectDept = this.departmentData.map(dept => dept.department);
                    
                } catch (error) {
                    console.error("Error fetching department data:", error);
                }
            },
            updateSubUnits() {
                if (this.demand.department && this.demand.sub_department) {
                    const dept = this.departmentData.find(d => d.department === this.demand.department);
                    if (dept) {
                        const unit = dept.units.find(u => u.name === this.demand.sub_department);
                        if (unit) {
                            this.itemsDiv = unit.sub_units;
                            return;
                        }
                    }
                }
                this.itemsDiv = [];
            },
            resetForm() {
                // Reset demand object
                this.demand = {
                    department: '',
                    sub_department: '',
                    sub_division: '',
                    position: '',
                    sub_position: '',
                    quantity: '',
                    content: ''
                };
                
                // Reset dates
                this.fromDate = '';
                this.toDate = '';
                this.createoDate = dayjs().format('YYYY-MM-DD');
                this.fullfilldate = '';
                
                // Reset ID
                this.id = '';
                
                // Reset form validation
                if (this.$refs.form) {
                    this.$refs.form.reset();
                }
            },
            
            async saveDemand() {
                if (!this.validateRequiredFields()) {
                    return;
                }
                
                // await this.validateDemId();
                if (this.demIdError) {
                    this.$notify({
                        title: 'Error',
                        text: this.demIdError,
                        type: 'error'
                    });
                    return;
                }
                
                let data = {
                    id: this.id,
                    dem_id: this.demand.dem_id,
                    dem_dept: this.getDepartmentId(this.demand.department),
                    dem_sub_department: this.demand.sub_department,
                    dem_unit: this.demand.sub_division,
                    dem_position: this.demand.position,
                    dem_sub_position: this.demand.sub_position,
                    dem_amount: this.demand.quantity,
                    dem_inputdate: this.createoDate,
                    dem_pause_start_at: this.fromDate,
                    dem_pause_end_at: this.toDate,
                    dem_note: this.demand.content,
                    dem_fullfilldate: this.fullfilldate,
                };
                try {
                    this.loading = true;
                    const res = await this.$axios.post(this.api + 'addDemand', data);
                    if (res.status === 200) {
                        this.$notify({
                            title: 'Demand',
                            text: 'Demand saved successfully',
                            type: 'success'
                        });
                        this.showDialog = false;
                        this.fetchDemand();
                        this.resetForm(); // Add this line to reset the form
                    }
                } catch (error) {
                    console.error("Error saving demand:", error);
                } finally {
                    this.loading = false;
                }
                
            },
            async validateDemId() {
                if (!this.demand.dem_id) return;
                
                try {
                    const res = await this.$axios.post(this.api + 'checkDemandId', {
                        dem_id: this.demand.dem_id,
                    });
        
                    if (res.data.exists) {
                        this.demIdError = this.$t('This ID already exists');
                    } else {
                        this.demIdError = '';
                    }
                } catch (error) {
                    console.error('Error checking demand ID:', error);
                    this.demIdError = this.$t('Error checking ID');
                }
            },
            showNoteDialog(item) {
                this.selectedNote = item.dem_note;
                this.noteDialog = true;
            },
            formatDate(date) {
                return date ? dayjs(date).format('YYYY-MM-DD') : '';
            },
            filterData() {
                if (!this.selectDept && this.selectedPositions.length === 0) {
                    this.demandData = [...this.originalDemandData];
                }
            },
            handlePositionSelect(position) {
                if (position === 'All') {
                    this.selectedPositions = ['All'];
                } else {
                    this.selectedPositions = this.selectedPositions.filter(p => p !== 'All');
                    
                    if (this.selectedPositions.includes(position)) {
                        this.selectedPositions = this.selectedPositions.filter(p => p !== position);
                    } else {
                        this.selectedPositions.push(position);
                    }
                }
            },
            exportToExcel() {
                const exportData = this.mappedDemandData.map(item => ({
                    'ID': item.dem_id,
                    'Division': item.dem_dept,
                    'Dept': item.dem_sub_department,
                    'Unit': item.dem_unit,
                    'Position': item.dem_position,
                    'Sub Position': item.dem_sub_position,
                    'Amount': item.dem_amount,
                    'Request Date': item.dem_inputdate,
                    'Recruited': item.dem_recruited,
                    'Fulfilled': item.dem_fulfilled,
                    'Fulfilled Date': item.dem_fullfilldate,
                    'Still in Need': item.stocknumber,
                    'Candidates': this.getCandidatesCount(item.dem_candidates),
                    'Note': item.dem_note,
                    'On hold start': item.dem_pause_start_at,
                    'On hold end': item.dem_pause_end_at
                }));
                
                const ws = XLSX.utils.json_to_sheet(exportData);
                
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Demand Report');
                
                const fileName = `demand_report_${dayjs().format('YYYY-MM-DD')}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                this.$notify({
                    title: 'Successfully',
                    text: 'Excel file exported successfully',
                    type: 'success'
                });
            },
            showCandidatesDialog(candidates) {
                try {
                    this.parsedCandidates = JSON.parse(candidates || '[]');
                    if (this.parsedCandidates.length > 0) {
                        this.candidatesDialog = true;
                    } else {
                        this.$notify({
                            title: 'No Candidates',
                            text: 'No candidates data available',
                            type: 'info'
                        });
                    }
                } catch (error) {
                    this.$notify({
                        title: 'Error',
                        text: 'Error loading candidates data',
                        type: 'error'
                    });
                }
            },
            updateFilter(field, values) {
                this.filters[field] = values;
            },
        
            updateFilterItems() {
                Object.keys(this.filterItems).forEach(key => {
                    const uniqueValues = new Set();
                    
                    this.demandData.forEach(item => {
                        let value;
                        
                        if (key === 'dem_dept') {
                            value = this.getDepartmentName(item[key]);
                        } else if (key === 'dem_candidates') {
                            value = this.getCandidatesCount(item[key]).toString();
                        } else if (['dem_amount', 'stocknumber', 'dem_recruited'].includes(key)) {
                            value = item[key]?.toString();
                        } else {
                            value = item[key];
                        }
        
                        if (value !== undefined && value !== null && value !== '') {
                            uniqueValues.add(value);
                        }
                    });
        
                    this.filterItems[key] = Array.from(uniqueValues).sort();
                });
            },
        
            resetFilters() {
                Object.keys(this.filters).forEach(key => {
                    this.filters[key] = [];
                });
                this.selectDept = '';
                this.selectedPositions = [];
            },
            updateVisibleColumns() {
                this.visibleColumns = [...this.selectedColumns];
                this.selectAllColumns = this.selectedColumns.length === this.headers.length - 1;
            },
            toggleAllColumns(value) {
                if (value) {
                    this.selectedColumns = this.headers
                        .filter(h => h.value !== 'actions')
                        .map(h => h.value);
                } else {
                    this.selectedColumns = [];
                }
                this.updateVisibleColumns();
            },
            initializeVisibleColumns() {
                this.selectedColumns = this.headers
                    .filter(h => h.value !== 'actions')
                    .map(h => h.value);
                this.visibleColumns = [...this.selectedColumns];
                this.selectAllColumns = true;
            },
            loadColumnSettings() {
                const savedColumns = localStorage.getItem('tableColumns');
                if (savedColumns) {
                    this.selectedColumns = JSON.parse(savedColumns);
                    this.visibleColumns = [...this.selectedColumns];
                    this.selectAllColumns = this.selectedColumns.length === this.headers.length - 1;
                } else {
                    this.initializeVisibleColumns();
                }
            },
        
            saveColumnSettings() {
                localStorage.setItem('tableColumns', JSON.stringify(this.visibleColumns));
                this.$notify({
                    title: 'Success',
                    text: this.$t('Column settings saved'),
                    type: 'success'
                });
            },
            closeMenu() {
                this.$refs.menu.isActive = false;
            },
            validateRequiredFields() {
                const missingFields = [];
                
                if (!this.demand.dem_id) missingFields.push(this.$t('Demand ID'));
                if (!this.demand.department) missingFields.push(this.$t('Division'));
                if (!this.demand.sub_department) missingFields.push(this.$t('Department'));
                if (!this.demand.sub_division) missingFields.push(this.$t('Unit'));
                if (!this.demand.position) missingFields.push(this.$t('Position'));
                if (!this.demand.quantity) missingFields.push(this.$t('Amount'));
      
                if (missingFields.length > 0) {
                  this.$notify({
                    title: this.$t('Error'),
                    text: this.$t('Please fill in the following required fields:') + ' ' + missingFields.join(', '),
                    type: 'error'
                  });
                  return false;
                }
      
                return true;
              }
        },
        watch: {
            'demand.department': {
                handler(newDept) {
                    const dept = this.departmentData.find(d => d.department === newDept);
                    this.itemsSelectUnit = dept ? dept.units.map(u => u.name) : [];
                    this.demand.sub_department = '';
                    this.demand.sub_division = '';
                    this.itemsDiv = [];
                },
                immediate: true
            },
            'demand.sub_department': {
                handler(newUnit) {
                    this.updateSubUnits();
                    this.demand.sub_division = '';
                }
            },
            demandData: {
                handler() {
                    this.updateFilterItems();
                },
                deep: true
            },
            visibleColumns: {
                handler(newVal) {
                    this.selectAllColumns = newVal.length === this.headers.length - 1;
                },
                deep: true
            },
            selectedColumns: {
                handler(newVal) {
                    this.selectAllColumns = newVal.length === this.headers.length - 1;
                },
                deep: true
            }
        },
      async  mounted() {
          await  this.getAllDept();
            this.fetchDemand();
            this.initializeVisibleColumns();
            this.loadColumnSettings();
        }
    }
</script>

<i18n>
    {
        "en": {
            "Total": "Total",
            "Demand management": "Demand Management",
            "Search": "Search",
            "Add demand": "Add Demand",
            "Department": "Dept",
            "Position Apply": "Position Apply",
            "Division": "Division",
            "Unit": "Unit", 
            "Position": "Position",
            "Sub Position": "Sub Position",
            "Amount": "Amount",
            "Request date": "Request Date",
            "Recruited": "Recruited",
            "Full filled": "Fulfilled",
            "Full filled date": "Fulfilled Date",
            "Still in need": "Still in Need",
            "Note": "Note",
            "Candidates": "Candidates",
            "On hold start": "On hold start",
            "On hold end": "On hold end",
            "Edit demand": "Edit Demand",
            "Basic Information": "Basic Information",
            "Time Period": "Time Period",
            "Start date": "Start Date",
            "On hold start": "On Hold Start",
            "On hold end": "On Hold End",
            "Additional Information": "Additional Information",
            "Content": "Content",
            "Cancel": "Cancel", 
            "Save": "Save",
            "Note Details": "Note Details",
            "Candidates Details": "Candidates Details",
            "Export excel": "Export Excel",
            "This field is required": "This field is required",
            "Must be greater than 0": "Must be greater than 0",
            "Please fill all required fields": "Please fill all required fields",
            "Only available for Staff, Staff (lang) and Translator": "Only available for Staff, Staff (lang) and Translator",
            "Warning": "Warning",
            "Do you want to delete this demand?": "Do you want to delete this demand?",
            "Failed to delete demand": "Failed to delete demand",
            "OK": "OK",
            "Success": "Success",
            "Error": "Error",
            "Demand deleted successfully": "Demand deleted successfully",
            "Error saving demand": "Error saving demand",
            "Successfully": "Successfully",
            "Excel file exported successfully": "Excel file exported successfully",
            "No Candidates": "No Candidates",
            "No candidates data available": "No candidates data available",
            "Error loading candidates data": "Error loading candidates data",
            "Cancel": "Cancel",
            "Actions": "Actions",
            "Toggle Columns": "Toggle Columns",
            "Select All": "Select All",
            "Column Settings": "Column Settings",
            "Column settings saved": "Column settings saved",
            "This ID already exists": "This ID already exists",
            "Error checking ID": "Error checking ID",
            "Please fill in the following required fields": "Please fill in the following required fields"
            
        },
        "vi": {
            "Total": "Tổng",
            "Demand management": "Quản lý nhu cầu",
            "Search": "Tìm kiếm",
            "Add demand": "Thêm nhu cầu",
            "Department": "Bộ phận",
            "Position Apply": "Vị trí ứng tuyển",
            "Division": "Cấp sở",
            "Unit": "Đơn vị",
            "Position": "Vị trí",
            "Sub Position": "Vị trí phụ",
            "Amount": "Số lượng",
            "Request date": "Ngày yêu cầu",
            "Recruited": "Đã tuyển",
            "Full filled": "Hoàn thành",
            "Full filled date": "N.hoàn thành",
            "Still in need": "Còn thiếu",
            "Note": "Ghi chú",
            "Candidates": "Ứng viên",
            "On hold start": "Từ ngày",
            "On hold end": "Đến ngày",
            "Edit demand": "Sửa nhu cầu",
            "Basic Information": "Thông tin cơ bản",
            "Time Period": "Thời gian",
            "Start date": "Ngày bắt đầu",
            "On hold start": "Bắt đầu tạm dừng",
            "On hold end": "Kết thúc tạm dừng",
            "Additional Information": "Thông tin bổ sung",
            "Content": "Nội dung",
            "Cancel": "Hủy",
            "Save": "Lưu",
            "Note Details": "Chi tiết ghi chú",
            "Candidates Details": "Chi tiết ứng viên",
            "Export excel": "Xuất Excel",
            "This field is required": "Trường này là bắt buộc",
            "Must be greater than 0": "Phải lớn hơn 0",
            "Please fill all required fields": "Vui lòng điền đầy đủ các trường bắt buộc",
            "Only available for Staff, Staff (lang) and Translator": "Chỉ khả dụng cho Nhân viên, Nhân viên (ngôn ngữ) và Phiên dịch",
            "Warning": "Cảnh báo",
            "Do you want to delete this demand?": "Bạn có muốn xóa nhu cầu này không?",
            "Failed to delete demand": "Không thể xóa nhu cầu",
            "OK": "Đồng ý",
            "Success": "Thành công",
            "Error": "Lỗi",
            "Demand deleted successfully": "Xóa nhu cầu thành công",
            "Error saving demand": "Lỗi khi lưu nhu cầu",
            "Successfully": "Thành công",
            "Excel file exported successfully": "Xuất file Excel thành công",
            "No Candidates": "Không có ứng viên",
            "No candidates data available": "Không có dữ liệu ứng viên",
            "Error loading candidates data": "Lỗi khi tải dữ liệu ứng viên",
            "Cancel": "Hủy",
            "Actions": "Hành động",
            "Toggle Columns": "Ẩn/Hiện Cột",
            "Select All": "Chọn Tất Cả",
            "Column Settings": "Cài Đặt Cột",
            "Column settings saved": "Đã lưu cài đặt cột",
            "This ID already exists": "ID này đã tồn tại",
            "Error checking ID": "Lỗi kiểm tra ID",
            "Please fill in the following required fields": "Vui lòng điền các trường bắt buộc sau"
            
        },
        "cn": {
            "Total": "总计",
            "Demand management": "需求管理",
            "Search": "搜索",
            "Add demand": "添加需求",
            "Department": "部",
            "Position Apply": "申请职位",
            "Division": "處", 
            "Unit": "单位",
            "Position": "职位",
            "Sub Position": "子职位",
            "Amount": "数量",
            "Request date": "申请日期",
            "Recruited": "已招聘",
            "Full filled": "已完成",
            "Full filled date": "完成日期",
            "Still in need": "仍需要",
            "Note": "备注",
            "Candidates": "候选人",
            "On hold start": "开始日期",
            "On hold end": "结束日期",
            "Edit demand": "编辑需求",
            "Basic Information": "基本信息",
            "Time Period": "时间段",
            "Start date": "开始日期",
            "On hold start": "暂停开始",
            "On hold end": "暂停结束",
            "Additional Information": "附加信息",
            "Content": "内容",
            "Cancel": "取消",
            "Save": "保存",
            "Note Details": "备注详情",
            "Candidates Details": "候选人详情",
            "Export excel": "导出Excel",
            "This field is required": "此字段为必填项",
            "Must be greater than 0": "必须大于0",
            "Please fill all required fields": "请填写所有必填字段",
            "Only available for Staff, Staff (lang) and Translator": "仅适用于职员、语言职员和翻译",
            "Warning": "警告",
            "Do you want to delete this demand?": "您要删除此需求吗？", 
            "Failed to delete demand": "删除需求失败",
            "OK": "好的",
            "Success": "成功",
            "Error": "错误",
            "Demand deleted successfully": "需求删除成功",
            "Error saving demand": "保存需求时出错",
            "Successfully": "成功",
            "Excel file exported successfully": "Excel文件导出成功",
            "No Candidates": "没有候选人",
            "No candidates data available": "没有候选人数据",
            "Error loading candidates data": "加载候选人数据时出错",
            "Cancel": "取消",
            "Actions": "操作",
            "Toggle Columns": "显示/隐藏列",
            "Select All": "全选",
            "Column Settings": "列设置",
            "Column settings saved": "列设置已保存",
            "This ID already exists": "此ID已存在",
            "Error checking ID": "检查ID时出错",
            "Please fill in the following required fields": "请填写以下必填字段"
        }
    }
</i18n>

<style scoped>
    .demand-card {
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s ease;
        background: #f8f9fa;
    }
    
    .search-field {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 20px;
        transition: all 0.3s ease;
    }
    
    .search-field:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    .form-card {
        border-radius: 12px !important;
        overflow: hidden;
    }
    
    .animate-button {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .animate-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 96, 100, 0.2) !important;
    }
    
    .action-icon {
        transition: all 0.2s ease;
        color: #546E7A;
    }
    
    .action-icon:hover {
        color: #004D40;
        transform: scale(1.2);
    }
    
    .dialog-bottom-transition-enter-active,
    .dialog-bottom-transition-leave-active {
        transition: transform 0.3s ease-in-out;
    }
    
    .dialog-bottom-transition-enter,
    .dialog-bottom-transition-leave-to {
        transform: translateY(100%);
    }
    
    .note-icon {
        cursor: pointer;
        color: #1976D2;
        /* Use blue color to indicate clickable/viewable content */
        transition: all 0.2s ease;
    }
    
    .note-icon:hover {
        transform: scale(1.2);
        opacity: 0.8;
    }
    
    /* Remove old note-text-truncate styles if not used elsewhere */
    
    .note-content {
        white-space: pre-wrap;
        font-size: 14px;
        line-height: 1.6;
        padding: 16px;
        background: #ffffff;
        border-radius: 4px;
        max-height: 400px;
        overflow-y: auto;
        color: #000000;
    }
    
    .candidates-text-truncate {
        display: block;
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        
        &:hover {
            color: #00796b;
        }
    }
    
    .candidates-content {
        white-space: pre-wrap;
        font-size: 14px;
        line-height: 1.6;
        padding: 16px;
        background: #ffffff;
        border-radius: 4px;
        max-height: 400px;
        overflow-y: auto;
        color: #000000;
    }
    
    .v-chip--selected {
        background-color: #00796b !important;
        color: white !important;
    }
    

    
    .gap-1 {
        gap: 4px;
    }
    
    .table-chip {
        font-weight: 500;
        height: 20px !important;
        transition: all 0.2s ease;
        cursor: pointer !important;
        /* Thêm cursor pointer */
    }
    
    .table-chip:hover {
        background-color: var(--v-primary-base) !important;
        color: white !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
    .v-data-table ::v-deep tbody tr:not(.total-row):hover {
        background-color: #f3fd99 !important;
    }
    .total-row {
        background-color: #004D40 !important; /* teal darken-4 */
    }
    
    .total-row td {
        color: white !important;
        font-size: 1.1em !important;
        border-top: 2px solid #004D40 !important; /* teal darken-3 for border */
        border-bottom: none !important;
        text-align: left !important;
    }
    
    .total-row td:first-child {
        background-color: #004D40 !important; /* slightly lighter for first column */
        text-align: center !important;
        position: sticky;
        left: 0;
        z-index: 2;
    }
    .total-row td span {
        display: block;
    }
    .action-buttons {
        display: flex;
        align-items: center;
    }
    .v-list-item {
        min-height: 35px;
    }
    .v-list-item__content {
        padding: 4px 0;
    }
</style>
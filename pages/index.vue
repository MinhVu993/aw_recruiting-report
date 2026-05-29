<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="5" width="100%" :loading="loading">
                <v-app-bar color="teal darken-4" dense dark class="px-2">
                    <v-toolbar-title>
                        <v-icon class="mr-2">mdi-file-document-outline</v-icon>
                        {{ $t("Candidate listing") }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-col cols="2" class="px-2">
                        <v-text-field v-model="search" append-icon="mdi-magnify" :label="$t('Search')" outlined dense
                        hide-details clearable class="search-field"></v-text-field>
                    </v-col>
                    <v-btn dark to="/create-candidate" class="ml-2 btn-hover" color="error">
                        <v-icon left>mdi-account-plus</v-icon>
                        {{ $t("New candidate") }}
                    </v-btn>
                </v-app-bar>
                <v-card-text>
                    <v-data-table :headers="headers" :items="filteredData" :items-per-page="10" :loading="loading"
                    loading-text="Loading data... Please wait" class="elevation-3 data-table"  :footer-props="{
                        'items-per-page-options': [10, 15, 30, 100],
                        'show-current-page': true,
                        'show-first-last-page': true
                    }" >
                    <template #[`footer.prepend`]>
                        <v-btn color="warning" small dark @click="dialogSetEmpno = true">
                            <v-icon left>mdi-cog-outline</v-icon>
                            {{ $t("set new empno") }}
                        </v-btn>
                        <v-btn color="secondary" dark class="ml-3" small>
                            <export-excel worksheet="All data" :data="exporFullData()" :name="`All_data_${today}`">
                                <v-icon left>mdi-file-excel</v-icon>
                                {{ $t("Export all data") }}
                            </export-excel>
                        </v-btn>
                        <v-btn color="primary" dark class="ml-3" small @click="exportHrm">
                            <v-icon left>mdi-file-excel</v-icon>
                            {{ $t("Export HRM") }}
                        </v-btn>
                        <v-btn color="success" dark class="ml-3" small @click="printBQT">
                            <v-icon left>mdi-printer</v-icon>
                            {{ $t("Unswiped Card") }}
                        </v-btn>
                        <v-btn color="error" dark class="ml-3" small @click="printHires">
                            <v-icon left>mdi-printer</v-icon>
                            {{ $t("Print hires") }}
                        </v-btn>
                    </template>
                    <template v-slot:[`item.gender`]="{ item }">
                        {{ item.gender === '1' ? $t('Female') : $t('Male') }}
                    </template>
                    <template v-slot:[`item.apply_dp`]="{ item }">
                        {{ item.apply_dp }}
                    </template>
                    <template v-slot:[`item.hr_ac_qu`]="{ item }">
                        <div class="checkbox-center">
                            <v-checkbox v-model="item.hr_ac_qu" :value="item.hr_ac_qu === 'yes' ? 0 : 1" dense
                            hide-details disabled></v-checkbox>
                        </div>
                    </template>
                    <template v-slot:[`item.dp_ac_qu`]="{ item }">
                        <div class="checkbox-center">
                            <v-checkbox v-model="item.dp_ac_qu" :value="item.dp_ac_qu === 'yes' ? 0 : 1" dense
                            hide-details disabled></v-checkbox>
                        </div>
                    </template>
                    <template v-slot:[`item.emp_demandid`]="{ item }">
                        {{ getDemandId (item.emp_demandid) }}
                    </template>
                    <template v-slot:[`item.reg`]="{ item }">
                        <div class="checkbox-center">
                            <v-checkbox 
                            v-model="item.reg" 
                            :true-value="'yes'" 
                            :false-value="'no'" 
                            dense 
                            hide-details 
                            color="error" 
                            @change="updateReg(item)" 
                            :disabled="item.reg === 'yes' || isUpdating">
                        </v-checkbox>
                    </div>
                </template>
                <template #[`header.key_in_date`]>
                    <DsFilter :name="$t('Key in')" :in-items="filterItems.key_in_date"
                    @changed="updateFilter('key_in_date', $event)" />
                </template>
                <template #[`header.emp_demandid`]>
                    <DsFilter :name="$t('ID DEM')" :in-items="filterItems.emp_demandid"
                    @changed="updateFilter('emp_demandid', $event)" />
                </template>
                <template #[`header.candidate_name`]>
                    <DsFilter :name="$t('Name')" :in-items="filterItems.candidate_name"
                    @changed="updateFilter('candidate_name', $event)" />
                </template>
                <template #[`header.dateofbirth`]>
                    <DsFilter :name="$t('Birth day')" :in-items="filterItems.dateofbirth"
                    @changed="updateFilter('dateofbirth', $event)" />
                </template>
                <template #[`header.gender`]>
                    <DsFilter :name="$t('Sex')" :in-items="filterItems.gender"
                    @changed="updateFilter('gender', $event)" />
                </template>
                <template #[`header.emp_id`]>
                    <DsFilter :name="$t('ID no')" :in-items="filterItems.emp_id"
                    @changed="updateFilter('emp_id', $event)" />
                </template>
                <template #[`header.position`]>
                    <DsFilter :name="$t('Position')" :in-items="filterItems.position"
                    @changed="updateFilter('position', $event)" />
                </template>
                <template #[`header.apply_dp`]>
                    <DsFilter :name="$t('Dept applied')" :in-items="filterItems.apply_dp"
                    @changed="updateFilter('apply_dp', $event)" />
                </template>
                <template #[`header.tmp_departid`]>
                    <DsFilter :name="$t('Unit')" :in-items="filterItems.tmp_departid"
                    @changed="updateFilter('tmp_departid', $event)" />
                </template>
                <template #[`header.hr_ac_qu`]>
                    <DsFilter :name="$t('HR acc')" :in-items="filterItems.hr_ac_qu"
                    @changed="updateFilter('hr_ac_qu', $event)" />
                </template>
                <template #[`header.dp_ac_qu`]>
                    <DsFilter :name="$t('Dept acc')" :in-items="filterItems.dp_ac_qu"
                    @changed="updateFilter('dp_ac_qu', $event)" />
                </template>
                <template #[`header.reg`]>
                    <DsFilter :name="$t('Reg')" :in-items="filterItems.reg"
                    @changed="updateFilter('reg', $event)" />
                </template>
                <template #[`header.ex_en_date`]>
                    <DsFilter :name="$t('Expected')" :in-items="filterItems.ex_en_date"
                    @changed="updateFilter('ex_en_date', $event)" />
                </template>
                <template #[`header.act_en_date`]>
                    <DsFilter :name="$t('Actually date')" :in-items="filterItems.act_en_date"
                    @changed="updateFilter('act_en_date', $event)" />
                </template>
                <template #[`header.note`]>
                    <DsFilter :name="$t('Note')" :in-items="filterItems.note"
                    @changed="updateFilter('note', $event)" />
                </template>
                <template #[`header.user_input`]>
                    <DsFilter :name="$t('Created by')" :in-items="filterItems.user_input"
                    @changed="updateFilter('user_input', $event)" />
                </template>
                <template #[`header.user_update`]>
                    <DsFilter :name="$t('Updated by')" :in-items="filterItems.user_update"
                    @changed="updateFilter('user_update', $event)" />
                </template>
                <template v-slot:[`item.newEmpno`]="{ item }">
                    <v-chip v-if="item.newEmpno" color="success" class="chip" label small>
                        {{ item.newEmpno }}
                    </v-chip>
                    
                </template>
                <template v-slot:[`header.newEmpno`]="{ headers }">
                    {{ $t('Empno HRM') }}
                </template>
                
                <template v-slot:[`item.candidate_name`]="{ item }">
                    <nuxt-link
                    :to="{ path: '../create-candidate', query: { id: item.id, emp: item.candidate_name } }"
                    class="candidate-link">
                    {{ item.candidate_name }}
                </nuxt-link>
            </template>
            <template v-slot:[`item.note`]="{ item }">
                <v-tooltip bottom max-width="300" v-if="item.note">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon 
                        v-bind="attrs"
                        v-on="on"
                        @click="showNoteDialog(item.note)"
                        color="primary"
                        >
                        mdi-information
                    </v-icon>
                </template>
                <span style="white-space: pre-line">{{ getNotePreview(item.note) }}</span>
            </v-tooltip>
        </template>
    </v-data-table>
</v-card-text>
</v-card>
</v-col>
<v-dialog v-model="dialogSetEmpno" width="600">
    <v-card>
        <v-card-title class="text-h5" style="background-color: #00796b; color: white">
            <v-icon color="white" left>mdi-cog-outline</v-icon>
            <span>{{ $t("Configure New Employee Number") }}</span>
            <v-spacer></v-spacer>
            <v-icon @click="dialogSetEmpno = false" color="white">mdi-close</v-icon>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12" class="d-flex mt-5">
                    <v-col cols="3">
                        <v-text-field v-model="newEmpno" :label="$t('Employee number')"
                        placeholder="Enter the latest HRM number" outlined dense hide-details
                        :rules="[v => !!v || $t('Employee number is required')]">
                    </v-text-field>
                </v-col>
                <v-col cols="4">
                    <v-autocomplete dense outlined hide-details v-model="newDeptCongif"
                    :label="$t('Select dept')" :rules="[v => !!v || $t('Dept is required')]"
                    :items="iDeptConfig">
                </v-autocomplete>
            </v-col>
            <v-col cols="5">
                <v-menu v-model="date" :close-on-content-click="false" transition="scale-transition">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="dateAcctual" :label="$t('Actual Work Date')" readonly
                        v-bind="attrs" v-on="on" outlined dense hide-details
                        prepend-inner-icon="mdi-calendar"> </v-text-field>
                    </template>
                    <v-date-picker v-model="dateAcctual" @input="date = false" header-color="teal"
                    :locale="$i18n.locale == 'cn' ? 'zh' : $i18n.locale">
                </v-date-picker>
            </v-menu>
        </v-col>
    </v-col>
</v-row>
</v-card-text>
<v-card-actions>
    <v-btn color="error" @click="dialogSetEmpno = false" outlined small>
        <v-icon>mdi-close</v-icon>
        {{ $t("CLOSE") }}
    </v-btn>
    <v-spacer></v-spacer>
    <v-btn color="success" outlined small @click="setNewEmpno">
        <v-icon>mdi-content-save</v-icon>
        {{ $t("SAVE") }}
    </v-btn>
</v-card-actions>
</v-card>
</v-dialog>
<v-dialog v-model="noteDialog" max-width="500">
    <v-card>
        <v-card-title class="text-h5" style="background-color: #00796b; color: white">
            {{ $t("Note Details") }}
            <v-spacer></v-spacer>
            <v-icon @click="noteDialog = false" color="white">mdi-close</v-icon>
        </v-card-title>
        <v-card-text class="pt-4">
            <p style="white-space: pre-wrap;">{{ selectedNote }}</p>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="noteDialog = false">
                {{ $t("Close") }}
            </v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</v-row>
</template>
<script>
import DSFilter from '@/components/DsFilter.vue'
import dayjs from "dayjs";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';

export default {
    components: { DSFilter },
    data() {
        return {
            today: dayjs().format('YYYY-MM-DD'),
            loading: true,
            api: '/api/aw-recuitingReport/',
            headers: [
            { text: this.$t('Key in'), value: "key_in_date", align: 'center' },
            { text: this.$t('ID DEM'), value: "emp_demandid", align: 'center' },
            { text: this.$t('Name'), value: "candidate_name", align: 'center' },
            { text: this.$t('Birth day'), value: "dateofbirth", align: 'center' },
            { text: this.$t('Sex'), value: "gender", align: 'center' },
            { text: this.$t('ID no'), value: "emp_id", align: 'center' },
            { text: this.$t('Position'), value: "position", align: 'center' },
            { text: this.$t('Dept applied'), value: "apply_dp", align: 'center' },
            { text: this.$t('Unit'), value: "tmp_departid", align: 'center' },
            { text: this.$t('HR acc'), value: "hr_ac_qu", align: 'center' },
            { text: this.$t('Dept acc'), value: "dp_ac_qu", align: 'center' },
            { text: this.$t('Reg'), value: "reg", align: 'center' },
            { text: this.$t('Expected'), value: "ex_en_date", align: 'center' },
            { text: this.$t('Actually date'), value: "act_en_date", align: 'center' },
            { text: this.$t('Empno HRM'), value: "newEmpno", align: 'center' },
            { text: this.$t('Note'), value: "note", align: 'center' },
            
            ],
            dataCadidates: [],
            dialogSetEmpno: false,
            search: '',
            dept: [],
            filter: {
                key_in_date: [],
                emp_demandid: [],
                candidate_name: [],
                dateofbirth: [],
                gender: [],
                emp_id: [],
                position: [],
                apply_dp: [],
                hr_ac_qu: [],
                dp_ac_qu: [],
                reg: [],
                ex_en_date: [],
                act_en_date: [],
                note: [],
                user_input: [],
                user_update: [],
                tmp_departid: [],
            },
            newEmpno: '',
            date: false,
            dateAcctual: '',
            lastEmpno: '',
            duty: [],
            demandId: null,
            demandDept: null,
            newDeptCongif: '',
            iDeptConfig: [],
            noteDialog: false,
            selectedNote: '',
            isUpdating: false,
            DemandData: [],
            sourceRecruiting: [],
        }
    },
    methods: {
        async getAllData() {
            this.loading = true;
            try {
                const response = await this.$axios.get(this.api + 'getDataEmpnoInfo');
                this.dataCadidates = response.data.dataEmpnoInfo;
                this.iDeptConfig = this.dataCadidates.map(item => item.tmp_departid);
            } catch (error) {
                console.error("Error fetching employee data:", error);
            } finally {
                this.loading = false;
            }
        },
        async fetchDemand() {
            this.loading = true;
            try {
                const res = await this.$axios.get(this.api + 'getAllDemandData');
                this.demandData = res.data || [];
            } catch (err) {
                console.log(err);
                this.demandData = [];
            } finally {
                this.loading = false;
            }
        },
        getDemandId(emp_demandid) {
            if (!emp_demandid || !Array.isArray(this.demandData)) return '';
            const demand = this.demandData.find(d => String(d.id) === String(emp_demandid));
            return demand ? demand.dem_id : '';
        },
        async getAllDept() {
            try {
                const response = await this.$axios.get(this.api + 'getDataDeptCode');
                this.dept = response.data.dataDeptCode;
            } catch (error) {
                console.error("Error fetching department data:", error);
            }
        },
        findeptCode(dept) {
            const department = this.dept.find(d => d.id.toString() === dept);
            return department ? department.department : 'N/A';
        },
        async getAllDuty() {
            try {
                const response = await this.$axios.get(this.api + 'getDataDutyHrm');
                let _rData = response.data.dataDutyHrm;
                
                _rData.forEach(item => {
                    item.duty_name = JSON.parse(item.duty_name);
                });
                this.duty = _rData;
            } catch (error) {
                console.error("Error fetching duty data:", error);
            }
            
        },
        
        exportHrm() {
            const data = Array.isArray(this.filteredData) ? this.filteredData : [];
            if (data.length === 0) {
                return [];
            }
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                return dateStr.replace(/-/g, '');
            };
            
            const preserveLeadingZeros = (value) => {
                if (!value) return '';
                const str = value.toString();
                return str.padStart(str.length, '0');
            };
            
            const wb = XLSX.utils.book_new();
            
            const headers = [
            ['人員基本資料'],
            [
            'USERNO', 'SYS_VIEWID', 'SYS_NAME', 'SYS_ENGNAME', 'IDNO', 'TMP_IDYCLASSID', 'TMP_DEPARTID',
            'TMP_DUTYID', 'TMP_CATEGORYID', 'TMP_LEVELID', 'TMP_RANKID', 'ONBOARDDATE', 'TMP_COUNTRYID',
            'BIRTHDATE', 'SEX', 'MARRAGE', 'TMP_OTHER_BIRTHPLAID', 'TMP_PROVINCID', 'TMP_EDUBGID',
            'REGTEL', 'REGADDRESS', 'COMMTEL', 'COMMADDRESS', 'TMP_SITEID', 'TMP_WORKAREAID',
            'TMP_ETHNICID', 'ISDIRECT', 'CONT_DATE', 'TMP_C_ADDRID'
            ],
            [
            '自訂序號', '員工工號', '姓名(本地文)', '姓名(英文)', '身分證號', '參數設定', '帳務部門',
            '職務', '職類', '職等', '職級', '預計到職日', '國籍', '生日', '性別', '婚姻',
            '其他出生地', '省份', '學歷', '戶籍電話', '戶籍住址', '通訊電話', '通訊地址',
            '廠別', '工作區域', '族群身份', 'D/I/O', '身份證簽證日期', '身分證簽發地址編號'
            ],
            [
            '欄位說明', '', '', '', '', '', '', '', '', '', '', '', '', '',
            '99:\n0:男\n1:女',
            '99:\n0:未婚\n1:已婚\n2:離婚\n3:鰥寡',
            '', '', '', '', '', '', '', '', '', '',
            '0:D\n1:I\n3:O',
            '', ''
            ]
            ];
            
            const exportData = data.map((item) => [
            '',
            preserveLeadingZeros(item.newEmpno),
            item.candidate_name,
            item.candidate_name,  // Changed this line to use candidate_name instead of empty string
            preserveLeadingZeros(item.emp_id),
            // ...rest of the mapping remains the same...
            preserveLeadingZeros(item.tmp_idyclass),
            preserveLeadingZeros(item.tmp_departid),
            preserveLeadingZeros(item.tmp_dutyid),
            preserveLeadingZeros(item.tmp_categoryid),
            preserveLeadingZeros(item.tmp_levelid),
            preserveLeadingZeros(item.tmp_rankid),
            formatDate(item.ex_en_date),
            item.national || 'VN',
            formatDate(item.dateofbirth),
            item.gender,
            item.marrage || '0',
            preserveLeadingZeros(item.birth_province),
            preserveLeadingZeros(item.province),
            preserveLeadingZeros(item.edu),
            preserveLeadingZeros(item.regTel),
            item.regAddress,
            preserveLeadingZeros(item.commTel),
            item.commAddress,
            item.tmp_siteid || 'VG',
            item.tmp_workareaid || 'VG',
            item.ethnic || 'A',
            item.isdirect || '1',
            formatDate(item.datecccd),
            preserveLeadingZeros(item.birth_province)
            ]);
            
            const wsData = [...headers, ...exportData];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            const numFmtCols = [1, 4, 5, 6, 7, 8, 9, 10, 16, 17, 18, 19, 21, 28];
            
            numFmtCols.forEach(col => {
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let R = range.s.r + 4; R <= range.e.r; ++R) {
                    const cell_ref = XLSX.utils.encode_cell({ r: R, c: col });
                    if (!ws[cell_ref]) continue;
                    ws[cell_ref].z = '@';
                    ws[cell_ref].t = 's';
                }
            });
            
            ws['!cols'] = Array(29).fill({ wch: 15 });
            
            const wrapColumns = [14, 15, 26];
            
            wrapColumns.forEach(col => {
                const cell_ref = XLSX.utils.encode_cell({ r: 3, c: col });
                if (ws[cell_ref]) {
                    if (!ws[cell_ref].s) ws[cell_ref].s = {};
                    ws[cell_ref].s.alignment = {
                        vertical: 'top',
                        horizontal: 'left',
                        wrapText: true
                    };
                    if (!ws['!rows']) ws['!rows'] = [];
                    ws['!rows'][3] = { hpt: 60 };
                }
            });
            
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cell_ref]) continue;
                    if (!ws[cell_ref].s) ws[cell_ref].s = {};
                    ws[cell_ref].s.alignment = {
                        vertical: 'center',
                        horizontal: 'left'
                    };
                }
            }
            
            XLSX.utils.book_append_sheet(wb, ws, 'HUM0020100A');
            
            const fileName = `HUM1-1 Import file_${dayjs().format('YYYY-MM-DD')}.xlsx`;
            XLSX.writeFile(wb, fileName);
        },
        
        ExportBQT() {
            const data = Array.isArray(this.filteredData) ? this.filteredData : [];
            if (data.length === 0) {
                return [];
            }
            const dutyMap = this.duty.reduce((acc, item) => {
                acc[item.duty_no] = item.duty_name;
                return acc;
            }, {});
            
            const deptMap = this.dept.reduce((acc, item) => {
                acc[item.sub_division] = JSON.parse(item.name).vi || item.sub_division;
                return acc;
            }, {});
            
            return data.map((item, index) => {
                const duty_name = dutyMap[item.tmp_dutyid] ? dutyMap[item.tmp_dutyid]['vi'] : '';
                const dept_name = deptMap[item.tmp_departid] || item.tmp_departid;
                
                return {
                    'no': index + 1,
                    'empno': item.newEmpno ? item.newEmpno.toString() : '',
                    'name': item.candidate_name,
                    'dept': item.tmp_departid,
                    'dept_name': dept_name,
                    'duty': duty_name,
                    'note': '',
                    'act_date': item.ex_en_date,
                };
            });
        },
        
        exportHires() {
            const data = Array.isArray(this.filteredData) ? this.filteredData : [];
            if (data.length === 0) {
                return [];
            }
            const dutyMap = this.duty.reduce((acc, item) => {
                acc[item.duty_no] = item.duty_name;
                return acc;
            }, {});
            
            const deptMap = this.dept.reduce((acc, item) => {
                acc[item.sub_division] = JSON.parse(item.name).vi || item.sub_division;
                return acc;
            }, {});
            
            return data.map((item, index) => {
                const duty_name = dutyMap[item.tmp_dutyid] ? dutyMap[item.tmp_dutyid]['vi'] : '';
                const dept_name = deptMap[item.tmp_departid] || item.tmp_departid;
                
                return {
                    'no': index + 1,
                    'ex_date': item.ex_en_date,
                    'name': item.candidate_name,
                    'duty': duty_name,
                    'dept': dept_name,
                    'result': item.reg,
                    'reasion': item.reason,
                    'change_Date': item.change_en_date,
                    'note': '',
                };
            });
        },
        
        exporFullData() {
            const data = Array.isArray(this.filteredData) ? this.filteredData : [];
            if (data.length === 0) {
                return [];
            }
            
            const dutyMap = this.duty.reduce((acc, item) => {
                acc[item.duty_no] = item.duty_name;
                return acc;
            }, {});
            
            const dept_map = this.dept.reduce((acc, item) => {
                acc[item.id] = item.department;
                return acc;
            }, {});
            
            const sourceMap = this.sourceRecruiting.reduce((acc, item) => {
                const sourceNames = JSON.parse(item.source);
                acc[item.id] = sourceNames;
                return acc;
            }, {});
            
            const toText = (value) => {
                if (value === null || value === undefined) return '';
                return `'${value}`;
            };
            
            const currentLocale = this.$i18n.locale;
            return data.map((item, index) => {
                const duty_name = dutyMap[item.tmp_dutyid] ? dutyMap[item.tmp_dutyid][currentLocale] : '';
                const Dept_appply = dept_map[item.apply_dp] ? dept_map[item.apply_dp] : '';
                const sourceName = sourceMap[item.recru_source] 
                ? sourceMap[item.recru_source][currentLocale] 
                : item.recru_source;
                
                return {
                    'No': index + 1,
                    'Key in': item.key_in_date,
                    'Demand ID': this.getDemandId(item.emp_demandid),
                    'Name': item.candidate_name,
                    'Birth day': item.dateofbirth,
                    'Sex': item.gender,
                    'ID no': toText(item.emp_id),
                    'Position': item.position,
                    'Department': Dept_appply,
                    'HR interview date': item.hr_iv_date,
                    'HR accept date': item.hr_ac_date,
                    'Department interview date': item.dp_iv_date,
                    'Department accept date': item.dp_ac_date,
                    'HR accept': item.hr_ac_qu,
                    'Department accept': item.dp_ac_qu,
                    'Register': item.reg,
                    'Expected date': item.ex_en_date,
                    'Actual date': item.act_en_date,
                    'Recruit source': sourceName,
                    'VG work times': toText(item.vg_work_times),
                    'Old employee no': toText(item.old_empno),
                    'Re VG from': item.re_vg_from,
                    'CV received at': item.cv_received_at,
                    'Salary signed at': item.salary_signed_at,
                    'Note': item.note,
                    'School': item.school,
                    'Sub position': item.sub_position,
                    'Employee demand ID': toText(item.emp_demandid),
                    'Created by': item.user_input,
                    'Updated by': item.user_update,
                    'Register tel': toText(item.regTel),
                    'Register address': item.regAddress,
                    'Communication tel': toText(item.commTel),
                    'Communication address': item.commAddress,
                    'National': item.national,
                    'New employee no': toText(item.newEmpno),
                    'Temporary ID class': toText(item.tmp_idyclass),
                    'Department ID': toText(item.tmp_departid),
                    'Duty ID': duty_name,
                    'Category ID': toText(item.tmp_categoryid),
                    'Level ID': toText(item.tmp_levelid),
                    'Rank ID': toText(item.tmp_rankid),
                    'Site ID': toText(item.tmp_siteid),
                    'Work area ID': toText(item.tmp_workareaid),
                    'Is direct': item.isdirect,
                    'Country ID': toText(item.countryid),
                    'Marriage': item.marrage,
                    'Birth province': toText(item.birth_province),
                    'Province': toText(item.province),
                    'Education': toText(item.edu),
                    'Probation': item.probation,
                    'CCCD date': item.datecccd,
                    'Reason': item.reason,
                    'Change date': item.change_en_date
                };
            });
        },
        async getLastEmpno() {
            try {
                const response = await this.$axios.get(this.api + 'getlastEmpno_dmc');
                this.newEmpno = response.data;
            } catch (error) {
                console.error("Error fetching last employee number:", error);
            }
        },
        
        async setNewEmpno() {
            try {
                if (!this.dateAcctual || !this.newDeptCongif) {
                    Swal.fire({
                        title: this.$t('Warning'),
                        text: this.$t('Please select Act. EN Date and Department first.'),
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                    return;
                }

                const hasGenerated = this.dataCadidates.some(
                    item => String(item.tmp_departid) === String(this.newDeptCongif) && 
                            item.act_en_date === this.dateAcctual && 
                            item.newEmpno
                );
                
                if (hasGenerated) {
                    Swal.fire({
                        title: this.$t('Warning'),
                        text: this.$t('Employee numbers for this department have already been generated today! Cannot generate again.'),
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                    return;
                }
                let params = {
                    newEmpno: parseInt(this.newEmpno),
                    act_en_date: this.dateAcctual,
                    tmp_departid: this.newDeptCongif,
                }
                
                const { value: accept } = await Swal.fire({
                    title: 'Are you sure?',
                    text: `You want to set new employee number start ${this.newEmpno}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#4CAF50',
                    cancelButtonColor: '#f44336',
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                });
                
                if (!accept) return;
                
                const response = await this.$axios.post(this.api + 'setNewEmpno', params);
                const responseData = response.data.data || [];
                
                this.lastEmpno = response.data;
                await this.getAllData();
                
                if (Array.isArray(responseData)) {
                    const uniqueDemandIds = [...new Set(responseData.map(item => item.emp_demandid))].filter(Boolean);
                    for (const demandId of uniqueDemandIds) {
                        try {
                            await this.saveDbDemand(demandId);
                        } catch (error) {
                            console.error('Error processing demand ID:', demandId, error);
                        }
                    }
                }
                await this.getLastEmpno();
                this.dialogSetEmpno = false;
                
                this.$notify({
                    title: 'Success',
                    text: 'Successfully set new employee numbers and updated all demands',
                    type: 'success'
                });
                
            } catch (error) {
                console.error('Error in setNewEmpno:', error);
                this.$notify({
                    title: 'Error',
                    text: 'Failed to set new employee number: ' + (error.message || 'Unknown error'),
                    type: 'error'
                });
            }
        },
       
        // async saveDbDemand(demandIdFromSetNewEmpno = null) {
        //     try {
        //         const filteredData = this.filteredData.filter(item => {
        //             return item.reg === 'yes' && 
        //             item.newEmpno && 
        //             (demandIdFromSetNewEmpno ? item.emp_demandid === demandIdFromSetNewEmpno : true);
        //         });
                
        //         const groupedData = filteredData.reduce((acc, item) => {
        //             const demandId = demandIdFromSetNewEmpno || item.emp_demandid;
        //             if (!acc[demandId]) {
        //                 acc[demandId] = [];
        //             }
        //             acc[demandId].push(item);
        //             return acc;
        //         }, {});
                
        //         for (const [demandId, items] of Object.entries(groupedData)) {
        //             if (!demandId) continue;
                    
        //             const demandRes = await this.$axios.get(this.api + 'getDemandById/' + demandId);
        //             if (!demandRes.data) continue;
        //             const existingData = demandRes.data;
                    
        //             const firstItem = items[0];
        //             const actualDate = this.dateAcctual || firstItem.act_en_date;
        //             const deptConfig = this.newDeptCongif || firstItem.tmp_departid;
                    
        //             const countRes = await this.$axios.get(
        //             `${this.api}countDemandById/${demandId}/${actualDate}/${deptConfig}`
        //             );
        //             const dem_recruited = countRes.data;
                    
        //             let candidates = [];
        //             if (existingData.dem_candidates) {
        //                 candidates = typeof existingData.dem_candidates === 'string'
        //                 ? JSON.parse(existingData.dem_candidates)
        //                 : existingData.dem_candidates;
        //             }
        //             items.forEach(data => {
        //                 const newCandidate = {
        //                     empno: data.newEmpno,
        //                     date: data.act_en_date,
        //                     name: data.candidate_name,
        //                 };
                        
        //                 const existingIndex = candidates.findIndex(c => c.empno === data.newEmpno);
        //                 if (existingIndex !== -1) {
        //                     candidates[existingIndex] = newCandidate;
        //                 } else {
        //                     candidates.push(newCandidate);
        //                 }
        //             });
                    
        //             const params = {
        //                 id: demandId,
        //                 dem_id: existingData.dem_id,
        //                 dem_fullfilldate: candidates.reduce((latest, current) => {
        //                     return !latest || new Date(current.date) > new Date(latest)
        //                     ? current.date
        //                     : latest;
        //                 }, null),
        //                 dem_recruited: dem_recruited,
        //                 dem_candidates: candidates,
        //                 dem_amount: existingData.dem_amount,
        //                 dem_unit: existingData.tmp_departid,
        //             };
                    
        //             await this.$axios.post(this.api + 'saveUpdateDemand', params);
        //         }
                
        //         this.$notify({
        //             title: 'Success',
        //             text: 'Demand data updated successfully',
        //             type: 'success'
        //         });
        //         this.dialogSetEmpno = false;
        //         this.newEmpno = '';
        //         this.dateAcctual = '';
        //         this.newDeptCongif = '';
                
        //     } catch (error) {
        //         this.$notify({
        //             title: 'Error',
        //             text: 'Failed to save demand data: ' + (error.message || 'Unknown error'),
        //             type: 'error'
        //         });
        //     }
        // },
        async saveDbDemand(demandIdFromSetNewEmpno = null) {
            try {
                const filteredData = this.filteredData.filter(item => {
                    return item.reg === 'yes' &&
                    item.newEmpno &&
                    (demandIdFromSetNewEmpno ? item.emp_demandid === demandIdFromSetNewEmpno : true);
                });
                const groupedData = filteredData.reduce((acc, item) => {
                    const demandId = demandIdFromSetNewEmpno || item.emp_demandid;
                    if (!acc[demandId]) {
                        acc[demandId] = [];
                    }
                    acc[demandId].push(item);
                    return acc;
                }, {});
                for (const [demandId, items] of Object.entries(groupedData)) {
                    if (!demandId) continue;
                    const demandRes = await this.$axios.get(this.api + 'getDemandById/' + demandId);
                    if (!demandRes.data) continue;
                    const existingData = demandRes.data;
                    const countRes = await this.$axios.get(
                    `${this.api}countDemandById/${demandId}/${items[0].act_en_date}/${items[0].tmp_departid}`
                    );
                  
                    const dem_recruited = countRes.data;
                    let candidates = [];
                    if (existingData.dem_candidates) {
                        candidates = typeof existingData.dem_candidates === 'string'
                        ? JSON.parse(existingData.dem_candidates)
                        : existingData.dem_candidates;
                    }
                    items.forEach(data => {
                        if (data.emp_demandid === demandId) {
                            const newCandidate = {
                                empno: data.newEmpno,
                                date: data.act_en_date,
                                name: data.candidate_name,
                            };
                            const existingIndex = candidates.findIndex(c => c.empno === data.newEmpno);
                            if (existingIndex !== -1) {
                                candidates[existingIndex] = newCandidate;
                            } else {
                                candidates.push(newCandidate);
                            }
                        }
                    });
                    const params = {
                        id: demandId,
                        dem_fullfilldate: candidates.reduce((latest, current) => {
                            return !latest || new Date(current.date) > new Date(latest)
                            ? current.date
                            : latest;
                        }, null),
                        dem_recruited: dem_recruited,
                        dem_candidates: candidates,
                        dem_amount: existingData.dem_amount,
                        dem_unit: existingData.tmp_departid,
                    };
                    await this.$axios.post(this.api + 'saveUpdateDemand', params);
                }
                this.$notify({
                    title: 'Success',
                    text: 'Demand data updated successfully',
                    type: 'success'
                });
                this.dialogSetEmpno = false;
                this.newEmpno = '';
                this.dateAcctual = '';
                this.newDeptCongif = '';
            } catch (error) {
                this.$notify({
                    title: 'Error',
                    text: 'Failed to save demand data: ' + (error.message || 'Unknown error'),
                    type: 'error'
                });
            }
        },
        async updateReg(data) {
            this.isUpdating = true;
            const { value: accept } = await Swal.fire({
                title: 'Confirmation',
                text: `Do you want to update registration status for ${data.candidate_name}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#4CAF50',
                cancelButtonColor: '#f44336',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            });
            if (!accept) {
                data.reg = data.reg === 'yes' ? 'no' : 'yes';
                this.isUpdating = false;
                return;
            }
            let params = {
                id: data.id,
                reg: data.reg,
                act_en_date: this.today,
            }
            try {
                await this.$axios.post(this.api + 'updateReg', params);
                this.$notify({
                    title: 'Success',
                    text: `Update success ${data.candidate_name}`,
                    type: 'success'
                });
                this.getAllData();
            } catch (error) {
                data.reg = data.reg === 'yes' ? 'no' : 'yes';
                this.$notify({
                    title: 'Error',
                    text: 'Failed to update registration status',
                    type: 'error'
                });
            } finally {
                this.isUpdating = false;
            }
        },
        printBQT() {
            const printData = this.ExportBQT();
            // console.log(printData);
            
            // const routeData = this.$router.resolve({
            //     path: '/template-print/bqt',
            //     query: { data: JSON.stringify(printData) },
            // });
            const uniqueDates = [...new Set(printData.map(item => item.act_date))];
            const routeData = this.$router.resolve({
                path: '/template-print/bqt',
                query: { data: uniqueDates[0] }  
            });
            window.open(routeData.href, '_blank');
        },
        printHires() {
            const printData = this.exportHires();
            const uniqueDates = [...new Set(printData.map(item => item.ex_date))];
            const routeData = this.$router.resolve({
                path: '/template-print/hires',
                // query: { data: JSON.stringify(printData) },
                query: { data: uniqueDates[0] }  
            });
            window.open(routeData.href, '_blank');
        },
        
        async handleDemandFilter() {
            if (this.$route.query.id ) {
                this.demandDept = this.$route.query.id;
                this.loading = true;
                let params = {
                    emp_demandid: this.demandDept.toString(),
                    reg: 'yes',
                    act_en_date:this.$route.query.act_en_date,
                };
                try {
                    const response = await this.$axios.post(this.api + 'getDataDeptFromDemand', params);
                    this.dataCadidates = response.data;
                } catch (error) {
                    console.error("Error fetching filtered employee data:", error);
                } finally {
                    this.loading = false;
                }
            } else {
                this.getAllData();
            }
        },
        updateFilter(field, selectedItems) {
            if (!selectedItems || selectedItems.length === 0) {
                this.filter[field] = [];
                return;
            }
            
            this.filter[field] = selectedItems;
        },
        getGenderText(gender) {
            return gender === '1' ? this.$t('Female') : this.$t('Male');
        },
        showNoteDialog(note) {
            this.selectedNote = note;
            this.noteDialog = true;
        },
        getNotePreview(note) {
            if (!note) return '';
            // Limit preview to first 100 characters
            return note.length > 100 ? note.substring(0, 100) + '...' : note;
        },
        async getAllSourceRecruiting() {
            try {
                const response = await this.$axios.get(this.api + 'getSourceRecruiting');
                this.sourceRecruiting = response.data;
                
            } catch (error) {
                console.error("Error fetching source recruiting data:", error);
            }
        },
    },
    async mounted() {
        await this.fetchDemand();
        this.getAllDept();
        this.getLastEmpno();
        this.getAllDuty();
        this.getAllSourceRecruiting();
    },
    watch: {
        '$route.query': {
            handler() {
                this.handleDemandFilter();
                // console.log(this.$route.query);
            },
            
            immediate: true
        }
    },
    computed: {
        filteredData() {
            if (this.dataCadidates) {
                let data = Object.values(this.dataCadidates);
                
                if (this.search) {
                    const searchTerm = this.search.toLowerCase();
                    data = data.filter(item => {
                        return Object.keys(item).some(key => {
                            const value = item[key];
                            if (value === null || value === undefined) return false;
                            
                            if (key === 'gender') {
                                return this.getGenderText(value).toLowerCase().includes(searchTerm);
                            }
                            if (key === 'apply_dp') {
                                return this.findeptCode(value).toLowerCase().includes(searchTerm);
                            }
                            
                            return value.toString().toLowerCase().includes(searchTerm);
                        });
                    });
                }
                
                if (data.length) {
                    data = data.filter(item => {
                        // const deptName = this.findeptCode(item.apply_dp);
                        const genderText = this.getGenderText(item.gender);
                        return (!this.filter.key_in_date.length || this.filter.key_in_date.includes(item.key_in_date)) &&
                        (!this.filter.emp_demandid.length || this.filter.emp_demandid.includes(this.getDemandId(item.emp_demandid))) &&
                        (!this.filter.candidate_name.length || this.filter.candidate_name.includes(item.candidate_name)) &&
                        (!this.filter.dateofbirth.length || this.filter.dateofbirth.includes(item.dateofbirth)) &&
                        (!this.filter.gender.length || this.filter.gender.includes(genderText)) &&
                        (!this.filter.emp_id.length || this.filter.emp_id.includes(item.emp_id)) &&
                        (!this.filter.position.length || this.filter.position.includes(item.position)) &&
                        (!this.filter.apply_dp.length || this.filter.apply_dp.includes(item.apply_dp)) &&
                        (!this.filter.tmp_departid.length || this.filter.tmp_departid.includes(item.tmp_departid)) &&
                        (!this.filter.hr_ac_qu.length || this.filter.hr_ac_qu.includes(item.hr_ac_qu)) &&
                        (!this.filter.dp_ac_qu.length || this.filter.dp_ac_qu.includes(item.dp_ac_qu)) &&
                        (!this.filter.reg.length || this.filter.reg.includes(item.reg)) &&
                        (!this.filter.ex_en_date.length || this.filter.ex_en_date.includes(item.ex_en_date)) &&
                        (!this.filter.act_en_date.length || this.filter.act_en_date.includes(item.act_en_date)) &&
                        (!this.filter.note.length || this.filter.note.includes(item.note)) &&
                        (!this.filter.user_input.length || this.filter.user_input.includes(item.user_input)) &&
                        (!this.filter.user_update.length || this.filter.user_update.includes(item.user_update));
                    });
                    return data;
                }
            }
        },
        filterItems() {
            if (!this.dataCadidates) {
                return {
                    key_in_date: [],
                    emp_demandid:[],
                    candidate_name: [],
                    dateofbirth: [],
                    gender: [],
                    emp_id: [],
                    position: [],
                    apply_dp: [],
                    hr_ac_qu: [],
                    dp_ac_qu: [],
                    reg: [],
                    ex_en_date: [],
                    act_en_date: [],
                    note: [],
                    user_input: [],
                    user_update: [],
                    tmp_departid: [],
                };
            }
            
            let data = Object.values(this.dataCadidates);
            let filterData = {
                key_in_date: new Set(),
                emp_demandid: new Set(),
                candidate_name: new Set(),
                dateofbirth: new Set(),
                gender: new Set(),
                emp_id: new Set(),
                position: new Set(),
                apply_dp: new Set(),
                hr_ac_qu: new Set(),
                dp_ac_qu: new Set(),
                reg: new Set(),
                ex_en_date: new Set(),
                act_en_date: new Set(),
                note: new Set(),
                user_input: new Set(),
                user_update: new Set(),
                tmp_departid: new Set(),
            };
            
            data.forEach(item => {
                filterData.key_in_date.add(item.key_in_date);
                filterData.emp_demandid.add(this.getDemandId(item.emp_demandid));
                filterData.candidate_name.add(item.candidate_name);
                filterData.dateofbirth.add(item.dateofbirth);
                filterData.gender.add(this.getGenderText(item.gender));
                filterData.emp_id.add(item.emp_id);
                filterData.position.add(item.position);
                // const deptName = this.item.apply_dp;
                filterData.apply_dp.add(item.apply_dp);
                filterData.hr_ac_qu.add(item.hr_ac_qu);
                filterData.dp_ac_qu.add(item.dp_ac_qu);
                filterData.reg.add(item.reg);
                filterData.ex_en_date.add(item.ex_en_date);
                filterData.act_en_date.add(item.act_en_date);
                filterData.note.add(item.note);
                filterData.user_input.add(item.user_input);
                filterData.user_update.add(item.user_update);
                filterData.tmp_departid.add(item.tmp_departid);
            });
            
            return {
                key_in_date: [...filterData.key_in_date],
                emp_demandid: [...filterData.emp_demandid].sort(),
                candidate_name: [...filterData.candidate_name],
                dateofbirth: [...filterData.dateofbirth],
                gender: [...filterData.gender],
                emp_id: [...filterData.emp_id],
                position: [...filterData.position],
                apply_dp: [...filterData.apply_dp],
                hr_ac_qu: [...filterData.hr_ac_qu],
                dp_ac_qu: [...filterData.dp_ac_qu],
                reg: [...filterData.reg],
                ex_en_date: [...filterData.ex_en_date],
                act_en_date: [...filterData.act_en_date],
                note: [...filterData.note],
                user_input: [...filterData.user_input],
                user_update: [...filterData.user_update],
                tmp_departid: [...filterData.tmp_departid],
            };
        },
    },
    
}
</script>

<style scoped>
.btn-hover:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.search-field {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    transition: all 0.3s ease;
}

.data-table {
    border-radius: 8px;
    overflow: hidden;
}

.candidate-link {
    color: #00796b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
    display: inline-block;
    width: 100%;
    text-align: center;
}

.candidate-link:hover {
    color: #004d40;
    text-decoration: underline;
}


.v-checkbox ::v-deep .v-input--selection-controls__ripple {
    cursor: pointer;
}

.checkbox-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.v-checkbox ::v-deep .v-input--selection-controls__input {
    margin: 0 auto;
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
}

.v-data-table ::v-deep tbody tr:hover {
    background-color: #f3fd99 !important;
}
.v-data-table ::v-deep .select .v-input__slot {
    margin-bottom: 0;
}
.v-data-table ::v-deep thead th,
.v-data-table ::v-deep tbody td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

<i18n>
    {
        "en": {
            "set new empno": "Set New Empno",
            "Candidate listing": "Candidate Listing",
            "Search": "Search",
            "New candidate": "New Candidate",
            "Configure New Employee Number": "Configure New Employee Number",
            "Employee number": "Employee Number",
            "Employee number is required": "Employee number is required",
            "Actual Work Date": "Actual Work Date",
            "CLOSE": "CLOSE",
            "SAVE": "SAVE",
            "Key in": "Key In",
            "Name": "Name",
            "Birth day": "Birth Day",
            "Sex": "Gender",
            "ID no": "ID No.",
            "Position": "Position",
            "Dept applied": "Dept Applied",
            "HR acc": "HR Accept",
            "Dept acc": "Dept Accept",
            "Reg": "Registered",
            "Expected": "Expected Date",
            "Actually date": "Actual Date",
            "Empno HRM": "Empno. HRM",
            "Note": "Note",
            "Created by": "Created By",
            "Updated by": "Updated By",
            "Export all data": "Export All Data",
            "Export HRM": "Export HRM",
            "Unswiped Card": "Unswiped Card",
            "Print hires": "Print Hires",
            "Female": "Female",
            "Male": "Male",
            "Unit": "Unit",
            "Note Details": "Note Details",
            "Close": "Close"
        },
        "vi": {
            "set new empno": "Cấu hình MST",
            "Candidate listing": "Danh sách ứng viên",
            "Search": "Tìm kiếm",
            "New candidate": "Thêm ứng viên",
            "Configure New Employee Number": "Cấu hình MST",
            "Employee number": "Số nhân viên",
            "Employee number is required": "Số nhân viên là bắt buộc",
            "Actual Work Date": "Ngày làm việc thực tế",
            "CLOSE": "Đóng",
            "SAVE": "Luu",
            "Key in": "Ngày nhập",
            "Name": "Họ tên",
            "Birth day": "Ngày sinh",
            "Sex": "Giới tính",
            "ID no": "Số CCCD",
            "Position": "Vị trí",
            "Dept applied": "BP ứng tuyển",
            "HR acc": "HR duyệt",
            "Dept acc": "PB duyệt",
            "Reg": "Được tuyển dụng",
            "Expected": "Ngày dự kiến",
            "Actually date": "Ngày thực tế",
            "Empno HRM": "MST HRM",
            "Note": "Ghi chú",
            "Created by": "Người tạo",
            "Updated by": "Người cập nhật",
            "Export all data": "Xuất tất cả dữ liệu",
            "Export HRM": "Xuất HRM",
            "Unswiped Card": "In BQT",
            "Print hires": "In danh sách tuyển dụng",
            "Female": "Nữ",
            "Male": "Nam",
            "Unit": "Đơn vị",
            "Note Details": "Chi tiết ghi chú",
            "Close": "Đóng"
        },
        "cn": {
            "set new empno": "设置新员工编号",
            "Candidate listing": "应聘者名单",
            "Search": "搜索",
            "New candidate": "新应聘者",
            "Configure New Employee Number": "配置新员工编号",
            "Employee number": "员工编号",
            "Employee number is required": "员工编号为必填项",
            "Note Details": "备注详情",
            "Actual Work Date": "实际工作日期",
            "CLOSE": "关闭",
            "SAVE": "保存",
            "Key in": "录入日期",
            "Name": "姓名",
            "Birth day": "出生日期",
            "Sex": "性别",
            "ID no": "身份证号",
            "Position": "职位",
            "Dept applied": "应聘部门",
            "HR acc": "人事通过",
            "Dept acc": "部门通过",
            "Reg": "已正式入職",
            "Expected": "预期日期",
            "Actually date": "实际日期",
            "Empno HRM": "HRM工号",
            "Note": "备注",
            "Created by": "创建人",
            "Updated by": "更新人",
            "Export all data": "导出所有数据",
            "Export HRM": "导出HRM",
            "Unswiped Card": "申請確認未刷卡單",
            "Print hires": "打印录用表",
            "Female": "女",
            "Male": "男",
            "Unit": "部门",
            "Note Details": "备注详情",
            "Close": "关闭"
        }
    }
</i18n>
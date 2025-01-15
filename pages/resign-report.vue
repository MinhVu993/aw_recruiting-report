<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="2">
                <!-- Header Section -->
                <v-app-bar color="teal darken-4" dense dark>
                    <v-toolbar-title class="d-flex align-center px-4">
                        <v-icon class="mr-2" @click="goToResign"
                        style="cursor: pointer">mdi-file-document-outline</v-icon>
                        <span class="text-h6">{{ $t("Resign report") }}</span>
                    </v-toolbar-title>
                </v-app-bar>
                <!-- Filters Section -->
                <v-card-text>
                    <v-row class="grey lighten-5 pa-4 rounded-lg mb-4">
                        <!-- from date -->
                        <v-col cols="12" md="2">
                            <v-menu v-model="fromDateMenu" :close-on-content-click="false"
                            transition="scale-transition">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="fromDate" :label="$t('From date')" readonly v-bind="attrs"
                                v-on="on" outlined dense hide-details
                                prepend-inner-icon="mdi-calendar"></v-text-field>
                            </template>
                            <v-date-picker v-model="fromDate" @input="fromDateMenu = false" header-color="teal"
                            :locale="$i18n.locale == 'cn' ? 'zh' : $i18n.locale"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <!-- to date -->
                    <v-col cols="12" md="2">
                        <v-menu v-model="toDateMenu" :close-on-content-click="false" transition="scale-transition">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field v-model="toDate" :label="$t('to date')" readonly v-bind="attrs"
                                v-on="on" outlined dense hide-details
                                prepend-inner-icon="mdi-calendar"></v-text-field>
                            </template>
                            <v-date-picker v-model="toDate" @input="toDateMenu = false" header-color="teal"
                            :locale="$i18n.locale == 'cn' ? 'zh' : $i18n.locale"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <!-- Department Filter -->
                    <v-col cols="12" md="2">
                        <v-combobox v-model="selectDept" :items="item_dept" :label="$t('Select dept')" dense
                        outlined hide-details clearable multiple chips small-chips deletable-chips></v-combobox>
                    </v-col>
                    
                    <!-- Action Buttons -->
                    <v-col cols="12" md="2" class="d-flex align-center">
                        <v-btn color="primary" class="mr-3" @click="getDataReport" :loading="loading" elevation="2">
                            <v-icon left>mdi-magnify</v-icon>
                            {{ $t('Search') }}
                        </v-btn>
                        
                        <v-btn color="success" class="mr-3" @click="exportExcel" :loading="exporting" elevation="2">
                            <v-icon left>mdi-file-excel</v-icon>
                            {{ $t('Export') }}
                        </v-btn>
                        
                        <v-btn color="info" @click="showColumnDialog = true" elevation="2">
                            <v-icon left>mdi-eye</v-icon>
                            {{ $t('Manage Columns') }}
                        </v-btn>
                    </v-col>
                </v-row>
                
                <!-- Data Table -->
                <v-data-table :headers="visibleHeaders" :items="reportData" :items-per-page="13" :loading="loading"
                :footer-props="{
                    'items-per-page-options': [10, 15, 30, 100],
                    'show-current-page': true,
                    'show-first-last-page': true
                }">
                
                <template v-slot:no-data>
                    {{ $t('No data available') }}
                </template>
                <template v-slot:[`header.dept`]="{ header }">
                    {{ $t('Dept') }}
                </template>
                <template v-slot:[`header.totalResign`]="{ header }">
                    {{ $t('Total') }}
                </template>
                <template v-slot:[`header.age18to30`]="{ header }">
                    {{ $t('Age[18-30]') }}
                </template>
                <template v-slot:[`header.age31to45`]="{ header }">
                    {{ $t('Age[31-45]') }}
                </template>
                <template v-slot:[`header.age46up`]="{ header }">
                    {{ $t('Age[>46]') }}
                </template>
                <template v-slot:[`header.seniorityLessThan1`]="{ header }">
                    {{ $t('Seniority[<1]') }} </template>
                    <template v-slot:[`header.seniority1`]="{ header }">
                        {{ $t('Seniority[1]') }}
                    </template>
                    <template v-slot:[`header.seniority2`]="{ header }">
                        {{ $t('Seniority[2]') }}
                    </template>
                    <template v-slot:[`header.seniority3up`]="{ header }">
                        {{ $t('Seniority[>3]') }}
                    </template>
                    <template v-slot:[`header.bus`]="{ header }">
                        {{ $t('Bus') }}
                    </template>
                    <template v-slot:[`header.genderMale`]="{ header }">
                        {{ $t('Male') }}
                    </template>
                    <template v-slot:[`header.genderFemale`]="{ header }">
                        {{ $t('Female') }}
                    </template>
                    <template v-slot:[`header.VungTau`]="{ header }">
                        {{ $t('Vũng Tàu') }}
                    </template>
                    <template v-slot:[`header.notVungTau`]="{ header }">
                        {{ $t('Other loc') }}
                    </template>
                    <template v-slot:[`header.betterJobOpportunity`]="{ header }">
                        {{ $t('Job better') }}
                    </template>
                    <template v-slot:[`header.healthIssues`]="{ header }">
                        {{ $t('Health issues') }}
                    </template>
                    <template v-slot:[`header.familyReasons`]="{ header }">
                        {{ $t('Family reasons') }}
                    </template>
                    <template v-slot:[`header.notSuitableForPersonalInterest`]="{ header }">
                        {{ $t('Not suitable for personal interest') }}
                    </template>
                    <template v-slot:[`header.unableToPerformCurrentJob`]="{ header }">
                        {{ $t('Unable to perform current job') }}
                    </template>
                    <template v-slot:[`header.culturalMismatch`]="{ header }">
                        {{ $t('Cultural mismatch') }}
                    </template>
                    <template v-slot:[`header.noDevelopmentOpportunity`]="{ header }">
                        {{ $t('No development opportunity') }}
                    </template>
                    <template v-slot:[`header.poorWelfareSystem`]="{ header }">
                        {{ $t('Poor welfare system') }}
                    </template>
                    <template v-slot:[`header.unfairEvaluation`]="{ header }">
                        {{ $t('Unfair evaluation') }}
                    </template>
                    <template v-slot:[`header.failedProbation`]="{ header }">
                        {{ $t('Failed probation') }}
                    </template>
                    <template v-slot:[`header.companyTermination`]="{ header }">
                        {{ $t('Company termination') }}
                    </template>
                    <template v-slot:[`header.retirement`]="{ header }">
                        {{ $t('Retirement') }}
                    </template>
                    <template v-slot:[`header.absenteeism5Days`]="{ header }">
                        {{ $t('Absent 5 days') }}
                    </template>
                    <template v-slot:[`header.contractExpiry`]="{ header }">
                        {{ $t('Contract expiry') }}
                    </template>
                    <template v-slot:[`header.study`]="{ header }">
                        {{ $t('Study') }}
                    </template>
                    <template v-slot:[`header.militaryService`]="{ header }">
                        {{ $t('Military service') }}
                    </template>
                    <template v-slot:[`header.dismissedAbsenteeism`]="{ header }">
                        {{ $t('Dismissed absenteeism') }}
                    </template>
                    <template v-slot:[`header.otherReasons`]="{ header }">
                        {{ $t('Other reasons') }}
                    </template>
                    <template v-slot:[`header.dismissedOtherReasons`]="{ header }">
                        {{ $t('Dismissed other reasons') }}
                    </template>
                    
                    <template v-slot:body.append>
                        <tr class="total-row">
                            <td>{{ $t('Total') }}</td>
                            <td v-for="header in visibleHeaders.slice(1)" :key="header.value">
                                {{ totalResign[header.value] || 0 }}
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-col>
    
    <!-- Column Management Dialog -->
    <v-dialog v-model="showColumnDialog" max-width="900px">
        <v-card>
            <v-card-title class="text-h6 grey lighten-2">
                {{ $t('Manage Columns') }}
                <v-spacer></v-spacer>
                <v-btn text color="success" @click="selectAllColumns">
                    <v-icon left small>mdi-check-all</v-icon>
                    {{ $t('Select All') }}
                </v-btn>
                <v-btn text color="error" class="ml-2" @click="deselectAllColumns">
                    <v-icon left small>mdi-close-box-multiple</v-icon>
                    {{ $t('Deselect All') }}
                </v-btn>
            </v-card-title>
            
            <v-card-text class="pt-4">
                <v-row dense>
                    <v-col cols="12" md="4" v-for="(group, index) in columnGroups" :key="index">
                        <v-card outlined>
                            <v-card-title class="subtitle-2 grey lighten-3 py-2">
                                {{ $t(group.title) }}
                            </v-card-title>
                            <v-card-text class="pa-2">
                                <v-checkbox v-for="header in group.headers" :key="header.value"
                                v-model="header.show" :label="$t(header.text)" dense hide-details
                                class="my-1"></v-checkbox>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn text @click="showColumnDialog = false">
                    {{ $t('Cancel') }}
                </v-btn>
                <v-btn color="primary" @click="saveAndCloseDialog" :loading="saving">
                    <v-icon left small>mdi-content-save</v-icon>
                    {{ $t('Apply') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-row>
</template>

<script>
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
export default {
    data() {
        return {
            api: 'http://gmo021.cansportsvg.com/api/aw-recuitingReport/',
            today: dayjs().format('YYYY-MM-DD'),
            fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
            toDate: dayjs().endOf('month').format('YYYY-MM-DD'),
            fromDateMenu: false,
            toDateMenu: false,
            selectDept: [],
            item_dept: [],
            headers: [
            { text: 'Dept', value: 'dept', show: true, align: 'center' },
            { text: 'Total', value: 'totalResign', show: true, align: 'center' },
            { text: 'Age[18-30]', value: 'age18to30', show: true, align: 'center' },
            { text: 'Age[31-45]', value: 'age31to45', show: true, align: 'center' },
            { text: 'Age[>46]', value: 'age46up', show: true, align: 'center' },
            { text: 'Seniority[<1]', value: 'seniorityLessThan1', show: true, align: 'center' },
            { text: 'Seniority[1]', value: 'seniority1', show: true, align: 'center' },
            { text: 'Seniority[2]', value: 'seniority2', show: true, align: 'center' },
            { text: 'Seniority[>3]', value: 'seniority3up', show: true, align: 'center' },
            { text: 'Bus', value: 'bus', show: true, align: 'center' },
            { text: 'Male', value: 'genderMale', show: true, align: 'center' },
            { text: 'Female', value: 'genderFemale', show: true, align: 'center' },
            { text: 'Vung Tau', value: 'VungTau', show: true, align: 'center' },
            { text: 'Other loc', value: 'notVungTau', show: true, align: 'center' },
            
            { text: 'Job better', value: 'betterJobOpportunity', show: true, align: 'center' },
            { text: 'Health issues', value: 'healthIssues', show: true, align: 'center' },
            { text: 'Family reasons', value: 'familyReasons', show: true, align: 'center' },
            { text: 'Not suitable for personal interest', value: 'notSuitableForPersonalInterest', show: true, align: 'center' },
            { text: 'Unable to perform current job', value: 'unableToPerformCurrentJob', show: true, align: 'center' },
            { text: 'Cultural mismatch', value: 'culturalMismatch', show: true, align: 'center' },
            { text: 'No development opportunity', value: 'noDevelopmentOpportunity', show: true, align: 'center' },
            { text: 'Poor welfare system', value: 'poorWelfareSystem', show: true, align: 'center' },
            { text: 'Unfair evaluation', value: 'unfairEvaluation', show: true, align: 'center' },
            { text: 'Failed probation', value: 'failedProbation', show: true, align: 'center' },
            { text: 'Company termination', value: 'companyTermination', show: true, align: 'center' },
            {
                text: 'Retirement',
                value: 'retirement', show: true, align: 'center'
            },
            { text: 'Absent 5 days', value: 'absenteeism5Days', show: true, align: 'center' },
            { text: 'Contract expiry', value: 'contractExpiry', show: true, align: 'center' },
            { text: 'Study', value: 'study', show: true, align: 'center' },
            { text: 'Military service', value: 'militaryService', show: true, align: 'center' },
            { text: 'Dismissed absenteeism', value: 'dismissedAbsenteeism', show: true, align: 'center' },
            { text: 'Other reasons', value: 'otherReasons', show: true, align: 'center' },
            { text: 'Dismissed other reasons', value: 'dismissedOtherReasons', show: true, align: 'center' },
            ].map(h => ({ ...h, show: true })), // Initialize all columns as visible
            reportData: [], // Ensure it's initialized as an empty array
            loading: false,
            exporting: false,
            showColumnDialog: false,
            totalResign: {
                totalResign: 0,
                age18to30: 0,
                age31to45: 0,
                age46up: 0,
                seniorityLessThan1: 0,
                seniority1: 0,
                seniority2: 0,
                seniority3up: 0,
                bus: 0,
                genderMale: 0,
                genderFemale: 0,
                VungTau: 0,
                notVungTau: 0,
                betterJobOpportunity: 0,
                healthIssues: 0,
                familyReasons: 0,
                notSuitableForPersonalInterest: 0,
                unableToPerformCurrentJob: 0,
                culturalMismatch: 0,
                noDevelopmentOpportunity: 0,
                poorWelfareSystem: 0,
                unfairEvaluation: 0,
                failedProbation: 0,
                companyTermination: 0,
                retirement: 0,
                absenteeism5Days: 0,
                contractExpiry: 0,
                study: 0,
                militaryService: 0,
                dismissedAbsenteeism: 0,
                otherReasons: 0,
                dismissedOtherReasons: 0
            },
            saving: false
        }
    },
    computed: {
        visibleHeaders() {
            return this.headers.filter(header => header.show);
        },
        basicHeaders() {
            return this.headers.filter(h => ['dept', 'totalResign'].includes(h.value));
        },
        demographicHeaders() {
            return this.headers.filter(h => [
            'age18to30', 'age31to45', 'age46up',
            'seniorityLessThan1', 'seniority1', 'seniority2', 'seniority3up',
            'bus', 'genderMale', 'genderFemale', 'tayNinh', 'notTayNinh',
            
            ].includes(h.value));
        },
        reasonHeaders() {
            return this.headers.filter(h => [
            'betterJobOpportunity', 'healthIssues', 'familyReasons', 'notSuitableForPersonalInterest',
            'unableToPerformCurrentJob', 'culturalMismatch', 'noDevelopmentOpportunity', 'poorWelfareSystem',
            'unfairEvaluation', 'failedProbation', 'companyTermination', 'retirement', 'absenteeism5Days',
            'contractExpiry', 'study', 'militaryService', 'dismissedAbsenteeism', 'otherReasons', 'dismissedOtherReasons'
            ].includes(h.value));
        },
        columnGroups() {
            return [
            { title: 'Basic Info', headers: this.basicHeaders },
            { title: 'Demographics', headers: this.demographicHeaders },
            { title: 'Resign Reasons', headers: this.reasonHeaders }
            ];
        },
        total() {
            if (!this.reportData.length) return {};
            const totals = {};
            Object.keys(this.reportData[0]).forEach(key => {
                if (key !== 'dept') { // Skip the dept column
                    totals[key] = this.reportData.reduce((sum, row) => {
                        return sum + (Number(row[key]) || 0);
                    }, 0);
                }
            });
            return totals;
        }
    },
    watch: {
        selectDept: {
            handler: async function (newVal) {
                // Thêm async/await để đảm bảo dữ liệu được cập nhật
                await this.getDataReport();
            }
        },
        toDate(newVal) {
            this.getDataReport();
        },
        reportData: {
            immediate: true,
            handler(newData) {
                if (newData && newData.length) {
                    this.calTotalCol();
                }
            }
        }
    },
    methods: {
        async getAllDeptHrm() {
            try {
                const res = await this.$axios.get(this.api + 'getDataDeptHrm');
                this.item_dept = res.data.dataDeptHrm.map(dept => dept.sub_division);
            } catch (error) {
                console.log(error);
            }
        },
        async getDataReport() {
            try {
                this.loading = true;
                const requestData = {
                    from_er_resigndate: this.fromDate,
                    to_er_resigndate: this.toDate,
                    er_deptid: this.selectDept.length ? this.selectDept : this.item_dept
                };
                
                const response = await this.$axios.post(this.api + 'resignReport', requestData);
                this.reportData = Array.isArray(response.data) ? response.data : [response.data];
                // Đảm bảo tính toán lại tổng sau khi có dữ liệu mới
                await this.calTotalCol();
            } catch (error) {
                console.error('Error fetching report data:', error);
                this.reportData = []; // Reset to empty array on error
            } finally {
                this.loading = false;
            }
        },
        async exportExcel() {
            try {
                this.exporting = true;
                
                // Define custom headers mapping
                const headerMapping = {
                    dept: 'Dept',
                    totalResign: 'Total',
                    age18to30: 'Age[18-30]',
                    age31to45: 'Age[31-45]',
                    age46up: 'Age[46+]',
                    seniorityLessThan1: 'Seniority[<1Y]',
                    seniority1: 'Seniority[1Y]',
                    seniority2: 'Seniority[2Y]',
                    seniority3up: 'Seniority[3Y+]',
                    bus: 'Bus',
                    genderMale: 'Male',
                    genderFemale: 'Female',
                    VungTau: 'Tay Ninh',
                    notVungTau: 'Other loc',
                    betterJobOpportunity: 'Job better',
                    healthIssues: 'Health issues',
                    familyReasons: 'Family reasons',
                    notSuitableForPersonalInterest: 'Not suitable for personal interest',
                    unableToPerformCurrentJob: 'Unable to perform current job',
                    culturalMismatch: 'Cultural mismatch',
                    noDevelopmentOpportunity: 'No development opportunity',
                    poorWelfareSystem: 'Poor welfare system',
                    unfairEvaluation: 'Unfair evaluation',
                    failedProbation: 'Failed probation',
                    companyTermination: 'Company termination',
                    retirement: 'Retirement',
                    absenteeism5Days: 'Absent 5 days',
                    contractExpiry: 'Contract expiry',
                    study: 'Study',
                    militaryService: 'Military service',
                    dismissedAbsenteeism: 'Dismissed absenteeism',
                    otherReasons: 'Other reasons',
                    dismissedOtherReasons: 'Dismissed other reasons'
                    
                };
                
                // Transform data with new headers
                const exportData = this.reportData.map(item => {
                    const newItem = {};
                    Object.keys(item).forEach(key => {
                        if (headerMapping[key]) {
                            newItem[headerMapping[key]] = item[key];
                        }
                    });
                    return newItem;
                });
                
                // Create worksheet with transformed data
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Resign');
                
                XLSX.writeFile(wb, `resign_report_${this.today}.xlsx`);
            } catch (error) {
                console.error('Error exporting to Excel:', error);
            } finally {
                this.exporting = false;
            }
        },
        saveColumnSettings() {
            // Optionally save column visibility settings to localStorage
            localStorage.setItem('resignReportColumns', JSON.stringify(
            this.headers.map(h => ({ value: h.value, show: h.show }))
            ));
        },
        loadColumnSettings() {
            const saved = localStorage.getItem('resignReportColumns');
            if (saved) {
                const settings = JSON.parse(saved);
                this.headers = this.headers.map(header => ({
                    ...header,
                    show: settings.find(s => s.value === header.value)?.show ?? true
                }));
            }
        },
        selectAllColumns() {
            this.headers.forEach(header => header.show = true);
        },
        deselectAllColumns() {
            this.headers.forEach(header => header.show = false);
        },
        saveAndCloseDialog() {
            this.saveColumnSettings();
            this.showColumnDialog = false;
        },
        goToResign() {
            this.$router.push('/resign');
        },
        async calTotalCol() {
            if (!this.reportData.length) return;
            
            // Reset all totals
            const columnsToSum = [
            'totalResign', 'age18to30', 'age31to45', 'age46up',
            'seniorityLessThan1', 'seniority1', 'seniority2', 'seniority3up',
            'bus', 'genderMale', 'genderFemale', 'VungTau', 'notVungTau',
            'betterJobOpportunity', 'healthIssues', 'familyReasons', 'notSuitableForPersonalInterest',
            'unableToPerformCurrentJob', 'culturalMismatch', 'noDevelopmentOpportunity', 'poorWelfareSystem',
            'unfairEvaluation', 'failedProbation', 'companyTermination', 'retirement', 'absenteeism5Days',
            'contractExpiry', 'study', 'militaryService', 'dismissedAbsenteeism', 'otherReasons', 'dismissedOtherReasons'
            
            ];
            
            // Reset all totals to 0
            columnsToSum.forEach(column => {
                this.totalResign[column] = 0;
            });
            
            // Calculate sum for each column
            this.reportData.forEach(row => {
                columnsToSum.forEach(column => {
                    // Handle the special case for 'total' which maps to 'totalResign' in the data
                    const dataKey = column === 'totalResign' ? 'totalResign' : column;
                    this.totalResign[column] += Number(row[dataKey]) || 0;
                });
            });
        }
    },
    async mounted() {
        this.loadColumnSettings();
        await this.getAllDeptHrm();
        this.getDataReport();
    }
    
}
</script>

<i18n>
    {
        "en": {
            "Resign report": "Resign Report",
            "From date": "From Date",
            "to date": "To Date",
            "Select dept": "Select Department",
            "Search": "Search",
            "Export": "Export",
            "Manage Columns": "Manage Columns",
            "Select All": "Select All",
            "Deselect All": "Deselect All",
            "Cancel": "Cancel",
            "Apply": "Apply",
            "No data available": "No data available",
            "Basic Info": "Basic Information",
            "Demographics": "Demographics",
            "Resign Reasons": "Resign Reasons",
            "Dept": "Department",
            "Total": "Total",
            "Age[18-30]": "Age [18-30]",
            "Age[31-45]": "Age [31-45]",
            "Age[>46]": "Age [>46]",
            "Seniority[<1]": "Seniority [<1Y]",
            "Seniority[1]": "Seniority [1Y]",
            "Seniority[2]": "Seniority [2Y]",
            "Seniority[>3]": "Seniority [>3Y]",
            "Bus": "Bus Service",
            "Male": "Male",
            "Female": "Female",
            "Vung Tau": "Vung Tau",
            "Other loc": "Other Location",
            "Job better": "Better Job Opportunity",
            "Health issues": "Health Issues",
            "Family reasons": "Family Reasons",
            "Not suitable for personal interest": "Not Suitable for Personal Interest",
            "Unable to perform current job": "Unable to Perform Current Job",
            "Cultural mismatch": "Cultural Mismatch",
            "No development opportunity": "No Development Opportunity",
            "Poor welfare system": "Poor Welfare System",
            "Unfair evaluation": "Unfair Evaluation",
            "Failed probation": "Failed Probation",
            "Company termination": "Company Termination",
            "Retirement": "Retirement",
            "Absent 5 days": "Absent 5 Days",
            "Contract expiry": "Contract Expiry",
            "Study": "Study",
            "Military service": "Military Service",
            "Dismissed absenteeism": "Dismissed Absenteeism",
            "Other reasons": "Other Reasons",
            "Dismissed other reasons": "Dismissed Other Reasons"
        },
        "vi": {
            "Resign report": "Báo cáo nghỉ việc",
            "From date": "Từ ngày",
            "to date": "Đến ngày",
            "Select dept": "Chọn bộ phận",
            "Search": "Tìm kiếm",
            "Export": "Xuất",
            "Manage Columns": "Quản lý cột",
            "Select All": "Chọn tất cả",
            "Deselect All": "Bỏ chọn tất cả",
            "Cancel": "Hủy",
            "Apply": "Áp dụng",
            "No data available": "Không có dữ liệu",
            "Basic Info": "Thông tin cơ bản",
            "Demographics": "Nhân khẩu học",
            "Resign Reasons": "Lý do nghỉ việc",
            "Dept": "Bộ phận",
            "Total": "Tổng",
            "Age[18-30]": "Tuổi [18-30]",
            "Age[31-45]": "Tuổi [31-45]",
            "Age[>46]": "Tuổi [>46]",
            "Seniority[<1]": "Thâm niên [<1 năm]",
            "Seniority[1]": "Thâm niên [1 năm]",
            "Seniority[2]": "Thâm niên [2 năm]",
            "Seniority[>3]": "Thâm niên [>3 năm]",
            "Bus": "Dịch vụ xe buýt",
            "Male": "Nam",
            "Female": "Nữ",
            "Vung Tau": "Vũng Tàu",
            "Other loc": "Địa điểm khác",
            "Job better": "Cơ hội việc làm tốt hơn",
            "Health issues": "Vấn đề sức khỏe",
            "Family reasons": "Lý do gia đình",
            "Not suitable for personal interest": "Không phù hợp với sở thích cá nhân",
            "Unable to perform current job": "Không thể thực hiện công việc hiện tại",
            "Cultural mismatch": "Không phù hợp văn hóa",
            "No development opportunity": "Không có cơ hội phát triển",
            "Poor welfare system": "Hệ thống phúc lợi kém",
            "Unfair evaluation": "Đánh giá không công bằng",
            "Failed probation": "Thử việc không đạt",
            "Company termination": "Công ty chấm dứt",
            "Retirement": "Nghỉ hưu",
            "Absent 5 days": "Vắng mặt 5 ngày",
            "Contract expiry": "Hết hạn hợp đồng",
            "Study": "Học tập",
            "Military service": "Nghĩa vụ quân sự",
            "Dismissed absenteeism": "Sa thải do vắng mặt",
            "Other reasons": "Lý do khác",
            "Dismissed other reasons": "Sa thải do lý do khác"
        },
        "cn": {
            "Resign report": "辞职报告",
            "From date": "开始日期",
            "to date": "结束日期",
            "Select dept": "选择部门",
            "Search": "搜索",
            "Export": "导出",
            "Manage Columns": "管理列",
            "Select All": "全选",
            "Deselect All": "取消全选",
            "Cancel": "取消",
            "Apply": "应用",
            "No data available": "无可用数据",
            "Basic Info": "基本信息",
            "Demographics": "人口统计",
            "Resign Reasons": "辞职原因",
            "Dept": "部门",
            "Total": "总计",
            "Age[18-30]": "年龄 [18-30]",
            "Age[31-45]": "年龄 [31-45]",
            "Age[>46]": "年龄 [>46]",
            "Seniority[<1]": "资历 [<1年]",
            "Seniority[1]": "资历 [1年]",
            "Seniority[2]": "资历 [2年]",
            "Seniority[>3]": "资历 [>3年]",
            "Bus": "巴士服务",
            "Male": "男",
            "Female": "女",
            "Vung Tau": "西宁",
            "Other loc": "其他地点",
            "Job better": "更好的工作机会",
            "Health issues": "健康问题",
            "Family reasons": "家庭原因",
            "Not suitable for personal interest": "不适合个人兴趣",
            "Unable to perform current job": "无法胜任当前工作",
            "Cultural mismatch": "文化不匹配",
            "No development opportunity": "没有发展机会",
            "Poor welfare system": "福利制度差",
            "Unfair evaluation": "不公平的评价",
            "Failed probation": "试用期未通过",
            "Company termination": "公司终止",
            "Retirement": "退休",
            "Absent 5 days": "缺席5天",
            "Contract expiry": "合同到期",
            "Study": "学习",
            "Military service": "兵役",
            "Dismissed absenteeism": "因缺席被解雇",
            "Other reasons": "其他原因",
            "Dismissed other reasons": "因其他原因被解雇"
        }
    }
</i18n>

<style scoped>
.v-checkbox {
    margin: 0 !important;
    padding: 4px 0 !important;
}

.total-row {
    background-color: #004D40 !important;
    /* teal darken-4 */
}

.total-row td {
    color: white !important;
    font-size: 1.1em !important;
    border-top: 2px solid #00695C !important;
    /* teal darken-3 for border */
    border-bottom: none !important;
    text-align: center !important;
}

.total-row td:first-child {
    background-color: #00695C !important;
    /* slightly lighter for first column */
    position: sticky;
    left: 0;
    z-index: 2;
}

/* New table styling */
::v-deep .v-data-table {
    border: 1px solid #e0e0e0 !important;
}

::v-deep .v-data-table__wrapper {
    overflow-y: auto !important;
}

::v-deep .v-data-table thead th {
    font-weight: 600 !important;
    color: #004D40 !important;
    background: white !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 1 !important;
    text-transform: uppercase !important;
}

::v-deep .v-data-table tbody tr:not(.total-row):hover {
    background-color: #f3fd99 !important;
}
</style>
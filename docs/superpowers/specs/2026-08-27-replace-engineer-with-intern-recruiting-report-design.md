# Design Spec: Replace 'Engineer' with 'Intern' on Recruiting Report Page

## Overview
This design document specifies the changes required on the Recruiting Report page ([recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue)) to replace the `Engineer` position chip with `Intern` and enable smart, case-insensitive position filtering.

## Requirements & Scope
- **File affected**: [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue)
- **Position list change**:
  - Replace `'Engineer'` with `'Intern'` in `loc_apply` array.
- **Filtering Logic**:
  - Update `filteredReportData` position check to be case-insensitive (`intern` / `Intern`).
- **Watcher Enhancement**:
  - Upgrade `selectedPositions` watcher to collapse to `['All']` when all individual chips are selected.

## Proposed Design Details

### 1. Updated `loc_apply` Array
In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L273):
```javascript
loc_apply: ['Worker', 'Staff', 'Staff (lang)', 'Leader', 'Translator', 'Intern']
```

### 2. Case-Insensitive Filtering
In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L376):
```javascript
const positionMatch = this.selectedPositions.includes('All') ||
  this.selectedPositions.some(p => String(p).toLowerCase() === String(item.position).toLowerCase());
```

### 3. Smart Watcher
In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L406):
```javascript
selectedPositions(newVal, oldVal) {
  if (!newVal || newVal.length === 0) {
    this.selectedPositions = ['All'];
    return;
  }
  if (newVal.includes('All') && !oldVal.includes('All')) {
    this.selectedPositions = ['All'];
  } else if (newVal.includes('All') && newVal.length > 1) {
    this.selectedPositions = newVal.filter(item => item !== 'All');
  } else if (newVal.filter(item => item !== 'All').length === this.loc_apply.length) {
    this.selectedPositions = ['All'];
  }
}
```

## Verification Plan
1. Open the Recruiting Report page.
2. Verify top position chips display **Intern** instead of **Engineer**.
3. Verify clicking **Intern** filters report table rows matching `intern` or `Intern`.
4. Verify smart toggle behavior with `All` chip.

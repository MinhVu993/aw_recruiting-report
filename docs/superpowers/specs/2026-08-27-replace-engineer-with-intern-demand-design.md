# Design Spec: Replace 'Engineer' position with 'intern' on Demand Page

## Overview
This design document specifies the changes required to replace the `Engineer` position entry with `intern` on the Demand Management page ([demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue)).

## Requirements & Scope
- **File affected**: [demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue)
- **Position array change**:
  - Replace `{ vi: 'Kỹ sư', en: 'Engineer', cn: '工程师' }` in `itemsPos` array with `{ vi: 'Thực tập sinh', en: 'intern', cn: '实习生' }`.
- **Filtering Logic**:
  - Update `mappedDemandData` position filter so that filtering by position is case-insensitive (matching both `intern` and `Intern` stored in `dem_position` in the database).

## Proposed Design Details

### 1. Updated `itemsPos` Data Array
In [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L586):
```javascript
itemsPos: [
    { vi: 'Tất cả', en: 'All', cn: '所有' },
    { vi: 'Công nhân', en: 'Worker', cn: '工人' },
    { vi: 'Nhân viên', en: 'Staff', cn: '科员' },
    { vi: 'Nhân viên (ngôn ngữ)', en: 'Staff (lang)', cn: '语言科员' },
    { vi: 'Cán bộ', en: 'Leader', cn: '干部' },
    { vi: 'Phiên dịch', en: 'Translator', cn: '翻译' },
    { vi: 'Thực tập sinh', en: 'intern', cn: '实习生' }
]
```

### 2. Robust Filtering Logic
In `mappedDemandData` computed property in [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L631):
```javascript
if (this.selectedPositions.length > 0) {
    if (this.selectedPositions.includes('All')) {
        this.selectedPositions = ['All'];
    } else {
        const selectedLower = this.selectedPositions.map(p => String(p).toLowerCase());
        filteredData = filteredData.filter(item =>
            item.dem_position && selectedLower.includes(String(item.dem_position).toLowerCase())
        );
    }
}
```

## Verification Plan
1. Open the Demand Management page.
2. Verify top position chips display **Thực tập sinh** (or translated label according to locale) instead of **Kỹ sư**.
3. Verify creating a new Demand with Position **Thực tập sinh** saves `dem_position = "intern"`.
4. Verify filtering by **Thực tập sinh** chip correctly filters database records matching `intern` or `Intern`.

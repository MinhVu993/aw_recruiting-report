# Design Spec: Smart Position Filter in Demand Management Page

## Overview
This design document specifies the overhaul of the position filter chips on the Demand Management page ([demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue)).
The goal is to improve usability and visual consistency:
1. Capitalize `intern` to `Intern` in the position items array for English display consistency (matching `Worker`, `Staff`, `Leader`, `Translator`).
2. Implement smart watcher behavior for `selectedPositions`:
   - Clicking `All` deselects all specific position chips.
   - Selecting any specific position chip automatically deselects `All`.
   - Deselecting all position chips automatically falls back to `All`.
   - Selecting all available position chips automatically collapses selection to `All`.
3. Clean up side-effects inside the `mappedDemandData` computed property.

## Detailed Changes

### 1. Updated `itemsPos` Data Entry
In [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L586-L594):
Change `{ vi: 'Thực tập sinh', en: 'intern', cn: '實習生' }` to `{ vi: 'Thực tập sinh', en: 'Intern', cn: '實習生' }`.

### 2. Smart Watcher for `selectedPositions`
In `watch` block of [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L1177):
```javascript
selectedPositions: {
    handler(newVal, oldVal) {
        if (!newVal || newVal.length === 0) {
            this.selectedPositions = ['All'];
            return;
        }

        const hadAllBefore = oldVal && oldVal.includes('All');
        const hasAllNow = newVal.includes('All');
        const specificPositions = this.itemsPos.map(p => p.en).filter(p => p !== 'All');

        // Case 1: User just clicked 'All' while other items were selected
        if (!hadAllBefore && hasAllNow) {
            this.selectedPositions = ['All'];
            return;
        }

        // Case 2: User selected a specific position while 'All' was active
        if (hadAllBefore && hasAllNow && newVal.length > 1) {
            this.selectedPositions = newVal.filter(p => p !== 'All');
            return;
        }

        // Case 3: User manually selected all specific positions
        const selectedSpecifics = newVal.filter(p => p !== 'All');
        if (selectedSpecifics.length === specificPositions.length) {
            this.selectedPositions = ['All'];
        }
    },
    deep: true
}
```

### 3. Pure Computed Filter in `mappedDemandData`
In `mappedDemandData` computed property in [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L631-L640):
```javascript
if (this.selectedPositions.length > 0 && !this.selectedPositions.includes('All')) {
    const selectedLower = this.selectedPositions.map(p => String(p).toLowerCase());
    filteredData = filteredData.filter(item =>
        item.dem_position && selectedLower.includes(String(item.dem_position).toLowerCase())
    );
}
```

## Verification Plan
1. Click `All`: verify all position chips clear and `All` stays checked.
2. Click `Worker` while `All` is checked: verify `All` unchecks and `Worker` checks.
3. Click `Intern`: verify `Worker` and `Intern` both stay checked.
4. Uncheck `Worker` and `Intern`: verify `All` automatically checks.
5. Verify `Intern` chip displays capitalized **Intern** in English locale.
6. Verify filtering correctly matches `intern` / `Intern` records in DB.

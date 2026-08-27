# Smart Position Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement smart chip selection behavior for position filters and capitalize `Intern` chip label in [demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue).

**Architecture:** Use a Vue watcher on `selectedPositions` to handle smart mutual exclusion between `All` and specific position chips, and clean up computed property side-effects.

**Tech Stack:** Vue.js 2 / Nuxt.js, Vuetify

---

### Task 1: Update itemsPos, mappedDemandData, and add watcher in demand.vue

**Files:**
- Modify: [demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L586-L640)
- Modify: [demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L1177-L1212)

- [ ] **Step 1: Capitalize `intern` to `Intern` in itemsPos**

In [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L593):
```diff
-            { vi: 'Thực tập sinh', en: 'intern', cn: '實習生' }
+            { vi: 'Thực tập sinh', en: 'Intern', cn: '實習生' }
```

- [ ] **Step 2: Clean up computed mappedDemandData filtering**

In [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L631-L640):
```diff
-            if (this.selectedPositions.length > 0) {
-                if (this.selectedPositions.includes('All')) {
-                    this.selectedPositions = ['All'];
-                } else {
-                    const selectedLower = this.selectedPositions.map(p => String(p).toLowerCase());
-                    filteredData = filteredData.filter(item =>
-                    item.dem_position && selectedLower.includes(String(item.dem_position).toLowerCase())
-                    );
-                }
-            }
+            if (this.selectedPositions.length > 0 && !this.selectedPositions.includes('All')) {
+                const selectedLower = this.selectedPositions.map(p => String(p).toLowerCase());
+                filteredData = filteredData.filter(item =>
+                    item.dem_position && selectedLower.includes(String(item.dem_position).toLowerCase())
+                );
+            }
```

- [ ] **Step 3: Add watcher for selectedPositions**

In [pages/demand.vue](file:///d:/source/aw-recruiting-report/pages/demand.vue#L1177):
Add `selectedPositions` handler to the `watch:` block.

- [ ] **Step 4: Verify UI behavior**

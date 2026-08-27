# Replace 'Engineer' with 'Intern' on Recruiting Report Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update [recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue) position options to use `Intern` instead of `Engineer` and apply smart filter behavior.

**Architecture:** Modify `loc_apply` data array, `filteredReportData` position matching, and `selectedPositions` watcher in `recruiting-report.vue`.

**Tech Stack:** Vue.js 2 / Nuxt.js, Vuetify

---

### Task 1: Update loc_apply, filteredReportData, and selectedPositions watcher

**Files:**
- Modify: [recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L273-L414)

- [ ] **Step 1: Replace Engineer with Intern in loc_apply**

In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L273):
```diff
-        loc_apply: ['Worker', 'Staff', 'Staff (lang)', 'Leader', 'Translator', 'Engineer'],
+        loc_apply: ['Worker', 'Staff', 'Staff (lang)', 'Leader', 'Translator', 'Intern'],
```

- [ ] **Step 2: Update filteredReportData position check**

In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L376-L377):
```diff
-          const positionMatch = this.selectedPositions.includes('All') ||
-          this.selectedPositions.includes(item.position);
+          const positionMatch = this.selectedPositions.includes('All') ||
+          this.selectedPositions.some(p => String(p).toLowerCase() === String(item.position).toLowerCase());
```

- [ ] **Step 3: Upgrade selectedPositions watcher**

In [pages/recruiting-report.vue](file:///d:/source/aw-recruiting-report/pages/recruiting-report.vue#L406-L414):
```diff
       selectedPositions(newVal, oldVal) {
+        if (!newVal || newVal.length === 0) {
+          this.selectedPositions = ['All'];
+          return;
+        }
         if (newVal.includes('All') && !oldVal.includes('All')) {
           this.selectedPositions = ['All'];
         } else if (newVal.includes('All') && newVal.length > 1) {
           this.selectedPositions = newVal.filter(item => item !== 'All');
-        } else if (newVal.length === 0) {
-          this.selectedPositions = ['All'];
+        } else if (newVal.filter(item => item !== 'All').length === this.loc_apply.length) {
+          this.selectedPositions = ['All'];
         }
       }
```

- [ ] **Step 4: Verification**

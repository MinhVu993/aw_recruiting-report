<template> </template>
<script>
export default {
  data() {
    return {};
  },
  beforeMount() {
    if (!this.$session.has("aw-recruiting-report")) {
      this.$router.push("./");
    }
  }
};
</script>
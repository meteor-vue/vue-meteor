<template>
<div class="vuex-tracker">
  <div class="threads">
    <div class="info">
      {{ $t('pages.vuex.tracker.info') }}
    </div>
    <div class="options">
      <div class="option sort-date" @click="toggleSortDate">
        {{ $t('pages.vuex.tracker.date') }}
        <span v-if="sortDate === 1">&#9660;</span>
        <span v-else>&#9650;</span>
      </div>
    </div>
    <div class="thread" v-for="thread in threads">
      <span class="name">{{thread.name}}</span>
      <span class="date">{{thread.date | date}}</span>
    </div>
  </div>
</div>
</template>

<script>
export default {
  vuex({forum}) {
    return {
      trackers: {
        threads: forum.trackers.getThreads
      },
      getters: forum.getters,
      actions: forum.actions
    }
  },
  filters: {
    date(value) {
      if(!value) {
        return '';
      }
      value = new Date(value);
      // Simple date format
      return `${value.getMonth()}-${value.getDate()}-${value.getFullYear()} ${value.getHours()}:${value.getMinutes()}`;
    }
  }
}
</script>

<style scoped lang="less">
.option {
  cursor: default;
}
.thread, .option {
  padding: 6px;
}
.thread {
  .date {
    float: right;
  }
}
.options {
  text-align: right;
}
</style>

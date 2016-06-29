<template>
  <div class="apollo">
    <h1>{{$t('pages.apollo.title')}}</h1>
    <div class="tags">
      <h2>{{$t('pages.apollo.tags.title')}}</h2>
      <div class="info">
          {{$t('pages.apollo.tags.info')}}
      </div>
      <span class="tag" v-for="tag in tags"><a>{{tag.label}}</a></span>

      <form @submit.prevent="addTag">
        <input v-model="tagLabel" :placeholder="$t('pages.apollo.tags.add')" />
      </form>
    </div>

    <hr />

    <div class="tests">
      <h2>{{$t('pages.apollo.tests.title')}}</h2>
      <div>
        <h3>{{$t('pages.apollo.tests.hello')}}</h3>
        <p>
          {{hello}}
        </p>
      </div>
      <div>
        <h3>{{$t('pages.apollo.tests.ping')}}</h3>
        <input v-model="pingInput" :placeholder="$t('pages.apollo.tests.input')" />
        <p>
          {{pingMessage}}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // Vue data
      pingInput: '',
      tagLabel: '',

      // Initialize your apollo data
      hello: '',
      pingMessage: '',
      tags: []
    }
  },
  // Apollo-specific options
  apollo: {
    // Non-reactive query
    data: {
      // Simple query that will update the 'hello' vue property
      hello: gql`{hello}`,
      // Advanced query with parameters
      // The 'variables' method is watched by vue
      pingMessage: {
        query: gql`query PingMessage($message: String!) {
          ping(message: $message)
        }`,
        // Reactive parameters
        variables() {
          // Use vue reactive properties here
          return {
              message: this.pingInput
          }
        },
        // We use a custom update callback because
        // the field names don't match
        // By default, the 'pingMessage' attribute
        // would be used on the 'data' result object
        // Here we know the result is in the 'ping' attribute
        // considering the way the apollo server works
        update(data) {
          console.log(data);
          return data.ping;
        },
        // Optional result hook
        result(data) {
          console.log("We got some result!");
        },
        // Error handling
        error(errors, type) {
          console.error(`We've got ${errors.length} errors of type '${type}'`);
        }
      }
    },
    // Reactive query
    watch: {
      // 'tags' data property on vue instance
      tags: {
        query: gql`{
          tags {
            id,
            label
          }
        }`,
        pollInterval: 300 // Not working, should be fixed soon
        // https://github.com/apollostack/apollo-client/pull/262
      }
    }
  },
  methods: {
    addTag() {
      // Mutate the tags data
      // You can also use this.$apollo.client.mutate
      this.$apollo.mutate({
        mutation: gql`mutation AddTag($label: String!) {
          addTag(label: $label) {
            id,
            label
          }
        }`,
        // Parameters
        variables: {
          label: this.tagLabel
        }
      }).then((data) => {
        // Result
        console.log(data);
        this.tagLabel = '';
      }).catch((error) => {
        // Error
        console.error(error);
      });
    }
  }
}
</script>

<style scoped lang="less">
.tags {
  margin-top: 32px;
  text-align: center;

  h2 {
    margin-bottom: 8px;
  }
}

.tag {
  display: inline-block;
  margin-right: 6px;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: #40b883;
  border-radius: 3px;

  a {
    color: white;
  }

  &:hover {
    background: #a0ddc4;
  }
}
</style>

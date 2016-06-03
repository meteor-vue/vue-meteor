# Apollo in Vue

Integrates [apollo](http://www.apollostack.com/) in your vue components with declarative queries.

*TODO npm package for use in non-meteor project*

## Installation


    meteor add akryum:vue-apollo

## Usage

Set the environment variable `APOLLO_CLIENT_URL` to the URL of your apollo serveur (default is `/graphql`).

To declare apollo queries in your Vue component, add an `apollo` object :

```javascript
new Vue({
    apollo: {
        // Apollo specific options
    }
});
```

You can access the [apollo-client](http://docs.apollostack.com/apollo-client/index.html) instance with `this.$apollo.client` in all your vue components.

### Queries

In the `data` object, add an attribute for each property you want to feed with the result of an Apollo query.

#### Simple query

Put the [gql](http://docs.apollostack.com/apollo-client/core.html#gql) query directly as the value:

```javascript
apollo: {
  // Non-reactive query
  data: {
    // Simple query that will update the 'hello' vue property
    hello: gql`{hello}`
  }
}
```

You don't need to call `registerGqlTag`, it's already done by the package so you can use `gql` everywhere in your app.

Don't forget to initialize your property in your vue component:

```javascript
data () {
  return {
    // Initialize your apollo data
    hello: ''
  }
}
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`;

export const resolvers = {
  Query: {
    hello(root, args, context) {
      return "Hello world!";
    }
  }
};
```

For more info, visit the [apollo doc](http://docs.apollostack.com/apollo-server/index.html).

You can then use your property as usual in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

#### Query with parameters

You can add variables (read parameters) to your `gql` query:

```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
    // Query with parameters
    ping: {
      // gql query
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Static parameters
      variables: {
        message: 'Meow'
      }
    }
  }
}
```

Don't forget to initialize your property in your vue component:

```javascript
data () {
  return {
    // Initialize your apollo data
    ping: ''
  }
}
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`;

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`;
    }
  }
};
```

And then use it in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

#### Reactive parameters

Use a function instead to make the parameters reactive with vue properties:

```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
    // Query with parameters
    ping: {
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
            message: this.pingInput
        }
      }
    }
  }
}
```

This will re-fetch the query each time a parameter changes, for example:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

#### Advanced options

Available advanced options:

 - `forceFetch: true` see the [apollo doc](http://docs.apollostack.com/apollo-client/core.html#forceFetch)
 - `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match
 - `result(data)` is a hook called when a result is received
 - `error(errors, type)` is a hook called when there are errors, `type` value can either be `'sending'` or `'execution'`


```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
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
        // The returned value will update
        // the vue property 'pingMessage'
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
  }
}
```

### Reactive Queries

*For now, the reactivity in apollo is quite limited and unstable. You can only do polling and it is currently broken (but should be fixed soon, see https://github.com/apollostack/apollo-client/pull/262).*

For more info, see the [apollo doc](http://docs.apollostack.com/apollo-client/core.html#watchQuery).

Add your queries in a `watch` object instead of `data`:

```javascript
// Apollo-specific options
apollo: {
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
      pollInterval: 300
    }
  }
}
```

And server-side:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`;

// Fake word generator
import casual from 'casual';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(casual.word);
}

function addTag(label) {
  let t = {
    id: id++,
    label
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    }
  }
};
```

### Mutations

Mutations are queries that changes your data state on your apollo server. For more info, visit the [apollo doc](http://docs.apollostack.com/apollo-client/core.html#Mutations).

```javascript
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
```

Server-side:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`;

// Fake word generator
import casual from 'casual';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(casual.word);
}

function addTag(label) {
  let t = {
    id: id++,
    label
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    }
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`);
      return addTag(label);
    }
  }
};
```

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)

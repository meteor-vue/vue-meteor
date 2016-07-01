# Vuex integration for Meteor

> Flux-inspired Application Architecture for your Vue Meteor app

![graph](https://raw.githubusercontent.com/vuejs/vuex/master/docs/en/vuex.png)

Manage the state of your app with a centralized data store using [vuex](https://github.com/vuejs/vuex).

[Why do I need a vuex store?](http://vuex.vuejs.org/en/intro.html)

See the [example app](https://github.com/Akryum/meteor-vuex-example)

## Installation


    meteor add akryum:vuex

## Usage

You can find the vuex doc [here](http://vuex.vuejs.org).

### Create a store

On you client, create a `StoreModule` object:

```javascript
import {StoreModule} from 'meteor/akryum:vuex';

const root = new StoreModule();
```

This object is the *root module* and it can have multiple *submodules* ([see there](#submodules)).

#### State

Set the initial state with the `addState(state)` method:

```javascript
root.addState({
  counter: 0
});
```

For more info on state, see the [vuex doc](http://vuex.vuejs.org/en/state.html).

#### Getters

Use the `addGetters(map)` method to add getters:

```javascript
root.addGetters({
  counter: state => state.counter,
  status: state => {
    if(state.counter === 0) {
      return 'None'
    } else if(state.counter === 1) {
      return 'One'
    } else {
      return 'Many'
    }
  }
});
```

Getters will be accessible with `root.getters.<name>`.

Using centralized getters is good practice. They are also cached by vue just like computed props, bringing better performance.

For more info on getters, see the [vuex doc](http://vuex.vuejs.org/en/state.html).

#### Mutations

The state can only be changed by *mutations*. To add mutations, use the `addMutations(map)` method:

```javascript
root.addMutations({
  INCREMENT(state, amount) {
    state.counter += amount;
  },
  DECREMENT(state, amount) {
    state.counter -= amount;
  }
});
```

For more info on mutations, see the [vuex doc](http://vuex.vuejs.org/en/mutations.html).

#### Actions

Use the `addActions(map)` method to add actions to the module:

```javascript
// Using centralized actions is good practice
root.addActions({
  increment(store, state, amount) {
    // state is immutable
    store.dispatch('INCREMENT', amount);
  },
  decrement(store, state, amount) {
    // state is immutable
    store.dispatch('DECREMENT', amount);
  }
});
```

Unlike in native vuex, the actions takes two mandatory parameters:

 - `store` is the vuex native store instance implementing the `dispatch()` method
 - `state` is the current state *relative to the module* and should not be modified inside actions

Actions will be accessible with `root.actions.<name>`.

For more info on actions, see the [vuex doc](http://vuex.vuejs.org/en/actions.html).

#### Export

Finally, export the store:

```javascript
// Export the vuex native store
export const store = root.exportStore();
```

### Use the store in your components

On the container component, inject the vuex native store:

```javascript
// We import the result of root.exportStore()
import {store} from '/imports/vuex/store'

export default {
  store: store
}
```

You can also use the ES6 syntax:

```javascript
export default {
  store
}
```

The store will be available in all the children of this component.

You can now use the `vuex` options as described in the [vuex doc](http://vuex.vuejs.org/en/getting-started.html).

The `vuex` option can also be a function, with the `root` module as parameter:

```javascript
export default {
  vuex(root) {
    return {
      /* Vuex options here */
    }
  }
}
```

That way, you can access the root module attributes (like getters and actions) while declaring the vuex options, without the need of imports.

#### Display state

Use the `vuex.getters` option ([more info](http://vuex.vuejs.org/en/state.html#getting-vuex-state-into-vue-components)):

```html
<template>
  <div>
    <h3>Counter is {{ counter }}</h3>
  </div>
</template>

<script>
export default {
  vuex(root) {
    return {
      getters: {
        counter: root.getters.counter
      }
    };
  }
}
</script>
```

You can use all the getters at once:

```javascript
export default {
  vuex(root) {
    return {
      getters: root.getters
    };
  }
}
```

If they are not shared between multiple components, you can also define getters inline:

```javascript
export default {
  vuex: {
    getters: {
      counter: state => state.counter
    }
  }
}
```


#### Call store actions

Use the `vuex.actions` option ([more info](http://vuex.vuejs.org/en/actions.html#calling-actions-in-components)):

```html
<template>
  <div>
    <button @click="increment(parseInt(amount))">Increment</button>
    <input class="input" v-model="amount" type="number" :placeholder="Amount" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      amount: 1
    }
  },
  vuex(root) {
    return {
      actions: {
        increment: root.actions.increment
      }
    };
  }
}
</script>
```

You can use all the actions at once:

```javascript
export default {
  vuex(root) {
    return {
      actions: root.actions
    };
  }
}
```

### Submodules

You can split your store into submodules to improve your project organization (especially if it is getting big). For example, each submodule could deal with a specific domain of your app.

To add a module, use the `StoreSubModule` class:

```javascript
import {StoreSubModule} from 'meteor/akryum:vuex';

const subModule = new StoreSubModule('forum');
```

Then export it:

```javascript
export default subModule;
```

And add it to the root module:

```javascript
import forum from './modules/tracker';
root.addModule(forum);
```

All the `state` parameters in the `addState`, `addGetters`, `addMutations`, `addActions`, `addTrackers` methods are relative to the module.

For example, let's add some state to our submodule:

```javascript
subModule.addState({
  sortDate: -1
});
```

In the store, the app state will be:

```javascript
{
  forum: {
    sortDate: -1
  }
}
```

But if you add a getter in your submodule:

```javascript
subModule.addGetters({
  sortDate: state => state.sortDate
});
```

The state will be automatically narrowed to the specific state of the submodule:

```javascript
{
  sortDate: -1
}
```

#### Usage in components

If you use the `vuex` function options, you get the root module as parameter. You can access the submodules directly on this parameter:

```javascript
export default {
  vuex(root) {
    let forum = root.forum;
    return {
      getters: {
        sortDate: forum.getters.sortDate
      }
    }
  }
}
```

With ES6 destructuring:

```javascript
export default {
  vuex({forum}) {
    return {
      getters: {
        sortDate: forum.getters.sortDate
      }
    }
  }
}
```

### Meteor data integration

To use meteor reactive data with your store, use *trackers* on your module with the `addTrackers(map)` method:

```javascript
// Add trackers to the store module
subModule.addTrackers({
  // Name of the tracker
  message() {
    return {
      // Update the meteor data
      // Data is relative to the module
      update(data) {
        // Update the module meteor data
        // Use meteor reactive data here
        data.message = Session.get('message');
      },
      // Getters
      // These are computed properties and are cached by vue
      getters: {
        // Getters should follow the get<Name> naming convention
        getMessage(data) {
          return data.message;
        }
      }
    }
  }
});
```

The trackers added this way will be accessible in the `trackers` attribute of the module.

The `update` method will be autorun by the `Tracker` meteor package when a meteor reactive data in the method has been changed. The parameter is a `data` object that represents the meteor data in the module, and is vue-reactive.

The tracker getters are working like vue computed properties (thus efficiently cached) and can be accessed on the module in the `trackers` attribute.

To use this tracker in your component, use the `vuex.trackers` option:

```javascript
export default {
  vuex({forum}) {
    return {
      trackers: {
        message: forum.trackers.getMessage
      }
    }
  }
}
```

And use it like a read-only vue computed property:

```html
<template>
  <div>{{message}}</div>
</template>
```

#### Advanced example

Here is a more advanced example with a subscription:

```javascript
// Import a meteor collection
import {Threads} from '/imports/api/collections';

// Add trackers to the store module
subModule.addTrackers({
  // Name of the tracker
  threads() {
    // Context variables
    let sub;

    // You can execute arbitrary code here

    return {
      // Initialize the meteor data (optionnal)
      init(data) {
        data.threads = []
      },
      // When the tracker is being used (optionnal)
      activate() {
        // Subscribe to the publication
        sub = Meteor.subscribe('threads');
      },
      // When the tracker is no longer used (optionnal)
      deactivate() {
        // Stop the subscription
        sub.stop();
      },
      // Watch store changes
      // State is relative to the module (optionnal)
      watch(state) {
        // state is immutable
        return {
          sortDate: state.sortDate
        }
      },
      // Update the meteor data
      // Data is relative to the module
      update(data, {sortDate}) {
        // Meteor data query
        // Use meteor reactive data here
        let threads = Threads.find({}, {
          sort: {date: sortDate}
        }).fetch();
        console.log("updated threads", threads.length);

        // Update the module meteor data
        data.threads = threads;
      },
      // Getters
      // These are computed properties and are cached by vue
      getters: {
        // Getters should follow the get<Name> naming convention
        getThreads(data) {
          return data.threads;
        }
      },
      // If true, the tracker will be activated right away
      // Else, you need to add it on a vue component or call t.addClient()
      isActivated: false
    }
  }
});
```

And in the component:

```html
<template>
  <div class="threads">
    <div class="thread" v-for="thread in threads">
      {{thread.name}}
    </div>
  </div>
</template>

<script>
export default {
  vuex({forum}) {
    return {
      trackers: {
        threads: forum.trackers.getThreads
      }
    }
  }
}
</script>
```

#### Tracker activation

The tracker will be activated if at last one component use it and deactivated if it is no longer used automatically.

You can activate and deactivate a tracker with the following methods:

 - `t.addClient()` will activate the tracker if it was not
 - `t.removeClient()` will deactivate it if there are no one else using it
 - `t.activate()` (not recommended) will activate it
 - `t.deactivate()` (not recommended) will deactivate it

Example for the tracker we created above:

```javascript
// In a vue component
export default {
  methods: {
    needTracker() {
      // this.$store.root.<submodule>.trackers.<tracker_name>.addClient();
      this.$store.root.forum.trackers.threads.addClient();
    },
    noLongerNeedTracker() {
      // this.$store.root.<submodule>.trackers.<tracker_name>.removeClient();
      this.$store.root.forum.trackers.threads.removeClient();
    }
  }
}
```

In the tracker declaration, you can set the `isActivated` boolean to `true` if you want it to be activated right away (this will call the `activate` callback).

---

## Next steps

- [Example project](https://github.com/Akryum/meteor-vuex-example)
- [Add routing to your app](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-router#installation)
- [Add internationalization to your app](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-i18n#installation)
- [Integrate apollo](https://github.com/Akryum/meteor-vue-component/tree/master/packages/vue-apollo#installation)

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)

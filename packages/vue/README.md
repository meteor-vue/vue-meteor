# Vue integration for Meteor

## Installation


    meteor add akryum:vue

## Usage

In your Vue component, add a `meteor` object :


    new Vue({
        meteor: {
            // Meteor specific options
        }
    );

#### Subscriptions

Add an object for each subscription in a `subscribe` object. The object key is the name of the publication and the value is either an array of parameters or a function returning an array of parameters. These subscription will be stopped when the component is destroyed.

    meteor: {
        // Subscriptions
        subscribe: {
            // Subscribes to the 'threads' publication with no parameters
            'threads': [],
            // Subscribes to the 'threads' publication with static parameters
            'threads': ['new', 10], // The 10 newest threads
            // Subscribes to the 'posts' publication with dynamic parameters
            // The subscription will be re-called when a vue reactive property changes
            'posts': function() {
                // Here you can use Vue reactive properties
                return [this.selectedThreadId] // Subscription params
            }
        }
    }

You can also use the `$subscribe(name, ...params)` method in you component code:


    ready () {
        // Subscribes to the 'threads' publication with two parameters
        this.$subscribe('thread', 'new', 10);
    }

You can also change the default subcription method be defining the `Vue.config.meteor.subscribe` function:


    // You can replace the default subcription function with our own
    // Here we replace the native subscribe() with a cached one
    // with the ccorcos:subs-cache package
    const subsCache = new SubsCache({
        expireAfter: 15,
        cacheLimit: -1
    });
    Vue.config.meteor.subscribe = function(...args) {
      args.unshift(subsCache.expireAfter); // First arg
      return subsCache.subscribeFor.apply(subsCache, args);
    };

#### Reactive data

You can make your component `data` properties update from any Meteor reactive sources (like collections or session) by putting an object for each property in the `data` object. The object key is the name of the property, and the value is either a function or an object with the following attributes:

 - `params()` (optionnal), a function returning an object, which can use any *Vue* reactive property,
 - `update([params])`, a function with optionnal `params` argument, that returns the value to update the corresponding `data` property of the component. Here you can use *Meteor* reactive sources, but **no Vue reactive property getters**. The `params` argument is the object returned by the `params()` function described above.


    new Vue({
        data() {
            return {
                selectedThreadId: null,
                // We init the property value in the data() component hook
                threads: []
            };
        },
        meteor: {
            // Subscriptions
            subscribe: {
                // We subscribe to the 'threads' publication
                'threads': []
            },
            // Reactive Data
            data: {
                // Threads list
                // This will update the 'threads' array property on the Vue instance
                // that we set in the data() hook earlier
                // You can use a function directly if you don't need
                // parameters coming from the Vue instance
                threads () {
                    // Here you can use Meteor reactive sources
                    // like cursors or reactive vars
                    // as you would in a Blaze template helper
                    // However, Vue reactive properties will not update
                    return Threads.find({}, {
                        sort: {date: -1}
                    });
                },
                // Selected thread
                // This will update the 'selectedThread' object property on component
                selectedThread: {
                    //// Vue Reactivity
                    // We declare which params depends on reactive vue properties
                    params () {
                        // Here you can use Vue reactive properties
                        // Don't use Meteor reactive sources!
                        return {
                            id: this.selectedThreadId
                        };
                    },
                    //// Meteor Reactivity
                    // This will be refresh each time above params changes from Vue
                    // Then it calls Tracker.autorun() to refresh the result
                    // each time a Meteor reactive source changes
                    update ({id}) {
                        // Here you can use Meteor reactive sources
                        // like cursors or reactive vars
                        // Don't use Vue reactive properties!
                        return Threads.findOne(id);
                    }
                }
            }
        }
    });

You can then use the reactive data in the template since it's standard Vue component properties:


    <!-- Thread list -->
    <thread-item v-for="thread in threads" :data="thread" :selected="thread._id === selectedThreadId" @select="selectThread(thread._id)"></thread-item>

    <!-- Selected thread -->
    <thread v-if="selectedThread" :id="selectedThreadId"></thread>

Or anywhere else in you Vue component:

    computed: {
        count () {
            return this.threads.length;
        }
    }

---

LICENCE MIT - Created by Guillaume CHAU (@Akryum)

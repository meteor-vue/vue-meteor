import Vue from 'vue'
import { Blaze } from 'meteor/blaze'

const vueVersion = parseInt(Vue.version.charAt(0))

if (vueVersion === 1) {
  Vue.directive('blaze', {
    update (newValue, oldValue) {
      if (newValue !== oldValue || !this.blazeView) {
        const templateName = newValue
        const template = Blaze._getTemplate(templateName, null)
        if (!template) {
          throw new Error(`Blaze template '${templateName}' not found.`)
        }
        if (this.blazeView) {
          Blaze.remove(this.blazeView)
        }
        this.blazeView = Blaze.render(template, this.el)
      }
    },
    unbind () {
      if (this.blazeView) {
        Blaze.remove(this.blazeView)
      }
    },
  })
} else if (vueVersion === 2) {
  Vue.directive('blaze', {
    bind (el, {value}) {
      renderTemplate(el, value)
    },
    update (el, {value, oldValue}) {
      if (value !== oldValue || !el.blazeView) {
        if (el.blazeView) {
          Blaze.remove(el.blazeView)
        }
        renderTemplate(el, value)
      }
    },
    unbind (el) {
      if (el.blazeView) {
        Blaze.remove(el.blazeView)
      }
    },
  })
}

function renderTemplate (el, templateName) {
  const template = Blaze._getTemplate(templateName, null)
  if (!template) {
    throw new Error(`Blaze template '${templateName}' not found.`)
  }
  el.blazeView = Blaze.render(template, el)
}

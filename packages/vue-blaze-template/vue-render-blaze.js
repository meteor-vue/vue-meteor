import { Vue } from 'meteor/akryum:vue';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

Vue.directive('blaze', {
  bind() {
  },
  update(newValue, oldValue) {
    const templateName = newValue;
    const template = Template[templateName];
    if(!template) {
      throw new Error(`Blaze template '${templateName}' not found.`);
    }
    if(this.blazeView) {
      Blaze.remove(this.blazeView);
    }
    this.blazeView = Blaze.render(template, this.el);
  },
  unbind() {
    Blaze.remove(this.blazeView);
  }
});

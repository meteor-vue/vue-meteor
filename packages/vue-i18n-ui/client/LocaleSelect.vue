<template>
  <div class="vue-ui-locale-select" :class="componentClass">
    <div class="vue-ui-backdrop" v-show="isOpen || showRememberPrompt" transition="fade" @click="isOpen = false"></div>
    <div class="vue-ui-component-wrapper">
      <div class="vue-ui-main-select-btn">

        <!-- Loading -->
        <div v-show="loading" class="vue-ui-loading-animation" transition="fade">
          <div class="vue-ui-spinner">
            <div class="vue-ui-bounce1"></div>
            <div class="vue-ui-bounce2"></div>
            <div class="vue-ui-bounce3"></div>
          </div>
        </div>

        <!-- Current lang -->
        <a v-else class="vue-ui-current-lang vue-ui-select-btn" @click="toggleOpen" @keyup.space="toggleOpen" tabindex="0" role="button" aria-describedby="Opens the language selection list" transition="fade">
          {{currentLang | langName}}
          <span class="vue-ui-arrow">
            <slot name="arrow">
              <span class="vue-ui-default-icon">
                <svg enable-background="new 0 0 32 32" height="23px" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="23px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <path d="M15.5,0C6.939,0,0,6.939,0,15.5S6.939,31,15.5,31S31,24.061,31,15.5S24.061,0,15.5,0z M28.975,15  h-5.996c-0.055-2.215-0.449-4.331-1.148-6.268c1.35-0.563,2.598-1.312,3.736-2.197C27.59,8.806,28.855,11.755,28.975,15z   M14.947,28.972c-1.662-1.384-3.056-3.181-4.076-5.268c1.309-0.409,2.696-0.633,4.129-0.679v5.949  C14.982,28.974,14.965,28.973,14.947,28.972z M16.051,2.028c1.886,1.57,3.425,3.673,4.466,6.126c-1.426,0.487-2.941,0.77-4.518,0.82  V2.025C16.018,2.026,16.034,2.027,16.051,2.028z M17.717,2.198c2.76,0.459,5.236,1.748,7.164,3.614  c-1.047,0.803-2.191,1.483-3.428,1.998C20.543,5.653,19.266,3.746,17.717,2.198z M15,2.025v6.949  c-1.577-0.051-3.093-0.333-4.518-0.82c1.041-2.453,2.58-4.556,4.466-6.126C14.966,2.027,14.982,2.026,15,2.025z M9.546,7.811  c-1.235-0.515-2.38-1.195-3.427-1.998c1.927-1.866,4.404-3.155,7.164-3.614C11.733,3.746,10.457,5.653,9.546,7.811z M10.105,9.076  C11.647,9.611,13.29,9.923,15,9.975V15H9.021C9.075,12.906,9.446,10.905,10.105,9.076z M15,16v6.025  c-1.577,0.048-3.102,0.306-4.539,0.769C9.595,20.732,9.084,18.435,9.021,16H15z M13.283,28.802  c-2.473-0.411-4.719-1.488-6.545-3.052c0.985-0.683,2.05-1.261,3.188-1.7C10.798,25.858,11.939,27.463,13.283,28.802z M16,28.975  v-5.949c1.432,0.046,2.82,0.27,4.129,0.679c-1.021,2.087-2.414,3.884-4.076,5.268C16.036,28.973,16.018,28.974,16,28.975z   M21.074,24.05c1.137,0.439,2.201,1.018,3.188,1.7c-1.826,1.563-4.072,2.641-6.545,3.052C19.061,27.463,20.201,25.858,21.074,24.05z   M20.539,22.794c-1.438-0.463-2.963-0.721-4.539-0.769V16h5.979C21.916,18.435,21.404,20.732,20.539,22.794z M16,15V9.975  c1.709-0.052,3.352-0.363,4.895-0.898c0.658,1.829,1.029,3.83,1.084,5.924H16z M5.434,6.535C6.572,7.42,7.82,8.169,9.169,8.732  C8.47,10.669,8.076,12.785,8.021,15H2.025C2.145,11.755,3.41,8.806,5.434,6.535z M2.025,16h5.996  c0.062,2.555,0.596,4.968,1.503,7.137c-1.267,0.494-2.448,1.152-3.538,1.931C3.638,22.731,2.156,19.536,2.025,16z M25.014,25.067  c-1.09-0.778-2.271-1.437-3.539-1.931c0.908-2.169,1.441-4.582,1.504-7.137h5.996C28.844,19.536,27.361,22.731,25.014,25.067z" fill="#333332" id="world"/>
                </svg>
              </span>
            </slot>
          </span>
        </a>
      </div>

      <!-- Lang-list -->
      <div class="vue-ui-lang-list" v-if="isOpen" role="list" aria-describedby="Available languages list">
        <lang-item class="vue-ui-lang-option vue-ui-select-btn" v-for="l in langs | orderBy l" @select="select" :lang="l"><span :title="l | nativeLangName">{{l | langName}}</span></lang-item>
      </div>

      <!-- Remember promp -->
      <div class="vue-ui-remember-prompt vue-ui-dialog" v-show="showRememberPrompt" transition="vue-ui-zoom" role="alertdialog" aria-labelledby="Remember language choice" aria-describedby="Asks if the selected language will be saved for the next visit">
        <div class="vue-ui-dialog-document" role="document">
          <div class="vue-ui-content vue-ui-info">
            {{$tp('remember.info')}}
          </div>
          <div class="vue-ui-actions">
            <a role="button" tabindex="0" @click="saveChoice" @keyup.space="saveChoice">{{$tp('remember.yes')}}</a>
            <a role="button" tabindex="0" @click="closePrompt" @keyup.space="closePrompt">{{$tp('remember.no')}}</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import {Vue} from 'meteor/akryum:vue';
import I18n, {IsoLangs} from 'meteor/akryum:vue-i18n';
import LangItem from './LangSelectItem.vue';

export default {
  props: {
    promptRemember: {
      type: Boolean,
      default: true
    },
    useNativeNames: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isOpen: false,
      showRememberPrompt: false
    }
  },
  computed: {
    langs() {
      return I18n.languageList;
    },
    currentLang() {
      return Vue.config.lang;
    },
    savedLang() {
      return I18n.savedLangOption;
    },
    loading() {
      return I18n.loading;
    },
    isReady() {
      return !this.loading && !this.showRememberPrompt;
    },
    componentClass() {
      return {
        'vue-ui-open': this.isOpen,
        'vue-ui-loading': this.loading,
        'vue-ui-prompt': this.showRememberPrompt,
        'vue-ui-busy': !this.isReady
      }
    }
  },
  methods: {
    toggleOpen() {
      if(this.isReady) {
        this.isOpen = !this.isOpen;
      }
    },
    select(lang) {
      if(this.isReady) {
        if(lang !== Vue.config.lang) {
          I18n.setLocale(lang);

          if(this.promptRemember) {
            this.showRememberPrompt = true;
          }
        }
        this.isOpen = false;
      }
    },
    saveChoice() {
      I18n.saveLang(Vue.config.lang);
      this.closePrompt();
    },
    closePrompt() {
      this.showRememberPrompt = false;
    }
  },
  filters: {
    langName(value) {
      let name = IsoLangs[value];
      if(this.useNativeNames) {
        return name.nativeName;
      } else {
        return name.name;
      }
    },
    nativeLangName(value) {
      return IsoLangs[value].name;
    }
  },
  components: {
    LangItem
  }
}
</script>

<style scoped lang="less">
@br: 3px;
@bg: white;
@bg-hover: #eee;

.ellipsis {
  overflow: hidden;
  -ms-text-overflow: ellipsis;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.frame {
  background: @bg;
  border-radius: @br;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.vue-ui-locale-select {
  font-size: 10pt;

  &, a {
    color: #666 !important;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    cursor: default;
  }

  .vue-ui-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.2);
  }

  .vue-ui-component-wrapper {
    position: relative;
  }

  .vue-ui-select-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 8px 10px;
    width: 120px;
    background: @bg;
    .ellipsis;

    &:hover {
      background: @bg-hover;
    }

    &:first-child {
      border-radius: @br @br 0 0;
    }

    &:last-child {
      border-radius: 0 0 @br @br;
    }
  }

  .vue-ui-main-select-btn {
    position: relative;
    width: 140px;
    height: 32px;
    display: inline-block;
    margin-bottom: 4px;
    .frame;

    .vue-ui-current-lang, .vue-ui-loading-animation {
      position: absolute;
      top: 0;
    }
  }

  .vue-ui-lang-list {
    position: absolute;
    background: @bg;
    border-radius: @br;
  }

  .vue-ui-current-lang {
    border-radius: @br !important;
    .vue-ui-arrow {
      float: right;
      transform: scale(0.7);
    }
  }

  .vue-ui-arrow {
    height: 16px;

    .vue-ui-default-icon {
      position: relative;
      top: -4px;
      right: -4px;
    }
  }

  .vue-ui-loading-animation {
    width: 100%;
    height: 100%;
    padding: 7px 0;
    box-sizing: border-box;
  }

  .vue-ui-spinner {
    width: 70px;
    text-align: center;
    margin: auto;
  }

  .vue-ui-spinner > div {
    width: 6px;
    height: 6px;
    background-color: grey;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1s infinite ease-in-out both;
    animation: sk-bouncedelay 1s infinite ease-in-out both;
  }

  .vue-ui-spinner .vue-ui-bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }

  .vue-ui-spinner .vue-ui-bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }

  @-webkit-keyframes sk-bouncedelay {
    0%, 80%, 100% { -webkit-transform: scale(0) }
    40% { -webkit-transform: scale(1.0) }
  }

  @keyframes sk-bouncedelay {
    0%, 80%, 100% {
      -webkit-transform: scale(0);
      transform: scale(0);
    } 40% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
    }
  }

  .vue-ui-dialog {
    position: fixed;
    top: 100px;
    left: 0;
    right: 0;

    .vue-ui-dialog-document {
      .frame;
      margin: auto;
      max-width: 300px;
      font-size: 1/0.9em;
      padding: 16px;

      .vue-ui-actions {
        margin-top: 16px;
      }

      .vue-ui-actions {
        display: flex;
        flex-direction: row;

        a {
          display: inline-block;
          .frame;
          padding: 6px 8px;
          flex: 100% 1 1;
          .ellipsis;
          margin-right: 8px;
          text-align: center;

          &:last-child {
            margin-right: 0;
          }

          &:hover {
            background: @bg-hover;
          }
        }
      }
    }
  }

  &.vue-ui-open {
    .vue-ui-current-lang {
      background: @bg-hover;
    }
  }

  &.vue-ui-busy {
    .vue-ui-select-btn {
      pointer-events: none;
    }
  }

  .vue-ui-fade-transition {
    transition: opacity .15s linear;
  }

  .vue-ui-fade-enter, .vue-ui-fade-leave {
    opacity: 0;
  }

  .vue-ui-zoom-transition {
    transition: opacity .15s linear, transform .15s cubic-bezier(0.190, 1.000, 0.220, 1.000);
  }

  .vue-ui-zoom-enter, .vue-ui-zoom-leave {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>

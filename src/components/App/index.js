function loadComponent(componentName, path) {
  return new Promise(function (resolve, reject) {
    requirejs([path], function () {
      const component = Vue.component(componentName);

      if (component) {
        resolve(component);
      } else {
        reject();
      }
    });
  });
}

function LoadCSS(cssURL) {

  // 'cssURL' is the stylesheet's URL, i.e. /css/styles.css

  return new Promise(function (resolve, reject) {

    const link = document.createElement('link');

    link.rel = 'stylesheet';

    link.href = cssURL;

    document.head.appendChild(link);

    link.onload = function () {
      resolve();
    };
  });
}

function LoadJS(jsURL) {

  return new Promise(function (resolve, reject) {

    const link = document.createElement('script');

    link.src = jsURL;

    document.head.appendChild(link);

    link.onload = function () {
      resolve();
    };
  });
}

requirejs.config({
  paths: {
    'router': '/assets/js/router',
    'api-util': '/assets/js/api.util',
    'storage-util': '/assets/js/storage.util',
    'vuex-store': '/assets/js/vuex-store',
    'i18n': '/assets/js/i18n'
  },
  shim: {
    'api-util': ['router'],
    'storage-util': ['api-util'],
    'vuex-store': ['storage-util'],
    'i18n': ['vuex-store'],
    'app-dependencies': ['i18n']
  }
});

requirejs(["/assets/js/router.js", "/assets/js/api.util.js", "/assets/js/storage.util.js", "/assets/js/vuex-store.js", "/assets/js/i18n.js"], function () {
  LoadCSS('/assets/css/style.css').then(function () {

    ApiUtil.init()

    const app = new Vue({
      el: '#app',
      template: PANO.UI,
      router,
      i18n,
      store,
      metaInfo() {
        return {
          title: this.$t("Common.Page.title"),
          meta: [
            {name: 'description', content: this.$t("Common.Page.description")}
          ]
        }
      },
      methods: {
        setLang(lang) {
          this.$store.dispatch('setLang', lang)
        }
      },
      computed: {
        langLoading() {
          return this.$store.state.langLoading
        }
      },
      beforeMount() {
        let loadLanguage;

        if (LanguageUtil.isThereLanguage())
          loadLanguage = LanguageUtil.getLanguage()
        else if (navigator.language.toUpperCase() === "tr".toUpperCase() || navigator.language.toUpperCase() === "tr-tr".toUpperCase())
          loadLanguage = "tr"
        else
          loadLanguage = "en"

        loadLanguageAsync(loadLanguage)
      },
      mounted() {

        // Enable Bootstrap 4 Tooltips

        $(function () {
          $('[data-toggle="tooltip"]').tooltip()
        })

      }
    });
  });
});
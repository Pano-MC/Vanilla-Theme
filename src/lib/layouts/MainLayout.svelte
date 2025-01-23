<svelte:head>
  <title>{$session.siteInfo.websiteName}</title>
</svelte:head>

<App>
  <!-- Announcement Alert -->
  <div
    class="alert alert-warning text-center alert-dismissible fade show rounded-0 mb-0"
    role="alert">
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="alert"
      aria-label="Close"></button>
    Alert 2
  </div>
  <!--Announcement Alert End-->
  <Header />

  <!-- Gives a gray background color to the container area -->
  <Navbar />
  <!-- Announcement Alert -->
  <div class="container">
    <div class="mb-3">
      <div
        class="alert alert-warning alert-dismissible fade show"
        role="alert">
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"></button>
        Alert 1
      </div>
    </div>
  </div>
  <!--Announcement Alert End-->
  <Main>
    <slot />
  </Main>

  <Footer />

  <!-- Modals Start-->
  <LoginModal />

  <RegisterModal />

  <!-- Modals End -->

  <NotificationContainer />
</App>

<script context="module">
  import { writable } from "svelte/store";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  import ApiUtil from "$lib/api.util.js";
  import { init as initLanguage } from "$lib/language.util";

  import { addListener } from "$lib/NotificationManager.js";
  import { initializePlugins, prepareSiteInfo } from "$lib/PluginManager.js";

  function sendVisitorVisitRequest({ event, csrfToken }) {
    ApiUtil.post({ path: "/api/visitorVisit", request: event, csrfToken });
  }

  function initNotificationListeners() {
    addListener("AN_ADMIN_REPLIED_TICKET", (notification) => {
      const {
        properties: { id },
      } = notification;

      goto("/ticket/" + id, { invalidateAll: true });
    });

    addListener("AN_ADMIN_CLOSED_TICKET", (notification) => {
      const {
        properties: { id },
      } = notification;

      goto("/ticket/" + id, { invalidateAll: true });
    });
  }

  /**
   * @type {import('@sveltejs/kit').LayoutServerLoad}
   */
  export async function loadServer(event) {
    const {
      locals: { user, csrfToken, apiUrlEnv }
    } = event;

    let siteInfo = await ApiUtil.get({
      path: "/api/siteInfo",
      request: event,
      csrfToken
    });

    siteInfo = await prepareSiteInfo(siteInfo);

    return { user, csrfToken, siteInfo, apiUrlEnv };
  }

  /**
   * @type {import('@sveltejs/kit').LayoutLoad}
   */
  export async function load(event) {
    const {
      data: { user, csrfToken, siteInfo, apiUrlEnv },
      parent,
    } = event;
    await parent();

    if (apiUrlEnv) {
      updateApiUrl(apiUrlEnv);
    }

    await initializePlugins(siteInfo);

    const output = {
      session: { user, csrfToken, siteInfo }
    };

    await initLanguage(siteInfo.locale);

    if (browser) {
      initNotificationListeners();
    }

    if (browser) {
      sendVisitorVisitRequest({ event, csrfToken });
    }

    return output;
  }
</script>

<script>
  import { onDestroy, setContext } from "svelte";

  import { page } from "$app/stores";

  import Header from "$lib/component/Header.svelte";
  import Navbar from "$lib/component/Navbar.svelte";
  import Main from "$lib/component/Main.svelte";
  import Footer from "$lib/component/Footer.svelte";
  import App from "$lib/component/App.svelte";

  import LoginModal from "$lib/component/modals/LoginModal.svelte";
  import RegisterModal from "$lib/component/modals/RegisterModal.svelte";
  import NotificationContainer from "$lib/component/NotificationContainer.svelte";

  export let data;

  const session = writable(data.session);
  const sidebar = writable(null);
  const sidebarProps = writable({});

  const pageUnsubscribe = page.subscribe((page) => {
    session.update(() => page.data.session);
    sidebar.update(() => page.data.sidebar);
    sidebarProps.update(() => page.data.sidebarProps || {});
  });

  setContext("session", session);
  setContext("sidebar", sidebar);
  setContext("sidebarProps", sidebarProps);

  onDestroy(pageUnsubscribe);
</script>

<Sidebar>
  <div class="mb-3">
    <!-- Profile Card -->
    <div class="card">
      <div class="card-body">
        <PlayerHead
          username="{user.username}"
          inGame="{$data.inGame}"
          lastActivityTime="{$data.lastActivityTime}"
          checkTime="{checkTime}" />
        <div class="text-center">
          <h2 class="mt-3">{user.username}</h2>
          <p
            use:tooltip="{[
              $_('sidebars.profile.secret'),
              { placement: 'top', hideOnClick: false },
            ]}">
            {user.email}
          </p>
          <PlayerPermissionBadge
            permissionGroupName="{$data.permissionGroupName}" />
        </div>
      </div>
    </div>
    <!-- Profile Card End -->
  </div>

  <!-- Profile Menu Card -->
  <div class="card">
    <div class="card-body">
      <ul class="nav nav-pills nav-fill flex-column">
        <li class="nav-item">
          <a
            class="nav-link"
            href="/profile"
            class:active="{matching($page.url.pathname, '/profile')}">
            {$_("sidebars.profile.links.statistics")}
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="/tickets"
            class:active="{matching($page.url.pathname, '/tickets', true)}">
            {$_("sidebars.profile.links.tickets")}
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            href="/profile/settings"
            class:active="{matching(
              $page.url.pathname,
              '/profile/settings',
              true,
            )}">
            {$_("sidebars.profile.links.settings")}
          </a>
        </li>
        <li class="nav-item">
          <button
            class="nav-link link-danger"
            on:click="{logout}"
            type="button">
            {$_("sidebars.profile.links.logout")}
          </button>
        </li>
      </ul>
    </div>
  </div>
  <!-- Profile Menu Card End -->
</Sidebar>

<script context="module">
  import ApiUtil from "$lib/api.util.js";
  import { writable } from "svelte/store";

  const data = writable({
    lastActivityTime: 0,
    inGame: false,
    permissionGroupName: "",
  });

  export const load = async (event) => {
    data.set(
      await ApiUtil.get({
        path: "/api/sidebars/profile",
        request: event,
      }),
    );
  };

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
</script>

<script>
  import { getContext, onDestroy, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import tooltip from "$lib/tooltip.util";

  import { page } from "$app/stores";

  import { logout } from "$lib/Store";

  import PlayerPermissionBadge from "$lib/component/PlayerPermissionBadge.svelte";
  import Sidebar from "$lib/component/Sidebar.svelte";
  import PlayerHead from "$lib/component/PlayerHead.svelte";

  const session = getContext("session");

  $: user = $session.user ? $session.user : {};

  let checkTime = 0;
  let interval;

  function matching(path, pathName, startsWith = false) {
    return (
      path.toUpperCase() === pathName.toUpperCase() ||
      path.toUpperCase() === (pathName + "/").toUpperCase() ||
      (startsWith && path.startsWith(pathName))
    );
  }

  onMount(() => {
    interval = setInterval(() => {
      checkTime += 1;
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

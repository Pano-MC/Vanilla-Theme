<!-- Header -->
<div class="bg-white border-bottom border-5 border-white">
  <div class="container">
    <img
      title={$session.siteInfo.websiteName}
      alt={$_("components.header.alt")}
      class="img-fluid d-block m-auto p-3"
      src="/api/websiteLogo" />
  </div>
</div>

<!-- Header End -->

<script>
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  const session = getContext("session");
</script>

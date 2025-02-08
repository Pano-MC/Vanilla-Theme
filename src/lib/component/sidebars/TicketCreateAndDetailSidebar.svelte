<Sidebar>
  <!-- Close Ticket Button -->
  {#if $ticketData}
    {#if $ticketData.status !== TicketStatuses.CLOSED}
      <div class="mb-3">
        <button
          class="btn btn-lg btn-danger w-100"
          type="button"
          on:click="{() => showCloseTicketConfirmModal($ticketData)}">
          <i class="fas fa-times me-2"></i>
          {$_("components.ticket-create-and-detail.close-ticket-button")}
        </button>
      </div>
    {/if}
  {/if}
  <!-- Close Ticket Button End -->

  <!-- Online Admins Card -->
  <OnlineAdmins onlineAdmins="{$data.onlineAdmins}" />
  <!-- Online Admins Card End -->
</Sidebar>

<script context="module">
  import { writable } from "svelte/store";

  import ApiUtil from "$lib/api.util.js";

  const data = writable({
    onlineAdmins: [],
  });
  const ticketData = writable(null);

  export const load = async (event, ticket) => {
    data.set(
      await ApiUtil.get({
        path: "/api/sidebars/support",
        request: event,
      }),
    );

    if (ticket) {
      ticketData.set(ticket);
    }
  };

  export const update = (ticket) => {
    ticketData.set(ticket);
  };
</script>

<script>
  import { _ } from "svelte-i18n";

  import Sidebar from "$lib/component/Sidebar.svelte";

  import OnlineAdmins from "$lib/component/OnlineAdmins.svelte";

  import { show as showCloseTicketConfirmModal } from "$lib/component/modals/CloseTicketConfirmModal.svelte";
  import { TicketStatuses } from "$lib/component/TicketStatus.svelte";
</script>

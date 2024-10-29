<style global>
  .answer {
    margin-bottom: 0;
  }
</style>

<article class="container">
  <div class="card">
    <div
      class="card-header bg-opacity-25 py-3 rounded-top"
      class:bg-secondary="{data.ticket.status === TicketStatuses.NEW}"
      class:bg-warning="{data.ticket.status === TicketStatuses.REPLIED}"
      class:bg-danger="{data.ticket.status === TicketStatuses.CLOSED}">
      <div class="row">
        <div class="col">
          <h5 class="card-title">{data.ticket.title}</h5>
          <small class="mb-0">
            {$_("pages.ticket-detail.detail.ticket", {values: {ticketId: data.ticket.id, }})},
            <Date time="{data.ticket.date}" relativeFormat="{true}" />
            ,
            {@html $_("pages.ticket-detail.detail.opened-in-category", {values: {category: `<a
              href="/tickets/category/${data.ticket.category.url}"
              title="${$_("pages.ticket-detail.filter")}"
              >${data.ticket.category === "-"
                ? $_("pages.ticket-detail.no-category")
                : data.ticket.category.title}
            </a>`, }})}</small>
        </div>
        <div class="col-auto">
          <TicketStatus status="{data.ticket.status}" />
        </div>
      </div>
    </div>
    <div
      class="card-body"
      id="messageSection"
      bind:this="{messagesSectionDiv}"
      bind:clientHeight="{$messagesSectionClientHeight}">
      {#if data.ticket.messages.length < data.ticket.messageCount && data.ticket.messageCount > 5}
        <button
          class="btn btn-link bg-light d-block m-auto"
          class:disabled="{loadMoreLoading}"
          on:click="{loadMore}"
          ><i class="fas fa-arrow-up mr-1"></i> {$_("pages.ticket-detail.previous-messages", {values: {count: data.ticket
                .messageCount -
              (data.ticket.messages.length - sentMessageCount)}})}
        </button>
      {/if}

      {#each data.ticket.messages as message, index (message)}
        {#if message.panel}
          <div class="row py-2 flex-nowrap justify-content-start">
            <div class="col-auto">
              <a href="/player/{message.username}">
                <img
                  src="https://minotar.net/avatar/{message.username}/48"
                  alt="{message.username}"
                  class="rounded d-block mr-auto animate__animated animate__zoomIn"
                  use:tooltip="{[message.username, { placement: 'bottom' }]}"
                  width="48"
                  height="48" />
              </a>
            </div>
            <div class="col-auto">
              <div class="card text-bg-light">
                <div class="card-header small">
                  <Date time="{message.date}" />
                </div>
                <div class="card-body answer">
                  {@html message.message}
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="row py-2 flex-nowrap justify-content-end">
            <div class="col-auto">
              <a href="/player/{message.username}">
                <img
                  src="https://minotar.net/avatar/{message.username}/48"
                  alt="{message.username}"
                  class="rounded animate__animated animate__zoomIn"
                  use:tooltip="{[message.username, { placement: 'bottom' }]}"
                  width="48"
                  height="48" />
              </a>
            </div>
            <div class="col-auto">
              <div class="card text-bg-secondary">
                <div class="card-header small">
                  <Date time="{message.date}" />
                </div>
                <div class="card-body">
                  {message.message}
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/each}

      <div
        class="row align-items-end mt-3"
        class:d-none="{data.ticket.status === TicketStatuses.CLOSED}">
        <div class="col">
          <textarea
            placeholder="{$_('pages.ticket-detail.inputs.message.placeholder')}"
            class="form-control"
            bind:value="{message}"></textarea>
        </div>
        <div class="col-auto">
          <button
            class="btn btn-secondary"
            on:click="{sendMessage}"
            class:disabled="{messageSendLoading || isSendButtonDisabled}"
            :disabled="{messageSendLoading || isSendButtonDisabled}">
            <i class="fas fa-paper-plane"></i>
            <span class="d-xl-inline d-none ms-2">{$_("pages.ticket-detail.send-button")}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</article>

<script context="module">
  import TicketCreateAndDetailSidebar, {
    load as loadSidebar,
    update as updateSidebar
  } from "$lib/component/sidebars/TicketCreateAndDetailSidebar.svelte";
  import { getTicketDetail } from "$lib/services/tickets";
  import { error } from "@sveltejs/kit";

  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load(event) {
    const { parent } = event;
    await parent();

    let data = {
      ticket: {
        id: -1,
        username: "",
        title: "",
        category: "-",
        messages: [],
        status: 1,
        date: 0,
        messageCount: 0,
      },
    };

    await getTicketDetail({
      id: event.params.id,
      request: event,
    }).then((body) => {
      if (body.error) {
        if (body.error === "NOT_EXISTS") {
          throw error(404, body.error);
        }

        throw error(500, body.error);
      }

      data = body;
    });

    await loadSidebar(event, data.ticket);

    return { ...data, sidebar: TicketCreateAndDetailSidebar };
  }
</script>

<script>
  import { afterUpdate, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import Date from "$lib/component/Date.svelte";
  import tooltip from "$lib/tooltip.util";

  import TicketStatus, {
    TicketStatuses,
  } from "$lib/component/TicketStatus.svelte";
  import {
    loadMoreTicketMessages,
    sendTicketMessage,
  } from "$lib/services/tickets";

  import {
    setCallback as setCloseTicketConfirmCallback,
  } from "$lib/component/modals/CloseTicketConfirmModal.svelte";

  export let data;

  let message = "";

  let messagesSectionDiv;
  let loadMoreLoading = false;
  let messageSendLoading = false;

  let shouldScroll = true;

  let sentMessageCount = 0;

  $: isSendButtonDisabled = message === "";

  const messagesSectionClientHeight = writable(0);

  async function loadMore() {
    loadMoreLoading = true;

    await loadMoreTicketMessages({
      id: data.ticket.id,
      lastMessageId: data.ticket.messages[0].id,
    }).then((body) => {
      if (body.error) {
        return;
      }

      body.messages.reverse().forEach((message) => {
        data.ticket.messages.unshift(message);
      });

      data.ticket.messages = data.ticket.messages;

      loadMoreLoading = false;
    });
  }

  async function sendMessage() {
    messageSendLoading = true;

    await sendTicketMessage({
      ticketId: data.ticket.id,
      message,
    }).then((body) => {
      if (body.error) {
        return;
      }

      shouldScroll = true;

      data.ticket.messages.push(body.message);
      data.ticket = data.ticket;

      sentMessageCount++;

      message = "";

      messageSendLoading = false;
    });
  }

  setCloseTicketConfirmCallback(() => {
    data.ticket.status = TicketStatuses.CLOSED;
    updateSidebar(data.ticket)
  });

  afterUpdate(() => {
    if (shouldScroll && messagesSectionDiv.scrollHeight > 0) {
      messagesSectionDiv.scrollTo(0, messagesSectionDiv.scrollHeight);

      shouldScroll = false;
    }
  });

  onMount(() => {
    shouldScroll = true;
  });
</script>

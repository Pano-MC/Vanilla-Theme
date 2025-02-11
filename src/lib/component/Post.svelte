<div class="card mb-3">
  {#if post.thumbnailUrl}
    <a href="/blog/post/{post.url}">
      <img
        src={post.thumbnailUrl}
        class="card-img-top rounded-top"
        alt={post.title}
        title={post.title} />
    </a>
  {/if}
  <div class="card-body">
    <div class="row mb-3 justify-content-center">
      <div class="col">
        <a href="/blog/post/{post.url}" class="card-title text-black">
          <h3 class="mb-0 d-inline-block text-break">
            {truncate(post.title, 100)}{@html post.title.length > 100
              ? "&hellip;"
              : ""}
          </h3>
        </a>
      </div>
      <div class="col-auto">
        {#if post.category.title !== "-"}
          <a
            class="badge bg-secondary text-dark rounded-pill"
            href="/blog/category/{post.category.url}"
            use:tooltip={["Filtrele", { placement: "bottom" }]}>
            {post.category.title}
          </a>
        {/if}
      </div>
    </div>

    <div class="card-text text-break">
      {@html post.text}
    </div>
  </div>
  <div
    class="card-footer bg-white d-flex align-items-center justify-content-between">
    {#if detail}
      <ul class="m-0 p-0 text-muted">
        <li class="list-inline">
          <div
            class="list-inline-item px-1"
            use:tooltip={[$_("components.post.view"), { placement: "bottom" }]}>
            <i class="fas fa-eye me-2"></i>
            {post.views}
          </div>
        </li>
      </ul>

      <div>
        <Date time={post.date} />
        <a href="/player/{post.writer.username}">
          <img
            src="https://minotar.net/avatar/{post.writer.username}"
            alt={post.writer.username}
            width="32"
            height="32"
            use:tooltip={[post.writer.username, { placement: "bottom" }]}
            class="rounded-circle ms-2" />
        </a>
      </div>
    {:else}
      <a class="btn btn-link link-info ps-0" href="/blog/post/{post.url}">
        {$_("components.post.read-more")}
      </a>

      <div>
        <Date time={post.date} />
        <a href="/player/{post.writer.username}">
          <img
            src="https://minotar.net/avatar/{post.writer.username}"
            alt={post.writer.username}
            width="32"
            height="32"
            use:tooltip={[post.writer.username, { placement: "bottom" }]}
            class="rounded-circle ms-2" />
        </a>
      </div>
    {/if}
  </div>
</div>

<script>
  import { _ } from "svelte-i18n";

  import { truncate } from "$lib/string.util";
  import tooltip from "$lib/tooltip.util";

  import Date from "$lib/component/Date.svelte";

  export let post;
  export let detail = false;
</script>

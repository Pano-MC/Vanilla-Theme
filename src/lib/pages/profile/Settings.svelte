<!-- Settings -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">{$_("pages.settings.title")}</h5>
    <div class="row mb-3">
      <label class="col-md-4 col-form-label" for="resetPassword">
        {$_("pages.settings.inputs.change-password.title")}
      </label>
      <div class="col col-form-label">
        <button
          class="btn btn-outline-primary"
          disabled="{resetPasswordLoading || !$session.siteInfo.emailEnabled}"
          on:click="{sendResetPasswordLink}"
          aria-describedby="resetPassword validationResetPassword"
          class:is-invalid="{resetPasswordError}"
          type="button"
        >{$_("pages.settings.inputs.change-password.description")}</button>

        <div id="validationResetPassword" class="invalid-feedback">
          {resetPasswordError}
        </div>
        {#if resetPasswordSuccess}
          <p class="text-dark mb-0">
            {$_("pages.settings.inputs.change-password.success-message")}
          </p>
        {/if}
      </div>
    </div>

    <div class="row mb-3">
      <label class="col-md-4 col-form-label" for="userEmail">
        {$_("pages.settings.inputs.change-email.title")}
      </label>
      <div class="col col-form-label">
        <form
          on:submit|preventDefault="{() =>
            changingEmail2ndStep
              ? sendChangeEmailLink()
              : startChangingEmail2ndStep()}">
          <div class="row">
            {#if !changingEmail}
              <div class="col-12">
                {#if changingEmailSuccess}
                  <p class="text-dark mb-0">
                    {$_("pages.settings.inputs.change-email.success-message", {
                      values: { newEmail },
                    })}
                  </p>
                {:else}
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    aria-describedby="userEmail"
                    on:click="{startChangingEmail}"
                    disabled="{!$session.siteInfo.emailEnabled}"
                  >{$_("pages.settings.inputs.change-email.description")}</button>
                {/if}
              </div>
            {:else if changingEmail2ndStep}
              <div class="col">
                <input
                  type="email"
                  id="newEmail"
                  placeholder="{$_(
                    'pages.settings.inputs.change-password.new-email-placeholder',
                  )}"
                  class="form-control"
                  aria-describedby="validationChangingEmail"
                  bind:value="{newEmail}"
                  class:is-invalid="{changingEmailError}"
                  autofocus />
                <div id="validationChangingEmail" class="invalid-feedback">
                  {changingEmailError}
                </div>
              </div>
              <div class="col-auto">
                <button
                  type="reset"
                  class="btn btn-link link-primary"
                  on:click="{stopChangingEmail2ndStep}">
                  {$_("pages.settings.inputs.change-email.back")}
                </button>
                <button
                  type="submit"
                  class="btn btn-link link-secondary"
                  class:disabled="{changingEmailLoading}">
                  {$_("pages.settings.inputs.change-email.confirm")}
                </button>
              </div>
            {:else}
              <div class="col">
                <input
                  type="password"
                  id="currentPassword"
                  placeholder="{$_(
                    'pages.settings.inputs.change-email.current-password-placeholder',
                  )}"
                  class="form-control"
                  bind:value="{currentPassword}"
                  autofocus />
              </div>
              <div class="col-auto">
                <button
                  type="reset"
                  class="btn btn-link link-danger"
                  on:click="{stopChangingEmail}">
                  {$_("pages.settings.inputs.change-email.cancel")}
                </button>
                <button type="submit" class="btn btn-link"
                  >{$_("pages.settings.inputs.change-email.continue")}</button>
              </div>
            {/if}
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<script context="module">
  import ProfileSidebar, { load as loadSidebar } from "$lib/component/sidebars/ProfileSidebar.svelte";

  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export async function load(event) {
    const { parent } = event;
    await parent();

    await loadSidebar(event);

    return { sidebar: ProfileSidebar };
  }
</script>

<script>
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { sendChangeEmail, sendResetPassword } from "$lib/services/profile.js";
  import { NETWORK_ERROR } from "$lib/api.util.js";

  let resetPasswordError;
  let resetPasswordLoading;
  let resetPasswordSuccess;

  let currentPassword;
  let newEmail;

  let changingEmail;
  let changingEmail2ndStep;

  let changingEmailError;
  let changingEmailLoading;
  let changingEmailSuccess;

  const session = getContext("session");

  async function sendResetPasswordLink() {
    resetPasswordError = null;
    resetPasswordLoading = true;
    resetPasswordSuccess = false;

    await sendResetPassword()
      .then((body) => {
        resetPasswordLoading = false;

        if (body.result === "ok") {
          resetPasswordSuccess = true;
        } else {
          resetPasswordError = body.error || NETWORK_ERROR;
        }
      })
      .catch(() => {
        resetPasswordLoading = false;
        resetPasswordError = NETWORK_ERROR;
      });
  }

  async function sendChangeEmailLink() {
    changingEmailError = null;
    changingEmailLoading = true;
    changingEmailSuccess = false;

    await sendChangeEmail(currentPassword, newEmail)
      .then((body) => {
        changingEmailLoading = false;

        if (body.result === "ok") {
          changingEmail = false;
          changingEmail2ndStep = false;

          changingEmailSuccess = true;
        } else {
          changingEmailError = body.error || NETWORK_ERROR;
        }
      })
      .catch(() => {
        changingEmailLoading = false;

        changingEmailError = NETWORK_ERROR;
      });
  }

  function startChangingEmail() {
    changingEmail = true;
  }

  function startChangingEmail2ndStep() {
    changingEmail2ndStep = true;
  }

  function stopChangingEmail() {
    currentPassword = "";
    newEmail = "";

    changingEmail = false;
  }

  function stopChangingEmail2ndStep() {
    changingEmail2ndStep = false;
  }
</script>

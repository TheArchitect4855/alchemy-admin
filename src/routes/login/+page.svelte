<script lang="ts">
	import { fly } from "svelte/transition";
	import Spinner from "../Spinner.svelte";
	let stage = 0;

	let isBusy = false;
	let message = '';
	let phone: string;
	async function onSubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();

		if (isBusy) return;
		isBusy = true;

		const formData = new FormData(e.target as HTMLFormElement);
		if (stage == 0) {
			phone = formData.get('phone')!.toString();
			const res = await fetch('/login', {
				method: 'PUT',
				body: formData,
			});

			if (res.ok) {
				stage += 1;
				message = `A login code has been sent to ${phone}`;
			} else {
				console.error(`${res.status} ${res.statusText}`);
				const body = await res.json();
				message = body.message;
			}
		} else {
			formData.set('phone', phone);
			const res = await fetch('/login', {
				method: 'POST',
				body: formData,
			});

			if (res.ok) {
				window.location.pathname = '/private';
			} else {
				console.error(`${res.status} ${res.statusText}`);
				const body = await res.json();
				message = body.message;
			}
		}

		isBusy = false;
	}
</script>
<form on:submit={ onSubmit }>
	<h1>Log In</h1>
	<div class="transition-container">
		{#if stage == 0}
		<section transition:fly={{ x: -24, duration: 500 }}>
			<label for="login-phone-input">Phone:</label>
			<input id="login-phone-input" type="text" name="phone" pattern="^\+\d+$" placeholder="+XXXXXXXXXXX" required />
		</section>
		{:else if stage == 1}
		<section transition:fly={{ x: 24, duration: 500, delay: 500 }}>
			<label for="login-code-input">Code:</label>
			<input id="login-code-input" type="text" name="code" pattern={ "^\\d{6}$" } placeholder="XXXXXX" required />
		</section>
		{/if}
	</div>
	<button style={ isBusy ? 'background-color: var(--colour-surface-10);' : null } type="submit">
		<span style={ isBusy ? 'display: none;' : null }>Log In</span>
		<Spinner style={ isBusy ? null : 'display: none;' } />
	</button>
	<span class="error">{ message }</span>
</form>

<style>
	:global(body) {
		background-color: var(--colour-surface-05);
		margin: 0;
		padding: 0;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.error {
		font-size: 0.8rem;
		max-width: 20ch;
		text-align: center;
	}

	.transition-container {
		height: 3em;
		position: relative;
		width: 13em;
	}

	.transition-container > * {
		position: absolute;
	}

	button {
		margin: 1em;
		transition: background-color 0.2s;
	}

	form {
		background-color: var(--colour-surface);
		border: 1px solid var(--colour-surface-10);
		border-radius: 1rem;
		padding: 0.5rem;

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	input, label {
		display: block;
	}

	section {
		margin: 0 1em;
	}
</style>

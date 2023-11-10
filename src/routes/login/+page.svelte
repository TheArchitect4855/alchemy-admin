<script lang="ts">
	import Spinner from "../Spinner.svelte";

	let isBusy = false;
	let message = '';
	async function onSubmit(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		if (isBusy) return;
		isBusy = true;

		const formData = new FormData(e.target as HTMLFormElement);
		console.dir(formData);
		const res = await fetch('/login', {
			method: 'POST',
			body: formData,
		});

		if (res.ok) {
			const body = await res.json();
			message = body.message;
		} else {
			message = `Error: ${res.status} ${res.statusText}`;
			const body = await res.text();
			console.error(body);
		}

		isBusy = false;
	}
</script>
<form on:submit={ onSubmit }>
	<h1>Log In</h1>
	<section>
		<label for="login-email-input">Email:</label>
		<input id="login-email-input" type="text" name="email" required />
	</section>
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

<script lang="ts">
	import type { PhoneGreenlist } from "$lib/database/types";
	import type { PageData } from "./$types";

	export let data: PageData;
	let greenlist: PhoneGreenlist[];
	$: greenlist = data.greenlist;

	async function createGreenlist(e: Event): Promise<void> {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const data = new FormData(form);
		const body = {
			phone: data.get('phone')!.toString(),
			nickname: data.get('nickname')!.toString(),
		};

		const req = await fetch('/private/phone-greenlist', {
			body: JSON.stringify(body),
			method: 'POST',
		});

		if (!req.ok) {
			console.error(req.statusText);
			return;
		}

		greenlist = [ ...greenlist, body ];
	}

	async function deleteGreenlist(phone: string): Promise<void> {
		const index = greenlist.findIndex((e) => e.phone == phone);
		if (index < 0) return;

		const req = await fetch(`/private/phone-greenlist?phone=${encodeURIComponent(phone)}`, {
			method: 'DELETE',
		});

		if (!req.ok) {
			console.error(req.statusText);
			return;
		}

		greenlist.splice(index, 1);
		greenlist = [ ...greenlist ];
	}

	async function saveGreenlist(greenlist: PhoneGreenlist): Promise<void> {
		await fetch('/private/phone-greenlist', {
			body: JSON.stringify(greenlist),
			method: 'PUT',
		});
	}
</script>

<h2>Phone Greenlist</h2>
<section>
	<table>
		<thead>
			<tr>
				<th>Phone Number</th>
				<th>Nickname</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each greenlist as pg}
			<tr>
				<td>{ pg.phone }</td>
				<td>
					<input type="text" value={ pg.nickname } on:change={(e) => pg.nickname = e.currentTarget.value} />
					<button class="icon" on:click={() => saveGreenlist(pg)}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--colour-secondary)" class="icon-mini">
							<path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
							<path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
						</svg>
					</button>
				</td>
				<td>
					<button class="icon" on:click={() => deleteGreenlist(pg.phone)}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--colour-error)" class="icon-mini">
							<path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
						</svg>
					</button>
				</td>
			</tr>
			{/each}
		</tbody>
	</table>
</section>

<section>
	<form on:submit={createGreenlist}>
		<div>
			<label for="create-greenlist-phone-input">Phone:</label>
			<input id="create-greenlist-phone-input" name="phone" type="text" pattern="^\+\d+$" required />
		</div>

		<div>
			<label for="create-greenlist-nickname-input">Nickname:</label>
			<input id="create-greenlist-nickname-input" name="nickname" type="text" required />
		</div>

		<button type="submit">Create</button>
	</form>
</section>

<style>
	form > div {
		margin-block: 1ch;
		width: 30ch;

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	section {
		margin-block: 1em;
	}
</style>

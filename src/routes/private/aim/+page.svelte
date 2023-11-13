<script lang="ts">
	import type { AdminContact } from "$lib/Database";
	import type { PageData } from "./$types";

	export let data: PageData;
	let addUserDialog: HTMLDialogElement;
	let editUserDialog: HTMLDialogElement;
	let saveConfDialog: HTMLDialogElement;
	let tombstones: boolean[] = new Array(data.grid.contacts.length).fill(false);

	const routes: typeof data.grid.routes = data.grid.routes;
	let remoteContacts: typeof data.grid.contacts = data.grid.contacts;
	let remoteGrid: typeof data.grid.grid = data.grid.grid;
	let localContacts: typeof remoteContacts;
	let localGrid: typeof remoteGrid;
	initLocalData();

	function addUser(e: SubmitEvent): void {
		e.preventDefault();
		addUserDialog.close();

		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get('name')!.toString();
		const phone = formData.get('phone')!.toString();

		localContacts = [ ...localContacts, { id: null, name, phone, isDirty: true }];
		localGrid.push(new Array(routes.length).fill(false));
		tombstones.push(false);
	}

	function editUser(e: SubmitEvent): void {
		e.preventDefault();
		editUserDialog.close();

		const formData = new FormData(e.target as HTMLFormElement);
		const id = formData.get('id')!.toString();
		const name = formData.get('name')!.toString();
		const phone = formData.get('phone')!.toString();

		const contact = localContacts.find((e: AdminContact) => e.id == id);
		contact.name = name;
		contact.phone = phone;
		contact.isDirty = true;
		localContacts = [ ...localContacts ];
	}

	function initLocalData(): void {
		localContacts = [ ...remoteContacts ];
		localGrid = [];
		for (const r of remoteGrid) localGrid.push([ ...r ]);
	}

	function revert(): void {
		initLocalData();
	}

	async function save(): Promise<void> {
		saveConfDialog.close();

		localContacts = (localContacts as AdminContact[]).filter((_, i) => !tombstones[i]);
		localGrid = (localGrid as boolean[][]).filter((_, i) => !tombstones[i]);
		tombstones = tombstones.filter((e) => !e);

		let body = { contacts: localContacts, grid: localGrid };
		const res = await fetch('/private/aim', {
			body: JSON.stringify(body),
			method: 'PUT',
		});

		if (!res.ok) {
			console.error(`Error: ${res.status} ${res.statusText}\n${await res.text()}`);
			return;
		}

		body = await res.json();
		remoteContacts = body.contacts;
		remoteGrid = body.grid;
		initLocalData();
	}

	function showEditUserDialog(contact: AdminContact): void {
		const [ idInput, nameInput, phoneInput ] = [
			document.querySelector('#edit-user-id-input'),
			document.querySelector('#edit-user-name-input'),
			document.querySelector('#edit-user-phone-input'),
		] as HTMLInputElement[];

		idInput.value = contact.id;
		nameInput.value = contact.name;
		phoneInput.value = contact.phone;
		editUserDialog.showModal();
	}
</script>

<h2>AIM</h2>
<table>
	<thead>
		<tr>
			<th></th>
			{#each routes as route}
			<th title={ route.path }>{ route.name }</th>
			{/each}
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each localContacts as contact, i}
		<tr style={ tombstones[i] ? "background-color: var(--colour-error);" : contact.isDirty ? "background-color: var(--colour-surface-05);" : null }>
			<td>{ contact.name }</td>
			{#each localGrid[i] as allowed, j}
			<td>
				<input type="checkbox" bind:checked={ allowed } disabled={ tombstones[i] } title={ routes[j].name } />
			</td>
			{/each}
			<td>
				{#if tombstones[i]}
				<button class="icon" on:click={() => tombstones[i] = false} title="Undo">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="icon-mini">
						<path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clip-rule="evenodd" />
					</svg>
				</button>
				{:else}
				<button class="trash icon" on:click={() => tombstones[i] = true} disabled={ contact.id == data.session.contact.id } title="Delete">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
						<path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
					</svg>
				</button>

				{#if contact.id != null}
				<button class="icon" on:click={() => showEditUserDialog(contact)} title="Edit">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--colour-secondary)" class="icon-mini">
						<path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
					</svg>
				</button>
				{/if}
				{/if}
			</td>
		</tr>
		{/each}
	</tbody>
</table>
<section>
	<button class="icon" on:click={() => addUserDialog.showModal()} title="Add User">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
			<path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
		</svg>
	</button>
	<button class="icon" on:click={() => saveConfDialog.showModal()} title="Save Changes">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
			<path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
			<path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
		</svg>
	</button>
	<button class="icon" on:click={revert} title="Revert Changes">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
			<path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clip-rule="evenodd" />
		</svg>
	</button>
</section>

<dialog bind:this={ addUserDialog }>
	<header>
		<h3>Add User</h3>
		<button class="icon" on:click={() => addUserDialog.close()}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</button>
	</header>
	<form on:submit={ addUser }>
		<label for="add-user-name-input">Name:</label>
		<input id="add-user-name-input" name="name" type="text" required />
		<label for="add-user-phone-input">Phone:</label>
		<input id="add-user-phone-input" name="phone" type="text" pattern="^\+\d+$" />
		<button type="submit">Add User</button>
	</form>
</dialog>

<dialog bind:this={ editUserDialog }>
	<header>
		<h3>Edit User</h3>
		<button class="icon" on:click={() => editUserDialog.close()}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</button>
	</header>
	<form on:submit={ editUser }>
		<label for="edit-user-name-input">Name:</label>
		<input id="edit-user-name-input" name="name" type="text" required />
		<label for="edit-user-phone-input">Phone:</label>
		<input id="edit-user-phone-input" name="phone" type="text" pattern="^\+\d+$" />
		<input id="edit-user-id-input" name="id" type="hidden" required />
		<button type="submit">Save</button>
	</form>
</dialog>

<dialog bind:this={ saveConfDialog }>
	<header>
		<h3>Save Changes?</h3>
	</header>
	<p>
		This will save all changes you've made, and they will become
		effective immediately.
	</p>
	<button on:click={save}>Save</button>
	<button on:click={() => saveConfDialog.close()}>Cancel</button>
</dialog>

<style>
	button.trash {
		color: var(--colour-error);
	}

	button.trash:disabled {
		color: var(--colour-surface-10);
	}

	form label, form input {
		display: block;
		margin: 0.5em 0;
	}

	section {
		margin: 0.5em 0;
	}

	section > button.icon {
		background-color: var(--colour-secondary);
		border-radius: 50%;
		color: white;
		padding: 6px;
	}
</style>

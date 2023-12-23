<script lang="ts">
	import type { ClientVersion } from "$lib/database/types";
	import type { PageData } from "./$types";

	export let data: PageData;
	let createDialog: HTMLDialogElement;
	let clientVersions: ClientVersion[];
	$: clientVersions = [...data.clientVersions];

	let currentUpdateTimeout: number | null = null;
	let dirtyClientVersions: { [semver: string]: ClientVersion } = {};

	async function addClientVersion(e: SubmitEvent): Promise<void> {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const data = new FormData(form);
		const body = {
			semver: data.get('semver'),
			isUpdateRequired: data.get('isUpdateRequired') != null,
		};

		const res = await fetch('/private/client-versions', {
			body: JSON.stringify(body),
			method: 'POST',
		});

		const version = await res.json();
		clientVersions = [ { semver: version.semver, isUpdateRequired: version.isUpdateRequired, createdAt: new Date(version.createdAt) }, ...clientVersions ];
		createDialog.close();
	}

	async function saveChanges(): Promise<void> {
		const versions = dirtyClientVersions;
		dirtyClientVersions = {};
		const res = await fetch('/private/client-versions', {
			body: JSON.stringify(Object.values(versions)),
			method: 'PUT',
		});

		clientVersions = await res.json();
	}

	async function setIsUpdateRequired(e: Event, index: number): Promise<void> {
		const input = e.target as HTMLInputElement;

		clientVersions[index] = { ...clientVersions[index], isUpdateRequired: input.checked };
		if (currentUpdateTimeout != null) clearTimeout(currentUpdateTimeout);
		currentUpdateTimeout = window.setTimeout(saveChanges, 1000);
		dirtyClientVersions[clientVersions[index].semver] = clientVersions[index];
	}
</script>

<h2>Client Versions</h2>
<table>
	<thead>
		<tr>
			<th>Semantic Version</th>
			<th>Created At</th>
			<th>Is Update Required?</th>
		</tr>
	</thead>
	<tbody>
	{#each clientVersions as version, index}
		<tr>
			<td>{ version.semver }</td>
			<td>{ version.createdAt.toLocaleString() }</td>
			<td>
				<input type="checkbox" checked={ version.isUpdateRequired } on:change={(e) => setIsUpdateRequired(e, index)} />
			</td>
		</tr>
	{/each}
	</tbody>
</table>
<section>
	<button on:click={() => createDialog.showModal()}>Add Client Version</button>
</section>

<dialog bind:this={createDialog}>
	<header>
		<h3>Add Client Version</h3>
		<button class="icon" on:click={() => createDialog.close()}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</button>
	</header>
	<form on:submit={addClientVersion}>
		<section>
			<label for="add-version-semver-input">Semantic Version:</label>
			<input type="text" id="add-version-semver-input" name="semver" placeholder="X.Y.Z" pattern="^\d+\.\d+\.\d+$" />
		</section>
		<section>
			<input type="checkbox" id="add-version-is-update-required-input" name="isUpdateRequired" />
			<label for="add-version-is-update-required-input">Is Update Required?</label>
		</section>
		<p>
			NOTE: Creating a new client version CANNOT BE UNDONE,
			and will make the app INACESSIBLE if the new version
			is not yet downloadable from the Play Store or App Store.
		</p>
		<button type="submit">Create</button>
	</form>
</dialog>

<style>
	section {
		margin-block: 1em
	}
</style>

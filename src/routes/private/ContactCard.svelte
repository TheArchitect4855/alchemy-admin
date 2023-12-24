<script lang="ts">
	import type { Contact } from "$lib/database/types";
	import { onMount } from "svelte";

	export let contact: Contact;
	let canvas: HTMLCanvasElement;
	let editDialog: HTMLDialogElement;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		drawContactIcon(ctx, canvas.width, canvas.height)
	});

	function drawContactIcon(ctx: CanvasRenderingContext2D, width: number, height: number): void {
		const cw = width / 5;
		const ch = height / 5;
		const hex = contact.id.replaceAll('-', '');
		const [ br, bg, bb ] = [ hex.substring(28, 29), hex.substring(30, 31), hex.substring(31, 32) ].map((e) => parseInt(e, 16) << 4);
		for (let x = 0; x < 5; x += 1) {
			for (let y = 0; y < 5; y += 1) {
				const i = y + x * 5;
				const h = parseInt(hex.substring(i, i + 1), 16);
				const r = ((h & 0b1100) << 4) | br;
				const g = ((h & 0b0110) << 5) | bg;
				const b = ((h & 0b0011) << 6) | bb;
				const colour = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
				ctx.fillStyle = colour;
				ctx.fillRect(Math.floor(x * cw), Math.floor(y * ch), Math.ceil(cw), Math.ceil(ch));
			}
		}
	}

	async function editContact(e: Event): Promise<void> {
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const data = new FormData(form);
		const body = {
			id: data.get('id'),
			phone: data.get('phone'),
			dob: data.get('dob'),
			isRedlisted: data.get('isRedlisted') == 'on',
		};

		const req = await fetch('/private/contacts', {
			body: JSON.stringify(body),
			method: 'PUT',
		});

		const res = await req.json();
		contact = {
			...contact,
			phone: res.phone,
			dob: new Date(res.dob),
			isRedlisted: res.isRedlisted,
		};

		editDialog.close();
	}

	function formatDate(date: Date): string {
		return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
	}
</script>

<section class="card">
	<canvas bind:this={ canvas } width="128" height="128"></canvas>
	<div>
		<h4>{ contact.id }</h4>
		<table>
			<tbody>
				<tr>
					<td>Phone</td>
					<td>{ contact.phone }</td>
				</tr>
				<tr>
					<td>DOB</td>
					<td>{ formatDate(contact.dob) }</td>
				</tr>
				<tr>
					<td>Created</td>
					<td>{ contact.createdAt.toLocaleString() }</td>
				</tr>
				<tr>
					{#if contact.isRedlisted}
					<td class="error">REDLISTED</td>
					{/if}
					{#if !contact.tosAgreed}
					<td class="error">TOS NOT ACCEPTED</td>
					{/if}
				</tr>
			</tbody>
		</table>
		<button class="icon" style="color: var(--colour-secondary);" on:click={() => editDialog.showModal()} title="Edit">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
				<path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
			</svg>
		</button>
		<a class="icon" title="View Profile" href={ `/private/contacts/profiles/${encodeURIComponent(contact.id)}` }>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
			</svg>
		</a>
	</div>
</section>

<dialog bind:this={ editDialog }>
	<header>
		<h3>Edit Contact</h3>
		<button class="icon" on:click={() => editDialog.close()}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="icon-mini">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</button>
	</header>
	<form on:submit={ editContact }>
		<table>
			<tbody>
				<tr>
					<td>
						<label for="edit-contact-id-input">Contact ID</label>
					</td>
					<td>
						<input id="edit-contact-id-input" name="id" type="text" value={ contact.id } required readonly />
					</td>
				</tr>
				<tr>
					<td>
						<label for="edit-contact-phone-input">Phone</label>
					</td>
					<td>
						<input id="edit-contact-phone-input" name="phone" type="text" value={ contact.phone } pattern="^\+\d+$" required />
					</td>
				</tr>
				<tr>
					<td>
						<label for="edit-contact-date-input">DOB</label>
					</td>
					<td>
						<input id="edit-contact-date-input" name="dob" type="date" value={ formatDate(contact.dob) } required />
					</td>
				</tr>
				<tr>
					<td>
						<label for="edit-contact-redlist-input">Redlisted</label>
					</td>
					<td>
						<input id="edit-contact-redlist-input" name="isRedlisted" type="checkbox" checked={ contact.isRedlisted } />
					</td>
				</tr>
			</tbody>
		</table>
		<button type="submit">Save</button>
	</form>
</dialog>

<style>
	canvas, section.card {
		border-radius: 1ch;
	}

	form > table {
		margin-block: 1em;
	}

	section.card {
		border: 1px solid var(--colour-surface-80);
		margin-block: 1em;
		padding: 1ch;
	}

	section.card > * {
		display: inline-block;
		vertical-align: middle;
	}

	section.card > div {
		margin: 0 1ch;
	}

	table td {
		border: none;
	}
</style>

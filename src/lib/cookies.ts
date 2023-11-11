export function getCookies(request: Request): { [name: string]: string } {
	const header = request.headers.get('cookie');
	if (header == null) return {};

	const cookies: { [name: string]: string } = {};
	for (const pair of header.split(';')) {
		const [ key, value ] = pair.split('=');
		cookies[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim());
	}

	return cookies;
}
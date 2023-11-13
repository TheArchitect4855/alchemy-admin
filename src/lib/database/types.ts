export type ActiveUsers = {
	date: Date,
	dau: number,
	wau: number,
	mau: number,
	yau: number,
	avgDau7: number,
	avgDau30: number,
	avgDau365: number,
};

export type AdminContact = {
	id: string,
	name: string,
	phone: string,
}

export type AdminRoute = {
	id: string,
	path: string,
	name: string,
};

export type AllowedRoute = {
	path: string,
	name: string,
};

export type AllowedRoutesGrid = {
	contacts: AdminContact[],
	routes: AdminRoute[],
	grid: boolean[][],
};

export type AnonymizedFunnels = {
	seen: number,
	loginsStarted: number,
	loginsSucceeded: number,
	waitlisted: number,
	profileCreationStarted: number,
	basicProfileCreated: number,
	photoUploads: number,
	tosAgreed: number,
	profileCreationCompleted: number,
	usersMatched: number,
	usersMessaged: number,
	profilesDeleted: number,
};
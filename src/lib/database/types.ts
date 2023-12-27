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

export type ApiStats = {
	date: Date,
	requestCount: number,
	clientErrorCount: number,
	serverErrorCount: number,
};

export type ClientVersion = {
	semver: string,
	isUpdateRequired: boolean,
	createdAt: Date,
};

export type Contact = {
	id: string,
	phone: string,
	dob: Date,
	isRedlisted: boolean,
	tosAgreed: boolean,
	createdAt: Date,
};

export type PhoneGreenlist = {
	phone: string,
	nickname: string,
};

export type Profile = {
	contact: Contact,
	name: string,
	bio: string,
	gender: string,
	photoUrls: string[],
	neurodiversities: string[],
	interests: string[],
	relationshipInterests: ('friends' | 'flings' | 'romance')[],
	pronouns: string | null,
	isVisible: boolean,
	createdAt: Date,
};

export type ResponseTime = {
	date: Date,
	p10: number,
	p50: number,
	p99: number,
};
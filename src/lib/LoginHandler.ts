import { urlEncodeObject, type EncodableObject } from "./encoding";
import type { Env } from "./env";

const codeRegex = /^\d{6}$/;
const phoneRegex = /^\+[1-9]\d{1,14}$/;
const twilioApi = 'https://verify.twilio.com/v2';

export enum SendLoginCodeResult {
	OK,
	InvalidFormat,
	InvalidPhone,
	ServiceUnavailable,
};

export enum VerifyLoginCodeResult {
	OK,
	InvalidCode,
	InvalidCodeFormat,
	InvalidPhoneFormat,
	NotApproved,
	ServiceUnavailable,
}

type TwilioLookupResponse = {
	valid: boolean,
};

type TwilioVerifyResponse = {
	status: 'pending' | 'approved' | 'canceled',
};

export default class LoginHandler {
	private _acctSid: string;
	private _auth: string;
	private _verifySid: string;

	private constructor(acctSid: string, auth: string, verifySid: string) {
		this._acctSid = acctSid;
		this._auth = auth;
		this._verifySid = verifySid;
	}

	async sendLoginCode(phone: string, channel: 'sms' | 'whatsapp'): Promise<SendLoginCodeResult> {
		if (!phoneRegex.test(phone)) return SendLoginCodeResult.InvalidFormat;
		const lookupRequest = await fetch(`https://lookups.twilio.com/v2/PhoneNumbers/${phone}`, {
			headers: { 'Authorization': this.getAuthHeader() },
		});

		if (lookupRequest.ok) {
			const lookupResponse = await lookupRequest.json() as TwilioLookupResponse;
			if (!lookupResponse.valid) return SendLoginCodeResult.InvalidPhone;
		} else {
			// If Twilio's lookup API fails, log the error
			// but still try to verify the phone number in
			// case this is only a partial failure on Twilio's
			// side.
			const text = await lookupRequest.text();
			console.error(`Twilio lookup failed: ${lookupRequest.status} ${lookupRequest.statusText}\n${text}`);
		}

		const body = {
			To: phone,
			Channel: channel,
		};

		const req = await this.doRequest(`/Services/${this._verifySid}/Verifications`, body);
		if (!req.ok) {
			const text = await req.text();
			console.error(`Twilio error: ${req.status} ${req.statusText}\n${text}`);
			return SendLoginCodeResult.ServiceUnavailable;
		}

		return SendLoginCodeResult.OK;
	}

	async verifyLoginCode(phone: string, code: string): Promise<VerifyLoginCodeResult> {
		if (!phoneRegex.test(phone)) return VerifyLoginCodeResult.InvalidPhoneFormat;
		if (!codeRegex.test(code)) return VerifyLoginCodeResult.InvalidCodeFormat;

		const body = {
			Code: code,
			To: phone,
		};

		const req = await this.doRequest(`/Services/${this._verifySid}/VerificationCheck`, body);
		if (!req.ok && req.status != 404) {
			const text = await req.text();
			console.error(`Twilio error: ${req.status} ${req.statusText}\n${text}`);
			return VerifyLoginCodeResult.ServiceUnavailable;
		} else if (req.status == 404) {
			return VerifyLoginCodeResult.InvalidCode;
		}

		const res = await req.json() as TwilioVerifyResponse;
		if (res.status == 'approved') return VerifyLoginCodeResult.OK;
		else return VerifyLoginCodeResult.NotApproved;
	}

	private async doRequest(endpoint: string, body: EncodableObject): Promise<Response> {
		return fetch(twilioApi + endpoint, {
			body: urlEncodeObject(body),
			headers: { 'Authorization': this.getAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		});
	}

	private getAuthHeader(): string {
		const auth = btoa(`${this._acctSid}:${this._auth}`);
		return `Basic ${auth}`;
	}

	static getHandler(env: Env): LoginHandler {
		return new LoginHandler(env.TWILIO_ACCT_SID, env.TWILIO_AUTH, env.TWILIO_VERIFY_SID);
	}
}

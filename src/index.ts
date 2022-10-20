/**
 * Copyright (c) 2022, knokbak
 * All rights reserved.
 * 
 * This file is subject to the terms and conditions of the BSD 3-Clause 
 * License. A copy of the license can be found in the LICENSE file. If 
 * a copy of the license was not distributed with this file, you can 
 * obtain one at https://github.com/knokbak/cf-turnstile. 
 */

const DEFAULT_API_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileOptions = {
    secret?: string;
    apiUrl?: string;
    hostname?: string;
    remoteip?: string;
    action?: string;
    cdata?: string;
};

type TurnstileResponse = {
    success: boolean;
    challenge_ts: string;
    hostname?: string;
    'error-codes'?: string[];
    action?: string;
    cdata?: string;
};

function turnstile(secret?: string, globalOptions?: TurnstileOptions): (token: string) => Promise<TurnstileResponse> {
    if (secret && typeof secret !== 'string') {
        throw new TypeError('secret must be a string or undefined');
    }

    return async (token: string, options?: TurnstileOptions): Promise<TurnstileResponse> => {
        options = {
            secret: options?.secret ?? globalOptions?.secret ?? secret,
            apiUrl: options?.apiUrl ?? globalOptions?.apiUrl ?? DEFAULT_API_URL,
            hostname: options?.hostname ?? globalOptions?.hostname,
            remoteip: options?.remoteip ?? globalOptions?.remoteip,
            action: options?.action ?? globalOptions?.action,
            cdata: options?.cdata ?? globalOptions?.cdata,
        };
        
        if (!options.secret || typeof options.secret !== 'string') {
            throw new Error('options.secret is required (when a secret is not provided globally) and must be a string');
        }
        if (!token || typeof token !== 'string') {
            throw new Error('token is required and must be a string');
        }
        
        const formData = new URLSearchParams();
        formData.append('secret', options.secret);
        formData.append('response', token);

        const remoteip = options?.remoteip;
        if (remoteip) {
            formData.append('remoteip', remoteip);
        }

        const data = await sendRequest(options?.apiUrl ?? DEFAULT_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/www-x-form-urlencoded',
            },
            body: formData.toString(),
        }).then(x => x.json());

        if (data['error-codes'] && data['error-codes'].length > 0) {
            throw new Error(`We ran into one or more errors whilst verifying Cloudflare Turnstile token: ${data['error-codes'].join(', ')}`);
        }

        if (!data.success) {
            throw new Error('Cloudflare Turnstile token verification failed; the provided token is invalid.');
        }

        const hostname = options?.hostname;
        const action = options?.action;
        const cdata = options?.cdata;

        if (hostname && data.hostname !== hostname) {
            throw new Error(`Cloudflare Turnstile token verification failed; the provided token is not valid for hostname ${hostname}. The token is valid for hostname ${data.hostname}.`);
        }
        if (action && data.action !== action) {
            throw new Error(`Cloudflare Turnstile token verification failed; the provided token is not valid for action ${action}. The token is valid for action ${data.action}.`);
        }
        if (cdata && data.cdata !== cdata) {
            throw new Error(`Cloudflare Turnstile token verification failed; the provided token is not valid for cdata ${cdata}. The token is valid for cdata ${data.cdata}.`);
        }

        return data;
    };
};

function sendRequest(url: string, options: RequestInit): Promise<any> {
    try {
        return fetch(url, options);
    } catch {
        const fetch = require('node-fetch');
        return fetch(url, options);
    }
};

module.exports = turnstile;
export default turnstile;
export { TurnstileOptions, TurnstileResponse };

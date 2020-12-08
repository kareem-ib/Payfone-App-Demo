import utils from '../../utils';
require('dotenv').config({path: '../../.env'});

const DEFAULT_PAYFONE_USERNAME = process.env.PAYFONE_USERNAME;
const DEFAULT_PAYFONE_PASSWORD = process.env.PAYFONE_PASSWORD;
const DEFAULT_PAYFONE_CLIENTID = process.env.PAYFONE_CLIENTID;
const DEFAULT_PAYFONE_TOKEN_URL = process.env.PAYFONE_TOKEN_URL;

// options:
// region - '', 'EU', 'CA'
const getPayfoneToken = async (options = {}) => {
    let username, password, clientId, url;
    if (options.region) {
	const region = options.region;
	const pe = process.env;

	username = pe['PAYFONE_USERNAME_' + region];
	password = pe['PAYFONE_PASSWORD_' + region];
	clientId = pe['PAYFONE_CLIENTID_' + region];
	url = pe['PAYFONE_TOKEN_URL_' + region];

	if (!(username && password && clientId && url))
	    throw new Error(`Could not resolve region \'${region}\'.`);
    } else {
	username = DEFAULT_PAYFONE_USERNAME;
	password = DEFAULT_PAYFONE_PASSWORD;
	clientId = DEFAULT_PAYFONE_CLIENTID;
	url = DEFAULT_PAYFONE_TOKEN_URL;
    }

    const tokenOptions = {
	username,
	password,
	clientId,
	url,
    }

    let {access_token, refreshed} = await utils.payfoneTokenRefresh(tokenOptions);
    if (!refreshed) {
	log('generating new token...');
	access_token = await utils.generatePayfoneToken(tokenOptions);
	log('new token credentials: ', access_token);
    }
    return access_token
}



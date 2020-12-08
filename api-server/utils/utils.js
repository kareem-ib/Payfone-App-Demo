const fs = require('fs');
const request = require('request-promise');
const uuid = require('uuid/v4');
const qs = require('querystring');

const ngrok = `https://362afe4f.ngrok.io`
const callbackUrlEndpoint = '/loadEventFinish/submitVFP';
const callbackUrl = ngrok + callbackUrlEndpoint;

let payfoneTokenFile = './payfoneToken';
//let requestId = ; // todo: make a unique id using .env['REQUEST_ID_PREFIX']

// Logging function to log events throughout the application
// Creates a write stream to root/log/
const log = async (...logContent) => {
    const date = new Date();
    const currentUTCDate = date.toUTCString();
    const currentDateString = date.toDateString();
    const logFileName = 'server.log.' + currentDateString;

    const fileOptions = {
	flags: 'a+',
	encoding: 'utf8'
    }
    const writeStream = fs.createWriteStream(`log/${logFileName}`, fileOptions);
    // Write out all of the contents of logContent
    for (let i of logContent)
	writeStream.write(`${i} `);
    writeStream.write(`${currentUTCDate}\n`);

    writeStream.on('err', (err) => {
	throw 'Logging issue: ' + err;
    });

    writeStream.end()
}

// Set the file name the tokens will be written to
const setTokenOutput = (fileName) => payfoneTokenFile = `./${fileName}`;

const writeTokens = (token) => {
    const tokens = {
	access_token: token.access_token,
	refresh_token: token.refresh_token,
    }

    const formattedTokens = JSON.stringify(tokens);
    fs.writeFileSync(payfoneTokenFile, formattedTokens);
}

const sendAPI = async (options) => {
    const formattedOptions = {
	method: options.method || 'POST',
	url: options.url,
	headers: options.headers || {},
	form: options.form,
    }

    console.log(formattedOptions)
    let response;
    try{
    await request(formattedOptions, (err, httpResponse, body) => {
	if (err) {
	    log(`sendAPI threw ${err}`);
	    throw err;
	}
	response = JSON.parse(body);
	console.log(response, options.url)
    });
    }catch(e) {
	console.log('ERROR', options.url);
    }
    console.log('after')
    return response;
}

// Check if the Payfone token can be refreshed
// If refreshed, return true
const payfoneTokenRefresh = async (options) => {
    // rs+ flag to bypass local system cache if new token has been written
    const fileOptions = {
	encoding: 'utf-8', 
	flag: 'a+',
    };

    let refreshed = {
	access_token: '',
	refreshed: false,
    }

    const rawData = fs.readFileSync(payfoneTokenFile, fileOptions);   
    let dataJSON;
    // If we fail to parse the token file data as a JSON then the token does not exist
    try {
	dataJSON = JSON.parse(rawData);
    } catch (e) {
	return refreshed;
    }

    const form = {
	client_id: options.clientId,
	grant_type: 'refresh_token',
	refresh_token: dataJSON.refresh_token,
    }

    // This POST request is prone to errors because of invalid refresh requests so
    // we need to catch any errors thrown
    try {
	await request.post(options.url, { form }, (err, httpResponse, body) => {
	    if (err) {
		log(err);
		throw err;
	    }
	    const res = JSON.parse(body);

	    if ('access_token' in res) {
		writeTokens(res);
		refreshed.access_token = dataJSON.access_token;
		refreshed.refreshed = true;
	    }
	});
    } catch(e) { log('Token refresh failed.') }

    return refreshed;
}

const generatePayfoneToken = async (options) => {
    const form = {
	username: options.username,
	password: options.password,
	client_id: options.clientId,
	grant_type: 'password',
    };

    const formOptions = {
	url: options.url,
	form,
    }

    const tokenResponse = await sendAPI(formOptions);

    console.log(tokenResponse);
    writeTokens(tokenResponse);

    return tokenResponse.access_token;
}

const getPayfoneToken = async (options) => {
    const tokenOptions = {
	username: options.username,
	password: options.password,
	clientId: options.clientId,
	url: options.url,
    }

    let {access_token, refreshed} = await payfoneTokenRefresh(tokenOptions);
    if (!refreshed) {
	log('generating new token...');
	access_token = await generatePayfoneToken(tokenOptions);
	log('new token credentials: ', access_token);
    }

    return access_token
}

const authenticateByRedirect = async (options) => {
    const requestId = uuid();
    // application/json must be stringified
    const form = JSON.stringify({
	phoneNumber: options.msisdn,
	requestId,
	application: false,
	callbackUrl
    });
    const formOptions = {
	url: options.url,
	headers: { 
	    'cache-control': 'no-cache',
	     accept: 'application/json',
	     'Content-Type': 'application/x-www-form-urlencoded',
	     Authorization: 'bearer '+options.token 
	},	
	form,
    }
    return await sendAPI(formOptions);
}

const authenticateFinish = async (options) => {
    const requestId = uuid();
    const form = JSON.stringify({
	requestId,
	vfp: options.vfp,
    });
    const formData = {
	url: options.url,
	form,
	headers: {
	    Authorization: 'bearer ' + options.token,
	    'Cache-Control': 'no-cache',
	    Accept: 'application/json',
	}
    }
    return await sendAPI(formData);
}

const simSwapDate = async (options) => {
    const requestId = uuid();
    const form = JSON.stringify({
	phoneNumber: options.msisdn,
	requestId,
    });
    const formData = {
	url: options.url,
	form,
	headers: {
	    accept: 'application/json',
	    Authorization: 'bearer ' + options.token,
	    'Cache-Control': 'no-cache',
	    'Content-Type': 'application/json',
	},
    }
    return await sendAPI(formData);
}

const matchAuthentication = async (options) => {
    const requestId = uuid();
    const form = JSON.stringify({
	requestId,
	phoneNumber: options.body.msisdn,
	firstName: options.body.firstName,
	lastName: options.body.lastName,
	address: options.body.address,
	postalCode: options.body.postalCode,
    });
    const formData = {
	url: options.url,
	form,
	headers: {
	    authorization: 'bearer ' + options.token,
	    accept: 'application/json',
	},
    }
    return await sendAPI(formData);
}

const getSfrCallback = (action) => {
    const route = action === 'match' ? `/verify/${action}` : `/sfrAuthCode/${action}`;
    return ngrok + route;
}

// The action either only be checknumber and atp_simswap or all of them
const getSfrServices = (action) => action === 'match' ? 
    ['mc_kyc_plain'] :
    ['kyc_phonenumber', 'atp_simswap'];


const getSfrAuthURI = (options) => {
    const callback = getSfrCallback(options.action);

    // Format the actions in a string
    const action = getSfrServices(options.action).join(' ');

    const responseType = 'code';
    const scope = 'openid ' + action;
    const correlationId = uuid();

    const redirectParams = {
	'client_id': options.clientId,
	'redirect_uri': callback,
	'response_type': responseType,
	scope,
	'login_hint': 'MSISDN:' + options.msisdn,
	'correlation_id': correlationId,
    }

    const encodedParams = qs.encode(redirectParams);

    const claims = `&claims=${options.claims}`;

    const sfrGW = 'https://carrier-gw.sfr.fr/payfone/authorize?';
    const sfrRedirectURI = sfrGW + encodedParams + claims; 

    return sfrRedirectURI;
}

module.exports = { 
    log,
    sendAPI,
    authenticateByRedirect,
    authenticateFinish,
    getPayfoneToken,
    simSwapDate,
    matchAuthentication,
    getSfrCallback,
    getSfrAuthURI,
    getSfrServices,
    helpers: {
	payfoneTokenRefresh,
	generatePayfoneToken,
    },
}





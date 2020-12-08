const express = require('express');
const request = require('request');
const path = require('path');
const bodyParser = require('body-parser');
const qs = require('querystring');

const utils = require('../utils/utils.js')

// Set environment variables
const PORT = process.env.API_SERVER_PORT
const PAYFONE_USERNAME_EU = process.env.PAYFONE_USERNAME_EU;
const PAYFONE_PASSWORD_EU = process.env.PAYFONE_PASSWORD_EU;
const PAYFONE_CLIENTID_EU = process.env.PAYFONE_CLIENTID_EU;
const PAYFONE_TOKEN_URL_EU = process.env.PAYFONE_TOKEN_URL_EU;

const SFR_CLIENT_ID;
const SFR_SERVICE_ID;
const SFR_AUTH_HEADER;

// Set 1x1 image for redirects
const imagePath = path.join(__dirname, 'assets/blank-image.png');

let details;
app = express()

let token, finalAuth, msisdn;
let sfrServices = {
    kyc_phonenumber: '',
    atp_simswap: '',
    mc_kyc_plain: '',
}

// support JSON encoded POST requests to /match/
app.use(bodyParser.json());

// The server will temporarily store state data
app.post('/submitDetails', async (req, res) => {
    details = req.body;
    console.log('DETAILS', details)
});

app.get('/getDetails', async (req, res) => {
    res.send(details);
});

// Call xconnect to see if phone number entered is valid and get its info
app.get('/checkValid', async (req, res) => {
    // Ex phone number: 447568540596
    console.log('bada yeet xconnect');
    msisdn = req.query.msisdn;
    const form = {
	url: X_CONNECT_URL,
	method: 'GET',
	headers: {
	    Authorization: 'Basic ',
	}
    }
    request(form, (err, http, body) => {
	if (err) {
	    log('validity check error', err);
	    throw err;
	}
	console.log(body)
	res.send(body);
    });
});
// START SFR

app.get('/loadEventStartFR/:action/', async (req, res) => {
    const action = req.params.action;
    const msisdn = req.query.msisdn;
    const claims = req.query.claims;
    console.log(action)
    const sfrAuthParams = {
	clientId: SFR_CLIENT_ID,
	serviceId: SFR_SERVICE_ID,
	action,
	msisdn,
	claims,
    }
    const sfrRedirectURI = utils.getSfrAuthURI(sfrAuthParams);

    const redirect = { redirect: sfrRedirectURI };
    res.send(redirect);
    console.log('sent redirect', redirect)
});

app.get('/sfrAuthCode/:action/', async (req, res) => {
    const action = req.params.action
    const actions = utils.getSfrServices(action);
    const code = req.query.code;

    const tokenUrl = SFR_URL;
    const tokenHeaders = {
	Authorization: `Basic ${SFR_AUTH_HEADER}`,
	'Content-Type': 'application/x-www-form-urlencoded',
    }
    const body = {
	grant_type: 'authorization_code',
	code,
	redirect_uri: utils.getSfrCallback(action),
    }
    //const encodedBody = qs.encode(body);
    const encodedBody = JSON.stringify(body);

    const tokenForm = {
	url: tokenUrl,
	headers: tokenHeaders,
	form: encodedBody,
    }
    
    const tokenResponse = await utils.sendAPI(tokenForm);
    
    const accessToken = tokenResponse.access_token;

    // Start action service request
    const serviceHeaders = {
	Authorization: `Bearer ${accessToken}`,
    }

    for(let action of actions) {
	let service;
	if (action === 'atp_simswap')
	    service = 'simswap';
	else if (action === 'kyc_phonenumber')
	    service = 'checknumber';
	else if (action === 'mc_kyc_plain')
	    service = 'matchid';

	const serviceUrl = SFR_URL;
	const serviceForm = {
	    method: 'GET',
	    url: serviceUrl,
	    headers: serviceHeaders,
	}

	const serviceResponse = await utils.sendAPI(serviceForm);
	sfrServices[action] = serviceResponse;
    }
    
    // Send back a 1x1 px image
    res.sendFile(imagePath);
    console.log(action, 'is completed');
});

app.get('/getSfrResponse/:action', async (req, res) => {
    console.log('EEE', req.params.action)
    const actions = utils.getSfrServices(req.params.action);
    let services = {};
    actions.map(( service ) => services[service] = sfrServices[service]);

    res.send(services);
    console.log(actions, 'was sent');
});

// End SFR
app.get('/loadEventStart', async (req, res) => {
    // Get the payfone token
    const tokenOptions = {
	username: PAYFONE_USERNAME_EU,
	password: PAYFONE_PASSWORD_EU,
	clientId: PAYFONE_CLIENTID_EU,
	url: PAYFONE_TOKEN_URL_EU,
    }
    token = await utils.getPayfoneToken(tokenOptions);

    // Start redirect authentication
    const url = PAYFONE_URL
    const msisdn = req.query.msisdn;
    const authenticateOptions = {
	url,
	msisdn,
	token,
    }
    const response = await utils.authenticateByRedirect(authenticateOptions);
    
    let redirectUrl;
    if (response.status === 0) {
	// Send back the redirectUrl
	redirectUrl = {
	    redirectUrl: response.response.redirectUrl,
	}
    } else {
	redirectUrl = { noRedirect: true };
    }
    res.send(redirectUrl);
});

app.get('/loadEventFinish/:action/', async (req, res) => {
    const action = req.params.action;
    if (action == 'submitVFP') {
	// Sent by Payfone
	const vfp = req.query.vfp;
	const authOptions = {
	    url: PAYFONE_URL,
	    vfp,
	    token,
	}
	const response = await utils.authenticateFinish(authOptions);
	finalAuth = response;

	// Send back a 1x1 px image
	res.sendFile(imagePath);
    } else if (action == 'getAuth') {
	// Sent by client
	res.send(finalAuth);
    }
});

app.get('/simSwapDate/', async (req, res) => {
    // Get the payfone token
    const tokenOptions = {
	username: PAYFONE_USERNAME_EU,
	password: PAYFONE_PASSWORD_EU,
	clientId: PAYFONE_CLIENTID_EU,
	url: PAYFONE_TOKEN_URL_EU,
    }
    //token = await utils.getPayfoneToken(tokenOptions);

    //const msisdn = req.query.msisdn;
    const msisdn = '';
    const simSwapOptions = {
	url: PAYFONE_URL,
	msisdn,
	token,
    }
    const simSwapDate = await utils.simSwapDate(simSwapOptions)
    res.send(simSwapDate);
});

app.post('/match/', async (req, res) => {
    // Fail case: 447608075821
    // Pass case: 447568540596
    // Get the payfone token
    const tokenOptions = {
	username: PAYFONE_USERNAME_EU,
	password: PAYFONE_PASSWORD_EU,
	clientId: PAYFONE_CLIENTID_EU,
	url: PAYFONE_TOKEN_URL_EU,
    }
    //token = await utils.getPayfoneToken(tokenOptions);

    const matchOptions = {
	url: PAYFONE_URL,
	body: req.body,
	token,
    }
    const match = await utils.matchAuthentication(matchOptions);
    console.log('MATCH AUTH', match)
    res.send(match);
});

app.listen(PORT, () => {
    console.log(`API server listening on localhost:${PORT}`) 
})

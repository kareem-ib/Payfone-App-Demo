import React, { Component } from 'react';
import { BubbleSpinLoader } from 'react-css-loaders';
import { AdjustableContainer, AdjustableButton, VerifiedSwitch } from '../assets/styled-components/';
import { Header, Footer } from '.';
import { bindFunctions, fetchResponse } from '../utils';

class Verify extends Component {

    state = {
	redirectUrl: '',
	redirectUrlSfr: '',
	action: '',
	fAuth: {},
	simSwap: '',
	match: '',
	details: {},
	matchDetails: undefined,
	payfoneAuthFailure: false,
    }

    constructor(props) {
	super(props);
	
	bindFunctions(this, 
	    this.getPayfoneAuthentication, 
	    this.handleRedirectLoad, 
	    this.simSwapDate,
	    this.bannerMessage,
	    this.getMatchAuthentication,
	    this.matchVerify,
	    this.showMatched,
	    this.startSfrAuth,
	    this.submitDetails,
	    this.getDetails,
	    this.proceedSfr,
	    this.sendSfrAuthCode,
	    this.sfrMatchValues,
	    this.proceedSfrMatch,
	);
    }

    async componentDidMount() {
	const country = this.props.details.country;
	// If action is defined then we skip the initial API calls
	if (this.props.match.params.action) {
	    await this.getDetails();
	    await this.sendSfrAuthCode();
	    await this.proceedSfrMatch();
	} else if (country === 'FR') {
	    this.startSfrAuth('number_and_simswap');

	    // If form details exist, do match authentication after checknumebr
	    // and simswap complete
	    this.setState({
		action: this.props.formDetails ? 'match' : 'number_and_simswap',
	    });
	} else if (country === 'GB') {
	    await this.getPayfoneAuthentication();
	    this.simSwapDate();
	    if (this.props.formDetails !== undefined)
		this.getMatchAuthentication();
	} else {
	    this.setState({payfoneAuthFailure: true});
	}
    }

    async submitDetails() {
	const body = {
	    state: {
		details: this.state.details,
		simswap: this.state.simswap,
		fAuth: this.state.fAuth,
	    },
	    props: {
		msisdn: this.props.msisdn,
		country: this.props.details.country,
		details: this.props.details,
		formDetails: this.props.formDetails,
	    },
	}

	const form = {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(body),
	}

	await fetchResponse('/submitDetails', form);
    }

    async getDetails() {
	const prevState = await fetchResponse('/getDetails');
	await this.props.handleRedirectStateChange(prevState.props);
	await this.setState({
	    ...this.state,
	    ...prevState.state,
	});
    }

    async startSfrAuth(action) {
	let matchClaims = {};
	if (action === 'match')
	    matchClaims = {
		given_name: this.props.formDetails.fname,
		family_name: this.props.formDetails.lname,
		address: this.props.formDetails.address,
		postal_code: this.props.formDetails.postalCode,
	    }

	const claims = {
	    age: this.props.SFR_SIM_SWAP_AGE_OFFSET,
	    ...matchClaims,
	}
	
	// Expects a redirect
	const redirect = 
	    await fetchResponse(`/loadEventStartFR/${action}?msisdn=${this.props.msisdn}&claims=${JSON.stringify(claims)}`);

	// If we are doing match, force a full redirect, otherwise set the image
	if (action === 'match') {
	    this.submitDetails();
	    window.location.href = redirect.redirect;
	} else {
	    this.setState({redirectUrlSfr: redirect.redirect});
	    // If SFR times out, you have not been authenticated
	    setTimeout(() => {
		if (this.state.fAuth.authenticated === undefined) {
		    this.setState({
			fAuth: {
			    authenticated: false,
			},
			details: {
			    ...this.state.details,
			    simActDate: false,
			},
			// this is to set the banner message to false if match is defined
			matchDetails: this.state.action === 'match' ? {} : undefined,
		    });
		}
	    }, 10000);
	}
    }

    async sendSfrAuthCode() {
	await fetch(`/sfrAuthCode/${this.props.match.params.action}${this.props.location.search}`);
    }

    sfrMatchValues(matches) {
	// Compute average of match categories
	return {
	    name: (matches.family_name_match + matches.given_name_match) / 2 * 100,
	    address: (matches.address_match + matches.postal_code_match) / 2 * 100,
	}
    }

    async proceedSfrMatch() {
	const action = 'match';
	const sfrJSON = await fetchResponse(`/getSfrResponse/${action}`);
	
	const matchValues = this.sfrMatchValues(sfrJSON.mc_kyc_plain);

	await this.setState({
	    ...this.state,
	    matchDetails: matchValues || this.state.details.matchDetails,
	});
	await this.props.handleDetails(this.state.details);
    }

    async proceedSfr() {
	const action = 'number_and_simswap';
	const sfrJSON = await fetchResponse(`/getSfrResponse/${action}`);
	
	// Set the new state with the SFR data
	await this.setState({
	    ...this.state,
	    fAuth: {
		authenticated: sfrJSON.kyc_phonenumber.phone_number_match === 'Y',
	    },
	    details: {
		...this.state.details,
		...this.props.details,
		simActDate: sfrJSON.atp_simswap.swapped,
	    },
	});
	await this.props.handleDetails(this.state.details);
	if (this.state.action === 'match')
	    this.startSfrAuth('match');
    }

    async getPayfoneAuthentication() {
	const redirectUrl = await fetchResponse(`/loadEventStart?msisdn=${this.props.msisdn}`);
	if (redirectUrl.noRedirect)
	    this.setState({payfoneAuthFailure: true});
	else
	    this.setState(redirectUrl);
    }

    async handleRedirectLoad() {
	const fAuthResponse = await fetchResponse('/loadEventFinish/getAuth');
	const fAuth = fAuthResponse.response;

	// Set details back to controller
	const details = {
	    ...this.state.details,
	    mno: fAuth.carrier,
	    lineType: fAuth.lineType,
	    country: fAuth.countryCode,
	}
	await this.setState({details});
	this.props.handleDetails(details);

	this.setState({fAuth});
    }

    async simSwapDate() {
	const simSwapJSON = await fetchResponse(`/simSwapDate?msisdn=${this.props.msisdn}`);
	const simActDate = simSwapJSON.response.simSwapTimestamp;
	const details = {
	    ...this.state.details,
	    simActDate,
	}
	console.log(details)
	await this.setState({details});
	this.props.handleDetails(this.state.details);
    }

    async getMatchAuthentication() {
	const formattedDetails = {
	    msisdn: this.props.msisdn,
	    firstName: this.props.formDetails.fname,
	    lastName: this.props.formDetails.lname,
	    address: this.props.formDetails.address,
	    postalCode: this.props.formDetails.postalCode,
	}
	const form = {
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(formattedDetails),
	}
	
	const matchJSON = await fetchResponse('/match', form);
	let matchDetails = {};
	// Checking if the status is 1010 is a quick and dirty fix,
	// when the error message improves we can implement better checks
	if (matchJSON.status === 0) {
	    const matchData = matchJSON.response;
	    const matchDetails = {
		name: matchData.name.nameScore,
		address: matchData.address.addressScore,
	    }
	}
	this.setState({matchDetails});
    }

    matchVerify(field) {
	return this.state.matchDetails[field] > 70;
    }
    
    showMatched() {
	if (this.props.formDetails)
	    return (
		<AdjustableContainer>
		    Name Match: <VerifiedSwitch verified={this.matchVerify('name')} />
		    <br />
		    Address Match: <VerifiedSwitch verified={this.matchVerify('address')} />
		    <br />
		</AdjustableContainer>
	    );
	else
	    return;
    }

    // Determines what to show on the page
    // If authentication hasn't happened yet, show spinner
    // Otherwise show verification status
    bannerMessage() {
	const auth = this.state.fAuth.authenticated !== undefined;
	const simActDate = this.state.details.simActDate !== undefined;
	const matchDetails = !this.props.formDetails || (this.state.matchDetails !== undefined);
	const isDone = simActDate && matchDetails && auth;
	if (isDone)
	    return (
		<AdjustableContainer fontSize='1.5em'>
		    Authenticated: <VerifiedSwitch verified={this.state.fAuth.authenticated} />
		    <br />
		    { this.showMatched() }
		    <AdjustableButton to={this.state.fAuth.authenticated ? '/details' : '/'}>

			{this.state.fAuth.authenticated ? 'Details' : 'Restart'}
		    </AdjustableButton>
		</AdjustableContainer>
	    );
	else if (this.state.payfoneAuthFailure)
	    return <AdjustableContainer>This number isn't supported by this service.</AdjustableContainer>;
	else
	    return (
		<AdjustableContainer fontSize='2.5em' margin='auto' width="50%">
		    Verifying...
		    <BubbleSpinLoader />
		</AdjustableContainer>
	    );
    }

    render() {
	return (
	    <AdjustableContainer id='Verify'>
		{ this.bannerMessage() }
		<img 
		    src={this.state.redirectUrl} 
		    onLoad={this.handleRedirectLoad} 
		    width='1px' 
		    height='1px'/>
		<img 
		    src={this.state.redirectUrlSfr} 
		    onLoad={this.proceedSfr} 
		    width='1px' 
		    height='1px'/>
		{this.state.match}
		{this.state.simSwap}
		{this.state.details.simActDate}
	    </AdjustableContainer>
	);
    }
}

export { Verify };

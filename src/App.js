import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Homepage, Form, Verify, Details, Header, Footer } from './components';
import { Input, AdjustableContainer } from './assets/styled-components/'
import { bindFunctions } from './utils';

class App extends Component{
    state = {
	msisdn: '',
	formDetails: undefined,
	details: {
	    country: '',
	    lineType: '',
	    mno: '',
	    simActDate: '',
	},
    }

    // props should be recieved from index.js and session-variables.js
    constructor(props) {
	super(props);
	
	// 48 hours for the sim swap age
	this.SFR_SIM_SWAP_AGE_OFFSET = 48;

	// DEV VARIABLE SETTING
	// this.state.match = true;

	// Set function bindings to the current working object
	bindFunctions(this,
	    this.handleMSISDNChange,
	    this.handleDetails,
	    this.validMSISDN,
	    this.resetState,
	    this.isAuthenticated,
	    this.handleDetails,
	    this.handleForm,
	    this.handleRedirectStateChange
	);
    }

    handleMSISDNChange(msisdn) {
	// When this function is called, the MSISDN is expected to be valid from <Homepage />
	this.setState({msisdn});
    }

    validMSISDN() {
	return this.state.msisdn;
    }

    isAuthenticated() {
	return this.state.authenticated;
    }

    handleDetails(details) {
	this.setState({details});
    }

    handleForm(formDetails) {
	this.setState({formDetails});
    }

    handleRedirectStateChange(prevState) {
	this.setState({
	    msisdn: prevState.msisdn,
	    formDetails: prevState.formDetails,
	    details: {
		country: prevState.details.country,
		lineType: '',
		mno: '',
		simActDate: prevState.details.simActDate,
	    }
	});
    }

    resetState() {
	this.setState({
	    msisdn: '',
	    formDetails: undefined,
	    details: {
		country: '',
		lineType: '',
		mno: '',
		simActDate: '',
	    },
	});
    }

    render() {
	return (
	    <Router>
		<AdjustableContainer id='App'>
		    <Header />
		    <Route exact path='/' render={(props) => {
			return (
			    <Homepage 
				{...props}
				handleMatchRequest={this.handleMatchRequest} 
				handleMSISDNChange={this.handleMSISDNChange}
				handleDetails={this.handleDetails}/>
			);
		    }}/>

		    <Route exact path='/form' render={(props)=>{
			return (
			    <Form
				{...props}
				handleForm={this.handleForm}/>
			);
		    }}/>

		    <Route exact path='/verify/' render={(props)=>{
			return (
			    <Verify 
				{...props}
				msisdn={this.state.msisdn}
				details={this.state.details}
				formDetails={this.state.formDetails}
				handleDetails={this.handleDetails}
				handleRedirectStateChange={this.handleRedirectStateChange}
				SFR_SIM_SWAP_AGE_OFFSET={this.SFR_SIM_SWAP_AGE_OFFSET}/>
			);
		    }}/>

		    <Route exact path='/verify/:action' render={(props)=>{
			return (
			    <Verify 
				{...props}
				msisdn={this.state.msisdn}
				details={this.state.details}
				formDetails={this.state.formDetails}
				handleDetails={this.handleDetails}
				handleRedirectStateChange={this.handleRedirectStateChange}/>
			);
		    }}/>
		    
		    <Route exact path='/details' render={(props)=>{
			return (
			    <Details
				{...props}
				msisdn={this.state.msisdn}
				details={this.state.details}
				SFR_SIM_SWAP_AGE_OFFSET={this.SFR_SIM_SWAP_AGE_OFFSET}/>
			);
		    }}/>
		<Footer />
		</AdjustableContainer>
	    </Router>
	);
    }
}

export default App;

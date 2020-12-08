import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AdjustableContainer, Input, Label, AdjustableButton, Option, Invalid } from '../assets/styled-components/';
import { Header, Footer } from '.';
import { bindFunctions, fetchResponse } from '../utils';

class Homepage extends Component {

    state = {
	accountNumber: '',
	choice: '',
	phoneNumber: '',
	validPhoneNumber: false,
	invalidMessage: false, // flag to show an invalid message
	redirectTo: '',
    }

    constructor(props) {
	super(props);
	const accountNumber = this.generateAccountNumber();
	const defaultChoice = 'Authentication';

	this.state.accountNumber = accountNumber;
	this.state.choice = defaultChoice;

	// bind to `this` so the functions can recognize this instance
	bindFunctions(this,
	    this.handleInputChange,
	    this.handleButtonClick,
	    this.invalidatePhoneNumber,
	    this.validatePhoneNumber,
	);

	// For dev purposes
	// O2: 447568540596
	//this.state.phoneNumber = "33610374288"; // French testing, passes
	this.state.phoneNumber = "447568540596"; // Passes Authentication
	//this.state.phoneNumber = "447715053061"; // Fails Authentication
    }

    generateAccountNumber() {
	return Math.floor(Math.random() * 1e10); // Get random 10 digits
    }

    handleChoice(choice) {
	// Verify that these are the correct parameters set for 'choice'
	if (choice === 'Authentication' || choice === 'Match')
	    this.setState({choice});
    }

    handleInputChange(e) {
	this.setState({invalidMessage: false});
	this.setState({phoneNumber: e.target.value});
    }

    async validatePhoneNumber() {
	this.setState({validPhoneNumber: true});
    }

    async invalidatePhoneNumber() {
	this.setState({validPhoneNumber: false});
    }

    async handleButtonClick() {
	const phoneData = await fetchResponse(`/checkValid?msisdn=${this.state.phoneNumber}`);
	if (phoneData) {
	    // Determine if the current choice is `Match`
	    this.props.handleMSISDNChange(this.state.phoneNumber);

	    const details = {
		country: phoneData.cc,
		mno: phoneData.cn,
		lineType: phoneData.nt,
	    }
	    
	    this.props.handleDetails(details);

	    const redirectTo = this.state.choice === 'Match' ? '/form' : '/verify';
	    this.setState({redirectTo});

	} else {
	    this.setState({invalidMessage: true});
	}
    }

    render() {
	return (
	    <AdjustableContainer id='Homepage'>
		<AdjustableContainer width="20%" float="right" fontSize="0.5em">
		    <Option 
			active={this.state.choice === 'Authentication'} 
			onClick={() => this.handleChoice('Authentication')}>

			Authentication

		    </Option>
		    <span>-</span>
		    <Option 
			active={this.state.choice === 'Match'} 
			onClick={() => this.handleChoice('Match')}>

			Match

		    </Option>
		</AdjustableContainer>
		<AdjustableContainer margin="auto" width="50%" height="auto" >
		    <br />

		    <Label htmlFor="phonenumber" >Mobile Phone Number:</Label>
		    <Invalid on={this.state.invalidMessage}>Invalid Phone Number</Invalid>
		    <Input 
			id="phonenumber" 
			primary 
			placeholder="Ex: +44123456789"
			value={this.state.phoneNumber}
			onChange={this.handleInputChange}
			type='tel'
			valid={!this.state.invalidMessage}/>

		    <br />

		    <Label htmlFor="accountnumber" >Account Number:</Label>
		    <Input 
			id="accountnumber" 
			primary 
			value={this.state.accountNumber}
			color="#000000"
			disabled />

		    <br />

		    <AdjustableButton 
			to='#' 
			onClick={this.handleButtonClick}>

			{this.state.choice === "Match" ? "Continue" : "Authenticate"}

		    </AdjustableButton>
		    {this.state.redirectTo && <Redirect to={this.state.redirectTo} />}
		</AdjustableContainer>
	    </AdjustableContainer>

	);
    }
}

export { Homepage };

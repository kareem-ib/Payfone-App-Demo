import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { AdjustableContainer, InputAndLabel, AdjustableButton } from '../assets/styled-components/';
import { Header, Footer } from '.';
import { bindFunctions } from '../utils/';

class Form extends Component {

    state = {
	inputs: [
	    {
		id: 'fname',
		label: 'First name',
		placeholder: 'John',
		valid: true,
	    },
	    {
		id: 'lname',
		label: 'Last name',
		placeholder: 'Smith',
		valid: true,
	    },
	    {
		id: 'address',
		label: 'Address',
		placeholder: '10 Anywhere Rd.',
		valid: true,
	    },
	    {
		id: 'postalCode',
		label: 'Postal code',
		placeholder: '11111',
		valid: true,
	    }
	],
	states: {},
	redirect: false,
    }

    constructor(props) {
	super(props);

	// Set default states for n amount of inputs
	for (let input of this.state.inputs)
	    this.state.states[input.id] = '';

	bindFunctions(this, this.handleInputChange, this.handleAuthenticate);
    }

    checkValidInput(input) {
	return input.search(/[A-Za-z0-9]/) != -1;
    }

    handleInputChange(e) {
	let nextState = this.state.states;
	nextState[e.target.id] = e.target.value;
	this.setState(nextState);
    }

    handleAuthenticate() {
	let allInputs = this.state.inputs;
	let authenticate = true;
	for (let input of allInputs) {
	    input.valid = this.checkValidInput(this.state.states[input.id]);
	    authenticate = authenticate && input.valid;
	}
	
	if (authenticate) {
	    this.props.handleForm(this.state.states);
	    this.setState({redirect: true});
	}
    }

    render() {
	return (
	    <AdjustableContainer id='Form'>
		<AdjustableContainer margin="auto" width="70%">
		    { this.state.inputs.map( (input, key) => {
		        return (<InputAndLabel 
			    inputId={input.id}
			    labelText={input.label + ':'}
			    placeholder={'Ex: ' + input.placeholder}
			    valid={input.valid}
			    handler={this.handleInputChange}
			    key={key}/>)
		        }
		    )}
		    
		    <AdjustableButton to='#' onClick={this.handleAuthenticate}>Authenticate</AdjustableButton>
		    {this.state.redirect && <Redirect to='/Verify' />}
		</AdjustableContainer>
	    </AdjustableContainer>
	);
    }
}

export { Form };

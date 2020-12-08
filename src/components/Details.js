import React, { Component } from 'react';
import { AdjustableContainer, Input } from '../assets/styled-components/';
import { Header, Footer } from '.';

class Details extends Component {

    render() {

	return (
	    <AdjustableContainer id='Details'>
		Phone number: {this.props.msisdn}
		<br />
		Country: {this.props.details.country}
		<br />
		Line type: {this.props.details.lineType}
		<br />
		MNO: {this.props.details.mno}
		<br />
		{
		    this.props.details.country === 'FR' ?
			`SIM swapped in last ${this.props.SFR_SIM_SWAP_AGE_OFFSET} hours: ${this.props.details.simActDate}` :
			`SIM activation date: ${this.props.details.simActDate}`
		}
	    </AdjustableContainer>
	);
    }
}

export { Details };

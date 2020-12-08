import React, { Component } from 'react';
import { AdjustableContainer, AdjustableImage } from '../assets/styled-components';
import bankImage from '../assets/images/chase-bank.png';

class Header extends Component {
    state = {
	bankImage: ''
    }

    constructor(props) {
	super(props);
	this.state.bankImage = bankImage
    }

    render() {
	return (
	    <AdjustableContainer>
		{/* This is our hero image */}
		<AdjustableImage src={this.state.bankImage} width='30%' height='30%' center />
	    </AdjustableContainer>
	);
    }
}

export { Header };

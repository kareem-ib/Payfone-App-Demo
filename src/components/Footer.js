import React, { Component } from 'react';
import payfoneLogo from '../assets/images/payfone-logo.svg';
import { AdjustableContainer, AdjustableImage } from '../assets/styled-components';

class Footer extends Component {
    constructor(props) {
	super(props);

    }

    render() {
	return (
	    <AdjustableContainer width="20%" float="right" fontSize="0.5em">
		Powered by <AdjustableImage width="50%" height="1%" src={payfoneLogo} />
	    </AdjustableContainer>
	);
    }
}

export { Footer };

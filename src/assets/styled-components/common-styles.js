import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Input = styled.input`
    padding: ${props => props.primary ? '5%' : '1%'};
    width: ${props => props.primary ? '100%' : '50%'};
    display: ${props => props.display ? props.display : 'block'};
    color: ${props => props.color || 'initial'};
    outline: ${props => props.valid === false ? 'red' : 'initial'} solid 1px;
    &:focus {
	outline: green solid 1px;
    }
    box-sizing: border-box;
`;

const AdjustableContainer = styled.div`
    width: ${props => props.width || '100%'};
    height: ${props => props.height || '100%'};
    margin: ${props => props.margin || '0'};
    display: ${props => props.display || 'block'};
    font-size: ${props => props.fontSize || 'auto'};
    float: ${props => props.float || 'none'};
`;

const AdjustableImage = styled.img.attrs(props => (
    {
	src: props.src
    }
))`
    width: ${props => props.width || '20%'};
    height: ${props => props.height || '20%'};
    margin: ${props => props.center ? 'auto' : 0};
    display: block;
`;

const Label = styled.label`
    color: ${props => props.color || '#757575'};
`;

// This is the styled button which is used by AdjustableButton to form a Link
const Button = styled.button`
    width: 100%;
    color: ${props => props.color || 'white'};
    background-color: ${props => props.backgroundColor || 'blue'};
    padding: 1em;
    cursor: pointer;
`;

const AdjustableButton = (props) => {
    // If valid wasn't defined then it is automatically true
    const valid = props.valid === undefined || props.valid;
    return (
	<Link to={props.to}>
	    <Button {...props}>
		{props.children}
	    </Button>
	</Link>
    );
}

export { Input, AdjustableContainer, AdjustableImage, Label, AdjustableButton };

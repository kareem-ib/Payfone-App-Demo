import React, { Component } from 'react';
import styled from 'styled-components';
import { AdjustableContainer, Input, Label } from '.';

const InputAndLabel = (props) => {
    const label = props.labelText;
    const placeholder = props.placeholder;
    const color = props.color;
    const id = props.inputId;
    const valid = props.valid;
    const handler = props.handler;

    return (
	<AdjustableContainer>
	    <Label htmlFor={id}>{label}</Label>
	    <Input id={id} valid={valid} onChange={handler} placeholder={placeholder}/>
	    <br />
	</AdjustableContainer>
    );
}

export { InputAndLabel };

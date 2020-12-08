import React from 'react';
import styled from 'styled-components';
import { MdCheckCircle, MdHighlightOff } from 'react-icons/md';

const size = '1em';
const Verified = styled(MdCheckCircle)`
    font-size: ${size};
    margin: auto;
    color: green;
`;

const NotVerified = styled(MdHighlightOff)`
    font-size: ${size};
    margin: auto;
    color: red;
`;

const VerifiedSwitch = (props) => {
    return props.verified ? <Verified /> : <NotVerified />;
}

export { Verified, NotVerified, VerifiedSwitch };

import styled from 'styled-components';

const AccountNumber = styled.div`
    color: #757575;   
    font-size: 0.76em;
`;

const Option = styled.span`
    color: ${props => props.active ? 'blue' : 'black'};
    cursor: pointer;
`;

const Invalid = styled.span`
    color: red;
    fontSize: 0.7em;
    display: ${props => props.on ? 'initial' : 'none'};
`;

export { AccountNumber, Option, Invalid };

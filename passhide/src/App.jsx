import styled from 'styled-components';

const MyButton = styled.button`
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  margin: 10px;
  border-radius: 5px;
  
  /* If the 'primary' prop is true, make it blue. Otherwise, make it gray. */
  background-color: ${props => props.primary ? 'blue' : 'gray'};
  color: white;
`;

function ButtonPage() {
  return (
    <div>
     
      <MyButton primary>Primary Button (Blue)</MyButton>
     
      <MyButton>Normal Button (Gray)</MyButton>
    </div>
  );
}

export default ButtonPage;

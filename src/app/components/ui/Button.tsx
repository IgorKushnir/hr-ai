import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import React from 'react';

export type ButtonProps = ChakraButtonProps & {
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <ChakraButton {...props}>
      {children}
    </ChakraButton>
  );
};

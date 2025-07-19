import { Box, IInputProps, Input } from "native-base";
import React from "react";
import Feather from "react-native-vector-icons/Feather";

interface SearchInputProps extends Omit<IInputProps, "InputLeftElement"> {
  iconColor: string;
}

export const SearchInput = ({ iconColor, ...props }: SearchInputProps) => {
  return (
    <Input
      flex={1}
      borderRadius="full"
      py={2}
      px={4}
      InputLeftElement={
        <Box pl={2}>
          <Feather name="search" size={20} color={iconColor} />
        </Box>
      }
      {...props}
    />
  );
};

import { Box, IPressableProps, Pressable } from "native-base";
import React from "react";
import Feather from "react-native-vector-icons/Feather";

interface IconButtonProps extends Omit<IPressableProps, "children"> {
  name: string;
  size?: number;
  color: string;
}

export const IconButton = ({
  name,
  size = 24,
  color,
  disabled,
  ...props
}: IconButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      _pressed={{ opacity: 0.7 }}
      {...props}
    >
      <Box
        w={`${size}px`}
        h={`${size}px`}
        justifyContent="center"
        alignItems="center"
      >
        <Feather name={name} size={size} color={color} />
      </Box>
    </Pressable>
  );
};

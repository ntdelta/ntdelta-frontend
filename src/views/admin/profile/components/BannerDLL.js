// Chakra imports
import { Avatar, Link, Box, Flex, Text, useColorModeValue, SimpleGrid } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";

export default function BannerDLL(props) {
  const { 
    name, 
    avatar, 
    description, 
    sha256, 
    first_seen_date, 
    version, 
    size, 
    virtual_size,
    function_count,
    id
   } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const borderColor = useColorModeValue(
    "white !important",
    "#111C44 !important"
  );
  return (
    <Card mb={{ base: "20px", lg: "20px" }} mt="20px" align='center'>
      <Avatar
        mx='auto'
        src={avatar}
        h='87px'
        w='87px'
        mt='-43px'
        border='4px solid'
        borderColor={borderColor}
      />
      <Text color={textColorPrimary} fontWeight='bold' fontSize='xl' mt='10px'>
         {description} - {name}
      </Text>
    </Card>
  );
}

// Chakra imports
import { Avatar, Box, Flex, Text, useColorModeValue, SimpleGrid } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";

export default function BannerHeader(props) {
  const { 
    name, 
    avatar, 
    description, 
    sha256, 
    signing_date, 
    version, 
    size, 
    virtual_size,
    function_count
   } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const borderColor = useColorModeValue(
    "white !important",
    "#111C44 !important"
  );
  return (
    <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
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
      <Text color={textColorSecondary} fontSize='sm'>
        {sha256}
      </Text>
      
      <SimpleGrid columns={{ base: 4, "2xl": 4 }} gap="20px" mt="20px">
            <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {version.split(" ")[0]}
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
              Version
            </Text>
            </Box>

           <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {new Date(Date.parse(signing_date)).toLocaleDateString()}
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            Signing Date
            </Text>
          </Box>

          <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {(size/1000).toLocaleString()} KB
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
                Size
            </Text>
          </Box>

          <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {(virtual_size/1000).toLocaleString()} KB
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
                Virtual Size
            </Text>
          </Box>
      </SimpleGrid>
   
    </Card>
  );
}

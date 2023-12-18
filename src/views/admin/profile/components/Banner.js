// Chakra imports
import { Flex, Center, Link, Tag, Grid, GridItem, Avatar, Button, Box, Select, Text, useColorModeValue, SimpleGrid, AbsoluteCenter, Icon } from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React from "react";
import { MdArrowForward } from "react-icons/md";

const handleOpenClick = (banner_id) => {
  if (document.getElementById("open_select_" + banner_id) == null) return null;

  const selectValue = document.getElementById("open_select_" + banner_id).value;
  window.location.href = `https://ntdelta.dev/admin/dllinstance/?id=${selectValue}`;
};

const handleCompareClick = (banner_id) => {
  if (document.getElementById("open_select_" + banner_id) == null) return null;
  if (document.getElementById("compare_select_" + banner_id) == null) return null;

  const selectValue = document.getElementById("open_select_" + banner_id).value;
  const compareValue = document.getElementById("compare_select_" + banner_id).value;
  window.location.href = `https://ntdelta.dev/admin/compare/?first_id=${selectValue}&second_id=${compareValue}`;
};

export default function Banner(props) {
  const { id, firstWindowsVersion, lastWindowsVersion, versionMap, banner, avatar, name, job, versions, functions, firstSeen, lastSeen } = props;
  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.400";
  const borderColor = useColorModeValue(
    "white !important",
    "#111C44 !important"
  );

  return (
    <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
      <Link href={"/admin/dll/?name=" + name}>
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
          {name}
        </Text>
        <Text color={textColorSecondary} fontSize='sm'>
          {job}
        </Text>
      </Link>
      { parseInt(functions) !== 0 ? ( <>
      <Link href={"/admin/dll/?name=" + name}>
      <SimpleGrid columns={{ base: 2, "2xl": 4 }} gap="20px">
            <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {versions}
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
              Versions
            </Text>
            </Box>

            <Box>
            <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
              {functions}
            </Text>
            <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
              Functions
            </Text>
            </Box>

            <Box>
          <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
            {versionMap[versionMap.length -1].version.split(" ")[0]}
          </Text>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            First Version
          </Text>
          </Box>

          <Box>
          <Text color={textColorPrimary} fontSize='2xl' fontWeight='700'>
            {versionMap[0].version.split(" ")[0]}
          </Text>
          <Text color={textColorSecondary} fontSize='sm' fontWeight='400'>
            Most Recent Version
          </Text>
          </Box>
      </SimpleGrid>
      </Link>
      <Grid mt="20px" templateColumns='repeat(4, 1fr)' gap={4}>
          <GridItem colSpan={3} >
          <Select id={"open_select_" + id}>
              {versionMap.map((option) => (
                  <option value={option.id}>
                    {option.version.split(" ")[0]}  { (new Date(option.first_seen_date)).toLocaleDateString('en-UK') }
                  </option>
              ))}
          </Select>
          </GridItem>
          <GridItem >
          <Button onClick={ () => handleOpenClick(id)} width="100%" colorScheme='blue'>Open</Button>
          </GridItem>
          <GridItem colSpan={3} >
          <Select id={"compare_select_"+id}>
              {versionMap.map((option) => (
                  <option value={option.id} >
                    {option.version.split(" ")[0]}  { (new Date(option.first_seen_date)).toLocaleDateString('en-UK') }
                  </option>
              ))}
          </Select>
          </GridItem>
          <GridItem  >
          <Button width="100%" onClick={() => handleCompareClick(id)}  colorScheme='blue'>Compare</Button>
          </GridItem>
          </Grid>
         </>) : <AbsoluteCenter><Text color={textColorPrimary} fontSize='2xl' >This DLL has just been added!</Text></AbsoluteCenter>}
         
      <Center>
      <Grid maxWidth={"400px"} mt={"15px"} templateColumns="repeat(9, 1fr)" gap={4}>
          <GridItem colSpan={4}>
            <Tag height="20px" size="lg" variant="solid" colorScheme="blue">{firstWindowsVersion}</Tag>
          </GridItem>
          <GridItem colSpan={1}>
            <Flex align="center" justify="center" h="100%">
              <Flex align="center" justify="center" direction="column">
                <Icon as={MdArrowForward}/>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem colSpan={4}>
          <Tag height="20px" size="lg" variant="solid" colorScheme="blue">{lastWindowsVersion}</Tag>
          </GridItem>
        </Grid>
        </Center>
    </Card>
  );
}
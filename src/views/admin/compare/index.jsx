import {
  Box,
  Code,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  AbsoluteCenter,
  Flex,
  Grid,
  Icon,
  GridItem,
  Text,
  Button,
} from "@chakra-ui/react";
// Assets

import Card from "components/card/Card.js";
import BannerHeaderCompare from "views/admin/profile/components/BannerHeaderCompare";
import avatar from "assets/img/avatars/avatar4.png";
import React, { useState, useEffect } from "react";
import { useLocation, Link } from 'react-router-dom';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { MdCompareArrows , MdCall } from "react-icons/md"
import { comment } from "stylis";
import Select from 'react-select'

var md5 = require('md5');

function fetchData(paramValue, setBannerData, setLoading) {
  return async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.ntdelta.dev/api/dlls/instances/" + paramValue);
      const data = await res.json();
      setBannerData(data);
    } catch (error) {
      console.error("Error fetching banner data:", error);
    } finally {
      setLoading(false);
    }
  };
}

function getConsistentFunctions(leftFunctionData, rightFunctionData) {
  var consistentFunctions = []
  for (var i = 0; i < leftFunctionData.length; i++) {
    for (var j = 0; j < rightFunctionData.length; j++) {
      if (leftFunctionData[i].function_c_hash == rightFunctionData[j].function_c_hash) {
        consistentFunctions.push(leftFunctionData[i])
      }
    }
  }

  return consistentFunctions
}

function getRemovedFunctions(leftFunctionData, rightFunctionData) {
  var removedFunctions = []
  for (var i = 0; i < leftFunctionData.length; i++) {
    var found = false
    for (var j = 0; j < rightFunctionData.length; j++) {
      if (leftFunctionData[i].function_name == rightFunctionData[j].function_name) {
        found = true
      }
    }
    if (!found) {
      removedFunctions.push(leftFunctionData[i])
    }
  }

  return removedFunctions
}

function removeLinesWithPattern(inputString, pattern) {
  const regex = new RegExp(pattern, 'g');
  return inputString.replace(regex, '');
}

function normalizeCode(inputString) {
  const patterns = [
    /DAT_[0-9A-Fa-f]+/g,
    /LAB_[0-9A-Fa-f]+/g,
    /code_[0-9A-Fa-f]+/g,
    /uRam[0-9A-Fa-f]+/g,
    /joined_r0x[0-9A-Fa-f]+/g,
  ];

  const replacement = {
    "DAT_": "DAT_0",
    "LAB_": "LAB_0",
    "code_": "code_0",
    "uRam": "uRam0",
    "joined_r0x": "joined_r0x00",
  };

  for (const pattern of patterns) {
    inputString = inputString.replace(pattern, (match) => {
      const prefix = Object.keys(replacement).find((key) => match.startsWith(key));
      return prefix ? replacement[prefix] : match;
    });
  }

  return inputString;
}

function BasicallyTheSame(inputString1, inputString2) {
  // The hash is different. Is that just because the memory address was differnt?
  // We can anonymise the LAB_* and DAT_* variables to make the hash memory position agnostic
  const commentPattern = /\/\*.*\*\//g; // Pattern to match /*    */

  var agnosticLeftCode = normalizeCode(inputString1);
  var agnosticRightCode = normalizeCode(inputString2);

  agnosticRightCode = agnosticRightCode.replace("\\n", "")
  agnosticLeftCode = agnosticLeftCode.replace("\\n", "")

  agnosticLeftCode = removeLinesWithPattern(agnosticLeftCode, commentPattern);
  agnosticRightCode = removeLinesWithPattern(agnosticRightCode, commentPattern);

  const functionPointerRegex = /\*\((?:undefined\d*\s*\*\))?\s*\((?:[^\)]+)\)\s*=\s*(?:0[xX][0-9a-fA-F]+|\d+)\s*;/g;
  agnosticLeftCode = agnosticLeftCode.replace(functionPointerRegex, "functionPointer = 0;")
  agnosticRightCode = agnosticRightCode.replace(functionPointerRegex, "functionPointer = 0;")

  return agnosticLeftCode == agnosticRightCode;
}

function getChangedFunctions(leftFunctionData, rightFunctionData) {
    var changedFunctions = []
    var consistentFunctions = []

    for (var i = 0; i < leftFunctionData.length; i++) {
      for (var j = 0; j < rightFunctionData.length; j++) {
        if ((leftFunctionData[i].function_name == rightFunctionData[j].function_name) && (leftFunctionData[i].function_c_hash !== rightFunctionData[j].function_c_hash)) {
          
          if (BasicallyTheSame(leftFunctionData[i].function_c, rightFunctionData[j].function_c))
          {
            // The code is the same, just the memory address is different
            consistentFunctions.push(leftFunctionData[i])
          }
          else {
            changedFunctions.push(leftFunctionData[i])
          }
        }
      }
    }
  
    return [changedFunctions, consistentFunctions]
}

function getAddedFunctions(leftFunctionData, rightFunctionData) {
  var addedFunctions = []
  for (var i = 0; i < rightFunctionData.length; i++) {
    var found = false
    for (var j = 0; j < leftFunctionData.length; j++) {
      if (rightFunctionData[i].function_name == leftFunctionData[j].function_name) {
        found = true
      }
    }
    if (!found) {
      addedFunctions.push(rightFunctionData[i])
    }
  }
  return addedFunctions
}


function fetchFunctionData(paramValue, setFunctionData, setFunctionLoading) {
  return async () => {
    try {
      setFunctionLoading(true);
      const res = await fetch("https://api.ntdelta.dev/api/dlls/instances/" + paramValue + "/functions");
      const data = await res.json();
      setFunctionData(data);
    } catch (error) {
      console.error("Error fetching banner data:", error);
    } finally {
      setFunctionLoading(false);
    }
  };
}



export default function CompareDllReport() {

  const handleFunctionChange = (selectedOption) => {
    setSelectedFunction(selectedOption.label);
  };

  const handleSwapClick = () => {
    const params = new URLSearchParams(location.search);
    const selectValue2 = params.get("first_id");
    const selectValue1 = params.get("second_id");
    window.location.href = `https://ntdelta.dev/admin/compare/?first_id=${selectValue1}&second_id=${selectValue2}`;
  }
  
  const [leftBannerData, setLeftBannerData] = useState(null);
  const [rightBannerData, setRightBannerData] = useState(null);
  const [leftFunctionData, setLeftFunctionData] = useState(null);
  const [rightFunctionData, setRightFunctionData] = useState(null);
  const [leftLoading, setLeftLoading] = useState(true);
  const [rightLoading, setRightLoading] = useState(true);
  const [leftFunctionLoading, setLeftFunctionLoading] = useState(true);
  const [rightFunctionLoading, setRightFunctionLoading] = useState(true);
  const [leftParamValue, setLeftParamValue] = useState(null);
  const [rightParamValue, setRightParamValue] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [doneDiff, setDoneDiff] = useState(null);
  const [addedDiff, setAddedDiff] = useState(null);
  const [changedDiff, setChangedDiff] = useState(null);
  const [removedDiff, setRemovedDiff] = useState(null);
  const [consistentDiff, setConsistentDiff] = useState(null);

  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newParamValueLeft = params.get("first_id");
    const newParamValueRight = params.get("second_id");
    setLeftParamValue(newParamValueLeft);
    setRightParamValue(newParamValueRight);
  }, [location.search]);

  useEffect(() => {
    if (leftParamValue && rightParamValue) {
      setSelectedFunction(null);
      const fetchDataAndUpdateStateLeft = fetchData(leftParamValue, setLeftBannerData, setLeftLoading);
      const fetchDataAndUpdateStateRight = fetchData(rightParamValue, setRightBannerData, setRightLoading);
      const fetchDataAndUpdateFunctionStateLeft = fetchFunctionData(leftParamValue, setLeftFunctionData, setLeftFunctionLoading);
      const fetchDataAndUpdateFunctionStateRight = fetchFunctionData(rightParamValue, setRightFunctionData, setRightFunctionLoading);
      fetchDataAndUpdateStateLeft();
      fetchDataAndUpdateFunctionStateLeft();
      fetchDataAndUpdateStateRight();
      fetchDataAndUpdateFunctionStateRight();
    }
  }, [leftParamValue, rightParamValue]);

  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  if (leftBannerData) {
    var leftBanner =(
      <BannerHeaderCompare
        key={leftBannerData.dll.name+"left"}
        gridArea="1 / 1 / 2 / 2"
        avatar={avatar}
        name={leftBannerData.dll.name}
        description={leftBannerData.dll.description}
        sha256={leftBannerData.sha256}
        signing_date={leftBannerData.signing_date}
        version={leftBannerData.version}
        size={leftBannerData.size}
        virtual_size={leftBannerData.virtual_size}
        function_count={leftBannerData.function_count}
        id={leftBannerData.id}
      />
    );
  }

  if (rightBannerData) {
    var rightBanner =(
      <BannerHeaderCompare
        key={rightBannerData.dll.name+"right"}
        gridArea="1 / 1 / 2 / 2"
        avatar={avatar}
        name={rightBannerData.dll.name}
        description={rightBannerData.dll.description}
        sha256={rightBannerData.sha256}
        signing_date={rightBannerData.signing_date}
        version={rightBannerData.version}
        size={rightBannerData.size}
        virtual_size={rightBannerData.virtual_size}
        function_count={rightBannerData.function_count}
        id={rightBannerData.id}
      />
    );
  }

  var consistentFunctionComponents = (
    <AbsoluteCenter p='4' color='white' axis='both'>
        <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </AbsoluteCenter>
  )

  var removedFunctionComponents = (
    <AbsoluteCenter p='4' color='white' axis='both'>
        <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </AbsoluteCenter>
  )

  var changedFunctionComponents = (
    <AbsoluteCenter p='4' color='white' axis='both'>
        <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </AbsoluteCenter>
  )

  var addedFunctionComponents = (
    <AbsoluteCenter p='4' color='white' axis='both'>
        <Spinner
        thickness='4px'
        speed='0.65s'
        emptyColor='gray.200'
        color='blue.500'
        size='xl'
      />
    </AbsoluteCenter>
  )

  var selectedFunctionCode = (         
    <Code mt="20px" width="100%">
 <pre>
 </pre>
</Code>)

  if (leftFunctionData && rightFunctionData ) {
    console.log("doing function diffing")

    // getChangedFunctions also returns functions which are consistent when LAB_* and DAT_* 
    // are made memory position agnostic
    var changedAndConsistentFunctions = getChangedFunctions(leftFunctionData, rightFunctionData);
    var changedFunctions = changedAndConsistentFunctions[0];
    var consistentFunctions = changedAndConsistentFunctions[1];
    
    console.log("consistent functions" + consistentFunctions.length)
    console.log("consistent exact: " + getConsistentFunctions(leftFunctionData, rightFunctionData).length)
    
    consistentFunctions = consistentFunctions.concat(getConsistentFunctions(leftFunctionData, rightFunctionData));
    var removedFunctions = getRemovedFunctions(leftFunctionData, rightFunctionData);
    var addedFunctions = getAddedFunctions(leftFunctionData, rightFunctionData);

    consistentFunctionComponents = (
      <Select
        variant='flushed' 
        onChange={handleFunctionChange}
        placeholder="Select a function"
        options={consistentFunctions.map((option) => ({
          value: option.id,
          label: option.function_name
        }))} />)

    removedFunctionComponents = (
      <Select
      variant='flushed' 
      onChange={handleFunctionChange}
      placeholder="Select a function"
      options={removedFunctions.map((option) => ({
        value: option.id,
        label: option.function_name
      }))} />)
    

    changedFunctionComponents = (
      <Select
      variant='flushed' 
      onChange={handleFunctionChange}
      placeholder="Select a function"
      options={changedFunctions.map((option) => ({
        value: option.id,
        label: option.function_name
      }))} />)

  addedFunctionComponents = (
    <Select
    variant='flushed' 
    onChange={handleFunctionChange}
    placeholder="Select a function"
    options={addedFunctions.map((option) => ({
      value: option.id,
      label: option.function_name
    }))} />)

    // setDoneDiff(true)
    // this.forceUpdate()

  var functionInLeft = leftFunctionData.find((func) => func.function_name === selectedFunction)
  var functionInRight = rightFunctionData.find((func) => func.function_name === selectedFunction)

  if (functionInLeft && functionInRight) {
    if (functionInLeft.function_c_hash === functionInRight.function_c_hash) { 
      selectedFunctionCode = (         
     <ReactDiffViewer showDiffOnly={false} rightTitle={functionInRight.function_name} leftTitle={functionInLeft.function_name} splitView={false} useDarkTheme={true} oldValue={functionInLeft.function_c} newValue={functionInRight.function_c}  />
)    }
    else {
      selectedFunctionCode = (
      <ReactDiffViewer disableWordDiff={true} rightTitle={functionInRight.function_name} leftTitle={functionInLeft.function_name} useDarkTheme={true} oldValue={functionInLeft.function_c} newValue={functionInRight.function_c} splitView={true} />
        )
    }
  }
  else if (functionInLeft){
    selectedFunctionCode = (         
      <ReactDiffViewer showDiffOnly={false} leftTitle={functionInLeft.function_name} splitView={false} useDarkTheme={true} oldValue={functionInLeft.function_c}   />
      )
  }
  else if (functionInRight) {
    selectedFunctionCode = (         
      <ReactDiffViewer showDiffOnly={false} rightTitle={functionInRight.function_name} splitView={false} useDarkTheme={true} newValue={functionInRight.function_c}   />
      )
  }
}

  return (
    <Box>
      {leftLoading ? (
        // Render the spinning wheel while loading
        <Box position='relative' h='100px'>
  <AbsoluteCenter p='4' color='white' axis='both'>
    
  <Spinner
  thickness='4px'
  speed='0.65s'
  emptyColor='gray.200'
  color='blue.500'
  size='xl'
/>
  </AbsoluteCenter>
</Box>
      ) : (
        <>
        <Grid templateColumns='repeat(21, 1fr)' >
            <GridItem colSpan={10}>
              {leftBanner}
            </GridItem>
            <GridItem colSpan={1}>
              <Flex align="center" justify="center" h="100%">
                <Flex align="center" justify="center" direction="column">
                  <Button onClick={handleSwapClick} >
                    <Box>
                      <Icon as={MdCompareArrows} />
                    </Box>
                  </Button>
                </Flex>
              </Flex>
            </GridItem>
            <GridItem colSpan={10}>
              {rightBanner}
            </GridItem>
        </Grid>
                    <SimpleGrid
                      columns={{ base: 1, md: 2, lg: 4 }}
                      gap="20px"
                      mb="20px"
                    >
                        <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                          <Text fontWeight='bold' fontSize='l' mb={"10px"}>
                            Consistent Functions
                            </Text>
                            {consistentFunctionComponents}
                        </Card>

                        <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                          <Text fontWeight='bold' fontSize='l' mb={"10px"}>
                            Changed Functions
                            </Text>
                            {changedFunctionComponents}
                        </Card>

                        <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                          <Text  fontWeight='bold' fontSize='l'  mb={"10px"}>
                            Removed Functions
                            </Text>
                            {removedFunctionComponents}
                        </Card>

                        <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                          <Text fontWeight='bold' fontSize='l' mb={"10px"}>
                            Added Functions
                            </Text>
                            {addedFunctionComponents}
                        </Card>
                    </SimpleGrid>
            {selectedFunctionCode}
        </>
      )}
    </Box>
  );
}

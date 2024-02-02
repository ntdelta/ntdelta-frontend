import {
  Avatar,
  Box,
  Tag,
  Center,
  Code,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  AbsoluteCenter,
  Text,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import Select from 'react-select'

// Assets
import ReactDiffViewer from 'react-diff-viewer-continued';
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import BannerHeader from "views/admin/profile/components/BannerHeader";
import avatar from "assets/img/avatars/avatar4.png";
import React, { useState, useEffect } from "react";
import { MdAutoGraph, MdEqualizer, MdInsights, MdArrowBack,
  MdArrowForward } from "react-icons/md";
import { useLocation, Link } from 'react-router-dom';

function getTotalCount(apiResponse) {
  let totalCount = 0;

  for (const dllKey in apiResponse) {
    if (apiResponse.hasOwnProperty(dllKey)) {
      const dll = apiResponse[dllKey];
      totalCount += dll.count;
    }
  }

  return totalCount.toLocaleString();
}

function GetVersionAndUpdateMap(windowsUpdates){

  const windowsVersions = {};

  // Iterate over the updates and group them by Windows version
  for (const update of windowsUpdates) {
      const versionName = update.windows_version__name;

      // If the version doesn't exist in the object, create an empty array for it
      if (!windowsVersions.hasOwnProperty(versionName)) {
          windowsVersions[versionName] = [];
      }

      // Add the update to the corresponding version
      windowsVersions[versionName].push(update);
  }

  return windowsVersions;
}

function getTotalFunctionCount(apiResponse) {
  let totalCount = 0;

  for (const dllKey in apiResponse) {
    if (apiResponse.hasOwnProperty(dllKey)) {
      const dll = apiResponse[dllKey];
      totalCount += dll.function_count;
    }
  }

  return totalCount.toLocaleString();
}

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

export default function DllReport() {

  const handleFunctionChange = (selectedOption) => {
    setSelectedFunction(selectedOption.value);
  };

  const [bannerData, setBannerData] = useState(null);
  const [functionData, setFunctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [functionLoading, setFunctionLoading] = useState(true);
  const [paramValue, setParamValue] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);

  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newParamValue = params.get("id");
    setParamValue(newParamValue);
  }, [location.search]);

  useEffect(() => {
    if (paramValue) {
      setSelectedFunction(null);
      const fetchDataAndUpdateState = fetchData(paramValue, setBannerData, setLoading);
      const fetchDataAndUpdateFunctionState = fetchFunctionData(paramValue, setFunctionData, setFunctionLoading);
      fetchDataAndUpdateState();
      fetchDataAndUpdateFunctionState();
    }
  }, [paramValue]);

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");



  if (bannerData) {
    var banners =(
      <BannerHeader
        key={bannerData.dll.name}
        gridArea="1 / 1 / 2 / 2"
        avatar={avatar}
        name={bannerData.dll.name}
        description={bannerData.dll.description}
        sha256={bannerData.sha256}
        first_seen_date={bannerData.first_seen_date}
        version={bannerData.version}
        size={bannerData.size}
        virtual_size={bannerData.virtual_size}
        function_count={bannerData.function_count}
      />
    );
  }

  var functionComponents = (
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

  if (functionLoading == false && functionData) {

    const selectOptions = functionData.map((func) => ({
      value: func.id,
      label: func.function_name,
    }));
    
    functionComponents = (
      <Select
        onChange={handleFunctionChange}
        options={selectOptions}
      />

    )
  }

 var functionReady = !loading && !functionLoading && selectedFunction && functionData && bannerData ? functionData.find((func) => func.id === parseInt(selectedFunction)) : null
var codeBlock = null
if (!loading && !functionLoading && selectedFunction && functionData && bannerData && functionReady)  {
  codeBlock = (<ReactDiffViewer showDiffOnly={false} rightTitle={functionReady.function_name} leftTitle={functionReady.function_name} splitView={false} useDarkTheme={true} oldValue={functionReady.function_c} newValue={functionReady.function_c}  />)
}
  return (
    <Box>
      {loading ? (
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
            {banners}
            <Center>
            {Object.entries(GetVersionAndUpdateMap(bannerData.windows_updates)).map(([version, updates], index) => (
              <React.Fragment key={version}>
                <Tag mr={"5px"} size="md" variant="solid" colorScheme="blue">
                  {version}
                </Tag>
                {updates.map((update) => (
                  <Tag mr={"5px"} size="md" variant="solid" colorScheme="green"> {update.name} </Tag>
                ))}
              </React.Fragment>
            ))}
            </Center>
            <Box mt="20px">
                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 3 }}
                    gap="20px"
                    mb="20px"
                  >
                  <Link to={"/admin/dllinstance/?id=" + bannerData.prev_dll.id}>
                  <MiniStatistics
                    startContent={
                      <IconBox
                        w='56px'
                        h='56px'
                        bg={boxBg}
                        icon={
                          <Icon w='32px' h='32px' as={MdArrowBack} color={brandColor} />
                        }
                      />
                    }
                    name='Previous Version'
                    value={bannerData.prev_dll.version.split(" ")[0]}
                  />
                  </Link>
                  <MiniStatistics
                    startContent={
                      <IconBox
                        w='56px'
                        h='56px'
                        bg={boxBg}
                        icon={
                          <Icon w='32px' h='32px' as={MdAutoGraph} color={brandColor} />
                        }
                      />
                    }
                    name='Decompiled Functions'
                    value={bannerData.function_count.toLocaleString()}
                  />
                    <Link to={"/admin/dllinstance/?id=" + bannerData.next_dll.id}>

                    <MiniStatistics 
                    endContent={
                      <IconBox
                        w='56px'
                        h='56px'
                        bg={boxBg}
                        icon={
                          <Icon w='32px' h='32px' as={MdArrowForward} color={brandColor} />
                        }
                      />
                    }
                  name='Next Version' value={bannerData.next_dll.version.split(" ")[0]} />
                  </Link>
                    
                    </SimpleGrid>
          </Box>
          <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
              <Text fontWeight='bold' fontSize='xl' mb={"10px"}>
                Decompiled Functions
                </Text>
                {functionComponents}
            </Card>

          <Code mt="20px" width="100%">
            <pre>
              {  codeBlock }
            </pre>
          </Code>
        </>
      )}
    </Box>
  );
}

import {
  Box,
  Center,
  SimpleGrid,
  Spinner,
  AbsoluteCenter,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Link,
  Icon,
  TableContainer,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdAutoGraph, MdEqualizer, MdInsights, MdArrowBack,
  MdArrowForward } from "react-icons/md";
import IconBox from "components/icons/IconBox";
import Card from "components/card/Card.js";
import MiniStatistics from "components/card/MiniStatistics";
import { Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import BannerDLL from "views/admin/profile/components/BannerDLL";
import avatar from "assets/img/avatars/avatar4.png";
import { InsiderPreviewContext } from "index";
import { useContext } from "react";

// Assets
import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';

function fetchData(paramValue, setBannerData, setBackupBannerData, setLoading) {
  return async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.ntdelta.dev/api/dlls/" + paramValue);
      const data = await res.json();
      setBannerData(data);
      setBackupBannerData(JSON.parse(JSON.stringify(data)))
    } catch (error) {
      console.error("Error fetching banner data:", error);
    } finally {
      setLoading(false);
    }
  };
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

export default function DllReport() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paramValue, setParamValue] = useState(null);
  const [backupBannerData, setBackupBannerData] = useState(null);
  const { insiderPreview, setInsiderPreview } = useContext(InsiderPreviewContext);
  

  const location = useLocation();

  function filterInsiderPreview(data) {
    if (insiderPreview){
      return backupBannerData
    }
    const filteredInstances = data.instances.filter(instance => !instance.insider);
    data["instances"] = filteredInstances
    return (data);
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newParamValue = params.get("name");
    setParamValue(newParamValue);
  }, [location.search]);

  useEffect(() => {
    if (paramValue) {
      const fetchDataAndUpdateState = fetchData(paramValue, setBannerData, setBackupBannerData, setLoading);
      fetchDataAndUpdateState();
    }
  }, [paramValue]);

  let formatted_data = [];
  let formatted_data_size = [];
  var lowestSigningDate = 0;
  var newestSigningDate = 0;

  if (bannerData) {
    for (let i = 0; i < filterInsiderPreview(bannerData).instances.length; i++) {
      let item = filterInsiderPreview(bannerData).instances[i];
      let formatted_item = {
          name:  item.name,
          date:  new Date(item.signing_date),
          "Function Count": item.function_count
        };

      let formatted_item_size = {
          name:  item.name,
          date:  new Date(item.signing_date),
          Size : Math.round(item.size/1000)
        };
        formatted_data.push(formatted_item);
        formatted_data_size.push(formatted_item_size);
    }

    let filteredBannerData = bannerData
    lowestSigningDate = filteredBannerData.instances[0].version
    newestSigningDate = filteredBannerData.instances[filteredBannerData.instances.length - 1].version

  }
  
  formatted_data.sort((a, b) => a.name - b.name);

  var sortedBannerData = bannerData ? filterInsiderPreview(bannerData).instances.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true, sensitivity: 'base' })) : [];

  for (let i = 0; i < sortedBannerData.length; i++) {
    Object.entries(GetVersionAndUpdateMap(sortedBannerData[i].windows_updates)).forEach(([version, updates]) => {
      sortedBannerData[i].update_tags = <Tag  size="md" variant="solid" colorScheme="blue">{version}</Tag>
    }) 
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
            <Center>
            <SimpleGrid columns={{ base: 1, xl: 2,}} gap={"20px"}>
            <Box>
            <BannerDLL
                  key={filterInsiderPreview(bannerData).dll.name}
                  gridArea="1 / 1 / 2 / 2"
                  avatar={avatar}
                  name={paramValue}
                  description={filterInsiderPreview(bannerData).dll.description}
                  sha256={"bannerData.sha256"}
                  signing_date={"bannerData.signing_date"}
                  version={"bannerData.version"}
                  size={"bannerData.size"}
                  virtual_size={"bannerData.virtual_size"}
                  function_count={"bannerData.function_count"}
                />
              <SimpleGrid columns={{ base: 2, md: 2, lg: 2 }} gap="20px" mb="20px">
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
                    name='DLL Instances'
                    value={filterInsiderPreview(bannerData).instances.length}
                  />
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
                    value={ filterInsiderPreview(bannerData).instances.reduce((sum, instance) => sum + instance.function_count, 0).toLocaleString()}
                  />
              </SimpleGrid>
              <SimpleGrid columns={{ base: 2, md: 2, lg: 2 }} gap="20px" mb="20px">
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
                    name='First Seen'
                    value={lowestSigningDate}
                  />
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
                    name='Last Seen'
                    value={newestSigningDate}
                  />
                </SimpleGrid>
                </Box>
                <Box>
                <Text align="center" fontWeight='bold' fontSize='xl' mb={"10px"}>
                    Function Count
                </Text>
                <LineChart width={600} height={300} data={formatted_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="Function Count" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <YAxis />
                    <XAxis dataKey="date" hide={true}/>
                <Tooltip />
                </LineChart>
                <Text align="center" mt={"10px"} fontWeight='bold' fontSize='xl' mb={"10px"}>
                    Size
                </Text>
                <LineChart width={600} height={300} data={formatted_data_size} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="Size" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <YAxis />
                    <XAxis dataKey="date" hide={true}/>
                    <Tooltip/>
                </LineChart>
                </Box>
            </SimpleGrid>
              </Center>

            <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
            <Text mb={{ base: "0px", lg: "20px" }} fontWeight='bold' fontSize='xl'>
                DLL Instances
            </Text>
              <TableContainer>
                <Table variant='simple'>
                  {/* <TableCaption>Imperial to metric conversion factors</TableCaption> */}
                  <Thead>
                    <Tr>
                      <Th>DLL Version</Th>
                      <Th>OS Version</Th>
                      <Th>Size</Th>
                      <Th>Function Count</Th>
                      <Th>Hash</Th>
                      <Th></Th>
                      {/* <Th></Th> */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    { sortedBannerData.map(item => { 
                      return (
                        <Tr>
                          <Td>{item.version.split(" ")[0]}</Td>
                          <Td>
                          {Object.entries(GetVersionAndUpdateMap(item.windows_updates)).map(([version, updates]) => (
                            <React.Fragment key={version}>
                              <Tag mr={"5px"} size="md" variant="solid" colorScheme="blue">
                                {version}
                              </Tag>
         
                            </React.Fragment>
                          ))}
                          </Td>
                          <Td>{Math.round((item.size/1000))} KB</Td>
                          <Td>{item.function_count}</Td>
                          <Td>{item.sha256}</Td>
                          <Td>
                            <Link href={"/admin/dllinstance/?id="+item.id}>
                              <Button>Open</Button>
                            </Link>
                          </Td>
                          {/* <Td><Button>Download</Button></Td> */}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
        </>
      )}
    </Box>
  );
}

import {
  Box,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  AbsoluteCenter,
  Switch
} from "@chakra-ui/react";
// Assets
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import Banner from "views/admin/profile/components/Banner";
import avatar from "assets/img/avatars/avatar4.png";
import React, { useState, useEffect, useContext } from "react";
import { MdAutoGraph, MdEqualizer, MdInsights } from "react-icons/md";
import { InsiderPreviewContext } from "index";

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

function SortWindowsVersions(versions) {
  return versions.sort((a, b) => {
    const versionA = a.version.toLowerCase();
    const versionB = b.version.toLowerCase();
    
    if (versionA < versionB) {
      return -1;
    } else if (versionA > versionB) {
      return 1;
    }
    
    return 0;
  });
}

function findOldestUpdate(dll) {
  const windowsUpdates = dll.windows_updates;

  let oldestUpdate = null;

  for (const update of windowsUpdates) {
    if (!oldestUpdate || update.release_date > oldestUpdate.release_date) {
      oldestUpdate = update;
    }
  }

  return oldestUpdate;
}

function findNewestUpdate(dll) {
  const windowsUpdates = dll.windows_updates;

  let oldestUpdate = null;

  for (const update of windowsUpdates) {
    if (!oldestUpdate || update.release_date < oldestUpdate.release_date) {
      oldestUpdate = update;
    }
  }

  return oldestUpdate;
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


export default function UserReports() {
  const [bannerData, setBannerData] = useState(null);
  const [backupBannerData, setBackupBannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { insiderPreview, setInsiderPreview } = useContext(InsiderPreviewContext);

  function filterInsiderPreview(data) {
    if (insiderPreview) {
      return backupBannerData
    }

    const filteredData = {};
    for (const dllName in data) {
      const dllInfo = data[dllName];
      const filteredVersionMap = dllInfo.version_map.filter((versionInfo) => {
        return !insiderPreview ? !versionInfo.insider : true;
      });
  
      if (filteredVersionMap.length > 0) {
        dllInfo.version_map = filteredVersionMap;
        filteredData[dllName] = dllInfo;
      }
    }

    return filteredData;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://api.ntdelta.dev/api/dlls");
        const data = await res.json();

        setBannerData(data);
        setBackupBannerData(JSON.parse(JSON.stringify(data)))
      } catch (error) {
        console.error("Error fetching banner data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  
  if (bannerData) {
    var banners = Object.entries(filterInsiderPreview(bannerData)).map(([key, dll]) => (
      <Banner
        link_url={dll.last_dll?"/admin/dllinstance/?id=" + dll.last_dll.id : ""}
        key={key}
        gridArea="1 / 1 / 2 / 2"
        avatar={avatar}
        name={key}
        id={dll.first_dll.id}
        versions={ (insiderPreview == false) ? dll.version_map.length : dll.count}
        functions={dll.function_count.toLocaleString()}
        firstSeen={dll.first_dll ? new Date(Date.parse(dll.first_dll.signing_date)).toLocaleDateString() : "None"}
        lastSeen={dll.first_dll ? new Date(Date.parse(dll.last_dll.signing_date)).toLocaleDateString(): "None"}
        versionMap={[...dll.version_map].reverse()}
        firstWindowsVersion={dll.windows_versions ? dll.windows_versions.find(obj => obj.id === findOldestUpdate(dll.first_dll).windows_version).version :"" }
        lastWindowsVersion={dll.windows_versions ? dll.windows_versions.find(obj => obj.id === findNewestUpdate(dll.last_dll).windows_version).version :"" }
      />
    ));
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
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap="20px"
            mb="20px"
          >
          <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdEqualizer} color={brandColor} />
              }
            />
          }
          name='DLLs Tracked'
          value={Object.keys(bannerData).length}
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
          name='Unique DLLs Consumed'
          value={getTotalCount(bannerData)}
        />
        <MiniStatistics 
        startContent={
          <IconBox
            w='56px'
            h='56px'
            bg={boxBg}
            icon={
              <Icon w='32px' h='32px' as={MdInsights} color={brandColor} />
            }
          />
        }
       name='Functions' value={getTotalFunctionCount(bannerData)} />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap="20px">
            {banners}
          </SimpleGrid>
        </>
      )}

    </Box>
  );
}

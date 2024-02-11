import React, { useEffect, useState } from 'react';
import { Box, Text, Link, Flex, VStack, Code, Card, Heading, Button, Divider } from '@chakra-ui/react';
import ReactDiffViewer from 'react-diff-viewer-continued';

function DoubleUpFunctions(function_data) {
    const functionsCombined = {};
    function_data.patch_functions.forEach(func => {
        const { name } = func.function;
        const instanceId = func.function.instance_id;
        const funcDetails = {
            code: func.function.c_code,
            title: func.title,
            description: func.description,
            isExpanded: false // Initial state for each function's expand/collapse state
        };

        // Ensure the structure exists for both pre and post, initializing as undefined
        if (!functionsCombined[name]) {
            functionsCombined[name] = { func_pre: undefined, func_post: undefined };
        }

        if (instanceId === function_data.pre_patch_dll.id) {
            functionsCombined[name].func_pre = funcDetails;
        } else if (instanceId === function_data.post_patch_dll.id) {
            functionsCombined[name].func_post = funcDetails;
        }
    });

    // Map to the desired structure, checking for existence of pre and post details
    return Object.keys(functionsCombined).map(key => {
        const func = functionsCombined[key];
        // No need to provide default values for missing pre or post details here
        return {
            func_name: key,
            ...func
        };
    });
}



const PatchDetails = ({ id }) => {
  const [patchData, setPatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [functions, setFunctions] = useState([]);

  useEffect(() => {
    const fetchPatchData = async () => {
      try {
        const response = await fetch(`https://api.ntdelta.dev/api/patch/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPatchData(data);
        setFunctions(DoubleUpFunctions(data)); // Initialize functions with isExpanded state
      } catch (error) {
        console.error('Failed to fetch patch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatchData();
  }, [id]);

  const toggleExpand = (index) => {
    const updatedFunctions = [...functions];
    updatedFunctions[index].func_post.isExpanded = !updatedFunctions[index].func_post.isExpanded; // Sync expand/collapse state between pre and post
    setFunctions(updatedFunctions);
  };

  if (loading) return <Box>Loading...</Box>;
  if (!patchData) return <Box>Failed to load data.</Box>;

  return (
    <>
         <Card padding="4" bg="gray.100" maxW="6xl" margin="auto">
         <Button size="xs" position="absolute" top="1" right="1" onClick={() => window.location.href = `/admin/compare/?first_id=${patchData.pre_patch_dll.id}&second_id=${patchData.post_patch_dll.id}`}>View full diff</Button>
        <VStack spacing="5" align="stretch">
            <Heading align={"center"} as="h2" size="lg">{patchData.name} in {patchData.dll}</Heading>
            <Text align={"center"} fontSize="md">{patchData.description}</Text>
            <Link align={"center"} href={patchData.url} isExternal color="blue.500">{patchData.url}</Link>
            
            <Text align={"center"}>Pre-patch SHA256: 
            <Button ml="2" size="sm" onClick={() => window.location.href = `/admin/dllinstance/?id=${patchData.pre_patch_dll.id}`}>
            <Code>{patchData.pre_patch_dll.sha256}</Code>
            </Button>
            </Text>
            <Text align={"center"}>Post-patch SHA256: 
            <Button ml="2" size="sm" onClick={() => window.location.href = `/admin/dllinstance/?id=${patchData.post_patch_dll.id}`}>
            <Code>{patchData.post_patch_dll.sha256}</Code>
            </Button>
            </Text>
        </VStack>
        </Card>
        <Heading mt={"2"} mb={"2"} as="h2" size="lg" align={"center"}>Patched Functions</Heading>

        {functions.map((func, index) => (
        <Card key={index} bg="white" p="4" rounded="md" shadow="sm" mb={"4"} position="relative">
            <Button size="xs" position="absolute" top="1" right="1" onClick={() => toggleExpand(index)}>{func.func_pre?.isExpanded ? 'Collapse' : 'Expand'}</Button>
            <Heading as='h5' size='md' fontWeight="bold" align={"center"}>{func.func_name}</Heading>

            {func.func_post?.isExpanded && (
                <>
                <Flex direction={{ base: "column", md: "row" }} mt="4" gap="4" justify="center" align="stretch">
                    {func.func_pre && (
                        <Card fontSize="m" w={{ base: "100%", md: "50%" }} p="2">
                            <Heading align={"center"} as='h4' size='md'>Pre-Patch implementation</Heading>
                            <Heading mt={"2"} mb={"2"} as='h5' size='sm'>{func.func_pre.title}</Heading>
                            <Text>{func.func_pre.description}</Text>
                        </Card>
                    )}
                    {func.func_post && (
                        <Card fontSize="m" w={{ base: "100%", md: func.func_pre ? "50%" : "100%" }} p="2">
                            <Heading align={"center"} as='h4' size='md'>Post-Patch implementation</Heading>
                            <Heading mt={"2"} mb={"2"} as='h5' size='sm'>{func.func_post.title}</Heading>
                            <Text>{func.func_post.description}</Text>
                        </Card>
                    )}
                </Flex>
                    <Divider />
                    {func.func_pre ? 
                         <ReactDiffViewer disableWordDiff={true} rightTitle={func.func_name || ''} leftTitle={func.func_name || ''} useDarkTheme={true} oldValue={func.func_pre?.code || ''} newValue={func.func_post?.code || ''} splitView={true} />

                    : 
                        <ReactDiffViewer showDiffOnly={false} rightTitle={func.func_name} leftTitle={func.func_name || ''}  splitView={false} useDarkTheme={true} newValue={func.func_post?.code}   />
                    }
                </>
            )}
        </Card>
    ))}
    </>
  );
};

export default PatchDetails;

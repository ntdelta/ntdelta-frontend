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
                description: func.description
            };

            if (!functionsCombined[name]) {
                functionsCombined[name] = {};
            }

            if (instanceId === function_data.pre_patch_dll.id) {
                functionsCombined[name].func_pre = funcDetails;
            } else if (instanceId === function_data.post_patch_dll.id) {
                functionsCombined[name].func_post = funcDetails;
            }
        });

        return (Object.keys(functionsCombined).map(key => ({
            func_name: key,
            ...functionsCombined[key]
        })))
}
const PatchDetails = ({ id }) => {
  const [patchData, setPatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/patch/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPatchData(data);

        console.log(funcData)
      } catch (error) {
        console.error('Failed to fetch patch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatchData();
  }, [id]);

  if (loading) return <Box>Loading...</Box>;
  if (!patchData) return <Box>Failed to load data.</Box>;

  console.log(DoubleUpFunctions(patchData))

  return (
    <>
        <Card padding="4" bg="gray.100" maxW="6xl" margin="auto">
        <VStack spacing="5" align="stretch">
            <Heading align={"center"} as="h2" size="lg">{patchData.name}</Heading>
            <Text fontSize="md">{patchData.description}</Text>
            <Link href={patchData.url} isExternal color="blue.500">{patchData.url}</Link>
            
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

        <Heading mt={"2"} mb={"2"} as="h3" size="md" align={"center"}>Patched Functions</Heading>

        {DoubleUpFunctions(patchData).map((func, index) => (
        <>
            <Card key={index} bg="white" p="4" rounded="md" shadow="sm" mb={"4"}>
                <Heading  as='h3' size='lg' fontWeight="bold" align={"center"}>{func.func_name}</Heading>

                <Flex direction={{ base: "column", md: "row" }} mt="4" gap="4" justify="center" align="stretch">
                    <Card fontSize="m" w={{ base: "100%", md: "50%" }} p="2">
                        <Heading  align={"center"} as='h4' size='md' >{func.func_pre.title}</Heading>
                        <Text>{func.func_pre.description}</Text>
                    </Card>
                    <Card fontSize="m" w={{ base: "100%", md: "50%" }} p="2">
                        <Heading  align={"center"} as='h4' size='md'>{func.func_post.title}</Heading>
                        <Text>{func.func_post.description}</Text>
                    </Card>
                </Flex>
                <Divider />
                <ReactDiffViewer disableWordDiff={true} rightTitle={func.func_post.name} leftTitle={func.func_pre.name} useDarkTheme={true} oldValue={func.func_pre.code} newValue={func.func_post.code} splitView={true} />
            </Card>
        </>
        ))}
    </>
  );
};

export default PatchDetails;

import React, { useState, useEffect } from 'react';
import {
    Box, Button, Collapse, Flex, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, useToast, Card
} from '@chakra-ui/react';

const RecentChanges = ({ componentParam }) => {
    const [loading, setLoading] = useState(true);
    const [addedFunctions, setAddedFunctions] = useState([]);
    const [removedFunctions, setRemovedFunctions] = useState([]);
    const [currentPageAdded, setCurrentPageAdded] = useState(0);
    const [currentPageRemoved, setCurrentPageRemoved] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false); // Initially collapsed
    const pageSize = 10; // Items per page
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://api.ntdelta.dev/api/dlls/${componentParam}/diffs`);
                if (!response.ok) throw new Error('Network response was not ok');
                const jsonData = await response.json();
                setAddedFunctions(jsonData.function_diffs.added_functions);
                setRemovedFunctions(jsonData.function_diffs.removed_functions);
            } catch (error) {
                toast({
                    title: "Error fetching data",
                    description: error.toString(),
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [componentParam]);

    const renderTableData = (data, currentPage) => {
        const startIndex = currentPage * pageSize;
        const selectedFunctions = data.slice(startIndex, startIndex + pageSize);
        return selectedFunctions.map((func, index) => (
            <Tr key={index}>
                <Td>{func}</Td>
            </Tr>
        ));
    };

    const handlePageChange = (setPageFunction, currentPage, change) => {
        setPageFunction(currentPage + change);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <Box>
            <Button onClick={toggleCollapse} size="sm" mb="4">
                {isCollapsed ? 'Show Recent Changes' : 'Hide Recent Changes'}
            </Button>
            <Collapse in={!isCollapsed} animateOpacity>
                <Flex direction={{ base: "column", md: "row" }} gap="10">
                    {/* Added Functions Table */}
                    <Box flex="1">
                        <HStack justifyContent="space-between">
                            <Box>
                                <Text mb="4" fontSize="xl" fontWeight="bold">Recently Added Functions</Text>
                            </Box>
                            <HStack>
                                <Button
                                    onClick={() => handlePageChange(setCurrentPageAdded, currentPageAdded, -1)}
                                    isDisabled={currentPageAdded === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handlePageChange(setCurrentPageAdded, currentPageAdded, 1)}
                                    isDisabled={currentPageAdded >= Math.ceil(addedFunctions.length / pageSize) - 1}
                                >
                                    Next
                                </Button>
                            </HStack>
                        </HStack>
                        {loading ? (
                            <Spinner size="xl" />
                        ) : (
                            <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Function Name</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>{renderTableData(addedFunctions, currentPageAdded)}</Tbody>
                                </Table>
                            </Card>
                        )}
                    </Box>
                    {/* Removed Functions Table */}
                    <Box flex="1">
                        <HStack justifyContent="space-between">
                            <Text mb="4" fontSize="xl" fontWeight="bold">Recently Removed Functions</Text>
                            <HStack>
                                <Button
                                    onClick={() => handlePageChange(setCurrentPageRemoved, currentPageRemoved, -1)}
                                    isDisabled={currentPageRemoved === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => handlePageChange(setCurrentPageRemoved, currentPageRemoved, 1)}
                                    isDisabled={currentPageRemoved >= Math.ceil(removedFunctions.length / pageSize) - 1}
                                >
                                    Next
                                </Button>
                            </HStack>
                        </HStack>
                        {loading ? (
                            <Spinner size="xl" />
                        ) : (
                            <Card mb={{ base: "0px", lg: "20px" }} mt="20px" align='center'>
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Function Name</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>{renderTableData(removedFunctions, currentPageRemoved)}</Tbody>
                                </Table>
                            </Card>
                        )}
                    </Box>
                </Flex>
            </Collapse>
        </Box>
    );
};

export default RecentChanges;

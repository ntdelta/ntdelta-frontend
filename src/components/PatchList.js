// PatchList.js
import React, { useEffect, useState } from 'react';
import { SimpleGrid, Box, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const PatchList = () => {
  const [patches, setPatches] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/patches/')
      .then(response => response.json())
      .then(data => setPatches(data))
      .catch(error => console.error('Error fetching patches:', error));
  }, []);

  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
      {patches.map((patch, index) => (
        <Link key={index} to={`/admin/patch?id=${patch.id}`} style={{ textDecoration: 'none' }}>
          <Box p={4} shadow="md" borderWidth="1px" borderRadius="lg" _hover={{ shadow: "xl" }}>
            <VStack spacing={2}>
              <Text fontWeight="bold" fontSize="md">{patch.name} in {patch.dll}</Text>
              <Text fontSize="sm">{patch.description}</Text>
            </VStack>
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );
};

export default PatchList;

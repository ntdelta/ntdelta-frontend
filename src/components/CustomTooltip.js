import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dateString = label instanceof Date ? label.toLocaleDateString() : label;

    return (
      <Box bg="white" p="2" boxShadow="md" borderRadius="md">
        <Text fontSize="sm">Date: {dateString}</Text>
        <Text fontSize="sm">{payload[0].name}: {payload[0].value}</Text>
        <Text fontSize="sm">Version: {payload[0].payload.name.split(" ")[0]}</Text>
      </Box>
    );
  }

  return null;
};

export default CustomTooltip;

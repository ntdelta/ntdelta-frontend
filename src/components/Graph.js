import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Text } from 'recharts';
import CustomTooltip from './CustomTooltip';

const Graph = ({ title, data, dataKey, color }) => (
  <>
    <Text align="center" fontWeight='bold' fontSize='xl' mb={"10px"}>
      {title}
    </Text>
    <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <Line type="monotone" dataKey={dataKey} stroke={color} />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <YAxis />
      <XAxis dataKey="date" hide={true} />
      <Tooltip content={<CustomTooltip />} />
    </LineChart>
  </>
);

export default Graph;

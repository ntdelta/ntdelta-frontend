import {
  Box,
  Center,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
} from "@chakra-ui/react";

// Assets
import React, { useState, useEffect } from "react";


const steps = [
  { title: 'Track more DLLs', description: 'Expand NtDelta to track more System 32 DLLs' },
  { title: 'Include Insider Preview DLLs', description: '' },
  { title: 'Allow tagging of funcion diffs', description: 'Users will be able to tag an interesting patch diff with "CVE-2023-12345" etc' },
  { title: 'Get a sponsor', description: 'A sponsor to cover the AWS bill would be nice...' },
  { title: 'Move to IDA Decompilation', description: 'IDA Pro licence required' },
]

export default function roadmap() {

  return (
    <Center mt={"30px"}>
      <Stepper orientation='vertical' height='400px' gap='0'>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    </Center>
  )
}

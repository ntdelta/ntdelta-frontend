import React, { useState } from 'react';
import { Button, Tooltip, useClipboard } from '@chakra-ui/react';

const CopyButton = ({ textToCopy }) => {
  const developerPrompt = "I am a reverse engineer, looking at Ghidra decompilations. I have two versions of the same DLL and am looking to see what has changed between their function implementations. I will display the two decompilations, your job is to tell me what has changed. I want you to focus on changes to the logic and let me know if any of the changes look like they are adding in security checks, additional function calls, or altering control-flow. Use technical language, do not speculate, and get straight to the point. After you are done, try to re-write the function in C and add some comments where the changes lie. Also try to guess some of the types based on their size and rename any variables you can infer the names of. Here they are:\n"
  const { hasCopied, onCopy } = useClipboard(developerPrompt + textToCopy);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = () => {
    onCopy();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <Tooltip label={hasCopied ? "Copied" : "Copy"} isOpen={showTooltip}>
      <Button size="xs" colorScheme="gray" mb="1" onClick={handleCopy}>{hasCopied ? "Copied" : "ChatGPT"}</Button>
    </Tooltip>
  );
};

export default CopyButton;

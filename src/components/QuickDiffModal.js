import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory from react-router-dom
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
} from '@chakra-ui/react';

export default function QuickDiffModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const history = useHistory(); // Instantiate useHistory hook for navigation
    const initialRef = React.useRef(null);

    const [firstSHA256, setFirstSHA256] = useState('');
    const [secondSHA256, setSecondSHA256] = useState('');
    const [firstErrorMessage, setFirstErrorMessage] = useState('');
    const [secondErrorMessage, setSecondErrorMessage] = useState('');
    const [firstDLLInstanceID, setFirstDLLInstanceID] = useState(null);
    const [secondDLLInstanceID, setSecondDLLInstanceID] = useState(null);

    const goToDiff = () => {
        onClose();

        history.push(`/admin/compare/?first_id=${firstDLLInstanceID}&second_id=${secondDLLInstanceID}`);
    };

    // Validate SHA256 (64 hexadecimal characters)
    const isValidSHA256 = (hash) => /^[a-fA-F0-9]{64}$/.test(hash);

    useEffect(() => {
        // Function to fetch DLL Instance data
        const fetchDLLInstance = async (sha256, setDLLInstanceID, setError) => {
            if (isValidSHA256(sha256)) {
                try {
                    const response = await fetch(`https://api.ntdelta.dev/api/dlls/instances/sha256?sha256=${sha256}`);
                    if (!response.ok) {
                        throw new Error('DLL Instance not found.');
                    }
                    const data = await response.json();
                    setDLLInstanceID(data.id); // Update based on your actual API response structure
                    setError(''); // Clear error message
                } catch (error) {
                    console.error("API Error:", error);
                    setError(error.message);
                }
            } else if (sha256) {
                setError('Invalid SHA256 format.');
                setDLLInstanceID(null);
            } else {
                setError(''); // Clear error message if input is empty
                setDLLInstanceID(null);
            }
        };

        // Perform the lookup for the first SHA256
        fetchDLLInstance(firstSHA256, setFirstDLLInstanceID, setFirstErrorMessage);
        
        // Perform the lookup for the second SHA256
        fetchDLLInstance(secondSHA256, setSecondDLLInstanceID, setSecondErrorMessage);
    }, [firstSHA256, secondSHA256]); // This effect depends on changes to the SHA256 inputs

    return (
        <>
            <Button onClick={onOpen}>QuickDiff</Button>

            {isOpen && (
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>QuickDiff</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <FormControl>
                                <FormLabel>First SHA256</FormLabel>
                                <Input
                                    ref={initialRef}
                                    placeholder='First SHA256'
                                    value={firstSHA256}
                                    onChange={(e) => setFirstSHA256(e.target.value)}
                                />
                                {firstErrorMessage && <Text color="red.500">{firstErrorMessage}</Text>}
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Second SHA256</FormLabel>
                                <Input
                                    placeholder='Second SHA256'
                                    value={secondSHA256}
                                    onChange={(e) => setSecondSHA256(e.target.value)}
                                />
                                {secondErrorMessage && <Text color="red.500">{secondErrorMessage}</Text>}
                            </FormControl>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                colorScheme='blue'
                                mr={3}
                                onClick={goToDiff}
                                isDisabled={!(firstDLLInstanceID && secondDLLInstanceID)} // Disable button unless both IDs are available
                            >
                                Go To Diff
                            </Button>
                            <Button variant='ghost' onClick={onClose}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
}

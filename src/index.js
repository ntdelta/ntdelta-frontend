import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'assets/css/App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import AdminLayout from 'layouts/admin';
import QuickDiffModal from 'components/QuickDiffModal.js';
import { Link, Flex, Box, Image, ChakraProvider, Button, Icon } from '@chakra-ui/react';
import theme from 'theme/theme';
import { ThemeEditorProvider } from '@hypertheme-editor/chakra-ui';
import avatar from "assets/img/logos/NtDelta-logos_transparent.png";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

export const InsiderPreviewContext = React.createContext(null);

const App = () => {
    const [insiderPreview, setInsiderPreview] = React.useState(true);
    const [isNarrowScreen, setIsNarrowScreen] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(false);

    const toggleInsiderPreview = () => {
        setInsiderPreview(!insiderPreview);
    };

    const handleScroll = () => {
        const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
        setIsNearBottom(bottom);
    };

    const scrollToBottomOrTop = () => {
        if (isNearBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsNarrowScreen(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
      <ChakraProvider theme={theme}>
        <React.StrictMode>
          <InsiderPreviewContext.Provider value={{ insiderPreview, setInsiderPreview }}>
            <ThemeEditorProvider>
              <BrowserRouter>
                <Link to="/admin">
                  <Flex pt={{ base: "30px" }} maxHeight="sm" align="center" justify="center">
                    <a href="https://ntdelta.dev">
                        <Image maxWidth="sm" src={avatar} alt="senpai" />
                    </a>
                    <Box
                        position="fixed" 
                        top={isNearBottom ? "auto" : "10px"}
                        bottom={isNearBottom ? "10px" : "auto"}
                        left="10px"
                        zIndex="docked" 
                    >
                        <Flex align="center">
                            <QuickDiffModal/>
                            <Button onClick={scrollToBottomOrTop} ml={2} colorScheme="gray">
                                <Icon as={isNearBottom ? MdArrowUpward : MdArrowDownward}/>
                            </Button>
                        </Flex>
                    </Box>

                    <Box
                        position="absolute"
                        top="10px"
                        right="10px"
                    >
                        <Flex align="center">
                            <Button 
                                onClick={toggleInsiderPreview} 
                                colorScheme={insiderPreview ? "blue" : "gray"}
                                fontSize="sm"
                            >
                                {isNarrowScreen ? "IP" : "Insider Preview"}
                            </Button>
                        </Flex>
                    </Box>
                  </Flex>
                </Link>
                <Switch>
                  <Route path="/admin" component={AdminLayout} />
                  <Redirect from="/" to="/admin" />
                </Switch>
              </BrowserRouter>
            </ThemeEditorProvider>
          </InsiderPreviewContext.Provider>
        </React.StrictMode>
      </ChakraProvider>
    );
  };
  
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export default App;

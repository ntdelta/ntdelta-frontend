import React from 'react';
import ReactDOM from 'react-dom/client';
import 'assets/css/App.css';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import AdminLayout from 'layouts/admin';
import QuickDiffModal from 'components/QuickDiffModal.js';
import { Link, Flex, Box, Image, ChakraProvider, Switch as ChakraSwitch } from '@chakra-ui/react';
import theme from 'theme/theme';
import { ThemeEditorProvider } from '@hypertheme-editor/chakra-ui';
import avatar from "assets/img/logos/NtDelta-logos_transparent.png";

export const InsiderPreviewContext = React.createContext(null);

const App = () => {
    const [insiderPreview, setInsiderPreview] = React.useState(true);
    
    const toggleInsiderPreview = () => {
        console.log("Insider Preview: ", insiderPreview, " => ", !insiderPreview )

        // Toggle the insiderPreview state
        setInsiderPreview(!insiderPreview);
      };

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
                        position="absolute"
                        top="10px"
                        left="10px"
                    >
                        <Box flex="1" align="right">
                            <QuickDiffModal/>
                        </Box>
                    </Box>
                    <Box
                        position="absolute"
                        top="10px"
                        right="10px"
                    >
                        <Box flex="1" align="right">
                            <ChakraSwitch
                            isChecked={insiderPreview}
                            onChange={toggleInsiderPreview}
                            colorScheme="teal"
                            size="lg"
                            />
                        </Box>
                        <Box ml={3}>{insiderPreview ? "Insider Preview: On" : "Insider Preview: Off"}</Box>
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
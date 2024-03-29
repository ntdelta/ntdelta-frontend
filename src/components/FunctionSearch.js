import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Button, Card, CardHeader, CardBody } from '@chakra-ui/react';
import Select from 'react-select'
import Graph from 'components/ResponsiveGraph';
import { InsiderPreviewContext } from "index";

function removeLinesWithPattern(inputString, pattern) {
    const regex = new RegExp(pattern, 'g');
    return inputString.replace(regex, '');
}

function normalizeCode(inputString) {
    const patterns = [
        /DAT_[0-9A-Fa-f]+/g,
        /LAB_[0-9A-Fa-f]+/g,
        /code_[0-9A-Fa-f]+/g,
        /uRam[0-9A-Fa-f]+/g,
        /joined_r0x[0-9A-Fa-f]+/g,
    ];

    const replacement = {
        "DAT_": "DAT_0",
        "LAB_": "LAB_0",
        "code_": "code_0",
        "uRam": "uRam0",
        "joined_r0x": "joined_r0x00",
    };

    for (const pattern of patterns) {
        inputString = inputString.replace(pattern, (match) => {
            const prefix = Object.keys(replacement).find((key) => match.startsWith(key));
            return prefix ? replacement[prefix] : match;
        });
    }

    return inputString;
}

function getFunctionLength(inputString1) {
    // The hash is different. Is that just because the memory address was differnt?
    // We can anonymise the LAB_* and DAT_* variables to make the hash memory position agnostic
    const commentPattern = /\/\*.*\*\//g; // Pattern to match /*    */

    var agnosticLeftCode = normalizeCode(inputString1);

    agnosticLeftCode = agnosticLeftCode.replace("\\n", "")
    agnosticLeftCode = removeLinesWithPattern(agnosticLeftCode, commentPattern);

    const functionPointerRegex = /\*\((?:undefined\d*\s*\*\))?\s*\((?:[^\)]+)\)\s*=\s*(?:0[xX][0-9a-fA-F]+|\d+)\s*;/g;
    agnosticLeftCode = agnosticLeftCode.replace(functionPointerRegex, "functionPointer = 0;")
    return agnosticLeftCode.split(/\r|\r\n|\n/g).length;
}

function startsWithFUN(param) {
    console.log("check")
    var prefixes = ["FUN_", "_", "Gv", "@"]
    for (const prefix of prefixes) {
        if (param.startsWith(prefix)) {
          return false; // Exclude if it starts with any prefix
        }
      }
      return true; // Include if it doesn't start with any prefix
}

const FunctionSearch = ({ dllName }) => {
    const [functionNames, setFunctionNames] = useState([]);
    const [selectedFunction, setSelectedFunction] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { insiderPreview, setInsiderPreview } = useContext(InsiderPreviewContext);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const fetchFunctions = async () => {
        if (dllName) {
            const response = await fetch(`https://api.ntdelta.dev/api/functions?dll_name=${dllName}`);
            const data = await response.json();
            setFunctionNames(data.filter(startsWithFUN)); // Extract function names
        } else {
            setFunctionNames([]); // Clear function list if no DLL name
        }
    };

    const handleFunctionChange = (event) => {
        setSelectedFunction(event.value);
    };

    const fetchData = async () => {
        if (selectedFunction) {
            const response = await fetch(`https://api.ntdelta.dev/api/functions/search?function_name=${selectedFunction}&dll_name=${dllName}`);
            const data = await response.json();
            setSearchResult(data);
        }
    };

    useEffect(() => {
        fetchFunctions(); // Fetch function list on component mount
    }, [dllName]); // Re-fetch functions on DLL name change

    useEffect(() => {
        fetchData();
    }, [selectedFunction]); // Re-fetch data on function selection

    var functionSelectOptions = functionNames.map((name) => ({
        value: name,
        label: name,
    }))

    var formatted_data = []
    if (searchResult) {
        var local_searchResult = Object.create(searchResult)
        local_searchResult.functions = local_searchResult.functions.filter((func) => {
            return !insiderPreview ? !func.dll_instance.insider : true;
        });

        formatted_data = local_searchResult.functions.map((result) => ({
            name: result.dll_instance.dll_version,
            "Function Size": getFunctionLength(result.function.c_code),
            date: new Date(result.dll_instance.first_seen)
        }))
    }


    return (
        <div>
            <Button onClick={toggleCollapse} size="sm" mt={"4"} mb={(isCollapsed ? 0 : 4)} >
                {isCollapsed ? 'Track Function Changes' : 'Hide Function Changes'}
            </Button>
            <Collapse in={!isCollapsed} animateOpacity>
                <Select onChange={handleFunctionChange} options={functionSelectOptions} />
                {searchResult ? (
                    <div className="container" style={{ width: "100%", height: "400px", marginTop: "40px" }}>
                        <Graph
                            title=""
                            fillWidth={true}
                            data={formatted_data}
                            dataKey="Function Size"
                            color="#8884d8"
                        />
                    </div>
                ) : (
                    <div style={{ paddingTop: '200px' }}></div>
                )}
            </Collapse>
        </div>
    );
};

export default FunctionSearch;
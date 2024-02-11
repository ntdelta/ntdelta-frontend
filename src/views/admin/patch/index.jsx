import React from 'react';
import PatchDetail from "components/PatchDetail";
import { useLocation } from 'react-router-dom';

export default function Patch() {

  const location = useLocation();

  // Function to parse query parameters
  const useQuery = () => {
    return new URLSearchParams(location.search);
  };

  const query = useQuery();
  const id = query.get('id'); // Retrieve the "id" parameter from the URL

  return (
    <div>
      {id ? <PatchDetail id={id} /> : <p>No ID provided</p>}
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const BadExample = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://api.example.com/data');
      const result = await response.json();
      setData(result);

      // Ejemplo de manipulación directa del DOM
      const newElement = document.createElement('div');
    };

    fetchData();
  }, []);

  return (
    <div>
      {data && <span>{data}</span>}
    </div>
  );
};

export default BadExample;
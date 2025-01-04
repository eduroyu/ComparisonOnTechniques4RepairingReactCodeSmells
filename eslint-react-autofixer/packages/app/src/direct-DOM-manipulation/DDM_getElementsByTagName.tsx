import React, { useEffect } from 'react';

function MyComponent() {
    useEffect(() => {
        const allParas = document.getElementsByTagName('p');
        // Haz algo con los elementos
        console.log(allParas);
    }, []);

    return (
        <div>
            <p>Este es un párrafo 1</p>
            <p>Este es un párrafo 2</p>
            <p>Este es un párrafo 3</p>
        </div>
    );
}

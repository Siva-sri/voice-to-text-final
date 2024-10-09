import React, { useState, useEffect } from 'react';

export default function IdeaPrompter({ content }){
    const [idea, setIdea] = useState('');
    const [error, setError] = useState('');
    const [fullIdea, setFullIdea] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const generateIdea = async () => {
        console.log('Sending content:', content); // Log content to be sent
        try {
            const response = await fetch('http://localhost:4000/generate-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: content.content }), // Ensure sending only the necessary part
            });
            if (!response.ok) {
                throw new Error('Failed to fetch idea');
            }
            const data = await response.json();
            setFullIdea(data.idea || ''); // Assuming the response has an idea field
            setIdea('');
            setError(''); // Clear any previous error
            setIsTyping(true);
        } catch (error) {
            console.error('Error generating idea:', error);
            setError('Error generating idea. Please try again.'); // Set error state
        }
    };

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (isTyping && index < fullIdea.length) {
                setIdea((prev) => prev + fullIdea[index]);
                index++;
            } else if (index >= fullIdea.length) {
                clearInterval(typingInterval);
                setIsTyping(false); // Stop typing animation
            }
        }, 10); // Adjust speed of typing (ms)

        return () => clearInterval(typingInterval); // Cleanup interval on unmount
    }, [fullIdea, isTyping]);
    
    return (
        <div>
            <button onClick={generateIdea}>Generate Idea</button>
            {error && <p>{error}</p>} {/* Display error message */}
            {idea && <p>{idea}</p>} {/* Display generated idea */}
        </div>
    );
};

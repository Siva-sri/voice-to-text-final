import React, { useState, useEffect, useCallback } from 'react';

export default function IdeaPrompter({ content }) {
    const [idea, setIdea] = useState('');
    const [error, setError] = useState('');
    const [fullIdea, setFullIdea] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const fetchKeywords = useCallback(async (text) => {
        try {
            const response = await fetch('http://localhost:4000/extract-keywords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: text.content }), // Send only the content field
            });
            if (!response.ok) {
                throw new Error('Failed to fetch keywords');
            }
            const data = await response.json();
            generateIdeas(data.keywords);
        } catch (error) {
            console.error('Error fetching keywords:', error);
            setError('Error fetching keywords. Please try again.');
        }
    }, []);

    const generateIdeas = async (keywords) => {
        try {
            const refinedKeywords = keywords.map(kw => `Explore the concept of ${kw}`);
            const response = await fetch('http://localhost:4000/generate-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: refinedKeywords.join(' ') }), // Send refined keywords as input
            });
            if (!response.ok) {
                throw new Error('Failed to fetch idea');
            }
            const data = await response.json();
            setFullIdea(data.idea || '');
            setIdea('');
            setError('');
            setIsTyping(true);
        } catch (error) {
            console.error('Error generating idea:', error);
            setError('Error generating idea. Please try again.');
        }
    };

    const handleGenerateIdea = () => {
        fetchKeywords(content); // Trigger the keyword extraction and idea generation
    };

    useEffect(() => {
        let index = -1;
        const typingInterval = setInterval(() => {
            if (isTyping && index < fullIdea.length) {
                setIdea((prev) => prev + fullIdea[index]);
                index++;
            } else if (index >= fullIdea.length) {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 10); // Adjust speed of typing (ms)
        return () => clearInterval(typingInterval); // Cleanup interval on unmount
    }, [fullIdea, isTyping]);

    return (
        <div>
            <button onClick={handleGenerateIdea}>Generate Idea</button>
            {error && <p>{error}</p>}
            {idea && <p>{idea}</p>}
        </div>
    );
}

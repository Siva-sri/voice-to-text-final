import { useEffect,useState } from 'react';
import { Navigate } from 'react-router-dom';
import SpeechRecognition,{useSpeechRecognition} from 'react-speech-recognition';


export default function CreateVox(){
    const [transcribing, setTranscribing] = useState(false);
    const enableTranscribing = () => setTranscribing(true);
    const disableTranscribing = () => setTranscribing(false);
    const {transcript, browserSupportsSpeechRecognition, resetTranscript} = useSpeechRecognition({transcribing});
    const [isTitle, setIsTitle] = useState(false);
    const [isContent, setIsContent] = useState(false);
    const [isSum, setIsSum] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [redirect, setRedirect] = useState(false);
    useEffect(()=>{
        if(isTitle){
            setTitle(transcript);
        }else if(isContent){
            setContent(transcript);
        }else if(isSum){
            setSummary(transcript);
        }
    },[isTitle,isSum,isContent,title,summary,content,transcript]);


    async function createNewVox(e){
        e.preventDefault();
        const response = await fetch('http://localhost:4000/post',{
            method: 'POST',
            body: JSON.stringify({title,summary,content}),
            headers: {'Content-Type':'application/json'},
            credentials: 'include'
        });
        if(response.ok){
            setRedirect(true);
        }
    }
    //******************************************Title Section********************************************************//
    function clickStartTitle(e){
        e.preventDefault();
        SpeechRecognition.startListening({continuous: true});
        setIsTitle(true);
    }
    function clickStopTitle(e){
        e.preventDefault();
        SpeechRecognition.stopListening();
        setIsTitle(false);
        resetTranscript();
    }
    function clickEditTitle(e){
        e.preventDefault();
        setIsTitle(true);
    }


    //******************************************Summary Section********************************************************//
    function clickStartSum(e){
        e.preventDefault();
        SpeechRecognition.startListening({continuous: true});
        setIsSum(true);
    }
    function clickStopSum(e){
        e.preventDefault();
        SpeechRecognition.stopListening();
        setIsSum(false);
        resetTranscript();
    }
    function clickEditSum(e){
        e.preventDefault();
        setIsSum(true);
    }
    //******************************************Content Section*******************************************************//
    function clickStartContent(e){
        e.preventDefault();
        SpeechRecognition.startListening({continuous: true});
        setIsContent(true);
    }    
    function clickStopContent(e){
        e.preventDefault();
        SpeechRecognition.stopListening();
        setIsContent(false);
        resetTranscript();
    }
    function clickEditContent(e){
        e.preventDefault();
        setIsContent(true);
    }


    if(!browserSupportsSpeechRecognition){
        return <p>Browser doesn't support speech recognition. Sorry for inconvinience.</p>;
    }
    if(redirect){
        return <Navigate to={'/index'} />
    }
    return(
        <>
            <form className='create' onSubmit={createNewVox}>
                <input type='text' placeholder='Title' className='title'
                       value={title} onInput={(e)=>setTitle(e.target.value)}
                       onFocus={enableTranscribing} onBlur={disableTranscribing}></input>
                <div className='btn-container'>
                    {title==='' && <button onClick={clickStartTitle}>Start</button>}
                    {isTitle && <button onClick={clickStopTitle}>Stop</button>}
                    {title!==''&& <button onClick={clickEditTitle}>Voice Edit</button>}
                </div>
                <input type='text' placeholder='Summary' className='summary'
                       value={summary} onInput={(e)=>setSummary(e.target.value)}
                       onFocus={enableTranscribing} onBlur={disableTranscribing}></input>
                <div className='btn-container'>
                    {summary==='' && <button onClick={clickStartSum}>Start</button>}
                    {isSum && <button onClick={clickStopSum}>Stop</button>}
                    {summary!==''&& <button onClick={clickEditSum}>Voice Edit</button>}
                </div>
                <textarea className='area' placeholder='Content'
                        value={content} onChange={(e)=>setContent(e.target.value)}
                        onFocus={enableTranscribing} onBlur={disableTranscribing}></textarea>
                <div className='btn-container'>
                    {content===''&& <button  onClick={clickStartContent}>Start</button>}
                    {isContent && <button  onClick={clickStopContent}>Stop</button>}
                    {content!== ''&& <button onClick={clickEditContent}>Voice Edit</button>}
                </div>
                <button>Create</button>
            </form>
        </>
    );
}
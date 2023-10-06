import {useTypewriter, Cursor} from 'react-simple-typewriter';
import gif from "../gif/voice.gif";
export default function WelcomePage(){
    const [jobs] = useTypewriter({
        words: ['Affirmations','Blog Content','Lyrics','Social Media posts'],
        loop: {},
        typeSpeed: 120
    });
    return(
        <div className='welcome'>
            <h1>Create your{' '}
            <span>{jobs}</span> here
            <span><Cursor cursorStyle='<< '></Cursor></span>
            <img src={gif} alt="gif" />
            </h1>
        </div>
    );
}
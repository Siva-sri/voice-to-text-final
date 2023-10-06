import {formatISO9075} from "date-fns";
import { Link } from "react-router-dom";
export default function Create({_id,title,summary,author,createdAt}){
    return(
        <div className='create-post'>
            <div className='heading'>
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
            <p className='about'>
                <a href = {`/post/${_id}`} className='author'>{author.username}</a>
                <time>{formatISO9075(new Date(createdAt))}</time>
            </p>
            <p>{summary}</p>
            </div>
        </div>
    );
}
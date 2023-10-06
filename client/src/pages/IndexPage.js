import Create from "../component/Create";
import {useEffect, useState, useContext} from "react";
import { UserContext } from "../component/UserContext";


export default function IndexPage() {
  const [posts,setPosts] = useState([]);
  const {userInfo, setUserInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/post').then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, [setUserInfo]);
  return (
    <>
      {posts.length >0 && posts.filter(post => 
      (post?.author?.username === userInfo?.username)).map(create => (
        <Create {...create} /> ))}
    </>
  );
}
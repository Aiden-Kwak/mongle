import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CMainForm() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get('/api/community/posts/')
            .then(response => {
                setPosts(response.data);
            })
            .catch(error => console.log(error));
    }, []);

    return (
        <div className='commu-container'>
            <div className='total'>
                <p>통합 게시판</p>
                {posts.length > 0 ? (
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id}>{post.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p>등록된 게시물이 없습니다</p>
                )}
            </div>
            
        </div>
    );
}

export default CMainForm;

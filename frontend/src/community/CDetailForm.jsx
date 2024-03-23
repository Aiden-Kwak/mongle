import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getCookie } from '../snippets'; // getCookie 함수 임포트
import { UserContext } from '../UserContext'; // UserContext 임포트

function CDetailForm() {
  const { pk } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const { user } = useContext(UserContext); // UserContext를 사용해 현재 로그인한 사용자 정보를 가져옴
  const maskUsername = (username) => {
    return username.length > 2 ? `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}` : username;
  };

  useEffect(() => {
    axios.get(`/api/community/posts/${pk}/`)
      .then(response => {
        setPost(response.data);
      })
      .catch(error => console.log(error));

    axios.get(`/api/community/posts/${pk}/comments/`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => console.log(error));
  }, [pk]);

  const addComment = (e) => {
    e.preventDefault();
    const csrfToken = getCookie('csrftoken');
    axios.post(`/api/community/posts/${pk}/comments/create/`, { content: commentContent }, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      withCredentials: true
    })
      .then(response => {
        setComments([...comments, response.data]);
        setCommentContent('');
      })
      .catch(error => console.log(error));
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className='post-detail-container'>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div>
        조회수: {post.view_count}
      </div>
      <p className='commu-container__post-list-item-school'>{post.user.school_name}</p>
      <p className='commu-container__post-list-item-writer'>{maskUsername(post.user.username)}</p>
      {user ? (
        <form onSubmit={addComment} className="comment-form">
          <textarea
            className="comment-textarea"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="댓글을 입력하세요"
          ></textarea>
          <button
            type="submit"
            className="comment-submit-btn"
            disabled={commentContent.length <= 1} // 댓글 내용이 1글자 이하인 경우 버튼 비활성화
          >
            댓글 추가
          </button>
        </form>
      ) : (
        <p>댓글을 작성하려면 <a href="/login">로그인</a>해주세요.</p>
      )}
      <div className="comments-section">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item">
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CDetailForm;

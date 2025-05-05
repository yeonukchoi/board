import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // 상태 변수들 정의
  const [posts, setPosts] = useState([]); // 게시글 목록
  const [title, setTitle] = useState(''); // 글 제목 입력값
  const [content, setContent] = useState(''); // 글 내용 입력값
  const [activeMenu, setActiveMenu] = useState(null); // 현재 열린 메뉴의 글 ID
  const [editingPostId, setEditingPostId] = useState(null); // 수정 중인 게시글 ID
  const [editTitle, setEditTitle] = useState(''); // 수정할 제목
  const [editContent, setEditContent] = useState(''); // 수정할 내용
  const [showLoginForm, setShowLoginForm] = useState(false); // 로그인 폼 표시 여부
  const [showRegisterForm, setShowRegisterForm] = useState(false); // 회원가입 폼 표시 여부
  const [userName, setUserName] = useState(''); // 로그인/회원가입 아이디
  const [password, setPassword] = useState(''); // 로그인/회원가입 비밀번호
  const [userNickname, setUserNickname] = useState(''); // 회원가입 닉네임
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // JWT 토큰
  const [currentUserId, setCurrentUserId] = useState(null); // 현재 로그인한 유저 ID

  // 게시글 불러오기
  const fetchPosts = () => {
    axios.get('http://localhost:3000/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error('글 목록 불러오기 실패', err));
  };

  useEffect(() => {
    fetchPosts();

    // 토큰이 있을 경우 유저 정보 가져오기
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId);
    }
  }, [token]);

  // 글 작성
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    axios.post('http://localhost:3000/posts', { title, content }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setTitle('');
        setContent('');
        fetchPosts();
      })
      .catch(err => console.error('글 작성 실패', err));
  };

  // 글 삭제
  const handleDelete = (postId) => {
    axios.delete(`http://localhost:3000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchPosts())
      .catch(err => console.error('삭제 실패', err));
  };

  // 글 수정 시작
  const startEdit = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setActiveMenu(null);
  };

  // 글 수정 완료
  const submitEdit = () => {
    axios.put(`http://localhost:3000/posts/${editingPostId}`, {
      title: editTitle,
      content: editContent
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setEditingPostId(null);
        setEditTitle('');
        setEditContent('');
        fetchPosts();
      })
      .catch(err => console.error('수정 실패', err));
  };

  // 로그인 요청
  const handleLogin = () => {
    axios.post('http://localhost:3000/auth/login', { userName, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setShowLoginForm(false);
      })
      .catch(err => alert('로그인 실패'));
  };

  // 회원가입 요청
  const handleRegister = () => {
    axios.post('http://localhost:3000/auth/register', { userNickname, userName, password })
      .then(() => {
        alert('회원가입 성공');
        setShowRegisterForm(false);
      })
      .catch(err => alert('회원가입 실패'));
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUserId(null);
  };

  // 메뉴 토글
  const toggleMenu = (postId) => {
    setActiveMenu(activeMenu === postId ? null : postId);
  };

  return (
    <div className="container">
      {/* 상단 헤더 영역 */}
      <div className="header">
        <h1>게시판</h1>
        <div>
          {token ? (
            <button onClick={handleLogout}>로그아웃</button>
          ) : (
            <>
              <button onClick={() => setShowLoginForm(true)}>로그인</button>
              <button onClick={() => setShowRegisterForm(true)}>회원가입</button>
            </>
          )}
        </div>
      </div>

      {/* 로그인 폼 */}
      {showLoginForm && (
        <div className="modal">
          <h3>로그인</h3>
          <input placeholder="아이디" value={userName} onChange={e => setUserName(e.target.value)} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>로그인</button>
          <button onClick={() => setShowLoginForm(false)}>닫기</button>
        </div>
      )}

      {/* 회원가입 폼 */}
      {showRegisterForm && (
        <div className="modal">
          <h3>회원가입</h3>
          <input placeholder="닉네임" value={userNickname} onChange={e => setUserNickname(e.target.value)} />
          <input placeholder="아이디" value={userName} onChange={e => setUserName(e.target.value)} />
          <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleRegister}>가입</button>
          <button onClick={() => setShowRegisterForm(false)}>닫기</button>
        </div>
      )}

      {/* 글 작성 폼 */}
      <form onSubmit={handleSubmit} className="post-form">
        <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} />
        <button type="submit">글 작성</button>
      </form>

      {/* 게시글 목록 카드 형태 */}
      <div className="post-list">
        {posts.map(post => (
          <div key={post._id} style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            width: 'calc(33.33% - 20px)',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-in-out',
            marginBottom: '20px',
            color: 'black' // 글자색을 검정으로 설정
          }}>
            {editingPostId === post._id ? (
              <div>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} />
                <button onClick={submitEdit}>수정 완료</button>
                <button onClick={() => setEditingPostId(null)}>취소</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{post.title}</h3>
                  {/* 로그인 여부와 관계없이 항상 점 세개 버튼을 보이게 */}
                  <div onClick={() => toggleMenu(post._id)} style={{ cursor: 'pointer', fontSize: '24px' }}>⋮</div>
                </div>
                {/* 메뉴가 열리면 수정 및 삭제 옵션을 표시 */}
                {activeMenu === post._id && (
                  <div style={{
                    marginTop: '10px',
                    backgroundColor: '#f8f8f8',
                    padding: '10px',
                    borderRadius: '4px'
                  }}>
                    <div onClick={() => startEdit(post)} style={{ cursor: 'pointer', padding: '5px 0' }}>수정</div>
                    <div onClick={() => handleDelete(post._id)} style={{ color: 'red', cursor: 'pointer', padding: '5px 0' }}>삭제</div>
                  </div>
                )}
                <p>{post.content}</p>
              </>
            )}
          </div>
        ))}
      </div>



    </div>
  );
}

export default App;
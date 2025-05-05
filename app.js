const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const app = express();

//MongoDB연결
mongoose.connect('mongodb://localhost:27017/board')
.then(() => console.log('MongoDB 연결 완료'))
.catch((err) => console.error(err));

app.use(express.json());
app.use(cors());
//라우터
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);



app.listen(3000, () => {
    console.log('서버가 실행중입니다.');
});
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { authenticateToken } = require('./auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// GET /api/todos - 모든 할일 조회
router.get('/', async (req, res) => {
  try {
    const { completed, priority, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // 쿼리 조건 구성 (사용자별 필터링 추가)
    let query = { user: req.user._id };
    
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const todos = await Todo.find(query).sort(sortOptions);
    
    res.json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할일 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// GET /api/todos/:id - 특정 할일 조회
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할일 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// POST /api/todos - 새 할일 생성
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, tags } = req.body;
    
    // 필수 필드 검증
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '할일 제목은 필수입니다.'
      });
    }
    
    const todo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category ? category.trim() : '',
      tags: tags || [],
      user: req.user._id
    });
    
    const savedTodo = await todo.save();
    
    res.status(201).json({
      success: true,
      message: '할일이 성공적으로 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '할일 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// PUT /api/todos/:id - 할일 수정
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate, category, tags } = req.body;
    
    const updateData = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) updateData.category = category.trim();
    if (tags !== undefined) updateData.tags = tags;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '할일이 성공적으로 수정되었습니다.',
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '할일 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// PATCH /api/todos/:id/toggle - 할일 완료/미완료 토글
router.patch('/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    
    res.json({
      success: true,
      message: `할일이 ${updatedTodo.completed ? '완료' : '미완료'}로 변경되었습니다.`,
      data: updatedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할일 상태 변경 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// DELETE /api/todos/:id - 할일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '할일이 성공적으로 삭제되었습니다.',
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할일 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// GET /api/todos/stats/summary - 할일 통계 조회
router.get('/stats/summary', async (req, res) => {
  try {
    const userQuery = { user: req.user._id };
    const totalTodos = await Todo.countDocuments(userQuery);
    const completedTodos = await Todo.countDocuments({ ...userQuery, completed: true });
    const incompleteTodos = await Todo.countDocuments({ ...userQuery, completed: false });
    
    const priorityStats = await Todo.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await Todo.aggregate([
      { $match: userQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalTodos,
        completed: completedTodos,
        incomplete: incompleteTodos,
        completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
        priorityStats,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// GET /api/todos/due-soon - 마감일 임박 할일 조회
router.get('/due-soon', async (req, res) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const dueSoonTodos = await Todo.find({
      user: req.user._id,
      completed: false,
      dueDate: { $lte: threeDaysFromNow, $gte: new Date() }
    });
    
    res.json({
      success: true,
      count: dueSoonTodos.length,
      data: dueSoonTodos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '마감일 임박 할일 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;

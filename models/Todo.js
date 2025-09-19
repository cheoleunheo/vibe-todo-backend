const mongoose = require('mongoose');

// Todo 스키마 정의
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '할일 제목은 필수입니다.'],
    trim: true,
    maxlength: [100, '제목은 100자를 초과할 수 없습니다.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '설명은 500자를 초과할 수 없습니다.']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, '카테고리는 50자를 초과할 수 없습니다.']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '태그는 20자를 초과할 수 없습니다.']
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
  versionKey: false // __v 필드 제거
});

// 인덱스 설정 (검색 성능 향상)
todoSchema.index({ title: 'text', description: 'text' }); // 텍스트 검색용
todoSchema.index({ completed: 1 }); // 완료 상태별 조회용
todoSchema.index({ priority: 1 }); // 우선순위별 조회용
todoSchema.index({ dueDate: 1 }); // 마감일별 조회용
todoSchema.index({ category: 1 }); // 카테고리별 조회용

// 가상 필드: 마감일까지 남은 일수
todoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const diffTime = this.dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// JSON 변환 시 가상 필드 포함
todoSchema.set('toJSON', { virtuals: true });

// 인스턴스 메서드: 할일 완료 처리
todoSchema.methods.markAsCompleted = function() {
  this.completed = true;
  return this.save();
};

// 인스턴스 메서드: 할일 미완료 처리
todoSchema.methods.markAsIncomplete = function() {
  this.completed = false;
  return this.save();
};

// 정적 메서드: 완료된 할일 조회
todoSchema.statics.findCompleted = function() {
  return this.find({ completed: true });
};

// 정적 메서드: 미완료 할일 조회
todoSchema.statics.findIncomplete = function() {
  return this.find({ completed: false });
};

// 정적 메서드: 우선순위별 조회
todoSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority });
};

// 정적 메서드: 카테고리별 조회
todoSchema.statics.findByCategory = function(category) {
  return this.find({ category: category });
};

// 정적 메서드: 마감일 임박 조회 (3일 이내)
todoSchema.statics.findDueSoon = function() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  return this.find({
    completed: false,
    dueDate: { $lte: threeDaysFromNow, $gte: new Date() }
  });
};

// 미들웨어: 저장 전 검증
todoSchema.pre('save', function(next) {
  // 마감일이 과거인 경우 경고
  if (this.dueDate && this.dueDate < new Date() && !this.completed) {
    console.warn(`할일 "${this.title}"의 마감일이 이미 지났습니다.`);
  }
  next();
});

// 모델 생성 및 내보내기
const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;

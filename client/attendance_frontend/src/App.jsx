import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AttendancePage from './pages/AttendancePage';
import NotFoundPage from './pages/NotFoundPage';

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard Routes (will be protected later) */}
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/student/mark-attendance/:lectureId?" element={<AttendancePage />} />
        
        <Route path="/teacher/*" element={<TeacherDashboard />} />
        
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
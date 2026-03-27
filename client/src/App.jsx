import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Pantry from './pages/Pantry';
import Recommendations from './pages/Recommendations';
import Expenses from './pages/Expenses';
import Trending from './pages/Trending';
import Chatbot from './pages/Chatbot';
import MySaves from './pages/MySaves';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/saves" element={<ProtectedRoute><MySaves /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
      {user && <Footer />}
    </BrowserRouter>
  );
}

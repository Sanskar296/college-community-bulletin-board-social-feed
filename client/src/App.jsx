import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import CreateNotice from "./pages/CreateNotice";
import ForgotPassword from "./pages/ForgotPassword";
import Courses from "./components/Courses";
import Schedule from "./components/Schedule";
import Exams from "./components/Exams";
import Discussions from "./components/Discussions";
import Library from "./components/Library";
import HelpCenter from "./components/HelpCenter";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/create-notice" element={<CreateNotice />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/library" element={<Library />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
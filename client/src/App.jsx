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
import Notifications from "./pages/Notifications";
import Courses from "./components/Courses";
import Schedule from "./components/Schedule";
import Exams from "./components/Exams";
import Discussions from "./components/Discussions";
import Library from "./components/Library";
import HelpCenter from "./components/HelpCenter";
import Footer from "./components/Footer";
import AdminFacultyRequests from "./pages/AdminFacultyRequests";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-1 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route exact path="/home" element={<Home />} />
            <Route exact path="/post/:id" element={<PostDetail />} />
            <Route exact path="/profile/:username" element={<Profile />} />
            <Route exact path="/create-post" element={<CreatePost />} />
            <Route exact path="/create-notice" element={<CreateNotice />} />
            <Route exact path="/notifications" element={<Notifications />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/forgot-password" element={<ForgotPassword />} />
            <Route exact path="/courses" element={<Courses />} />
            <Route exact path="/schedule" element={<Schedule />} />
            <Route exact path="/exams" element={<Exams />} />
            <Route exact path="/discussions" element={<Discussions />} />
            <Route exact path="/library" element={<Library />} />
            <Route exact path="/help-center" element={<HelpCenter />} />
            <Route exact path="/admin/faculty-requests" element={<AdminFacultyRequests />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
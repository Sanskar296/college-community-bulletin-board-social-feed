"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Sidebar from "./CategorySidebar"

function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handlePostRedirect = () => {
    if (user) {
      navigate("/create-post")
    } else {
      navigate("/login", { state: { from: "/create-post" } })
    }
  }

  return (
    <>
      <nav className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {/* Triple-line menu bar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white text-2xl focus:outline-none md:hidden"
            >
              ☰
            </button>
            <Link to="/home" className="flex items-center space-x-2">
              <img src="../images/collegelogo.jpg" alt="Vishwaniketan Logo" className="h-10 w-10 rounded-full" />
              <span className="text-xl font-bold">Vishwaniketan Campus</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/home" className="hover:text-blue-200">
              Home
            </Link>
            <button
              onClick={handlePostRedirect}
              className="bg-white text-blue-600 px-4 py-1 rounded-full hover:bg-blue-100"
            >
              Post
            </button>
            {user ? (
              <>
                {user.username === "sanskarkumarFE23" && (
                  <Link to="/create-notice" className="bg-yellow-500 text-white px-4 py-1 rounded-full hover:bg-yellow-600">
                    Create Notice
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img 
                      src={user.avatar || "/images/default_profile.jpg"}
                      alt={`${user.username}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/default_profile.jpg";
                      }}
                    />
                    <span className="hidden md:inline">{user.username}</span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to={`/profile/${user.username}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
      >
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-600 text-2xl focus:outline-none"
          >
            ×
          </button>
        </div>
        <Sidebar onSelect={() => setIsSidebarOpen(false)} />
      </div>
    </>
  )
}

export default Navbar


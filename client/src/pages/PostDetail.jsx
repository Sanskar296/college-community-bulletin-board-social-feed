"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { FaArrowUp, FaArrowDown, FaComment, FaShare, FaBookmark, FaFlag, FaTrash, FaEdit } from "react-icons/fa"
import ApiService from "../services"
import { AuthContext } from "../context/AuthContext"
import Comment from "../components/Comment"

function PostDetail() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentContent, setCommentContent] = useState("")
  const [votes, setVotes] = useState(0)
  const [voteStatus, setVoteStatus] = useState(0)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await ApiService.get(`/posts/${id}`) // Fetch post from backend
        const fetchedPost = response.data

        setPost(fetchedPost)
        setVotes(fetchedPost.votes)
        setVoteStatus(fetchedPost.userVote || 0)
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleVote = async (newStatus) => {
    if (newStatus === voteStatus) {
      setVotes(votes - newStatus)
      setVoteStatus(0)
    } else {
      setVotes(votes - voteStatus + newStatus)
      setVoteStatus(newStatus)
    }

    try {
      await ApiService.post(`/posts/${id}/vote`, { vote: newStatus }) // Send vote to backend
    } catch (err) {
      console.error("Error voting:", err)
      setVotes(votes)
      setVoteStatus(voteStatus)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentContent.trim()) return

    try {
      const response = await ApiService.post(`/posts/${id}/comments`, {
        content: commentContent,
      })

      setPost({
        ...post,
        comments: [response.data, ...post.comments],
      })

      setCommentContent("")
    } catch (err) {
      console.error("Error posting comment:", err)
    }
  }

  const handleReply = async (commentId, content) => {
    try {
      const response = await ApiService.post(`/comments/${commentId}/replies`, {
        content,
      })

      const updatedComments = post.comments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data],
          }
        }
        return comment
      })

      setPost({
        ...post,
        comments: updatedComments,
      })
    } catch (err) {
      console.error("Error posting reply:", err)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      await ApiService.delete(`/posts/${id}`) // Delete post from backend
      navigate("/")
    } catch (err) {
      console.error("Error deleting post:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-md shadow-md p-8 text-center">
          <h2 className="text-xl font-medium mb-2">Post not found</h2>
          <p className="text-gray-500 mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-blue-500 hover:underline">
            Return to home page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {/* Post */}
        <div className="bg-white rounded-md shadow-md mb-6 overflow-hidden">
          <div className="flex">
            {/* Vote sidebar */}
            <div className="bg-gray-50 p-3 flex flex-col items-center">
              <button
                onClick={() => handleVote(1)}
                className={`p-1 ${voteStatus === 1 ? "text-orange-500" : "text-gray-400"} hover:text-orange-500`}
              >
                <FaArrowUp />
              </button>
              <span className="font-medium my-1">{votes}</span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-1 ${voteStatus === -1 ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
              >
                <FaArrowDown />
              </button>
            </div>

            {/* Post content */}
            <div className="p-4 w-full">
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium text-gray-700">c/{post.category}</span>
                <span> • Posted by </span>
                <Link to={`/profile/${post.author.username}`} className="hover:underline">
                  u/{post.author.username}
                </Link>
                <span> • {formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>

              <h1 className="text-2xl font-medium mb-3">{post.title}</h1>
              <div className="text-gray-800 mb-4 whitespace-pre-line">{post.content}</div>

              {post.image && (
                <div className="mb-4">
                  <img src={post.image} alt={post.title} className="max-h-96 object-contain" />
                </div>
              )}

              <div className="flex text-gray-500 text-sm border-t pt-3">
                <div className="flex items-center mr-4">
                  <FaComment className="mr-1" />
                  <span>{post.comments?.length || 0} Comments</span>
                </div>
                <button className="flex items-center mr-4 hover:text-blue-500">
                  <FaShare className="mr-1" />
                  <span>Share</span>
                </button>
                <button className="flex items-center mr-4 hover:text-blue-500">
                  <FaBookmark className="mr-1" />
                  <span>Save</span>
                </button>
                <button className="flex items-center hover:text-red-500">
                  <FaFlag className="mr-1" />
                  <span>Report</span>
                </button>

                {user && user._id === post.author._id && (
                  <>
                    <Link to={`/edit-post/${post._id}`} className="flex items-center ml-auto mr-4 hover:text-blue-500">
                      <FaEdit className="mr-1" />
                      <span>Edit</span>
                    </Link>
                    <button onClick={handleDeletePost} className="flex items-center hover:text-red-500">
                      <FaTrash className="mr-1" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comment form */}
        <div className="bg-white rounded-md shadow-md p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">Add a comment</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="What are your thoughts?"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={!commentContent.trim()}
                >
                  Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">You need to be logged in to comment</p>
              <Link to="/login" className="text-blue-500 hover:underline">
                Log in
              </Link>
              <span className="text-gray-500 mx-2">or</span>
              <Link to="/register" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-md shadow-md p-4">
          <h3 className="text-lg font-medium mb-4">Comments ({post.comments?.length || 0})</h3>

          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <Comment key={comment._id} comment={comment} onReply={handleReply} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">No comments yet. Be the first to comment!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
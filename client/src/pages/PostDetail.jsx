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
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        console.log('Fetching post with ID:', id);
        const response = await ApiService.getPost(id);
        console.log('Post details response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load post');
        }
        
        const fetchedPost = response.data;
        console.log('Fetched post data:', fetchedPost);

        setPost(fetchedPost)
        setVotes(fetchedPost.votes || 0)
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
    if (!user) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }
    
    // Optimistically update UI
    if (newStatus === voteStatus) {
      setVotes(votes - newStatus)
      setVoteStatus(0)
    } else {
      setVotes(votes - voteStatus + newStatus)
      setVoteStatus(newStatus)
    }

    try {
      const response = await ApiService.votePost(id, newStatus);
      console.log('Vote response:', response);
      
      if (!response.success) {
        // Revert UI on error
        setVotes(votes);
        setVoteStatus(voteStatus);
        setError("Failed to vote on post. Please try again.");
      }
    } catch (err) {
      console.error("Error voting:", err);
      // Revert UI on error
      setVotes(votes);
      setVoteStatus(voteStatus);
      setError("Failed to vote on post. Please try again.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }

    if (!commentContent.trim()) return;

    try {
      setLoading(true);
      const response = await ApiService.createComment(id, commentContent.trim());
      
      console.log('Comment submission response:', response);
      
      if (response.success && response.data) {
        // Update post with new comment
        setPost({
          ...post,
          comments: [response.data, ...(post.comments || [])],
          commentCount: (post.commentCount || 0) + 1
        });
        setCommentContent("");
        setError(null);
      } else {
        throw new Error(response.message || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId, content) => {
    try {
      const response = await ApiService.createReply(commentId, content);
      
      if (response.success && response.data) {
        const updatedComments = post.comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data],
            }
          }
          return comment
        });

        setPost({
          ...post,
          comments: updatedComments,
        });
      } else {
        console.error("Error posting reply:", response.message);
        setError("Failed to post reply. Please try again.");
      }
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to post reply. Please try again.");
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this post: ${post.title}`,
          url: window.location.href,
        });
        console.log('Post shared successfully');
      } catch (err) {
        console.error('Error sharing post:', err);
      }
    } else {
      // Fallback - copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }
    
    try {
      // This would require implementing a save/bookmark feature in the backend
      alert('Post saving feature coming soon!');
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

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

              {/* Post actions */}
              <div className="flex justify-between text-gray-500 mt-6 border-t pt-3">
                <div className="flex">
                  <div className="flex mr-6">
                    <button
                      onClick={() => handleVote(1)}
                      className={`p-1 mr-1 ${voteStatus === 1 ? "text-orange-500" : ""} hover:text-orange-500`}
                      title="Upvote"
                    >
                      <FaArrowUp />
                    </button>
                    <span className="mx-1 font-medium">{votes}</span>
                    <button
                      onClick={() => handleVote(-1)}
                      className={`p-1 ml-1 ${voteStatus === -1 ? "text-blue-500" : ""} hover:text-blue-500`}
                      title="Downvote"
                    >
                      <FaArrowDown />
                    </button>
                  </div>

                  <button className="flex items-center mr-6 hover:text-blue-500" title="Comments">
                    <FaComment className="mr-1" />
                    <span>{post.commentCount || post.comments?.length || 0} Comments</span>
                  </button>
                </div>

                <div className="flex">
                  <button onClick={handleShare} className="flex items-center mr-6 hover:text-blue-500" title="Share">
                    <FaShare className="mr-1" />
                    <span>Share</span>
                  </button>
                  <button onClick={handleSave} className="flex items-center hover:text-blue-500" title="Save">
                    <FaBookmark className="mr-1" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Post image (larger size in detail view) */}
              {post.image && (
                <div className="mt-4">
                  <img
                    src={post.image.fullUrl || `http://localhost:5000${post.image.path}`}
                    alt={post.title}
                    className="max-w-full rounded-md cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                    onError={(e) => {
                      console.error('Image load error:', e.target.src);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}

              <div className="flex text-gray-500 text-sm border-t pt-3">
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

        {/* Lightbox for image viewing */}
        {lightboxOpen && post.image && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="max-w-4xl max-h-[90vh]">
              <img 
                src={post.image.fullUrl || `http://localhost:5000${post.image.path}`}
                alt={post.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Comment form */}
        <div className="bg-white rounded-md shadow-md p-4 mt-4">
          <h3 className="font-medium text-lg mb-4">Comments</h3>
          
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentContent.trim() || loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md mb-6 text-center">
              <p className="text-gray-600 mb-2">You need to be logged in to comment</p>
              <Link to="/login" state={{ from: `/post/${id}` }} className="text-blue-500 hover:underline">
                Log in
              </Link>
            </div>
          )}

          {/* Comments list */}
          {post.comments?.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="border-b pb-4">
                  <div className="flex justify-between">
                    <div className="flex items-center mb-2">
                      <img
                        src={comment.author?.avatar || "/default-avatar.png"}
                        alt={comment.author?.username || "User"}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="font-medium">
                        {comment.author?.username || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="ml-10 text-gray-800">{comment.content}</p>
                  
                  <div className="mt-2 ml-10 flex items-center text-sm text-gray-500">
                    <button className="mr-4 hover:text-blue-500">Reply</button>
                    <button className="hover:text-blue-500">Report</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
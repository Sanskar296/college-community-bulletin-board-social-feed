"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { FaArrowUp, FaArrowDown, FaComment, FaShare, FaBookmark } from "react-icons/fa"
import ApiService from "../services"

function PostCard({ post, isDetailView = false }) {
  const [votes, setVotes] = useState(post.votes);
  const [voteStatus, setVoteStatus] = useState(post.userVote || 0);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleVote = async (newStatus) => {
    // Optimistically update the UI
    if (newStatus === voteStatus) {
      setVotes(votes - newStatus)
      setVoteStatus(0)
    } else {
      setVotes(votes - voteStatus + newStatus)
      setVoteStatus(newStatus)
    }

    try {
      // Make API call to update the vote in the backend
      await ApiService.post(`/posts/${post._id}/vote`, { vote: newStatus })
    } catch (err) {
      console.error("Error voting:", err)
      setError("Failed to update vote. Please try again.")

      // Revert the UI changes if the API call fails
      setVotes(votes)
      setVoteStatus(voteStatus)
    }
  }

  const getImageUrl = (post) => {
    if (!post.image?.path) return null;
    return `http://localhost:5000${post.image.path}`;
  };

  const formatDateDistance = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  const renderPostContent = () => {
    if (!post.content) return null;
    const maxLength = 300;
    if (post.content.length > maxLength) {
      return (
        <>
          {post.content.substring(0, maxLength)}...
          <Link to={`/post/${post._id}`} className="text-blue-500 hover:underline">
            Read more
          </Link>
        </>
      );
    }
    return post.content;
  };

  const renderAuthor = () => {
    if (!post.author) return 'Unknown user';
    
    return (
      <Link 
        to={`/profile/${post.author.username}`} 
        className="hover:underline font-medium"
      >
        {post.author.firstname} {post.author.lastname}
        <span className="text-gray-500 font-normal"> (@{post.author.username})</span>
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-md shadow-md mb-4 overflow-hidden">
      <div className="flex">
        {/* Vote sidebar */}
        <div className="bg-gray-50 p-2 flex flex-col items-center">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 ${voteStatus === 1 ? "text-orange-500" : "text-gray-400"} hover:text-orange-500`}
          >
            <FaArrowUp />
          </button>
          <span className="font-medium text-xs my-1">{votes}</span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 ${voteStatus === -1 ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
          >
            <FaArrowDown />
          </button>
        </div>

        {/* Post content */}
        <div className="p-3 w-full">
          {/* Post metadata */}
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium text-gray-700">c/{post.category}</span>
            <span> • Posted by </span>
            {renderAuthor()}
            <span> • {formatDateDistance(post.createdAt)}</span>
          </div>

          {/* Post title */}
          {isDetailView ? (
            <h1 className="text-2xl font-medium mb-2">{post.title}</h1>
          ) : (
            <Link to={`/post/${post._id}`}>
              <h2 className="text-lg font-medium mb-2 hover:text-blue-600">{post.title}</h2>
            </Link>
          )}

          {/* Post content */}
          <div className="text-gray-800 mb-3">
            {renderPostContent()}
          </div>

          {/* Post image */}
          {post.image && (
            <div className="mb-3">
              <img
                src={getImageUrl(post)}
                alt={post.title}
                className={`${isDetailView ? 'max-w-full' : 'max-h-96'} w-full object-cover rounded-md cursor-pointer`}
                onClick={() => setLightboxOpen(true)}
                onError={(e) => {
                  console.error('Image load error:', post._id);
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.png';
                }}
              />
              {lightboxOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                  onClick={() => setLightboxOpen(false)}
                >
                  <div className="max-w-4xl max-h-[90vh] relative">
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${post.image.path}`}
                      alt={post.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post actions */}
          <div className="flex text-gray-500 text-sm">
            <Link to={`/post/${post._id}`} className="flex items-center mr-4 hover:text-blue-500">
              <FaComment className="mr-1" />
              <span>{post.commentCount} Comments</span>
            </Link>
            <button className="flex items-center mr-4 hover:text-blue-500">
              <FaShare className="mr-1" />
              <span>Share</span>
            </button>
            <button className="flex items-center hover:text-blue-500">
              <FaBookmark className="mr-1" />
              <span>Save</span>
            </button>
          </div>

          {/* Error message */}
          {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        </div>
      </div>
    </div>
  )
}

export default PostCard
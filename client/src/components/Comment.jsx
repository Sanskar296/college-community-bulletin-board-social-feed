"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { FaArrowUp, FaArrowDown, FaReply, FaFlag } from "react-icons/fa"

function Comment({ comment, onReply, level = 0 }) {
  const [votes, setVotes] = useState(comment.votes)
  const [voteStatus, setVoteStatus] = useState(comment.userVote || 0)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")

  const maxLevel = 3 // Maximum nesting level

  const handleVote = (newStatus) => {
    // Toggle vote if clicking the same button
    if (newStatus === voteStatus) {
      setVotes(votes - newStatus)
      setVoteStatus(0)
    } else {
      // Update vote count: remove previous vote if any, then add new vote
      setVotes(votes - voteStatus + newStatus)
      setVoteStatus(newStatus)
    }

    // Here you would make an API call to update the vote in the backend
  }

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (replyContent.trim()) {
      onReply(comment._id, replyContent)
      setReplyContent("")
      setShowReplyForm(false)
    }
  }

  return (
    <div className={`mb-3 ${level > 0 ? "ml-6 pl-4 border-l-2 border-gray-200" : ""}`}>
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex flex-col items-center mr-2">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 ${voteStatus === 1 ? "text-orange-500" : "text-gray-400"} hover:text-orange-500`}
          >
            <FaArrowUp size={12} />
          </button>
          <span className="text-xs my-1">{votes}</span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 ${voteStatus === -1 ? "text-blue-500" : "text-gray-400"} hover:text-blue-500`}
          >
            <FaArrowDown size={12} />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          {/* Comment metadata */}
          <div className="text-xs text-gray-500 mb-1">
            <Link to={`/profile/${comment.author.username}`} className="font-medium hover:underline">
              {comment.author.username}
            </Link>
            <span> • {formatDistanceToNow(new Date(comment.createdAt))} ago</span>
          </div>

          {/* Comment text */}
          <div className="text-sm text-gray-800 mb-2">{comment.content}</div>

          {/* Comment actions */}
          <div className="flex text-xs text-gray-500 mb-2">
            {level < maxLevel && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center mr-3 hover:text-blue-500"
              >
                <FaReply className="mr-1" />
                <span>Reply</span>
              </button>
            )}
            <button className="flex items-center hover:text-red-500">
              <FaFlag className="mr-1" />
              <span>Report</span>
            </button>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mb-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Write a reply..."
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Reply
                </button>
              </div>
            </form>
          )}

          {/* Nested comments */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment key={reply._id} comment={reply} onReply={onReply} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Comment


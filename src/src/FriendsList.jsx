

import { useEffect, useRef, useState } from "react";
import "./FriendsList.css";

export default function FriendsList({
  setPrivateMessage,
  userchat,
  username,
  sendMessage,
  setPrivateRecipient,
}) {
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState("");
  const [selectedFriendName, setSelectedFriendName] = useState(null);

  const selectedFriend = userchat.find(
    (user) => user.friends === selectedFriendName
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (selectedFriend?.MessageList?.length) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedFriend?.MessageList?.length]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;

        sendMessage(selectedFriendName,messageText);
    setMessageText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="friends-container">
      {/* LEFT SIDE - FRIEND LIST */}
      <div className={`friends-sidebar ${selectedFriend ? "mobile-hidden" : ""}`}>
        <div className="sidebar-header">Chats-List</div>
        {userchat.length === 0 ? (
          <div className="empty-state">
            <p>No conversations</p>
          </div>
        ) : (
          userchat.map((user, index) => (
            <div
              key={user.username || index}
              onClick={() => setSelectedFriendName(user.friends)}
              className={`friend-item ${
                selectedFriendName === user.friends ? "active" : ""
              }`}
            >
              <div className="friend-name">{user.friends}</div>

              <div className="friend-last-message">
                {user.MessageList && user.MessageList.length > 0
                  ? user.MessageList[user.MessageList.length - 1].message
                  : "No messages yet"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT SIDE - CHAT AREA */}
      {selectedFriend && (
        <div className="chat-area">
          {/* Chat Header with back button */}
          <div className="chat-header" onClick={() => setSelectedFriendName(null)}>
            <span className="back-arrow">&#8592;</span>
            {selectedFriendName}
          </div>

          {/* Messages */}
          <div className="messages-container">
            {selectedFriend.MessageList && selectedFriend.MessageList.length > 0 ? (
              <>
                {selectedFriend.MessageList.map((m, index) => {
                  const isSentByMe = m.sendername === username;
                  return (
                    <div
                      key={index}
                      className={`message-row ${isSentByMe ? "sent" : "received"}`}
                    >
                      <div
                        className={`message-bubble ${
                          isSentByMe ? "sent" : "received"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="empty-state">
                <p>No messages yet</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="message-input-wrapper">
            <div className="input-inner">
              <input
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={handleSendMessage}
                className={`send-button ${
                  messageText.trim() ? "enabled" : "disabled"
                }`}
                disabled={!messageText.trim()}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
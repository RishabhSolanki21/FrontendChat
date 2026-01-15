import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './ChatApp.css';

// icon components
const Send = () => <span>📤</span>;
const Users = () => <span>👥</span>;
const MessageCircle = () => <span>💬</span>;
const LogOut = () => <span>🚪</span>;
const User = () => <span>👤</span>;

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [activeTab, setActiveTab] = useState('private');
  const [roomId, setRoomId] = useState('');
  const [joinedRoom, setJoinedRoom] = useState('');
  
  // Private chat 
  const [privateRecipient, setPrivateRecipient] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  
  // Group chat 
  const [groupMessage, setGroupMessage] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [privateMessages, groupMessages]);

  const connect = () => {
    const token = localStorage.getItem('jwt');
    const savedUsername = localStorage.getItem('username');
    
    if (!token || !savedUsername) {
      alert('Please login first');
      window.location.href = '/';
      return;
    }
    
    if (!username) {
      setUsername(savedUsername);
    }

    const socket = new SockJS('http://localhost:8080/ws');
    //step 1
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      
      debug: (str) => {git
        console.log('STOMP: ' + str);
      },
      // step 2
      onConnect: () => {
        console.log('Connected to WebSocket as:', username);
        setIsConnected(true);
        // step 4
        client.subscribe(`/user/${username}/private`, (message) => {
          const received = JSON.parse(message.body);
          console.log('Received private message:', received);
          setPrivateMessages(prev => [...prev, {
            from: received.sendername,
            to: received.receivername,
            content: received.message,
            timestamp: new Date(),
            type: 'received'
          }]);
        });

        console.log('Subscribed to private messages for user:', username);
      },
      
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        alert('Connection error. Please try again.');
        setIsConnected(false);
      },
      
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      }
    });
    // step 3
    client.activate();
    setStompClient(client);
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
      setIsConnected(false);
      setJoinedRoom('');
      setPrivateMessages([]);
      setGroupMessages([]);
    }
  };
  const GroupSubRef=useRef(null);
  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    
    if (stompClient && stompClient.connected) {
      GroupSubRef.current=stompClient.subscribe(`/topic/group/${roomId}`, (message) => {
        const received = JSON.parse(message.body);
        console.log('Received group message:', received);
        setGroupMessages(prev => [...prev, {
          username: received.username,
          content: received.content,
          timestamp: new Date()
        }]);
      });

      setJoinedRoom(roomId);
      console.log('Joined room:', roomId);
    }
  };

  const leaveRoom = () => {
    setJoinedRoom('');
    setGroupMessages([]);
    setRoomId('');
  };
  const BASE_URL = "http://localhost:8080"
  const sendPrivateMessage =() => {
    if (!privateMessage.trim() || !privateRecipient.trim()) {
      alert('Please enter recipient and message');
      return;
    }

    if (stompClient && stompClient.connected) {
      const messageObj = {
        sendername: username,
        receivername: privateRecipient,
        message: privateMessage
      };

      // console.log('Sending private message:', messageObj);
      // const token=localStorage.getItem('jwt')
      // const response=await fetch(`${BASE_URL}/af`,{
      //   method:'POST',
      //   headers:{
      //     'Content-Type':'text/plain',
      //     'Authorization':`Bearer ${token}`
      //   },
      //   body:messageObj.receivername
      // })
      // console.log(response)
      // console.log(await response.text())
      stompClient.publish({
        destination: '/chat/private/message',
        body: JSON.stringify(messageObj),
        headers: {
          'message-type': 'private',
          'priority': 'high',
          'timestamp': new Date().toISOString()
        }
      });

      setPrivateMessages(prev => [...prev, {
        from: username,
        to: privateRecipient,
        content: privateMessage,
        timestamp: new Date(),
        type: 'sent'
      }]);

      setPrivateMessage('');
    }
  };

  const sendGroupMessage = () => {
    if (!groupMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (stompClient && stompClient.connected && joinedRoom) {
      const messageObj = {
        username: username,
        content: groupMessage
      };

      console.log('Sending group message:', messageObj);
      
      stompClient.publish({
        destination: `/chat/message/${joinedRoom}`,
        body: JSON.stringify(messageObj),
        headers: {
          'message-type': 'group',
          'room': joinedRoom,
          'timestamp': new Date().toISOString()
        }
      });

      setGroupMessage('');
    }
  };

  const handleKeyPress = (e, sendFunction) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFunction();
    }
  };

  // CONNECT PAGE
  if (!isConnected) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-wrapper">
              <MessageCircle />
            </div>
            <h1 className="login-title">Welcome to Chat</h1>
            <p className="login-subtitle">Enter your username to get started</p>
          </div>
          
          <div className="login-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && connect()}
                placeholder="Enter your username"
                className="form-input"
              />
            </div>
            
            <button onClick={connect} className="btn-connect">
              <User />
              Connect to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN CHAT PAGE
  return (
    <div className="chat-container">
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              <User />
            </div>
            <div className="user-details">
              <h2 className="user-name">{username}</h2>
              <p className="user-status">● Online</p>
            </div>
          </div>
          
          <button onClick={disconnect} className="btn-disconnect">
            <LogOut />
            Disconnect
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          <div className="tabs-list">
            <button
              onClick={() => setActiveTab('private')}
              className={`tab-button ${activeTab === 'private' ? 'active' : ''}`}
            >
              <div className="tab-content">
                <MessageCircle />
                Private Chat
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('group')}
              className={`tab-button ${activeTab === 'group' ? 'active' : ''}`}
            >
              <div className="tab-content">
                <Users />
                Group Chat
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-wrapper">
        {activeTab === 'private' ? (
          // PRIVATE CHAT
          <div className="chat-box">
            <div className="chat-input-header">
              <input
                type="text"
                value={privateRecipient}
                onChange={(e) => setPrivateRecipient(e.target.value)}
                placeholder="Enter recipient username"
                className="recipient-input"
              />
            </div>

            <div className="messages-container">
              {privateMessages.length === 0 ? (
                <div className="empty-state">
                  <MessageCircle />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                privateMessages.map((msg, index) => (
                  <div key={index} className={`message-row ${msg.type}`}>
                    <div className={`message-bubble ${msg.type}`}>
                      <div className="message-header">
                        {msg.type === 'sent' ? `To: ${msg.to}` : `From: ${msg.from}`}
                      </div>
                      <p className="message-content">{msg.content}</p>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="message-input-wrapper">
                <input
                  type="text"
                  value={privateMessage}
                  onChange={(e) => setPrivateMessage(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, sendPrivateMessage)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button onClick={sendPrivateMessage} className="btn-send">
                  <Send />
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          // GROUP CHAT
          <div className="chat-box">
            <div className="chat-input-header">
              {!joinedRoom ? (
                <div className="room-join-wrapper">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                    placeholder="Enter room ID to join"
                    className="recipient-input"
                  />
                  <button onClick={joinRoom} className="btn-join">
                    Join Room
                  </button>
                </div>
              ) : (
                <div className="room-info">
                  <div className="room-details">
                    <div className="room-icon">
                      <Users />
                    </div>
                    <div className="room-info-text">
                      <h3 className="room-name">Room: {joinedRoom}</h3>
                      <p className="room-type">Group Chat</p>
                    </div>
                  </div>
                  <button onClick={leaveRoom} className="btn-leave">
                    Leave Room
                  </button>
                </div>
              )}
            </div>

            <div className="messages-container">
              {!joinedRoom ? (
                <div className="empty-state">
                  <Users />
                  <p>Join a room to start chatting</p>
                </div>
              ) : groupMessages.length === 0 ? (
                <div className="empty-state">
                  <MessageCircle />
                  <p>No messages yet. Be the first to send one!</p>
                </div>
              ) : (
                groupMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-row ${msg.username === username ? 'sent' : 'received'}`}
                  >
                    <div className={`message-bubble ${msg.username === username ? 'sent' : 'received'}`}>
                      {msg.username !== username && (
                        <div className="message-sender">{msg.username}</div>
                      )}
                      <p className="message-content">{msg.content}</p>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {joinedRoom && (
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    value={groupMessage}
                    onChange={(e) => setGroupMessage(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, sendGroupMessage)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button onClick={sendGroupMessage} className="btn-send">
                    <Send />
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
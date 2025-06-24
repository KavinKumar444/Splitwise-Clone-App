import React, { useState } from 'react';
import axios from 'axios';

export default function ChatBot() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');

  const sendMessage = async () => {
    const res = await axios.post('http://localhost:8000/chat', { message });
    setReply(res.data.response || res.data.error);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">💬 Ask ExpenseBot</h2>
      <textarea
        className="border w-full p-2"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me about your groups or expenses..."
      />
      <button onClick={sendMessage} className="mt-2 px-4 py-1 bg-blue-600 text-white rounded">Send</button>
      {reply && <p className="mt-4 bg-gray-100 p-3 rounded">{reply}</p>}
    </div>
  );
}

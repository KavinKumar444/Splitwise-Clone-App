import React, { useState } from 'react';
import { apiService } from '../services/api';

export const Home: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createUser({ name, email });
      setMessage('User created successfully!');
      setName('');
      setEmail('');
    } catch (error) {
      setMessage('Error creating user. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-800 mb-2 tracking-tight">
          Create a New User
        </h3>
        <p className="text-center text-gray-500 mb-6">
          Enter your details to get started with Splitwise Clone.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
              placeholder="Your name"
              required
            />
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
              placeholder="Your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Create User
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm font-medium text-green-600 animate-fade-in">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 
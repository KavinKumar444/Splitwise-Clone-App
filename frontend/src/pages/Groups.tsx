import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, User, Group } from '../services/api';

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, usersData] = await Promise.all([
          apiService.getGroups(),
          apiService.getUsers(),
        ]);
        setGroups(groupsData.data);
        setUsers(usersData.data);
      } catch (error) {
        setMessage('Error fetching data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createGroup({ name, user_ids: selectedUsers });
      const response = await apiService.getGroups();
      setGroups(response.data);
      setName('');
      setSelectedUsers([]);
      setMessage('Group created successfully!');
    } catch (error) {
      setMessage('Error creating group. Please try again.');
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-2">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-800 mb-2 tracking-tight">
          Create a New Group
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
              placeholder="Group Name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Members
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Create Group
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm font-medium text-green-600 animate-fade-in">
            <p>{message}</p>
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  to={`/groups/${group.id}`}
                  className="block hover:bg-indigo-50 transition rounded-xl px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-indigo-700 truncate">
                      {group.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Click to view group details</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}; 
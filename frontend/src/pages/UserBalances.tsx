import React, { useState, useEffect } from 'react';
import { apiService, User, UserBalance } from '../services/api';

export const UserBalances: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | ''>('');
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getUsers();
        setUsers(response.data);
      } catch (error) {
        setMessage('Error fetching users. Please try again.');
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = async (userId: number) => {
    try {
      const response = await apiService.getUserBalances(userId);
      setUserBalance(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching user balances. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-2">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 mb-8">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-800 mb-2 tracking-tight">
          View User Balances
        </h3>
        <div className="mt-5">
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <select
            id="user"
            value={selectedUser}
            onChange={(e) => {
              const userId = Number(e.target.value);
              setSelectedUser(userId);
              handleUserSelect(userId);
            }}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 sm:text-base text-base"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        {message && (
          <div className="mt-4 text-center text-sm font-medium text-red-600 animate-fade-in">
            <p>{message}</p>
          </div>
        )}
      </div>
      {userBalance && (
        <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl border border-gray-100 mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Balances for {userBalance.user_name}
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {userBalance.group_balances.map((groupBalance) => {
              const userGroupBalance = groupBalance.balances.find(
                (balance) => balance.user_id === userBalance.user_id
              );
              return (
                <div key={groupBalance.group_id} className="px-4 py-5 sm:px-6">
                  <h4 className="text-md font-medium text-indigo-700 mb-4">
                    {groupBalance.group_name}
                  </h4>
                  <ul className="divide-y divide-gray-200">
                    {userGroupBalance && (
                      <li key={userGroupBalance.user_id} className="py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {userGroupBalance.user_name}
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              userGroupBalance.amount > 0
                                ? 'text-green-600'
                                : userGroupBalance.amount < 0
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}
                          >
                            ${userGroupBalance.amount.toFixed(2)}
                          </p>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 
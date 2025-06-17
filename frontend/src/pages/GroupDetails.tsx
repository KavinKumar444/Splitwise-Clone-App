import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService, Group, User, Expense, GroupBalance, Balance } from '../services/api';

export const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groupBalances, setGroupBalances] = useState<Balance[]>([]); // State for group balances
  const [message, setMessage] = useState('');

  // Expense form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<number | ''>('');
  const [splitType, setSplitType] = useState<'equal' | 'percentage'>('equal');
  const [splits, setSplits] = useState<{ user_id: number; amount: number; percentage?: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, expensesRes, usersRes, balancesRes] = await Promise.all([
          apiService.getGroup(Number(groupId)),
          apiService.getGroupExpenses(Number(groupId)),
          apiService.getUsers(),
          apiService.getGroupBalances(Number(groupId)), // Fetch group balances
        ]);
        setGroup(groupRes.data);
        setExpenses(expensesRes.data);
        setUsers(usersRes.data);
        setGroupBalances(balancesRes.data.balances); // Set group balances
      } catch (error) {
        setMessage('Error loading group details.');
      }
    };
    fetchData();
  }, [groupId]);

  // Handle split for equal type
  useEffect(() => {
    if (group && splitType === 'equal') {
      const perUser = amount && group.members.length > 0 ? Number(amount) / group.members.length : 0;
      setSplits(
        group.members.map((member) => ({ user_id: member.id, amount: perUser }))
      );
    }
  }, [amount, group, splitType]);

  // Handle split for percentage type
  const handlePercentageChange = (user_id: number, percentage: number) => {
    if (!group) return;
    const newSplits = group.members.map((member) => {
      if (member.id === user_id) {
        return {
          user_id,
          percentage,
          amount: (Number(amount) * percentage) / 100,
        };
      }
      const existing = splits.find((s) => s.user_id === member.id);
      return existing || { user_id: member.id, amount: 0, percentage: 0 };
    });
    setSplits(newSplits);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    try {
      await apiService.createExpense(group.id, {
        description,
        amount: Number(amount),
        paid_by: Number(paidBy),
        split_type: splitType,
        splits,
      });
      setMessage('Expense added!');
      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitType('equal');
      setSplits([]);
      // Refresh expenses and balances
      const [expensesRes, balancesRes] = await Promise.all([
        apiService.getGroupExpenses(group.id),
        apiService.getGroupBalances(Number(groupId)),
      ]);
      setExpenses(expensesRes.data);
      setGroupBalances(balancesRes.data.balances);
    } catch (error) {
      setMessage('Error adding expense.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-2">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-800 mb-4 tracking-tight">Group Details</h1>
        {group ? (
          <>
            <h2 className="text-lg font-semibold mb-2 text-indigo-700 text-center">{group.name}</h2>
            <div className="mb-4 text-center">
              <span className="font-medium">Members:</span>
              <ul className="list-disc ml-6 inline-block text-left">
                {group.members.map((member) => (
                  <li key={member.id}>{member.name} ({member.email})</li>
                ))}
              </ul>
            </div>
            <form onSubmit={handleExpenseSubmit} className="mb-6 bg-indigo-50 rounded-xl p-4 shadow-inner">
              <h3 className="font-semibold mb-2 text-indigo-700">Add Expense</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
                  required
                />
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(Number(e.target.value))}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
                  required
                >
                  <option value="">Paid By</option>
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as 'equal' | 'percentage')}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
                >
                  <option value="equal">Equal</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              {splitType === 'percentage' && group.members.map((member) => (
                <div key={member.id} className="mb-1 flex items-center gap-2">
                  <label className="mr-2 w-24">{member.name} %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={splits.find((s) => s.user_id === member.id)?.percentage || ''}
                    onChange={(e) => handlePercentageChange(member.id, Number(e.target.value))}
                    className="border rounded-lg px-2 py-1 w-24 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition outline-none text-base shadow-sm"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Add Expense
              </button>
            </form>

            <div className="bg-gray-50 rounded-xl p-4 shadow-inner mb-6">
              <h3 className="font-semibold mb-2 text-indigo-700">Group Balances (Who Owes Whom)</h3>
              {groupBalances.length === 0 ? (
                <p className="text-center text-gray-500">No balances to display yet. Add some expenses!</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {groupBalances.map((balance) => {
                    const userName = users.find(u => u.id === balance.user_id)?.name || 'Unknown';
                    return (
                      <li key={balance.user_id} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-gray-800">{userName}</span>
                        <span
                          className={`font-semibold ${
                            balance.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {balance.amount > 0 ? 'Owes ' : 'Is Owed '}${Math.abs(balance.amount).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <h3 className="font-semibold mb-2 text-indigo-700">Expenses</h3>
            <ul className="divide-y divide-gray-200">
              {expenses.length === 0 && <li className="py-2 text-center text-gray-500">No expenses yet.</li>}
              {expenses.map((expense) => (
                <li key={expense.id} className="py-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span>
                      <strong>{expense.description}</strong> - ${expense.amount.toFixed(2)}
                      <span className="ml-2 text-xs text-gray-500">({expense.split_type})</span>
                    </span>
                    <span className="text-sm text-gray-600 mt-1 sm:mt-0">
                      Paid by: {users.find((u) => u.id === expense.paid_by)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="ml-4 text-sm text-gray-700">
                    Splits:
                    <ul className="ml-4 list-disc">
                      {expense.splits.map((split) => (
                        <li key={split.user_id}>
                          {users.find((u) => u.id === split.user_id)?.name || 'Unknown'}: ${split.amount.toFixed(2)}
                          {split.percentage !== undefined && (
                            <span> ({split.percentage}%)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Loading group details...</p>
        )}
        {message && <div className="mt-3 text-center text-sm font-medium text-green-600 animate-fade-in">{message}</div>}
      </div>
    </div>
  );
};

export default GroupDetails; 
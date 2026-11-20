import React, { useState } from 'react';
import { Play, PlusCircle, Edit3, Trash2, Sparkles, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { viewService } from '../../services/viewService';
import { useToast } from '../../context/ToastContext';

export const ViewMutationConsole = ({ categories = [], onOperationSuccess }) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('INSERT'); // 'INSERT' | 'UPDATE' | 'DELETE'
  const [loading, setLoading] = useState(false);
  const [sandboxRecord, setSandboxRecord] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Form states
  const [insertData, setInsertData] = useState({
    categoryId: 6, // Food
    amount: 350.00,
    transactionDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    description: 'Direct view insertion test'
  });

  const [updateData, setUpdateData] = useState({
    transactionId: '',
    amount: 500.00,
    paymentMethod: 'CARD',
    description: 'Updated through v_expense_transactions view'
  });

  const [deleteId, setDeleteId] = useState('');

  const addLog = (entry) => {
    setConsoleLogs((prev) => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString(), ...entry },
      ...prev.slice(0, 9)
    ]);
  };

  // Helper to generate a safe sandbox record
  const handleGenerateSandbox = async () => {
    setLoading(true);
    try {
      const res = await viewService.createSandboxRecord();
      if (res.success && res.data) {
        setSandboxRecord(res.data.sandboxRecord);
        setUpdateData((prev) => ({
          ...prev,
          transactionId: res.data.sandboxRecord.transaction_id,
          amount: 550.00
        }));
        setDeleteId(res.data.sandboxRecord.transaction_id);
        addLog({
          type: 'success',
          action: 'SANDBOX RECORD CREATED',
          sql: res.data.executedQuery,
          result: res.data.sandboxRecord
        });
        success('Safe demo test record created in MySQL!');
        if (onOperationSuccess) onOperationSuccess();
      }
    } catch (err) {
      error(err.message || 'Failed to create test sandbox record');
      addLog({
        type: 'error',
        action: 'SANDBOX FAILED',
        sql: 'INSERT INTO v_expense_transactions ...',
        result: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Execute INSERT through v_expense_transactions
  const handleInsert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await viewService.insertThroughView(insertData);
      if (res.success && res.data) {
        addLog({
          type: 'success',
          action: 'INSERT THROUGH VIEW',
          sql: res.data.executedQuery,
          result: res.data.mysqlResult
        });
        success('Record inserted into MySQL via v_expense_transactions!');
        if (onOperationSuccess) onOperationSuccess();
      }
    } catch (err) {
      error(err.message || 'Insert through view failed');
      addLog({
        type: 'error',
        action: 'INSERT FAILED',
        sql: 'INSERT INTO v_expense_transactions ...',
        result: err
      });
    } finally {
      setLoading(false);
    }
  };

  // Execute UPDATE through v_expense_transactions
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!updateData.transactionId) {
      error('Please specify a transaction ID or create a test record first');
      return;
    }
    setLoading(true);
    try {
      const res = await viewService.updateThroughView(updateData.transactionId, {
        amount: parseFloat(updateData.amount),
        paymentMethod: updateData.paymentMethod,
        description: updateData.description
      });
      if (res.success && res.data) {
        addLog({
          type: 'success',
          action: 'UPDATE THROUGH VIEW',
          sql: res.data.executedQuery,
          result: res.data.mysqlResult
        });
        success('Record updated in MySQL via v_expense_transactions!');
        if (onOperationSuccess) onOperationSuccess();
      }
    } catch (err) {
      error(err.message || 'Update through view failed');
      addLog({
        type: 'error',
        action: 'UPDATE FAILED',
        sql: 'UPDATE v_expense_transactions ...',
        result: err
      });
    } finally {
      setLoading(false);
    }
  };

  // Execute DELETE through v_expense_transactions
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteId) {
      error('Please enter a Transaction ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await viewService.deleteThroughView(deleteId);
      if (res.success && res.data) {
        addLog({
          type: 'success',
          action: 'DELETE THROUGH VIEW',
          sql: res.data.executedQuery,
          result: res.data.mysqlResult
        });
        success(`Transaction #${deleteId} deleted via v_expense_transactions!`);
        if (sandboxRecord?.transaction_id == deleteId) {
          setSandboxRecord(null);
        }
        setDeleteId('');
        if (onOperationSuccess) onOperationSuccess();
      }
    } catch (err) {
      error(err.message || 'Delete through view failed');
      addLog({
        type: 'error',
        action: 'DELETE FAILED',
        sql: `DELETE FROM v_expense_transactions WHERE transaction_id = ${deleteId}`,
        result: err
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">
              Interactive View Mutation Console (DML Demonstration)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Execute live <code className="text-indigo-600 font-mono">INSERT</code>, <code className="text-indigo-600 font-mono">UPDATE</code>, and <code className="text-indigo-600 font-mono">DELETE</code> statements directly targeting the MySQL view <strong className="font-mono">v_expense_transactions</strong>.
          </p>
        </div>

        {/* Sandbox generator button */}
        <button
          onClick={handleGenerateSandbox}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate Safe Test Record</span>
        </button>
      </div>

      {/* Sandbox banner if present */}
      {sandboxRecord && (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Active Test Record: <strong>ID #{sandboxRecord.transaction_id}</strong> (₹{sandboxRecord.amount} - {sandboxRecord.description})
            </span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">Ready for Update/Delete</span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-slate-100 flex gap-2">
        <button
          onClick={() => setActiveTab('INSERT')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'INSERT'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>1. INSERT into View</span>
        </button>
        <button
          onClick={() => setActiveTab('UPDATE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'UPDATE'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>2. UPDATE through View</span>
        </button>
        <button
          onClick={() => setActiveTab('DELETE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
            activeTab === 'DELETE'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>3. DELETE from View</span>
        </button>
      </div>

      {/* Tab Forms */}
      <div className="p-6">
        {activeTab === 'INSERT' && (
          <form onSubmit={handleInsert} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={insertData.categoryId}
                onChange={(e) => setInsertData({ ...insertData, categoryId: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.filter(c => c.category_type === 'EXPENSE').map(c => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={insertData.amount}
                onChange={(e) => setInsertData({ ...insertData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={insertData.paymentMethod}
                onChange={(e) => setInsertData({ ...insertData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={insertData.description}
                onChange={(e) => setInsertData({ ...insertData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute INSERT on View</span>
              </button>
            </div>
          </form>
        )}

        {activeTab === 'UPDATE' && (
          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction ID</label>
              <input
                type="number"
                placeholder="Target ID"
                value={updateData.transactionId}
                onChange={(e) => setUpdateData({ ...updateData, transactionId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={updateData.amount}
                onChange={(e) => setUpdateData({ ...updateData, amount: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={updateData.paymentMethod}
                onChange={(e) => setUpdateData({ ...updateData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute UPDATE on View</span>
              </button>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Updated Description</label>
              <input
                type="text"
                value={updateData.description}
                onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </form>
        )}

        {activeTab === 'DELETE' && (
          <form onSubmit={handleDelete} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction ID to Delete</label>
              <input
                type="number"
                placeholder="e.g., 27"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">
                Will execute: <code className="font-mono text-rose-600">DELETE FROM v_expense_transactions WHERE transaction_id = ?</code>
              </p>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Execute DELETE on View</span>
              </button>
            </div>
          </form>
        )}

        {/* Live SQL Execution Terminal Log */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              Live MySQL DML Execution History
            </span>
            <span className="text-[11px] text-slate-400">Responses returned by MySQL Server 8.0</span>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto border border-slate-800 space-y-3">
            {consoleLogs.length === 0 ? (
              <p className="text-slate-500">Awaiting view DML operation. Select an action above and click execute.</p>
            ) : (
              consoleLogs.map((log) => (
                <div key={log.id} className="border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className={log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      [{log.action}]
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-indigo-400 break-all">{log.sql}</p>
                  <pre className="text-slate-400 text-[10px] mt-1 bg-slate-900/60 p-1.5 rounded overflow-x-auto">
                    MySQL Output: {JSON.stringify(log.result, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

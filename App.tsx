
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Wallet, 
  HandCoins, 
  History, 
  LayoutDashboard, 
  LogOut, 
  UserCircle, 
  PlusCircle, 
  ArrowRightLeft, 
  XCircle, 
  CheckCircle2, 
  CalendarDays, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  Edit2, 
  AlertCircle,
  Calendar,
  Trash2
} from 'lucide-react';
import { INITIAL_DATA } from './constants';
import { 
  Role, 
  Status, 
  LoanStatus, 
  TransactionType, 
  AppData, 
  Member, 
  Deposit, 
  Loan, 
  Transaction 
} from './types';

// --- Helper Functions ---
const generateId = (prefix: string) => `${prefix}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
const formatCurrency = (amount: number) => {
  return "Rs. " + amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

// --- Sub-Components ---

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void 
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-indigo-600 text-white shadow-lg' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const Card: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color: string }> = ({ 
  title, value, subValue, icon, color 
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);

const TransactionTable: React.FC<{ 
  transactions: Transaction[]; 
  members: Member[]; 
  isAdmin: boolean;
  onDelete?: (txId: string) => void;
}> = ({ transactions, members, isAdmin, onDelete }) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
          {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((tx) => {
          const member = members.find(m => m.member_id === tx.member_id);
          return (
            <tr key={tx.transaction_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.transaction_month}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member?.name || tx.member_id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                  tx.transaction_type === TransactionType.DEPOSIT ? 'bg-green-100 text-green-800' :
                  tx.transaction_type === TransactionType.LOAN ? 'bg-blue-100 text-blue-800' :
                  tx.transaction_type === TransactionType.INTEREST ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tx.transaction_type}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(tx.amount)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">{tx.notes}</td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onDelete?.(tx.transaction_id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              )}
            </tr>
          );
        })}
        {transactions.length === 0 && (
          <tr>
            <td colSpan={isAdmin ? 6 : 5} className="px-6 py-10 text-center text-gray-400 italic">No transactions found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // 1. Database Mock
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('appsheet_db');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // 2. Auth State
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  // 3. Form States
  const [showMemberModal, setShowMemberModal] = useState<'create' | 'edit' | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [txFormType, setTxFormType] = useState<TransactionType>(TransactionType.DEPOSIT);
  
  // 4. Local state for transactions
  const [selectedMemberForTx, setSelectedMemberForTx] = useState<string>('');
  const [selectedYearForDeposit, setSelectedYearForDeposit] = useState<number>(new Date().getFullYear());
  const [loanPurpose, setLoanPurpose] = useState<'disbursement' | 'repayment' | 'interest'>('disbursement');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 5. Persistence Effect
  useEffect(() => {
    localStorage.setItem('appsheet_db', JSON.stringify(data));
  }, [data]);

  // 6. Derived Values (Must be after state/effects, but before any returns)
  const isAdmin = currentMember?.role === Role.ADMIN;

  const accessibleMembers = useMemo(() => {
    if (!currentMember) return [];
    return isAdmin ? data.members : data.members.filter(m => m.member_id === currentMember.member_id);
  }, [data.members, isAdmin, currentMember]);

  const accessibleDeposits = useMemo(() => {
    if (!currentMember) return [];
    return isAdmin ? data.deposits : data.deposits.filter(d => d.member_id === currentMember.member_id);
  }, [data.deposits, isAdmin, currentMember]);

  const accessibleLoans = useMemo(() => {
    if (!currentMember) return [];
    return isAdmin ? data.loans : data.loans.filter(l => l.member_id === currentMember.member_id);
  }, [data.loans, isAdmin, currentMember]);

  const accessibleTransactions = useMemo(() => {
    if (!currentMember) return [];
    const txs = isAdmin ? data.transactions : data.transactions.filter(t => t.member_id === currentMember.member_id);
    return [...txs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data.transactions, isAdmin, currentMember]);

  const totalPool = accessibleDeposits.reduce((acc, d) => acc + d.current_balance, 0);
  const totalActiveLoans = accessibleLoans.filter(l => l.loan_status === LoanStatus.ACTIVE).reduce((acc, l) => acc + l.outstanding_principal, 0);
  const activeMembersCount = data.members.filter(m => m.status === Status.ACTIVE).length;

  const depositAlreadyExists = useMemo(() => {
    if (txFormType !== TransactionType.DEPOSIT) return false;
    return data.deposits.some(d => d.member_id === selectedMemberForTx && d.year === selectedYearForDeposit);
  }, [txFormType, selectedMemberForTx, selectedYearForDeposit, data.deposits]);

  // --- Logic Handlers ---

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mobile = formData.get('mobile') as string;
    const member = data.members.find(m => m.mobile === mobile);
    if (member) {
      if (member.status === Status.INACTIVE) {
        setLoginError('Account is inactive. Please contact Admin.');
      } else {
        setCurrentMember(member);
        setLoginError('');
      }
    } else {
      setLoginError('Mobile number not found. Access restricted.');
    }
  };

  const handleLogout = () => {
    // Note: window.confirm is removed to avoid blocking in sandbox environments
    setCurrentMember(null);
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  // --- Session Guard (Must be after ALL hooks) ---
  if (!currentMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8 bg-indigo-600 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Member Fund Manager</h1>
            <p className="text-indigo-100 text-sm mt-2">Private Internal Access Only</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input required name="mobile" type="tel" className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter 10-digit mobile" />
                </div>
              </div>
              {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center space-x-2"><XCircle size={16} /><span>{loginError}</span></div>}
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">Sign In</button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Demo Credentials</p>
              <div className="mt-2 flex justify-center space-x-4">
                <div className="text-xs text-gray-500"><span className="font-bold">Admin:</span> 9876543210</div>
                <div className="text-xs text-gray-500"><span className="font-bold">Member:</span> 9988776655</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Application Logic Handlers (Post-Guard) ---

  const addTransaction = (payload: Omit<Transaction, 'transaction_id' | 'created_at' | 'created_by'>) => {
    const newTx: Transaction = {
      ...payload,
      transaction_id: generateId('TX'),
      created_at: new Date().toISOString(),
      created_by: currentMember?.email || 'system',
    };
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTx]
    }));
    return newTx;
  };

  const handleDeleteTransaction = (txId: string) => {
    const tx = data.transactions.find(t => t.transaction_id === txId);
    if (!tx) return;

    if (!window.confirm(`Are you sure you want to delete this ${tx.transaction_type} transaction?`)) {
      return;
    }

    setData(prev => {
      let updatedDeposits = [...prev.deposits];
      let updatedLoans = [...prev.loans];
      let updatedTransactions = prev.transactions.filter(t => t.transaction_id !== txId);

      if (tx.transaction_type === TransactionType.DEPOSIT) {
        const yearMatch = tx.notes.match(/\[(\d{4})\]/);
        const year = yearMatch ? parseInt(yearMatch[1]) : new Date(tx.transaction_month).getFullYear();
        updatedDeposits = updatedDeposits.map(d => 
          (d.member_id === tx.member_id && d.year === year)
          ? { ...d, current_balance: d.current_balance - tx.amount, membership_amount: d.membership_amount - tx.amount }
          : d
        );
      } else if (tx.transaction_type === TransactionType.LOAN) {
        const activeLoan = updatedLoans.find(l => l.member_id === tx.member_id && l.loan_status === LoanStatus.ACTIVE);
        if (activeLoan) {
          if (tx.amount > 0) {
            updatedLoans = updatedLoans.map(l => l.loan_id === activeLoan.loan_id 
              ? { ...l, outstanding_principal: l.outstanding_principal - tx.amount, loan_amount: l.loan_amount - tx.amount } 
              : l
            );
          } else {
            updatedLoans = updatedLoans.map(l => l.loan_id === activeLoan.loan_id 
              ? { ...l, outstanding_principal: l.outstanding_principal + Math.abs(tx.amount) } 
              : l
            );
          }
        }
      }

      return {
        ...prev,
        deposits: updatedDeposits,
        loans: updatedLoans,
        transactions: updatedTransactions
      };
    });
  };

  const handleMemberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData: Partial<Member> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      mobile: formData.get('mobile') as string,
      role: formData.get('role') as Role,
      status: formData.get('status') as Status,
    };

    if (showMemberModal === 'create') {
      const newMember: Member = {
        member_id: generateId('M'),
        ...memberData as Omit<Member, 'member_id'>
      };
      setData(prev => ({
        ...prev,
        members: [...prev.members, newMember],
        deposits: [...prev.deposits, {
          deposit_id: generateId('DEP'),
          member_id: newMember.member_id,
          opening_balance: 0,
          membership_amount: 0,
          dividend: 0,
          current_balance: 0,
          year: new Date().getFullYear(),
        }]
      }));
    } else if (showMemberModal === 'edit' && editingMember) {
      setData(prev => ({
        ...prev,
        members: prev.members.map(m => m.member_id === editingMember.member_id ? { ...m, ...memberData } : m)
      }));
    }
    setShowMemberModal(null);
    setEditingMember(null);
  };

  const handleDeposit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mId = formData.get('member_id') as string;
    const amount = Number(formData.get('amount'));
    const year = Number(formData.get('year'));
    const dateStr = formData.get('transaction_date') as string;
    const notes = formData.get('notes') as string;

    addTransaction({
      member_id: mId,
      transaction_type: TransactionType.DEPOSIT,
      amount: amount,
      transaction_month: dateStr,
      notes: `Yearly Membership [${year}]: ${notes}`
    });

    setData(prev => {
      const existingDeposit = prev.deposits.find(d => d.member_id === mId && d.year === year);
      if (existingDeposit) {
        return {
          ...prev,
          deposits: prev.deposits.map(d => 
            (d.member_id === mId && d.year === year)
              ? { ...d, current_balance: d.current_balance + amount, membership_amount: d.membership_amount + amount } 
              : d
          )
        };
      } else {
        const newDeposit: Deposit = {
          deposit_id: generateId('DEP'),
          member_id: mId,
          opening_balance: 0,
          membership_amount: amount,
          dividend: 0,
          current_balance: amount,
          year: year
        };
        return {
          ...prev,
          deposits: [...prev.deposits, newDeposit]
        };
      }
    });
    setShowAddTransaction(false);
  };

  const handleLoanTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const mId = formData.get('member_id') as string;
    const amount = Number(formData.get('amount'));
    const dateStr = formData.get('transaction_date') as string;
    const purpose = formData.get('purpose') as string;
    const notes = formData.get('notes') as string;

    let txType: TransactionType = TransactionType.LOAN;
    let finalAmount = amount;
    let effect: 'none' | 'increase' | 'decrease' = 'none';

    if (purpose === 'disbursement') {
      txType = TransactionType.LOAN;
      finalAmount = amount;
      effect = 'increase';
    } else if (purpose === 'repayment') {
      txType = TransactionType.LOAN;
      finalAmount = -amount; 
      effect = 'decrease';
    } else if (purpose === 'interest') {
      txType = TransactionType.INTEREST;
      finalAmount = amount;
      effect = 'none'; 
    }

    addTransaction({
      member_id: mId,
      transaction_type: txType,
      amount: finalAmount,
      transaction_month: dateStr,
      notes: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)}: ${notes}`
    });

    setData(prev => {
      let updatedLoans = [...prev.loans];
      if (effect === 'increase') {
        const activeLoan = updatedLoans.find(l => l.member_id === mId && l.loan_status === LoanStatus.ACTIVE);
        if (activeLoan) {
          updatedLoans = updatedLoans.map(l => l.loan_id === activeLoan.loan_id ? { ...l, outstanding_principal: l.outstanding_principal + amount, loan_amount: l.loan_amount + amount } : l);
        } else {
          updatedLoans.push({
            loan_id: generateId('LN'),
            member_id: mId,
            loan_amount: amount,
            outstanding_principal: amount,
            interest_rate: 1,
            loan_start_date: dateStr,
            loan_status: LoanStatus.ACTIVE
          });
        }
      } else if (effect === 'decrease') {
        const activeLoan = updatedLoans.find(l => l.member_id === mId && l.loan_status === LoanStatus.ACTIVE);
        if (activeLoan) {
          updatedLoans = updatedLoans.map(l => l.loan_id === activeLoan.loan_id ? { ...l, outstanding_principal: Math.max(0, l.outstanding_principal - amount) } : l);
        }
      }
      return { ...prev, loans: updatedLoans };
    });
    setShowAddTransaction(false);
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title={isAdmin ? "Total Fund Pool" : "My Balance"} value={formatCurrency(totalPool)} icon={<Wallet className="text-white w-6 h-6" />} color="bg-indigo-600" subValue={isAdmin ? `${activeMembersCount} Active Members` : undefined} />
        <Card title={isAdmin ? "Total Outstanding Loans" : "My Outstanding Loan"} value={formatCurrency(totalActiveLoans)} icon={<HandCoins className="text-white w-6 h-6" />} color="bg-rose-600" subValue={isAdmin ? `${accessibleLoans.filter(l => l.loan_status === LoanStatus.ACTIVE).length} Active Loans` : undefined} />
        <Card title="Monthly Interest (Est)" value={formatCurrency(totalActiveLoans * 0.01)} icon={<History className="text-white w-6 h-6" />} color="bg-amber-500" subValue="Calculated at 1% Fixed" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
          <button onClick={() => setActiveTab('transactions')} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold">View All</button>
        </div>
        <TransactionTable 
          transactions={accessibleTransactions.slice(0, 5)} 
          members={data.members} 
          isAdmin={isAdmin}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Member Directory</h2>
        {isAdmin && (
          <button onClick={() => { setEditingMember(null); setShowMemberModal('create'); }} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md transition-all">
            <PlusCircle size={20} /><span>Add Member</span>
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Mobile</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accessibleMembers.map(m => (
              <tr key={m.member_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{m.member_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.mobile}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`capitalize px-2 py-1 rounded text-xs font-medium ${m.role === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{m.role}</span></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`capitalize px-2 py-1 rounded text-xs font-medium ${m.status === Status.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{m.status}</span></td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setEditingMember(m); setShowMemberModal('edit'); }} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-all inline-flex items-center space-x-1">
                      <Edit2 size={16} /><span>Edit</span>
                    </button>
                    <button onClick={() => { setData(prev => ({ ...prev, members: prev.members.map(mem => mem.member_id === m.member_id ? { ...mem, status: mem.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE } : mem) })) }} className={`ml-4 p-2 rounded-lg text-xs font-semibold ${m.status === Status.ACTIVE ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{m.status === Status.ACTIVE ? 'Disable' : 'Enable'}</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Loan Management</h2>
        {isAdmin && (
          <button onClick={() => { setTxFormType(TransactionType.LOAN); setShowAddTransaction(true); setLoanPurpose('disbursement'); }} className="flex items-center space-x-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 shadow-md">
            <PlusCircle size={20} /><span>Loan Transaction</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4">
        {accessibleLoans.map(loan => {
          const member = data.members.find(m => m.member_id === loan.member_id);
          return (
            <div key={loan.loan_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{member?.name}</h3>
                    <span className="text-xs font-mono text-gray-400">#{loan.loan_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.loan_status === LoanStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{loan.loan_status.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-gray-500 uppercase tracking-wide">Original Amount</p><p className="font-semibold text-gray-800">{formatCurrency(loan.loan_amount)}</p></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</p><p className="font-bold text-rose-600">{formatCurrency(loan.outstanding_principal)}</p></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-wide">Interest Rate</p><p className="font-semibold text-gray-800">{loan.interest_rate}% Monthly</p></div>
                    <div><p className="text-xs text-gray-500 uppercase tracking-wide">Next Interest</p><p className="font-semibold text-amber-600">{formatCurrency(loan.outstanding_principal * 0.01)}</p></div>
                  </div>
                </div>
                {isAdmin && loan.loan_status === LoanStatus.ACTIVE && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button onClick={() => { setSelectedMemberForTx(loan.member_id); setLoanPurpose('interest'); setTxFormType(TransactionType.LOAN); setShowAddTransaction(true); }} className="p-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium border border-amber-200">Interest Paid</button>
                    <button onClick={() => { setSelectedMemberForTx(loan.member_id); setLoanPurpose('repayment'); setTxFormType(TransactionType.LOAN); setShowAddTransaction(true); }} className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 text-sm font-medium border border-emerald-200">Repay Principal</button>
                    <button disabled={loan.outstanding_principal > 0} onClick={() => { setData(prev => ({ ...prev, loans: prev.loans.map(l => l.loan_id === loan.loan_id ? { ...l, loan_status: LoanStatus.CLOSED } : l) })); }} className={`p-2 rounded-lg text-sm font-medium border ${loan.outstanding_principal > 0 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}>Close</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDeposits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Deposit Accounts</h2>
        {isAdmin && (
          <button onClick={() => { setTxFormType(TransactionType.DEPOSIT); setShowAddTransaction(true); setSelectedMemberForTx(''); }} className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-md">
            <PlusCircle size={20} /><span>New Deposit</span>
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Member</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-right">Opening Bal</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-right">Membership (YTD)</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-right">Dividends</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-right">Current Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...accessibleDeposits].sort((a,b) => b.year - a.year).map(d => {
              const member = data.members.find(m => m.member_id === d.member_id);
              return (
                <tr key={d.deposit_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{member?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{d.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(d.opening_balance)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(d.membership_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium text-right">{formatCurrency(d.dividend)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">{formatCurrency(d.current_balance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 animate-in fade-in duration-300">
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3"><div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg"><Wallet className="text-white" size={24} /></div><h1 className="text-xl font-bold text-white tracking-tight">FundApp</h1></div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<Users size={20} />} label={isAdmin ? "Member Management" : "My Profile"} isActive={activeTab === 'members'} onClick={() => { setActiveTab('members'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<Wallet size={20} />} label={isAdmin ? "Deposit Accounts" : "My Deposits"} isActive={activeTab === 'deposits'} onClick={() => { setActiveTab('deposits'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<HandCoins size={20} />} label={isAdmin ? "Loan Management" : "My Loans"} isActive={activeTab === 'loans'} onClick={() => { setActiveTab('loans'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<History size={20} />} label="Transactions Log" isActive={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }} />
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-xl mb-4 overflow-hidden"><div className="w-8 h-8 rounded-full bg-indigo-500 shrink-0 flex items-center justify-center text-white font-bold">{currentMember?.name[0]}</div><div className="overflow-hidden"><p className="text-sm font-medium text-white truncate">{currentMember?.name}</p><p className="text-xs text-slate-400 capitalize truncate">{currentMember?.role}</p></div></div>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all group">
              <LogOut size={18} className="group-hover:text-rose-500" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{activeTab}</h2>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden sm:flex items-center space-x-3 text-right">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Current Session</p>
                  <p className="text-xs font-semibold text-gray-900">{currentMember?.name}</p>
                </div>
                <UserCircle className="text-gray-300" size={32} />
             </div>
             <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 text-gray-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all rounded-lg font-medium text-sm group" title="Sign Out">
               <LogOut size={18} className="group-hover:scale-110 transition-transform" />
               <span>Sign Out</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'members' && renderMembers()}
            {activeTab === 'deposits' && renderDeposits()}
            {activeTab === 'loans' && renderLoans()}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>{isAdmin && <div className="flex space-x-2"><button onClick={() => { setTxFormType(TransactionType.ADJUSTMENT); setShowAddTransaction(true); setSelectedMemberForTx(''); }} className="flex items-center space-x-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 shadow-md"><ArrowRightLeft size={20} /><span>Adjustment</span></button></div>}</div>
                <TransactionTable transactions={accessibleTransactions} members={data.members} isAdmin={isAdmin} onDelete={handleDeleteTransaction} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals are unchanged but kept for structural completeness */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${showMemberModal === 'create' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white`}><h3 className="text-xl font-bold">{showMemberModal === 'create' ? 'New Member' : 'Edit Member'}</h3><button onClick={() => setShowMemberModal(null)}><X size={24}/></button></div>
            <form onSubmit={handleMemberSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input required name="name" type="text" defaultValue={editingMember?.name} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input required name="email" type="email" defaultValue={editingMember?.email} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Mobile</label><input required name="mobile" type="tel" defaultValue={editingMember?.mobile} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Role</label><select name="role" defaultValue={editingMember?.role || Role.MEMBER} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"><option value={Role.MEMBER}>Member</option><option value={Role.ADMIN}>Admin</option></select></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Status</label><select name="status" defaultValue={editingMember?.status || Status.ACTIVE} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"><option value={Status.ACTIVE}>Active</option><option value={Status.INACTIVE}>Inactive</option></select></div>
              </div>
              <div className="pt-4 flex space-x-3"><button type="button" onClick={() => setShowMemberModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50">Cancel</button><button type="submit" className={`flex-1 px-4 py-2 ${showMemberModal === 'create' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white rounded-lg font-semibold shadow-md`}>Save</button></div>
            </form>
          </div>
        </div>
      )}

      {showAddTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between text-white ${txFormType === TransactionType.DEPOSIT ? 'bg-emerald-600' : txFormType === TransactionType.LOAN ? 'bg-rose-600' : 'bg-slate-700'}`}>
              <h3 className="text-xl font-bold uppercase tracking-tight">{txFormType} Transaction</h3>
              <button onClick={() => setShowAddTransaction(false)}><X size={24}/></button>
            </div>
            <form onSubmit={txFormType === TransactionType.DEPOSIT ? handleDeposit : txFormType === TransactionType.LOAN ? handleLoanTransaction : (e) => { e.preventDefault(); setShowAddTransaction(false); }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Select Member</label><select required name="member_id" value={selectedMemberForTx} onChange={(e) => setSelectedMemberForTx(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"><option value="" disabled>Choose a member</option>{data.members.map(m => (<option key={m.member_id} value={m.member_id}>{m.name}</option>))}</select></div>
                {txFormType === TransactionType.LOAN && (
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Purpose</label><select required name="purpose" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"><option value="disbursement">Loan Taken</option><option value="interest">Interest Paid</option><option value="repayment">Principal Repayment</option></select></div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Date</label><input required name="transaction_date" type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                  {txFormType === TransactionType.DEPOSIT && (
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">Year</label><select name="year" value={selectedYearForDeposit} onChange={(e) => setSelectedYearForDeposit(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">{[...Array(10)].map((_, i) => { const year = new Date().getFullYear() - 2 + i; return <option key={year} value={year}>{year}</option> })}</select></div>
                  )}
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label><input required name="amount" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label><textarea name="notes" rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"></textarea></div>
              </div>
              <div className="pt-4 flex space-x-3"><button type="button" onClick={() => setShowAddTransaction(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50">Cancel</button><button type="submit" className={`flex-1 px-4 py-2 text-white rounded-lg font-semibold shadow-md ${txFormType === TransactionType.DEPOSIT ? 'bg-emerald-600' : txFormType === TransactionType.LOAN ? 'bg-rose-600' : 'bg-slate-700'}`}>Post</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

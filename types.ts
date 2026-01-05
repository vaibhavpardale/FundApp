
export enum Role {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum LoanStatus {
  ACTIVE = 'active',
  CLOSED = 'closed'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  LOAN = 'loan',
  INTEREST = 'interest',
  ADJUSTMENT = 'adjustment'
}

export interface Member {
  member_id: string;
  name: string;
  email: string;
  mobile: string; // Added for login validation
  role: Role;
  status: Status;
}

export interface Deposit {
  deposit_id: string;
  member_id: string;
  opening_balance: number;
  membership_amount: number;
  dividend: number;
  current_balance: number;
  year: number;
}

export interface Loan {
  loan_id: string;
  member_id: string;
  loan_amount: number;
  outstanding_principal: number;
  interest_rate: number; // default 1%
  loan_start_date: string;
  loan_status: LoanStatus;
}

export interface Transaction {
  transaction_id: string;
  member_id: string;
  transaction_type: TransactionType;
  amount: number;
  transaction_month: string;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface AppData {
  members: Member[];
  deposits: Deposit[];
  loans: Loan[];
  transactions: Transaction[];
}

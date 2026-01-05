
import { Role, Status, LoanStatus, AppData } from './types';

export const INITIAL_DATA: AppData = {
  members: [
    {
      member_id: 'M001',
      name: 'PANDURANG LAXMAN PARDALE',
      email: 'pandurang@example.com',
      mobile: '9876543210',
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
    {
      member_id: 'M002',
      name: 'RAMESH LAXMAN PARDALE',
      email: 'ramesh@example.com',
      mobile: '9988776655',
      role: Role.MEMBER,
      status: Status.ACTIVE,
    },
    {
      member_id: 'M003',
      name: 'PRAKASH SHANTARAM PARDALE',
      email: 'prakash@example.com',
      mobile: '9123456789',
      role: Role.MEMBER,
      status: Status.ACTIVE,
    },
    {
      member_id: 'M004',
      name: 'PARESH PRAKASH PARDALE',
      email: 'paresh@example.com',
      mobile: '8877665544',
      role: Role.MEMBER,
      status: Status.ACTIVE,
    },
  ],
  deposits: [
    {
      deposit_id: 'D001',
      member_id: 'M001',
      opening_balance: 210503.16,
      membership_amount: 2400.00,
      dividend: 26073.79,
      current_balance: 238976.95,
      year: 2025,
    },
    {
      deposit_id: 'D002',
      member_id: 'M002',
      opening_balance: 133825.73,
      membership_amount: 2400.00,
      dividend: 16576.21,
      current_balance: 152801.94,
      year: 2025,
    },
    {
      deposit_id: 'D003',
      member_id: 'M003',
      opening_balance: 210503.16,
      membership_amount: 2400.00,
      dividend: 26073.79,
      current_balance: 238976.95,
      year: 2025,
    },
    {
      deposit_id: 'D004',
      member_id: 'M004',
      opening_balance: 133825.73,
      membership_amount: 2400.00,
      dividend: 16576.21,
      current_balance: 152801.94,
      year: 2025,
    },
  ],
  loans: [
    {
      loan_id: 'L001',
      member_id: 'M001',
      loan_amount: 286000.00,
      outstanding_principal: 286000.00,
      interest_rate: 1,
      loan_start_date: '2025-01-01',
      loan_status: LoanStatus.ACTIVE,
    },
    {
      loan_id: 'L002',
      member_id: 'M002',
      loan_amount: 174500.00,
      outstanding_principal: 174500.00,
      interest_rate: 1,
      loan_start_date: '2025-01-01',
      loan_status: LoanStatus.ACTIVE,
    },
    {
      loan_id: 'L003',
      member_id: 'M003',
      loan_amount: 275000.00,
      outstanding_principal: 275000.00,
      interest_rate: 1,
      loan_start_date: '2025-01-01',
      loan_status: LoanStatus.ACTIVE,
    },
    {
      loan_id: 'L004',
      member_id: 'M004',
      loan_amount: 164000.00,
      outstanding_principal: 164000.00,
      interest_rate: 1,
      loan_start_date: '2025-01-01',
      loan_status: LoanStatus.ACTIVE,
    },
  ],
  transactions: [
    {
      transaction_id: 'T000',
      member_id: 'M001',
      transaction_type: 'adjustment' as any,
      amount: 210503.16,
      transaction_month: '2025-01-01',
      notes: 'Initial opening balance migration',
      created_by: 'system',
      created_at: '2025-01-01T00:00:00Z'
    }
  ]
};
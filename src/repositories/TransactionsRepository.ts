import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (acc: Balance, cv: Transaction) => {
        switch (cv.type) {
          case 'income':
            acc.income += Number(cv.value);
            break;
          case 'outcome':
            acc.outcome += Number(cv.value);
            break;

          default:
            break;
        }
        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return {
      ...balance,
      total: balance.income - balance.outcome,
    };
  }
}

export default TransactionsRepository;

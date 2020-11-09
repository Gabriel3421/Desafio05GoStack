import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Saldo insuficiente');
    }

    let cat = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!cat) {
      cat = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(cat);
    }

    const newTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: cat.id,
    });
    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;

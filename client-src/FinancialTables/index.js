import BalanceOverview from './BalanceOverview';
import CategoricalAccruals from './CategoricalAccruals';
import CascadedAccruals from './CascadedAccruals';
import FinancialWorksheet from './FinancialWorksheet';
import FinancialStatement from './FinancialStatement';
import CashflowWorksheet from './CashflowWorksheet';
import CashflowStatement from './CashflowStatement';

export default function(){
    return {
        BalanceOverview: BalanceOverview(),
        CategoricalAccruals: CategoricalAccruals(),
        CascadedAccruals: CascadedAccruals(),
        CashflowWorksheet: CashflowWorksheet(),
        // CashflowStatement: CashflowStatement(),
        // FinancialWorksheet: FinancialWorksheet(),
        // FinancialStatement: FinancialStatement(),
    }
}
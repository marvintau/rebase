import BalanceOverview from './BalanceOverview';
import CategoricalAccruals from './CategoricalAccruals';
import CascadedAccruals from './CascadedAccruals';
import FinancialWorksheet from './FinancialWorksheet';
import CashflowWorksheet from './CashflowWorksheet';

export default function(){
    return {
        BalanceOverview: BalanceOverview(),
        CategoricalAccruals: CategoricalAccruals(),
        CascadedAccruals: CascadedAccruals(),
        CashflowWorksheet: CashflowWorksheet(),
        FinancialWorksheet: FinancialWorksheet(),
    }
}
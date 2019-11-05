import BalanceOverview from './BalanceOverview';
import CategoricalAccruals from './CategoricalAccruals';
import CascadedAccruals from './CascadedAccruals';
// import FinancialStatementConf from './FinancialStatementConf';
// import FinancialStatement from './FinancialStatement';
// import CashflowConf from './deprecated/CashflowConf';
// import Cashflows from './deprecated/Cashflows';
import CashflowWorksheet from './CashflowWorksheet';
import CashflowStatement from './CashflowStatement';

export default function(){
    return {
        BalanceOverview: BalanceOverview(),
        CategoricalAccruals: CategoricalAccruals(),
        CascadedAccruals: CascadedAccruals(),
        // FinancialStatementConf: FinancialStatementConf(),
        // FinancialStatement: FinancialStatement(),
        // CashflowConf: CashflowConf(),
        // Cashflows: Cashflows(),
        CashflowWorksheet: CashflowWorksheet(),
        CashflowStatement: CashflowStatement()
    }
}
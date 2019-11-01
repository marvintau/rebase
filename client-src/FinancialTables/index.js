import BalanceOverview from './BalanceOverview';
import RouteAnalysis from './RouteAnalysis';
import FinancialStatementConf from './FinancialStatementConf';
import FinancialStatement from './FinancialStatement';
// import CashflowConf from './deprecated/CashflowConf';
// import Cashflows from './deprecated/Cashflows';
import CashflowWorksheet from './CashflowWorksheet';
import CashflowStatement from './CashflowStatement';

export default function(){
    return {
        BalanceOverview: BalanceOverview(),
        RouteAnalysis: RouteAnalysis(),
        FinancialStatementConf: FinancialStatementConf(),
        FinancialStatement: FinancialStatement(),
        // CashflowConf: CashflowConf(),
        // Cashflows: Cashflows(),
        CashflowWorksheet: CashflowWorksheet(),
        CashflowStatement: CashflowStatement()
    }
}
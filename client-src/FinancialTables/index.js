import BalanceOverview from './BalanceOverview';
import RouteAnalysis from './RouteAnalysis';
import FinancialStatementConf from './FinancialStatementConf';
import FinancialStatement from './FinancialStatement';
import CashflowConf from './CashflowConf';
import CashflowWorksheet from './CashflowWorksheet';
import Cashflows from './Cashflows';

export default function(){
    return {
        BalanceOverview: BalanceOverview(),
        RouteAnalysis: RouteAnalysis(),
        FinancialStatementConf: FinancialStatementConf(),
        FinancialStatement: FinancialStatement(),
        CashflowWorksheet: CashflowWorksheet(),
        CashflowConf: CashflowConf(),
        Cashflows: Cashflows()
    }
}
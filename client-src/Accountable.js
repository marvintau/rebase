import "./ExtendObject.js"
import "./ExtendArray.js"

export default class Accountable {
    constructor(head, body){
        
        this.head     = head;
        this.body     = body;
        this.presBody = body;

        this.sortKeyOrder  = [];
        this.filters = [];
        this.pagers  = [];

        this.tableState = "NORMAL";
    }

    permuteColumns(colNameOrder){
        this.head = this.head.rewrite(colNameOrder);
        this.body = this.body.map(record => record.rewrite(colNameOrder));
        this.presBody = this.body;
    }

    marshall(){
        for (let i = this.body.length-1; i>=0; i--)
        for (let colName in this.body[i]){
            let cell = this.body[i][colName];
            if (cell === null || cell === undefined){
                this.body[i][colName] = this.head[colName].default;
            }
        }
    }

    addSort(colName){

        let isDesc = true;
                   
        this.sortKeyOrder.push(colName);
        this.head[colName].sorting = {isDesc, keyIndex: this.sortKeyOrder.length - 1};
        this.sort();
    }
    toggleSort(colName){

        this.head[colName].sorting.isDesc = !this.head[colName].sorting.isDesc;
        this.sort();
    }

    removeSort(colName){
        this.sortKeyOrder.splice(this.sortKeyOrder.indexOf(colName), 1);
        this.head[colName].sorting = undefined;
        this.updateKeyOrder();
        this.sort();
    }

    updateKeyOrder(){
        for (let i = 0; i < this.sortKeyOrder.length; i++){
            let colName = this.sortKeyOrder[i];
            this.head[colName].sorting.keyIndex = i;
        }
    }

    setFilter(colName, filter){

        let makeFilterFunc = (filterText) => {
            let func;
            if (filterText === ""){
                func = (e) => true;
            } else if (filterText[0].match(/(\<|\>)/) && filterText.slice(1).match(/ *-?\d*\.?\d*/)){
                func = (e) => {return eval(e+filterText)}
            } else {
                func = (e) => {
                    if (isNaN(e))
                        return e === filterText || e.includes(filterText);
                    else
                        return e === parseFloat(filterText);
                };
            }
            return func;    
        }

        this.head[colName].filter = {
            text : filter,
            func : makeFilterFunc(filter)
        };

        this.presBody = this.body;

        for (let colName in this.head){
            let filterFunc = this.head[colName].filter.func;
            this.presBody = this.presBody.filter((rec) => filterFunc(rec[colName]));
        }

        if (this.head.values().some(col=>col.filter.text !== "")){
            this.tableState = 'FILTER';
        } else {
            this.tableState = 'NORMAL';
        }
    }

    /**
     * sort
     * ============
     * sort on both original data and displayed data. Deep-copying the whole
     * table will be costy, and not necessary, thus we do a write-through.
     */
    sort(){

        for (let i = 0; i < this.sortKeyOrder.length; i++){
            let colName = this.sortKeyOrder[i];

            if(this.head[colName].sorting === undefined) continue;

            let isDesc = this.head[colName].sorting.isDesc ? 1 : -1;
            this.body.sort((a, b) => ((a[colName] < b[colName]) ? -1 : 1) * isDesc);
        }

        this.presBody = this.body;
    }

    setGather(key){
        console.log(this.head[key]);
        if( 'gather' in this.head[key].operations ){

            if (!this.head[key].gathered){
                this.tableState = "GATHER";
                this.head[key].gathered = true;
                let {summaryFunc, labelFunc, termFunc, oper} = this.head[key].operations['gather'];
    
                this.body = this.body.nest(key, {
                    summaryFunc,
                    labelFunc,
                    termFunc,
                    oper,
                });
                this.body.sortBy(key);
                this.presBody = this.body;    
            } else {
                this.body = this.body.flatten();
            }


        }
    }

    setPage(key){
        if('pager' in this.head[key].operations ){
            this.tableState = 'PAGED';

            // this.pagePath 
        }
    }
}

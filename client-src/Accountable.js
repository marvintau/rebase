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

    /**
     * addPager
     * ========
     * Add a new way of paging, and controlled by a paginator.
     * 
     * The default paging method is to split the records into pages according
     * to the record number. And this will not affect the structure body. However
     * you may define your own way of paging, which will separate the body into
     * several groups, and switch different groups with paginator. Thus it's more
     * like a "group switcher".
     * 
     * There could be multiple custom pager, which means you may separate the body
     * into a hierarchical groups.
     * 
     * After separating the body into groups with a pager, the sort, filter, and
     * default paging method will be affect the innermost group.
     * 
     * Moreover, addPager should not be used as a dynamic/interactive operation.
     * Pagers should be prepared before rendering.
     * @param {string} pagerName
     * @param {Function} pagerFunc pager function
     * @param {Function} displayFunc display paging
     * 
     */
    addPager(name, pagerFunc, displayFunc){
        this.pagers.push({
            name, pagerFunc, displayFunc
        })
    }

    /**
     * applyPagers
     * ===========
     * apply all pager function at one (and should be only one) time.
     */
    applyPagers(){
        // for (let i = 0; i > )
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

    /**
     * initGather
     * ==========
     * supposed to run in the initiating stage.
     * 
     * @param {string} colName column name
     * @param {Function} labelFunc
     * THE LABELFUNC IS NOT A FUNCTION THAT RETURNS LABEL,
     * BUT RETURNS THE LABEL FUNCTION! It takes the level
     * as parameter, and returns the label function that
     * corresponding to the level.
     * 
     * @param {Function} sumFunc
     * the function that turns grouped records into single
     * one. It takes two arguments, which are the label of
     * the group, and the grouped records.
     * 
     * @param {Array} gatherLevels the levels of gathering, in array form.
     */
    initGather(colName, labelFunc, sumFunc, gatherLevels){

        let defaultLevel = "无聚合";

        this.head[colName].gather = {
            labelFunc,
            sumFunc,
            levels: [defaultLevel, ...gatherLevels],
            currLevel: 0
        }        
    }

    setGather(colName, oper){

        let currLevel = this.head[colName].gather.currLevel,
            levels = this.head[colName].gather.levels;
        
        this.head[colName].gather.currLevel = levels[oper](currLevel);

        let newLevel = this.head[colName].gather.currLevel

        if(newLevel !== 0){

            let labelFunc = this.head[colName].gather.labelFunc(newLevel);
    
            this.presBody = this.body
                .groupBy((e)=>labelFunc(e))
                .map((label, grouped) => sumFunc(label, grouped))
                .values();
            
            this.tableState = "gather";
        } else {
            this.presBody = this.body;
            this.tableState = "normal";
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
            this.tableState = 'filter';
        } else {
            this.tableState = 'normal';
        }
    }

    expand(rowNumber){
        
        let expanded = this.body[rowNumber].unzip();
        
        Object.defineProperty(this.body[rowNumber], "children", {
            value: expanded,
            enumerable: false
        });
    }

    collapse(rowNumber){
        
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


}

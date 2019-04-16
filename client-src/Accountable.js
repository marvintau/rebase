import "./ExtendArray.js"

export default class Accountable {
    constructor(head, body){
        
        this.head     = head;
        this.body     = body;

        this.sortKeyOrder  = [];

        this.tableState = "NORMAL";
    }

    applyColumn(keys, func){
        for (let i = 0; i < this.body.length; i++){
            for (let key of keys){
                this.body[i][key] = func(this.body[i][key], this.head[key]);
            }
        }
    }

    insertRecord(path, record){
        
        record = record ? record : this.head.map((k, v)=>v.default);

        let ref = this.body;
        for (let i = 0; i < path.length-1; i++){
            ref = ref[path[i]].children;
        }
        
        ref.splice(path.last()+1, 0, record);
    }

    removeRecord(path){

        let ref = this.body;
        for (let i = 0; i < path.length-1; i++){
            ref = ref[path[i]].children;
        }
        ref.splice(path.last(), 1);

    }

    updateCell(path, columnKey, data){

        let ref = this.body;
        for (let i = 0; i < path.length-1; i++){
            ref = ref[path[i]].children;
        }
        ref[path.last()][columnKey] = data;
    }

    permuteColumns(colNameOrder){
        this.head = this.head.rewrite(colNameOrder);
        this.body = this.body.map(record => record.rewrite(colNameOrder));
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

    }

    setGather(key){

        if( 'gather' in this.head[key].operations ){

            if (!this.head[key].gathered){
                this.tableState = "GATHER";
                this.head[key].gathered = true;
    
                this.body = this.body.nest(key, this.head[key].operations['gather']);

                this.body.sortBy(key);
            } else {

                this.tableState = "NORMAL";
                this.head[key].gathered = false;

                console.time('flatten')
                this.body = this.body.flatten2((e) => e.children);
                console.timeEnd('flatten')
            }


        }
    }
}

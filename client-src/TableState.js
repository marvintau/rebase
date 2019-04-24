import "./ExtendArray.js"

export default class TableState {
    constructor(head, body){
        
        this.head     = head;
        this.body     = body;

        this.sortKeyOrder  = [];

        this.tableState = "NORMAL";
    }

    ref(path, childFunc=(e)=>e.children){
        let r = this.body;
        for (let i = 0; i < path.length-1; i++){
            r = childFunc(r[path[i]]);
        }
        return r;
    }

    insert(path){
        this.ref(path).splice(path.last()+1, 0, this.head.map((k, v)=>v.default));
    }

    remove(path){
        this.ref(path).splice(path.last(), 1);
    }

    update(path, columnKey, data){
        this.ref(path)[path.last()][columnKey] = data;
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
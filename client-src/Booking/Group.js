import List from "./List";

/**
 * The Group class
 * ===============
 * Note: In this project, a Group class should always
 *       created from a List object.
 */
export default class Group {
    
    // Note: 
    // 1. group MUST BE a Map
    // 2. the value of Map should be List or Group
    //    AT THE SAME TIME. 
    constructor(desc, group){
        
        this.desc = desc;
        this.group = group;
    }

    get(key){
        return this.group[key];
    }

    set(path, newValue){
        let [key, ...rest] = path;
        this.get(key).set(rest, newValue);
    }

    insert(path, newRec){
        let [key, ...rest] = path;
        if(key === undefined){
            throw Error('the given path reaches a group, which not available for insert record');
        } else {
            this.get(first).set(rest, newRec);
        }
    }

    iter = (func, logger=()=>{}, desc) => {

        logger(`按${desc}迭代`);
        let newGroup = {},
            entries = Object.entries(this.group);

        for (let i = 0; i < entries.length; i++){
            let [key, value] = entries[i];            
            newGroup[key] = func(key, value);
        }


        return new Group(this.desc, newGroup);
    }

    vals(){
        return Object.values(this.group);
    }

    keys(){
        return Object.keys(this.group);
    }

    grap() {

        let list = new List(0),
            vals = this.vals();
        for (let i = 0; i < vals.length; i++){
            list.unshift(vals[i]);
        }
        return list;
    }
}
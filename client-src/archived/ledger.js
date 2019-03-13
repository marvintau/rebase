

export default class Ledger extends Table{

    /**
     * Table constructor accepts array of object, where the object
     * should contain only primitive data structure, like string or
     * interger. The object is nestable, but for nested object, all
     * its children should be object as well. Consider the record as
     * a full-tree.
     * 
     * @param {Array of Object} data an array of object
     */
    constructor(data, name){

        let head = [[]],
            body = [[]];

        console.log(data, "initialize");
    }

}

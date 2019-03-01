import sql from 'mssql';

export default class Base {

    constructor(){

        this.config = {
            user: "marvin",
            password: "1q0o2w9i3e8u",
            server: "192.168.0.127",
            options: {encrypt: true},
            authentication: {
              type: "default",
              options: {  
                userName: "marvin",
                password: "1q0o2w9i3e8u",
            }
          }
        };
    }

    connect(){
        return sql.connect(this.config);
    }

    close(){
        return sql.close();
    }
}
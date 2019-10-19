import sql from 'mssql';

const fs = require('fs').promises;

let config = {
    user: "marvin",
    password: "all4Jesus",
    server: "192.168.0.128",
    connectionTimeout: 300000,
    idleTimeoutMillis: 300000,
    requestTimeout:    300000,
    max: 100
}

const queries = {

RESTORE : (path) =>
`declare @mdfpath nvarchar(max),
@ldfpath nvarchar(max)

select @mdfpath = [0], @ldfpath = [1]
from (select type, physical_name
    from sys.master_files
    WHERE database_id = DB_ID(N'rebase'))
as paths
pivot(max(physical_name) for type in ([0], [1])) as pvt;

restore database rebase from disk = N'${path}' WITH FILE=1,
MOVE N'Ufmodel'     TO @mdfpath,
MOVE N'Ufmodel_LOG' TO @ldfpath,
NOUNLOAD,  REPLACE,  STATS = 10;`,

PROGRESS : () =>
`SELECT command,
    start_time,
    percent_complete,
    CAST(estimated_completion_time/60000 as varchar) + 'min' as est_remaining_time
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) s
WHERE r.command='RESTORE DATABASE';`,

CHECKIYEAR: () => {
    return `SELECT * FROM rebase.information_schema.columns WHERE column_name='iyear' AND table_name='GL_accvouch'`
},

BALANCE : (iyearExisting) =>{

    let year = iyearExisting ? "iyear" : "0 as iyear";

    return `select accsum.i_id, iperiod, ${year}, accsum.ccode, ccode_name, cclass, mb, md, mc, me from rebase.dbo.GL_accsum accsum
    join rebase.dbo.code code
    on code.ccode=accsum.ccode;`
},

JOURNAL: (iyearExisting) => {

    let year = iyearExisting ? "iyear" : "0 as iyear";

    return `select cus_vouchers.*, ccode_name, cclass from
    (select ino_id, inid, iperiod, ${year}, ccode, ccode_equal, cdigest, cCusCode, cCusName, md, mc from
        rebase.dbo.GL_accvouch vouchers
        left join (select cCusName, cCusCode from rebase.dbo.Customer) customer
        on vouchers.ccus_id = customer.cCusCode) as cus_vouchers
    join rebase.dbo.code code
    on cus_vouchers.ccode=code.ccode;`
},

CATEGORY : (iyearExisting) =>
`select code.ccode, ccode_name, cclass
    from rebase.dbo.code code
join (
    select distinct ccode
        from rebase.dbo.GL_accsum
    ) as accsum
on code.ccode=accsum.ccode`,
}

export function operate(method, args){

    return new Promise(function(resolve, reject){
        let pool = new sql.ConnectionPool(config);
        return pool.connect()
        .then((pool) => {
            return pool.request().query(queries[method](args));
        }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        }).finally(() => {
            pool.close();
        })
    })
}

export function retrieve(method, args){

    return new Promise(function(resolve, reject){
        let pool = new sql.ConnectionPool(config);
        return pool.connect()
        .then((pool) => {
            return pool.request().query(queries.CHECKIYEAR())
        }).then((res) => {
            let iyearExisting = res.recordset.length === 1;
            return pool.request().query(queries[method](iyearExisting, ...args));
        }).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        }).finally(() => {
            pool.close();
        })
    })
}

export function retrieveAndStore(path, method, args=[]){

    return retrieve(method, args).then(res => {
        // console.log(res);
        console.log("writing file", path, method, `${res.recordset.length} lines`);
        return fs.writeFile(`${path}.${method}.JSON`, JSON.stringify(res.recordset));
    }).catch(err => {
        console.error(path, method, err);
    })
}

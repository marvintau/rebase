import io from 'socket.io-client';

import { saveAs } from 'file-saver';

import {Badge, Button, Form, FormGroup} from 'reactstrap';
import {Table} from 'reactstrap';

import getFinancialTables from './FinancialTables';
import {SheetCollection} from 'persisted';

import UploadManager from './UploadManager';

import Formwell from 'formwell'

export default class TableManager extends React.Component {
  constructor(props){
    super(props);

    this.state ={
      status :'loading'
    }
  }

  componentDidMount(){

    let {address} = this.props;

    let id = localStorage.getItem('user_id')

    this.socket = io(`${address}/TABLES`)
    .on('ERROR', ({msg}) =>{
    })
    .on('connect_error', (error) => {
    });

    this.sheetColl = new SheetCollection(this.socket, id, this.log);
    this.sheetColl.addSheets(getFinancialTables());
    this.setState({
      status: 'selecting-table'
    })
  }

  componentWillUnmount(){
    this.socket.close();
    this.sheetColl.clearSheets();
  }

  export = (data) => {
    let {currTable} = this.state,
        {projName} = this.props;
    let sheet = this.sheetColl.get(currTable);

    console.log(currTable, 'export');

    this.socket.emit('EXPORT', {
      projName,
      sheetName: sheet.desc,
      type: sheet.type,
      data
    })
    .on('EXPORTED', ({outputArrayBuffed, projName, sheetName}) => {
      saveAs(new Blob([outputArrayBuffed],{type:"application/octet-stream"}), `导出-${projName}-${sheetName}.xlsx`);
    })
}


// save接受的是从exportFunc返回的用于在服务器端保存的数据。具体的返回值需要参考
// FinancialTables中各文件的exportFunc是如何实现的。
  save = (data) => {
    let {currTable} = this.state,
        {projName} = this.props;
    let sheet = this.sheetColl.get(currTable);

    console.log(sheet, sheet.type, 'save');

    this.socket.emit('SAVE', {
        id: localStorage.getItem('user_id'),
        projName,
        sheetName: currTable,
        type: sheet.type,
        data
    }).on('SAVED', () => {
        console.log('已保存')
    })
  }


  fetchTable = (sheetName) => {

    let {projName} = this.props;

    console.log(projName, sheetName, 'fetch');

    this.sheetColl.fetchTable({
      projName,
      sheetName,
      afterFetched: (isFetched) => {
        this.setState({
          status: isFetched ? 'working-table' : 'require-upload',
          currTable: sheetName
        });  
      }
    })
  }

  navigateToList = () => {
    this.setState({
      currTable: undefined,
      status: 'selecting-table'
    })
  }

  renderTable(){
    
    let rows = [];
    for (let sheetName in this.sheetColl.sheets){
      let {desc, location, hidden} = this.sheetColl.get(sheetName);
      if(location === 'local' && !hidden) {
        rows.push(<tr key={sheetName}>
          <td style={{verticalAlign: 'middle'}}>{desc}</td>
          <td><div style={{display: 'flex', flexDirection:'row-reverse'}}>
            <Button color="primary" onClick={() => this.fetchTable(sheetName)}>打开</Button>
          </div></td>
        </tr>)
      }
    }

    return <Table hover striped><tbody>{rows}</tbody></Table>;
  }

  render(){
    let {projName, backToProjectList} = this.props,
        {status, currTable} = this.state,
        content;

    switch(status){
      case 'loading' : 
        content = <div>TableManager Placeholder</div>;
        break;
      case 'selecting-table':
        let {address} = this.props;
        let tableList = this.renderTable();
        content = <div>
          {tableList}
          <UploadManager address={address} projName={projName} />
        </div>
        break;
      case 'working-table':
        let {tables, exportProc, isSavable, isExportable} = this.sheetColl.get(currTable);

        content = <Formwell
            key={currTable}
            sheetName={currTable}
            tables={tables}

            exportProc={exportProc}
            saveRemote={isSavable && this.save}
            exportRemote={this.export}
        />;
        break;
      case 'require-upload':
        let {referred} = this.sheetColl.get(currTable);
        console.log(referred);
        content = <div>看来您还有其他文件没有上传，请先上传完毕后再打开此表</div>
        break;
    }
        
    let [realProjName, year] = projName.split('-');

    return <div>
      <Button outline color='primary' style={{marginBottom:'10px'}} onClick={backToProjectList}>
        我的项目
      </Button>
      <Button outline color='primary' style={{marginLeft: '10px', marginBottom:'10px'}} onClick={this.navigateToList}>
        <Badge color="primary" >{year}</Badge> {' '} {realProjName}
      </Button>
      {currTable && <Button color="dark" outline style={{marginLeft: '10px', marginBottom:'10px'}}>{this.sheetColl.get(currTable).desc}</Button>}
      {content}
    </div>
  }
}
import io from 'socket.io-client';

import {Button, Form, FormGroup} from 'reactstrap';

import {Table, Label} from 'reactstrap';

class ConfirmDelete extends React.Component {
  constructor(props){
    super(props);
    this.state = {confirm: false}
  }

  toggleConfirm = (e) => {
    this.setState({
      confirm: !this.state.confirm
    })
  }

  render(){
    let {del} = this.props;
    let {confirm} = this.state;
    if(!confirm){
      return <Button color="warning" style={{margin: '0px 5px'}} onClick={this.toggleConfirm}>删除</Button>
    } else {
      return [
        <Button key='withdraw' color="warning" style={{margin: '0px 5px'}} onClick={this.toggleConfirm}>取消</Button>,
        <Button key="confirm" color="danger" style={{margin: '0px 5px'}} onClick={del}>确认删除</Button>,
      ]
    }
  }
}

export default class ProjectNavigator extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      projName: '',
      projNameValid: false,
      year: '2019',
      yearValid: true,

      status: 'loading'
    }
  }

  renderTable(data){
    let rows = data.map(({projName, year}, r) => {

      let fullProjName = `${projName}-${year}`;

      return <tr key={r}>
        <td style={{verticalAlign:'middle'}}><div>{year}{' - '}{projName}</div></td>
        <td key='control'><div style={{display: 'flex', flexDirection:'row-reverse'}}>
          <Button color="primary" onClick={() => this.enter(fullProjName)}>进入</Button>
          <ConfirmDelete del={() => this.delete(fullProjName)}/>
        </div></td>
      </tr>
    });
    return <Table hover striped style={{tableLayout:'fixed'}}><tbody>{rows}</tbody></Table>
  }
  
  enter(e){
    let {navigateToProject} = this.props;
    navigateToProject(e);
  }

  error(msg){
    this.setState({
      status: 'error',
      errorMsg: msg
    })
  }

  componentDidMount(){

    let id = localStorage.getItem('user_id');

    this.socket = io(`${this.props.address}/PROJECT`)
    .on('ERROR', ({msg}) =>{
      let errMsg = {
        'EEXIST': '已经有一个同名的项目了'
      }[msg];
      this.setState({uploadState: 'ERROR', errMsg})
    })
    .on('connect_error', (error) => {
        this.error('与服务器的连接貌似断开了');
    })
    .on('PROJECT_LIST', ({list}) => {
      let projList = list;
      this.setState({status: 'selecting', projList});
    })
    .on('CREATE_PROJECT_DONE', () => {
      this.socket.emit('REQUIRE_PROJECT_LIST', {id});
    })
    .on('DELETE_PROJECT_DONE', () => {
      this.socket.emit('REQUIRE_PROJECT_LIST', {id});
    })
    .emit('REQUIRE_PROJECT_LIST', {id});
  }

  componentWillUnmount(){
    this.socket.close();
  }

  create = () => {
    let id = localStorage.getItem('user_id');
    let {year, projName} = this.state;
    this.socket.emit('CREATE_PROJECT', {projName, year, id})
  }

  delete = (projName) => {
    let id = localStorage.getItem('user_id');
    this.socket.emit('DELETE_PROJECT', {id, projName})
  }

  handleInput = (e) => {
    let {name, value} = e.target;

    let yearValid = true,
        projNameValid = true;
    if(name === 'year' && value.match(/^2[0-9]{3}$/) === null){
        yearValid = false;
    }
    if(name === 'projName' && (value.length === 0 || value.includes('-'))){
        projNameValid = false;
    }

    this.setState({[name]: value, yearValid, projNameValid});
  }


  toggleCreate = (e) => {

    let {status: current} = this.state;
    let status = {
      'creating': 'selecting',
      'selecting': 'creating'
    }[current]

    this.setState({status});
  }

  render(){
    let {status, projList} = this.state;

    let content;
    switch(status) {
      case 'loading':
        content = <div> 正在载入您的项目，请稍候... </div>;
        break;
      case 'creating':
        let {year, projName, yearValid, projNameValid} = this.state;
        content =<Form>
            <FormGroup>
                <Label>会计年度</Label>
                <input 
                    id="year" name="year" value={year}
                    className="form-control" style={{margin:'3px'}}
                    placeholder="会计年度" onChange={this.handleInput}/>
                {!yearValid && <div className='help-block'>年度格式不对</div>}
            </FormGroup>
            <FormGroup>
                <Label>项目名称</Label>
                <input
                    id="projName" name='projName' value={projName}
                    className="form-control" style={{margin:'3px'}}
                    placeholder="项目（客户）名称" onChange={this.handleInput} />
                {!projNameValid && <div className='help-block'>项目名称不能为空，同时不能包含"-"符号（全角符号没问题）</div>}
            </FormGroup>
            <FormGroup>
                { yearValid && projNameValid && <Button id="create" color="primary" onClick={this.create} style={{marginRight: '15px'}}>创建</Button>}
                <Button color="info" outline onClick={this.toggleCreate}>返回</Button>
            </FormGroup>
        </Form>
        break;
      case 'selecting':
        content = <div>
          {this.renderTable(projList)}
          <Button color="primary" onClick={this.toggleCreate}>创建新项目</Button>
        </div>;
        break;
    }

    return <div style={{margin:'10px'}}>
      {content}
    </div>
  }
}

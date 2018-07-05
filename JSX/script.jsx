class CompaniesService {  
    
    mapToCompaniesWithDaughters(companies) {
    
            let daughterCompanies = (daughterIds) => {
                return companies.filter(c => daughterIds.includes(c.id));
            }
    
            return companies.map((company, i, arr) => {
                return {
                    name: company.name,
                    profit: company.profit,
                    id: company.id,
                    daughterIds: company.daughterIds,
//                    daughters: daughterCompanies(company.daughterIds),
                    totalProfit: company.profit + daughterCompanies(company.daughterIds)
                        .reduce((acc, cur) => acc += cur.profit, 0)
                };
            })
        }
    
    getAllCompanies() {
        return axios.get(`http://localhost:3000/company`)
            .then(res => this.mapToCompaniesWithDaughters(res.data)); 
    }

    getCompany() {
        return axios.get(`http://localhost:3000/company/${id}`)
            .then(res => this.mapToCompaniesWithDaughters([res.data]));
    }

    deleteCompany(id) {
        return axios.delete(`http://localhost:3000/company/${id}`);
    }

    updateCompany(company) {
        company.daughterIds = [];
        company.totalProfit = null;
        company.profit = parseInt(company.profit);
        return axios.put(`http://localhost:3000/company/${company.id}`, company);
    }

    createCompany(company) {
        company.daughterIds = [];
        company.totalProfit = null;
        company.profit = parseInt(company.profit);
        return axios.post(`http://localhost:3000/company`, company);
    }
}


const companiesService = new CompaniesService();


class App extends React.Component{
       
    constructor(props){
        super(props);
        this.state = {
            companies: [],
            viewMode: false,
            selectedCompany: null,
            formMode: false       
        };
        this.onSave = this.onSave.bind(this);
        this.getData = this.getData.bind(this);
        this.deleteTR = this.deleteTR.bind(this);
        this.viewClose = this.viewClose.bind(this);
        this.viewShow = this.viewShow.bind(this);
        this.formShow = this.formShow.bind(this);
        this.formClose = this.formClose.bind(this);
    }
      
    viewShow(id) {
        this.setState(
            {
                viewMode: true, 
                selectedCompany: this.state.companies.find(x => x.id === id)
            }
        );
    } 
    
    viewClose() {
        this.setState({viewMode: false});
    }
    
    formShow(id){
        this.viewClose();
        this.setState({formMode: true, selectedCompany: {}});              //why not else??
        if(id) {
            this.setState({selectedCompany: this.state.companies.find(x => x.id === id)}) 
        }
    }
    
    formClose(){
        this.setState({formMode: false});
    }
    
    
    componentDidMount(){
        companiesService.getAllCompanies() 
            .then(data => {                              
                this.setState({companies: data}); 
            })
    }
    
    getData(){
        companiesService.getAllCompanies()  
            .then(data => {                              
                this.setState({companies: data})     
            })
    }
    
    deleteTR(id) {
        companiesService.deleteCompany(id)  
            .then(() => getData())
    }
    
    onSave(company) {
        let promise;
        if(company.id){
           promise = companiesService.updateCompany(company)
        }else {
            promise = companiesService.createCompany(company)
        }
        promise.then(() => this.getData())
        this.formClose();
    }
    
    
    render(){
        let currentComponent = '';
        if(this.state.viewMode){
            currentComponent = <ViewWindow company={this.state.selectedCompany} close={this.viewClose} showEditForm={this.formShow}/>
        }else if(this.state.formMode){
            currentComponent = <CompanyForm company={this.state.selectedCompany} save={this.onSave} close={this.formClose}/>
        }else {
            currentComponent = <Table companies={this.state.companies} onDelete={this.deleteTR} show={this.viewShow} showAddForm={this.formShow}/>
        }
        return currentComponent;
    }
    

}


class Table extends React.Component{
    
    render(){
    return <div>
            <table>
              <caption>TableAble</caption>
              <tbody>
                <tr><th>Company</th><th>Profit</th><th>Total profit</th><th>Operate</th></tr>
                  { 
                      this.props.companies.map(company => 
                            <Row key={company.id} company={company} onDelete={this.props.onDelete} show={this.props.show}/>
                        )}
              </tbody>
            </table>
            <button className="btnAdd" onClick={() => this.props.showAddForm()}>Add company</button>
        </div>
    }
}

class Row extends React.Component {
    
   render() {
       return <tr>
            <td>{this.props.company.name}</td>
            <td>{this.props.company.profit}</td>
            <td>{this.props.company.totalProfit}</td>
            <td><button  onClick = {() => this.props.show(this.props.company.id)}>View</button>
            <button onClick={() => this.props.onDelete(this.props.company.id)}>Delete</button></td>
            </tr>
   } 
}


class ViewWindow extends React.Component {
    render(){
        return  <div>
                    <div className="modal_content">
                        <span className="close" onClick={() => this.props.close()}>&times;</span>
                        <span>ID: <p className = "pView">{this.props.company.id}</p></span>
                        <span>Name: <p className = "pView" >{this.props.company.name}</p></span>
                        <span>Profit: <p className = "pView" >{this.props.company.profit}</p></span>
                        <button onClick={() => this.props.showEditForm(this.props.company.id)}>Edit</button>
                    </div>
                </div>
                
    }
}



class CompanyForm extends React.Component {
    
    constructor(props){
        super(props);
        this.state = Object.assign({}, props.company);
    }
    
    onNameChange(event) {
        this.setState({name: event.target.value.toUpperCase()});
    }
    
    onProfitChange(event){
        this.setState({profit: event.target.value});
    }
    onDaughtersChange(event){
        this.setState({daughterIds: event.target.value});
    }
    
    render(){
        return <div>
            <div className="modal_content">
                <span className="close" onClick={this.props.close}>&times;</span>
                <label>Name: 
                    <input type="text" value={this.state.name} onChange={(e) => this.onNameChange(e)}></input>
                </label>
                <hr width="50%"></hr>
                <label>Profit: 
                    <input type="text" value={this.state.profit} onChange={(e) => this.onProfitChange(e)}></input>
                </label>
                <hr width="50%"></hr>
                <label>Daughters: 
                    <input type="text" value={this.state.daughterIds} onChange={(e) => this.onDaughtersChange(e)}></input>
                </label>
                <hr width="50%"></hr>
                <button onClick={() => this.props.save(this.state)}>Save</button>
                <button style={{float:"right"}} onClick = {this.props.close}>Cancel</button>
            </div>
        </div>
    }
}










ReactDOM.render(
    <App/>,
    document.getElementById('container')
)





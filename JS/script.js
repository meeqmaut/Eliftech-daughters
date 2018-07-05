class CompaniesService {

    mapToCompaniesWithDaughters(companies) {

        let daughterCompanies = daughterIds => {
            return companies.filter(c => daughterIds.includes(c.id));
        };

        return companies.map((company, i, arr) => {
            return {
                name: company.name,
                profit: company.profit,
                id: company.id,
                daughterIds: company.daughterIds,
                //                    daughters: aaddaughterCompanies(company.daughterIds),
                totalProfit: company.profit + daughterCompanies(company.daughterIds).reduce((acc, cur) => acc += cur.profit, 0)
            };
        });
    }

    getAllCompanies() {
        return axios.get(`https://company-backend.herokuapp.com/company`).then(res => this.mapToCompaniesWithDaughters(res.data));
    }

    getCompany() {
        return axios.get(`https://company-backend.herokuapp.com/company/${id}`).then(res => this.mapToCompaniesWithDaughters([res.data]));
    }

    deleteCompany(id) {
        return axios.delete(`https://company-backend.herokuapp.com/company/${id}`);
    }

    updateCompany(company) {
        company.daughterIds = [];
        company.totalProfit = null;
        company.profit = parseInt(company.profit);
        return axios.put(`https://company-backend.herokuapp.com/company/${company.id}`, company);
    }

    createCompany(company) {
        company.daughterIds = [];
        company.totalProfit = null;
        company.profit = parseInt(company.profit);
        return axios.post(`https://company-backend.herokuapp.com/company`, company);
    }
}

const companiesService = new CompaniesService();

class App extends React.Component {

    constructor(props) {
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
        this.setState({
            viewMode: true,
            selectedCompany: this.state.companies.find(x => x.id === id)
        });
    }

    viewClose() {
        this.setState({ viewMode: false });
    }

    formShow(id) {
        this.viewClose();
        this.setState({ formMode: true, selectedCompany: {} }); //why not else??
        if (id) {
            this.setState({ selectedCompany: this.state.companies.find(x => x.id === id) });
        }
    }

    formClose() {
        this.setState({ formMode: false });
    }

    componentDidMount() {
        companiesService.getAllCompanies().then(data => {
            this.setState({ companies: data });
        });
    }

    getData() {
        companiesService.getAllCompanies().then(data => {
            this.setState({ companies: data });
        });
    }

    deleteTR(id) {
        companiesService.deleteCompany(id).then(() => getData());
    }

    onSave(company) {
        let promise;
        if (company.id) {
            promise = companiesService.updateCompany(company);
        } else {
            promise = companiesService.createCompany(company);
        }
        promise.then(() => this.getData());
        this.formClose();
    }

    render() {
        let currentComponent = '';
        if (this.state.viewMode) {
            currentComponent = React.createElement(ViewWindow, { company: this.state.selectedCompany, close: this.viewClose, showEditForm: this.formShow });
        } else if (this.state.formMode) {
            currentComponent = React.createElement(CompanyForm, { company: this.state.selectedCompany, save: this.onSave, close: this.formClose });
        } else {
            currentComponent = React.createElement(Table, { companies: this.state.companies, onDelete: this.deleteTR, show: this.viewShow, showAddForm: this.formShow });
        }
        return currentComponent;
    }

}

class Table extends React.Component {

    render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "table",
                null,
                React.createElement(
                    "caption",
                    null,
                    "TableAble"
                ),
                React.createElement(
                    "tbody",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement(
                            "th",
                            null,
                            "Company"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Profit"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Total profit"
                        ),
                        React.createElement(
                            "th",
                            null,
                            "Operate"
                        )
                    ),
                    this.props.companies.map(company => React.createElement(Row, { key: company.id, company: company, onDelete: this.props.onDelete, show: this.props.show }))
                )
            ),
            React.createElement(
                "button",
                { className: "btnAdd", onClick: () => this.props.showAddForm() },
                "Add company"
            )
        );
    }
}

class Row extends React.Component {

    render() {
        return React.createElement(
            "tr",
            null,
            React.createElement(
                "td",
                null,
                this.props.company.name
            ),
            React.createElement(
                "td",
                null,
                this.props.company.profit
            ),
            React.createElement(
                "td",
                null,
                this.props.company.totalProfit
            ),
            React.createElement(
                "td",
                null,
                React.createElement(
                    "button",
                    { onClick: () => this.props.show(this.props.company.id) },
                    "View"
                ),
                React.createElement(
                    "button",
                    { onClick: () => this.props.onDelete(this.props.company.id) },
                    "Delete"
                )
            )
        );
    }
}

class ViewWindow extends React.Component {
    render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "modal_content" },
                React.createElement(
                    "span",
                    { className: "close", onClick: () => this.props.close() },
                    "\xD7"
                ),
                React.createElement(
                    "span",
                    null,
                    "ID: ",
                    React.createElement(
                        "p",
                        { className: "pView" },
                        this.props.company.id
                    )
                ),
                React.createElement(
                    "span",
                    null,
                    "Name: ",
                    React.createElement(
                        "p",
                        { className: "pView" },
                        this.props.company.name
                    )
                ),
                React.createElement(
                    "span",
                    null,
                    "Profit: ",
                    React.createElement(
                        "p",
                        { className: "pView" },
                        this.props.company.profit
                    )
                ),
                React.createElement(
                    "button",
                    { onClick: () => this.props.showEditForm(this.props.company.id) },
                    "Edit"
                )
            )
        );
    }
}

class CompanyForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = Object.assign({}, props.company);
    }

    onNameChange(event) {
        this.setState({ name: event.target.value.toUpperCase() });
    }

    onProfitChange(event) {
        this.setState({ profit: event.target.value });
    }
    onDaughtersChange(event) {
        this.setState({ daughterIds: event.target.value });
    }

    render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "modal_content" },
                React.createElement(
                    "span",
                    { className: "close", onClick: this.props.close },
                    "\xD7"
                ),
                React.createElement(
                    "label",
                    null,
                    "Name:",
                    React.createElement("input", { type: "text", value: this.state.name, onChange: e => this.onNameChange(e) })
                ),
                React.createElement("hr", { width: "50%" }),
                React.createElement(
                    "label",
                    null,
                    "Profit:",
                    React.createElement("input", { type: "text", value: this.state.profit, onChange: e => this.onProfitChange(e) })
                ),
                React.createElement("hr", { width: "50%" }),
                React.createElement(
                    "label",
                    null,
                    "Daughters:",
                    React.createElement("input", { type: "text", value: this.state.daughterIds, onChange: e => this.onDaughtersChange(e) })
                ),
                React.createElement("hr", { width: "50%" }),
                React.createElement(
                    "button",
                    { onClick: () => this.props.save(this.state) },
                    "Save"
                ),
                React.createElement(
                    "button",
                    { style: { float: "right" }, onClick: this.props.close },
                    "Cancel"
                )
            )
        );
    }
}

ReactDOM.render(React.createElement(App, null), document.getElementById('container'));

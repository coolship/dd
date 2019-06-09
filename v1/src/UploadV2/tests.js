class SimpleUploadView extends Component {
    render(props) {
        return (
            <div>
                <section>
                    <h1>upload datasets</h1>
                    <XumiDropperContainer/>
                </section>
            </div>
        )
    }
}
class UploadProgressView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            which_dataset: props.match.params.number,
            metadata: _.find(props.datasets, (d) => d.dataset == props.match.params.number)
        }
        console.log(this.state)
    }
    render(props) {
        console.log(props)
        return (
            <Breadcrumb
            data={{
            title: <b>Sample Dataset {props.match.params.number}</b>,
            pathname: props.match.url,
            search: null
        }}></Breadcrumb> < div > <section>
            <b>Uploading Dataset {props.match.params.number}</b>
        </section> < /div>
                ) } }
                }




                <Switch>
                    <Route
                        title="List"
                        exact
                        path='/gallery '
 render = {
            (props) => <SimpleUploadView {...props}/>
        } /> <Route
            path='/gallery/:number'
            render={(props) => <GalleryDemo {...props} datasets={this.props.datasets}/>}/> < /Switch>
//preset variable for tokens and set it to null
var token =null;

//represantation of a List of users
class UserList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      users: this.props.users
    };
  }
  //constructing list based on users state
  CreateList = () => {
    var list = [];
    for(var index = 0; index<this.state.users.length; index++){
      
      //Creating an user list for rendering by pushing all users in the users state
      list.push(<div key={this.state.users[index]._id} id={this.state.users[index]._id}><User user={this.state.users[index]} admin={true}/></div>);
    }
    return list;
  }
  //endering the list of users
  render() {
    return <div>{this.CreateList()}</div>;
  }
}

//Representation of a single users info
class User extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      render: true,
      user : this.props.user,
      name : this.props.user.name,
      email : this.props.user.email,
      erapaiva : this.props.user.erapaiva,
      id : this.props.user._id,
      role: this.props.user.role
    };
  }
  render(){
    //if the render state is false we don't render anything
    if (this.state.render==false) return null;
    
    
    //if erapaiva exist we tell it if it dosn't we tell no payment
    if(this.state.erapaiva){
      var info = (" Erapaiva: "+this.state.erapaiva);
    }else{
      var info =(" No payment made ");
    }
    
    
    
    //if user is an admin we tell it if not create a button to make them one
    if(this.state.role==0){
      var admin =("user is an admin");
    }
    else{
      var admin =<button onClick={this.makeAdmin.bind(this)}> make admin</button>;
    }
    //this is what we return when we want to call user in a list
    if(this.props.admin==true){
      return( 
      //return users info and buttons to make them an admin and delete them from the userbase
       <div> Name: {this.state.name} Email: {this.state.email} {info} <button onClick={this.showForm}>Change</button> {admin} <button onClick={this.deleteUser}>Delete</button></div>
      );
    }
    else{
      var outofDate ="";
      if(new Date(this.state.erapaiva)<new Date()||(!(this.state.erapaiva))){
        outofDate="your membership is out of date";
      }
      //this is what we call when the user is diaplayed alone
     return(
     <div>
        <ul>
          <li>Name: {this.state.name}</li>
          <li>Email: {this.state.email}</li>
          <li>{info}</li>
        </ul>
        <p>{outofDate}</p>
        <button onClick={this.makePayment}>Make payment</button>
        <button onClick={this.deleteUser}>Deletet</button>
     </div>
     );
    }
  }
  
  //function for making a payment.
  //normaly this would propably take to a middleman trough wich payments are handeld, since handling payments online can be difficult
  makePayment = () =>
  {
    //Sending call to a server about making a payment
    fetch(('/api/payment/'+this.state.id), {
      headers:{'Authorization': 'Bearer '+ token},
      method: 'POST'
    }).then((response)=>{ 
      if(response.status!=200){
        console.log("tapahtui virhe maksuvirhe koodilla" +response.status);
      }
      //reredering after a succesful payment to update info
      else{response.json().then((data)=> {  
          
          this.setState({erapaiva: data.erapaiva});
      
      });
      }
      
    })
    
  }
  //function for making the user an admin called on the make an admin button
  makeAdmin = () =>
  {
    //sending an admin command to server and checking for a cvalid response
    fetch(('/api/admin/'+this.state.id), {
      headers:{'Content-Type': 'application/json','Authorization': 'Bearer '+ token},
      method: 'POST',
    }).then( (response)=>{ 
      if(response.status!=200){
        console.log("tapahtui virhe koodilla admin " +response.status);
      }
      else{
        this.setState({role: 0});
        console.log("admin made");
      }
    })
    
  }
  
  
  //function for deleting an user called with the delete button
  deleteUser = () =>
  {
    //send command to server to deletet user
    fetch(('/api/users/'+this.state.id), {
      headers:{'Content-Type': 'application/json','Authorization': 'Bearer '+ token},
      method: 'DELETE',
    }).then((response)=>{ 
      if(response.status!=202){
        console.log("tapahtui virhe koodilla deletion " +response.status);
      }
      else{
        this.setState({render: false});
        console.log("Deleted");
      }
    })
    
    
  }
  
  
  //function to get the form to change users data
  showForm = () =>
  {
    //we render the form for changin the users data
    ReactDOM.render(
      <ChangeForm target={this.state.user} admin={true}/>,
      document.getElementById('input')
    )
  }
}  



//form for changin an users info
class ChangeForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  //sending the data in the form to server and saving it if it validates
  handleSubmit(event) {
    event.preventDefault();
    var FData = new FormData(event.target);
    
    fetch('/api/users/'+FData.get('target'), {
      headers:{'Content-Type': 'application/json','Authorization': 'Bearer '+ token},
      method: 'POST',
      body: JSON.stringify({
        name: FData.get('username'),
        password: FData.get('password'),
        email: FData.get('email')
      })
    }).then(function(response){
      if(response.status!=200){
        console.log("tapahtui virhe koodilla formissa " +response.status);
      }
      
      
      //if we succesfully call the change function we re render the user in question in the visable list
      //this gives an warning about rendering ontop of previous component
      else{
        response.json().then(function(data) {
          console.log(FData.get('admin')) 
          ReactDOM.render(
            <User user={data} admin={FData.get('admin')=='true'}/>,
            document.getElementById(FData.get('target'))
          )
          if(FData.get('admin')=='true'){
            ReactDOM.render(
                    <p>User info changed</p>,
                    document.getElementById('input')
                  );
          }
          else{
            ReactDOM.render(
                  <ChangeForm target={data} admin={false}/>,
                  document.getElementById('input')
            );
          
          }
        });
      }  
    });
  }
  
  render() {
    //we return the form for changing users data
    return (
      <div>
      Changin values of {this.props.target.name}
      <br/>
      <form onSubmit={this.handleSubmit}>
      <label htmlFor="target">id of {this.props.target.name}</label>
      <input id="target" name="target" type="readOnly" value={this.props.target._id} />
        <br/>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text"/>
        <br/>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="text" />
        <br/>
        <label htmlFor="email">email</label>
        <input id="email" name="email" type="text"/>
        <br/>
        <input id="admin" name="admin" type="hidden" value={this.props.admin} />
        <button>Change</button>
      </form>
      </div>
    );
  }
}


//from for logging in
class LoginForm extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    var FData = new FormData(event.target);

    //logging in with given data to get token
    fetch('/api/login', {
      headers:{'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
        name: FData.get('username'),
        password: FData.get('password')
      })
    }).then(function(response){
      if(response.status==401){
        alert("Incorrect username or password");
      }
      else{response.json().then(function(data) {
        //saving said token
         token = data.token;
        
        //using said token for login and getting user data
        fetch('/api/info', {
          headers:{'Authorization': 'Bearer '+token,},
          method: 'GET',
        }).then(function(response){
          if(response.status!=200){
            console.log("tapahtui virhe koodilla haettaessa" +response.status);
          }
          else{
            response.json().then(function(data) {
              
              //rendering the logout button
              ReactDOM.render(
                  <button onClick = {window.location.reload.bind(window.location)}>Logout</button>,
                  document.getElementById('links')
              );

              
              //if regural user there is only the data of a single user
              if(data.length==1){
                ReactDOM.render(
                  <h1>Info</h1>,
                  document.getElementById('header')
                );
                console.log(data[0]._id);
                ReactDOM.render(
                  
                  <div id={data[0]._id}> <User user={data[0]} admin={false}/></div>,
                  document.getElementById('output')
                );
                
                ReactDOM.render(
                  <h1>Change Your info</h1>,
                  document.getElementById('subheader')
                );
                
                ReactDOM.render(
                  <ChangeForm target={data[0]} admin={false}/>,
                    document.getElementById('input')
                );
              }
              //if more than on user the login was from an admin
              else{
                ReactDOM.render(
                  <h1>Users</h1>,
                  document.getElementById('header')
                );
                ReactDOM.render(
                  <UserList users={data}/>,
                  document.getElementById('output')
                );
                ReactDOM.render(
                  <h1>Change User</h1>,
                  document.getElementById('subheader')
                );
                
                ReactDOM.render(
                  <div/>,
                  document.getElementById('input')
                );
                
              }
            })
          }
          })
      });
      }
    })
  }

  
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text"/>
        <br/>
        
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="text" />
        <br/>
        
        <button>Login</button>
      </form>
    );
  }
}



//form for creating an user
class CreateForm extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  
  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    
    var FData = new FormData(event.target);
    //sending a request to create an user to the server
    fetch('/api/create', {
      headers:{'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({
        name: FData.get('username'),
        password: FData.get('password'),
        email: FData.get('email')
      })
      //does not automaticly log user in to avoid stacking too many fetches
    }).then(function(response){
      if(response.status!=201){
        alert("User not added due to error " + response.status);
      }
      else{
        alert("User added please login");
      }
    });
  }
  
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" />
        <br/>
        
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="text" />
        <br/>
        
        <label htmlFor="email">email</label>
        <input id="email" name="email" type="text" />
        <br/>
        
        <button>Create</button>
      </form>
    );
  }
}



//what we render on page load
ReactDOM.render(
  <h1>Login</h1>,
  document.getElementById('header')
);
ReactDOM.render(
  <LoginForm />,
  document.getElementById('output')
);

ReactDOM.render(
  <h1>Create User</h1>,
  document.getElementById('subheader')
);

ReactDOM.render(
  <CreateForm />,
  document.getElementById('input')
);
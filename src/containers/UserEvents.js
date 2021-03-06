import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import '../style.scss';
import { changeSelectedEvent } from '../actions';
// import data from '../MockData';


class UserEvents extends Component {
  constructor(props) {
    super(props);
    this.state = { events: [] };
  }

  componentDidMount = () => {
    window.scrollTo(0, 0);
    let field;
    if (window.localStorage.getItem('isChef') === 'true') {
      field = 'chef_id';
    } else {
      field = 'creator_id';
    }
    axios.get('/api/events', { params: {
      field,
      target: window.localStorage.getItem('userId'),
    } })
      .then((events) => {
        console.log('events data: ', events.data);
        this.setState({ events: events.data });
      })
      .catch(err => console.log(err));
  }

  render = () => (
    <div className='topLevelDiv center miniPadding profile event'>
      {this.state.events.map(event => (
          <Card
            key={event.id}
            className='eventCard'
            onClick={() => {
              console.log('Selected Event store: ', event);
              this.props.changeSelectedEvent(event);
              this.props.history.push('/selectedEvent');
          }}>
            <Card.Content>
              <Image floated='right' size='mini' src={event.img} />
              <Card.Header>
                {event.name} ({event.cuisine_type})
              </Card.Header>
              <Card.Meta>
                <div>{event.creator_username}</div>
              </Card.Meta>
              <Card.Description>
                <div>{event.description}</div>
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <span>Size: {event.party_size}</span>
              <span className='onSubmitEditing'>Budget: {event.budget}</span>
            </Card.Content>
          </Card>
      ))}
    </div>
  )
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({ changeSelectedEvent }, dispatch);
}

export default connect(null, mapDispatchToProps)(withRouter(UserEvents));

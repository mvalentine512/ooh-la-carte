import React from 'react';
import io from 'socket.io-client';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setSocket } from '../actions';

const socketUrl = 'http://localhost:8888/';
class ChatTab extends React.Component {
  constructor(props) {
    super(props);

    // this.state = { socket: null };
    this.initSocket = this.initSocket.bind(this);
  }

  componentWillMount() {
    this.initSocket();
  }

  initSocket() {
    if (!this.props.socketReducer) {
      const socket = io(socketUrl);
      socket.on('connect', () => {
        console.log('Connected');
        console.log('Socket: ', socket.id);
        this.props.setSocket(socket.id);
      });
      // this.setState({ socket });
    }
  }

  render = () => (
        <div className='container'>
          Chat room!
        </div>
  );
}

function mapStateToProps(state) {
  return { socketReducer: state.socketReducer };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setSocket }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatTab);

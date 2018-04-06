import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import playerInput, {
  createLevel,
  openingMessages,
  setDungeonLevel
} from '../actions/';

import Cell from '../components/cell';

class Grid extends Component {
  constructor() {
    super();
    this.state = {
      viewportWidth: 0,
      viewportHeight: 0
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.VP_HEIGHT_OFFSET = 5;
    this.VP_MINIMUM_HEIGHT = 22;
    this.VP_WIDTH_RATIO = 30;
    this.VP_HEIGHT_RATIO = 21;
  }

  componentWillMount() {
    const viewportWidth = window.innerWidth / this.VP.VP_WIDTH_RATIO;
    const viewportHeight = Math.max(
      this.VP_MINIMUM_HEIGHT,
      (window.innerHeight / this.VP_HEIGHT_RATIO) - this.VP_HEIGHT_OFFSET
    );
    this.setState({ viewportWidth, viewportHeight });
    this.props.createLevel();
    this.props.setDungeonLevel(1);
  }

  componentDidMount() {
    window.addEventListener('keydown', _.throttle(this.handleKeyPress, 100));
    window.addEventListener('resize', _.debounce(this.handleResize, 500));
    this.props.triggerOppeningMessages();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', _.throttle(this.handleKeyPress, 100));
    window.removeEventListener('resize', _.debounce(this.handleResize, 500));
  }

  handleKeyPress(e) {
    if (typeof (this.props.grid.dungeonLevel) === 'number') {
      switch (e.keyCode) {
        //north
        case 38:
        case 87:
          this.props.playerInput([0, -1]);
          break;
        //east
        case 39:
        case 68:
          this.props.playerInput([1, 0]);
          break;
        //south
        case 40:
        case 83:
          this.props.playerInput([0, 1]);
        //west
        case 37:
        case 65:
          this.props.playerInput([-1, 0]);
          break;
        default:
          return;
      }
    }
  }

  handleResize(e) {
    const viewportWidth = e.target.innerWidth / this.VP_WIDTH_RATIO;
    const viewportHeight = Math.max(
      this.VP_MINIMUM_HEIGHT,
      (e.target.innerHeight / this.VP_HEIGHT_RATIO) - this.VP_HEIGHT_OFFSET
    );
    this.setState({ viewportWidth, viewportHeight });
  }

  render() {
    const viewportHeight = this.state.viewportHeight - this.state.viewportHeight % 2;
    const viewportWidth = this.state.viewportWidth - this.state.viewportWidth % 2;

    const { entities } = this.props.grid;
    const [ playerX, playerY ] = this.props.grid.playerPosition;

    const top = _.clamp(playerY - viewportHeight / 2, 0, entities.length - viewportHeight);
    const right = Math.max(playerX + viewportWidth / 2, viewportWidth);
    const bottom = Math.max(playerY + viewportHeight / 2, viewportHeight);
    const left = _.clamp(playerX - viewportWidth / 2, 0, entities[0].length - viewportWidth);

    const newEntities = entities.map((row, i) => row.map((cell, j) => {
      cell.distanceFromPlayer = (Math.abs(playerY - i)) + (Math.abs(playerX - j));
      return cell;
    }));

    const cells = newEntities.filter((row, i) => i >= top && i < bottom)
    .map((row, i) => {
      return (
        <div key={i} className="row">{
          row
          .filter((row, i) => i >= left && i < right)
          .map((cell, j) => {
            return (
              <Cell
                key={j}
                cell={cell}
                distance={cell.distanceFromPlayer}
                zone={this.props.grid.dungeonLevel}
                visible={this.props.fogMode}
              />
            );
          })
        }</div>
      );
    });

    return (
      <div className="grid-wrapper">
        {cells}
      </div>
    );
  }
}

const mapStateToProps = ({ ui, grid, player }) => {
  return { fogMode: ui.fogMode, grid, player };
};

const mapDispatchToProps = (dispatch)  => {
  return {
    playerInput: (vector) => dispatch(playerInput(vector)),
    createLevel: () => dispatch(createLevel()),
    setDungeonLevel: (level) => dispatch(setDungeonLevel(level)),
    triggerOppeningMessages: () => dispatch(openingMessages())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Grid);

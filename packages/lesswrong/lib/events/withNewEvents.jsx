import { withNew } from 'meteor/vulcan:core';
import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { LWEvents } from '../collections/lwevents/collection.js';
import { shallowEqual } from '../modules/utils/componentUtils';


/*
  HoC that passes functions for registering events to child
*/

function withNewEvents(WrappedComponent) {
  class EventsWrapped extends Component {
    constructor(props) {
      super(props);
      this.state = {
        events: {},
      };
      this.registerEvent = this.registerEvent.bind(this);
      this.closeEvent = this.closeEvent.bind(this);
    }
    
    // Don't update on changes to state.events (which is this component's
    // only state), because that doesn't affect rendering at all and gets
    // modified in mount events.
    shouldComponentUpdate(nextProps, nextState) {
      if (!shallowEqual(this.props, nextProps))
        return true;
      return false;
    }
    
    registerEvent(name, properties) {
      const newMutation = this.props.newMutation;
      const { userId, documentId, important, intercom, ...rest} = properties;
      let event = {
        userId,
        name,
        documentId,
        important,
        properties: rest,
        intercom,
      };
      // Update properties with current time
      event.properties = {
        startTime: new Date(),
        ...event.properties,
      }
      const eventId = uuid();
      this.setState(prevState => {
        prevState.events[eventId] = event;
        return prevState;
      });
      newMutation({document: event});
      return eventId;
    }

    closeEvent(eventId, properties = {}) {
      const newMutation = this.props.newMutation;
      let event = this.state.events[eventId];
      // Update properties with current time and duration in ms
      let currentTime = new Date();
      event.properties = {
        endTime: currentTime,
        duration: currentTime - event.properties.startTime,
        ...event.properties,
        ...properties,
      };
      newMutation({document: event});
      this.setState(prevState => {
        prevState.events = _.omit(prevState.events, eventId);
        return prevState;
      });
      return eventId;
    }

    componentWillUnmount() {
      // When unmounting, close all current event trackers
      const events = this.state.events;
      Object.keys(events).forEach(key => {
        this.closeEvent(key);
      });
    }

    render() {
      return <WrappedComponent
                registerEvent={this.registerEvent}
                closeEvent={this.closeEvent}
                {...this.props}
              />
    }
  }
  return withNew(newEventOptions)(EventsWrapped);
}

const newEventOptions = {
  collection: LWEvents,
  fragmentName: 'newEventFragment',
}

export default withNewEvents;

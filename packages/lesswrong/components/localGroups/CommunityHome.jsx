import {
  Components,
  registerComponent,
  withMessages,
} from 'meteor/vulcan:core';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Users from 'meteor/vulcan:users';
import { Link } from 'react-router';
import withUser from '../common/withUser';
import { withStyles } from '@material-ui/core/styles';
import EventIcon from '@material-ui/icons/Event';

const styles = theme => ({
  content: {
    marginTop: 460,
  }
});

class CommunityHome extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      newGroupFormOpen: false,
      newEventFormOpen: false,
      currentUserLocation: Users.getLocation(props.currentUser),
    }
  }

  componentDidMount() {
    const { currentUser } = this.props
    const newLocation = Users.getLocation(currentUser);
    if (!_.isEqual(this.state.currentUserLocation, newLocation)) {
      this.setState({ currentUserLocation: Users.getLocation(currentUser) });
    }
  }

  handleOpenNewGroupForm = () => {
    this.setState({
      newGroupFormOpen: true,
    })
  }

  handleCloseNewGroupForm = () => {
    this.setState({
      newGroupFormOpen: false,
    })
  }

  handleOpenNewEventForm = () => {
    this.setState({
      newEventFormOpen: true,
    })
  }

  handleCloseNewEventForm = () => {
    this.setState({
      newEventFormOpen: false,
    })
  }

  render() {
    const {classes, router} = this.props;
    const filters = (router.location.query && router.location.query.filters) || [];
    const { TabNavigationMenu, SingleColumnSection, SectionTitle, PostsList2, SectionButton, GroupFormLink } = Components

    const postsListTerms = {
      view: 'nearbyEvents',
      lat: this.state.currentUserLocation.lat,
      lng: this.state.currentUserLocation.lng,
      limit: 7,
      filters: filters,
    }
    const groupsListTerms = {
      view: 'nearby',
      lat: this.state.currentUserLocation.lat,
      lng: this.state.currentUserLocation.lng,
      limit: 7,
      filters: filters,
    }
    const mapEventTerms = {
      view: 'nearbyEvents',
      lat: this.state.currentUserLocation.lat,
      lng: this.state.currentUserLocation.lng,
      filters: filters,
    }
    return (
      <React.Fragment>
        <TabNavigationMenu />
        <Components.CommunityMapWrapper
          terms={mapEventTerms}
        />
        <div className={classes.content}>
          <SingleColumnSection>
            <SectionTitle title="Local Groups">
              {this.props.currentUser && <GroupFormLink />}
            </SectionTitle>
            { this.state.currentUserLocation.loading
              ? <Components.Loading />
              : <Components.LocalGroupsList
                  terms={groupsListTerms}
                  showHeader={false} />
            }
          </SingleColumnSection>
          <SingleColumnSection>
            <SectionTitle title="Events">
              {this.props.currentUser && <Link to={{pathname:"/newPost", query: {eventForm: true}}}>
                <SectionButton>
                  <EventIcon />
                  New Event
                </SectionButton>
              </Link>}
            </SectionTitle>
            <PostsList2 terms={postsListTerms}>
              <Link to="/pastEvents">View Past Events</Link>
              <Link to="/upcomingEvents">View Upcoming Events</Link>
            </PostsList2>
          </SingleColumnSection>

          <SingleColumnSection>
            <SectionTitle title="Resources"/>
            <PostsList2 terms={{view: 'communityResourcePosts'}} showLoadMore={false} />
          </SingleColumnSection>
        </div>
      </React.Fragment>
    )
  }
}

registerComponent('CommunityHome', CommunityHome,
  withUser, withMessages, withRouter,
  withStyles(styles, { name: "CommunityHome" }));

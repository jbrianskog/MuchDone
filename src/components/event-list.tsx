import * as React from "react";
import OnClickOut, { InjectedOnClickOutProps } from "react-onclickoutside";
import { Event } from "data/event-store";
import { EventListItem } from "./event-list/event-list-item";
import { DomainEventTypeName } from "domain/events";

export interface EventListProps {
  events: Event<DomainEventTypeName>[];
  showHistoryVersion(version: number): void;
  showCurrentVersion(): void;
}

export class EventListInner extends React.PureComponent<EventListProps & InjectedOnClickOutProps> {
  handleClickOutside = () => {
    this.props.showCurrentVersion();
  }
  render() {
    return (
      <div className="list-group">
        {this.props.events.map(event =>
          <EventListItem
            key={event.id}
            event={event}
            showHistoryVersion={this.props.showHistoryVersion}
          />)}
      </div>
    );
  }
}

export const EventList = OnClickOut<EventListProps>(EventListInner);

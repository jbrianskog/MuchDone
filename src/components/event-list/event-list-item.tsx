import * as React from "react";
import { Event } from "data/event-store";
import { DomainEventTypeName } from "domain/events";

export interface EventListItemProps {
  event: Event<DomainEventTypeName>;
  showHistoryVersion(version: number): void;
}

export class EventListItem extends React.PureComponent<EventListItemProps> {
  showHistory: React.MouseEventHandler<HTMLButtonElement> = e => {
    this.props.showHistoryVersion(this.props.event.id);
  }
  render() {
    return (
      <button onClick={this.showHistory} className="list-group-item event-list-item">{this.props.event.id} : {DomainEventTypeName[this.props.event.type]}</button>
    );
  }
}

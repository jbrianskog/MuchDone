import * as React from "react";
import { DomainEventTypeName, DomainEvent } from "domain/events";

export interface EventListItemProps {
  event: DomainEvent;
  showHistoryVersion(version: number): void;
}

export class EventListItem extends React.PureComponent<EventListItemProps> {
  showHistory: React.MouseEventHandler<HTMLButtonElement> = e => {
    this.props.showHistoryVersion(this.props.event.version);
  }
  render() {
    return (
      <button onClick={this.showHistory} className="list-group-item event-list-item">{this.props.event.version} : {DomainEventTypeName[this.props.event.type]}</button>
    );
  }
}

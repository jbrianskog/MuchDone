import * as firebase from "firebase";
import { ESEvent, EventStore, UncommittedESEvent, SubCallback, Unsub } from "./event-store";

export class FirebaseRTDBEventStore<T> implements EventStore<T> {
  protected async getEvents(path: string, version?: number): Promise<ESEvent<T>[]> {
    let user = firebase.auth().currentUser;
    if (!user) {
      throw new Error("getEvents(). User not logged into Firebase.");
    }
    let events = [] as ESEvent<T>[];
    let ref: firebase.database.Reference | firebase.database.Query = firebase.database().ref(`/users/${user.uid}/${path}`);
    if (version) {
      ref = ref.orderByChild("version").endAt(version);
    }
    let snap = await ref.once("value");
    snap.forEach(childSnap => {
      events.push(childSnap.val())
    });
    return events;
  }
  async getAllEvents(version?: number): Promise<ESEvent<T>[]> {
    let events = await this.getEvents("events", version);
    return events;
  }
  async getEventsByAggregate(aggregateId: string, version?: number): Promise<ESEvent<T>[]> {
    let events = await this.getEvents(`eventsByAggregate/${aggregateId}`, version);
    return events;
  }
  async getEventsByType(typeId: T, version?: number): Promise<ESEvent<T>[]> {
    let events = await this.getEvents(`eventsByType/${typeId}`, version);
    return events;
  }
  protected onEventsUpdated(path: string, callback: SubCallback<T>): Unsub {
    let user = firebase.auth().currentUser;
    if (!user) {
      throw new Error("onEventsUpdated(). User not logged into Firebase.");
    }
    let ref = firebase.database().ref(`/users/${user.uid}/${path}`);
    let onCallback = ref.on("value", snap => {
      let events = [] as ESEvent<T>[];
      if (snap) {
        snap.forEach(childSnap => {
          events.push(childSnap.val())
        });
      }
      callback(events, off);
    });
    let off = () => {
      // @ts-ignore: The type mismatch for this callback param is Firebase's problem.
      ref.off("value", onCallback)
    };
    return off;
  }
  onEventsByAggregateUpdated(aggregateId: string, callback: SubCallback<T>): Unsub {
    return this.onEventsUpdated(`eventsByAggregate/${aggregateId}`, callback);
  }
  onEventsByTypeUpdated(typeId: T, callback: SubCallback<T>): Unsub {
    return this.onEventsUpdated(`eventsByType/${typeId}`, callback);
  }
  async addEvents(events: UncommittedESEvent<T>[]): Promise<void> {
    let user = firebase.auth().currentUser;
    if (!user) {
      throw new Error("addEvents(). User not logged into Firebase.");
    }
    let userRef = firebase.database().ref(`/users/${user.uid}`);
    let updates: any = {};
    for (const event of events) {
      let eventRef = userRef.child("/events").push();
      let key = eventRef.key;
      (event as any).version = firebase.database.ServerValue.TIMESTAMP;
      updates[`/events/${key}`] = event;
      updates[`/eventsByAggregate/${event.aggregateId}/${key}`] = event;
      updates[`/eventsByType/${event.type}/${key}`] = event;
    }
    return userRef.update(updates);
  }
}
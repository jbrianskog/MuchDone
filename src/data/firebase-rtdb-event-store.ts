import * as firebase from "firebase";
import { ESEvent, EventStore } from "./event-store";

export class FirebaseRTDBEventStore<T> implements EventStore<T> {
  protected async getEvents(path: string, version?: number): Promise<ESEvent<T>[]> {
    let user = firebase.auth().currentUser;
    if (!user) {
      console.log("getEvents() error. User not logged into Firebase.");
      return [];
    }
    let events = [] as ESEvent<T>[];
    let query = firebase.database().ref(`/users/${user.uid}/${path}`).orderByChild("version");
    if (version) {
      query = query.endAt(version);
    }
    let snap = await query.once("value");
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
    let events = await this.getEvents(`aggregateEvents/${aggregateId}`, version);
    return events;
  }
  onAggregateEventsUpdated(aggregateId: string, callback: (events: ESEvent<T>[], off: () => void) => any): () => void {
    let user = firebase.auth().currentUser;
    if (!user) {
      console.log("onAggregateEventsUpdated() error. User not logged into Firebase.");
      return () => null;
    }
    let ref = firebase.database().ref(`/users/${user.uid}/aggregateEvents/${aggregateId}`).orderByChild("version");
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
  async addEvents(events: ESEvent<T>[]): Promise<void> {
    let user = firebase.auth().currentUser;
    if (!user) {
      console.log("addEvents() error. User not logged into Firebase.");
      return;
    }
    let userRef = firebase.database().ref(`/users/${user.uid}`);
    let updates: any = {};
    for (const event of events) {
      let eventRef = userRef.child("/events").push();
      let key = eventRef.key;
      updates[`/events/${key}`] = event;
      updates[`/aggregateEvents/${event.aggregateId}/${key}`] = event;
    }
    return userRef.update(updates);
  }
}
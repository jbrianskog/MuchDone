import * as firebase from "firebase";

export async function updateUserProfile(): Promise<void> {
  let user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("updateUserProfile(). User not logged into Firebase.");
  }
  let providerData = user.providerData[0];
  if (!providerData) {
    throw new Error("updateUserProfile(). No providerData.");
  }
  let profile: any = {};
  profile[providerData.providerId.replace(/\./g, ",")] = {
    email: user.email,
    emailVerified: user.emailVerified
  }
  return firebase.database().ref(`/users/${user.uid}/profile`).update(profile);
}

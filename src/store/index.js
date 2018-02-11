import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';
import { emailIsWhitelisted, addIdToItems } from '../utils';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    error: null,
    challenges: [],
  },
  getters: {
    user: state => state.user,
    challenges: state => [...state.challenges].sort((a, b) => b.createdAt - a.createdAt),
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setChallenges(state, payload) {
      state.challenges = payload;
    },
  },
  actions: {
    validateUser({ commit, dispatch }, payload) {
      if (emailIsWhitelisted(payload.email)) {
        const { displayName: name, email, photoURL: photoUrl, uid: id } = payload;
        const user = { name, email, photoUrl };
        firebase.database().ref(`/users/${id}`).set(user);
        commit('setUser', { ...user, id });
        commit('setError', null);
      } else {
        dispatch('signOut', 'You must be part of the "umich.edu" domain to use this app.');
      }
    },
    signIn({ dispatch }) {
      const google = new firebase.auth.GoogleAuthProvider();
      google.setCustomParameters({ hd: 'umich.edu' });
      firebase.auth()
        .signInWithPopup(google)
        .then(({ user }) => { dispatch('validateUser', user); })
        .catch(() => {});
    },
    signOut({ commit }, payload) {
      firebase.auth().signOut();
      commit('setUser', null);
      commit('setError', payload || null);
    },
    loadChallenges({ commit }) {
      firebase.database().ref('challenges').on('value', (snapshot) => {
        commit('setChallenges', addIdToItems(snapshot.val() || {}));
      });
    },
  },
});

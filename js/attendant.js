let app = new Vue({
    el: '#app',
    data: {
        isSignedIn: false
    },
    methods: {
        signIn: function() {
            alert('sign in')
        },
        signOut: function() {
            alert('sign out')
        }
    }
});

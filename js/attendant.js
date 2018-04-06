let app = new Vue({
    el: '#app',
    data: {
        signedIn: false
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

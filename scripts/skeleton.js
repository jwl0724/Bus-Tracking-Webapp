function loadSkeleton() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {                  
            console.log($('#footerPlaceholder').load('./text/footer.html'));
        } else {
            
        }
    });
    
}
loadSkeleton(); 

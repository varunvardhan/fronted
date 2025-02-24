export function saveLoginDta(token, user) { 
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("loginTime", Date.now());
}

    export function getUserLoginData(){
      const token=  localStorage.getItem("token")
      const user =localStorage.getItem("user")? JSON.parse(localStorage.getItem("user")):null;
    
       if(user && token) {
        return {
            token,
            user,
        }
       } else return null;
    }
    

    //remove userInfor from local
    
    export function removeUserData(){
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");

    }
    export function isSessionExpired() {
        const loginTime = localStorage.getItem("loginTime");
        if (!loginTime) return true;
    
        const currentTime = Date.now();
        const expirationTime = 50 * 60 * 1000;
    
        return currentTime - loginTime > expirationTime;
    }
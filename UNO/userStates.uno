using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.UX;

[UXGlobalModule]
public class userStates : NativeEventEmitterModule
{
    static readonly userStates _instance;


    public userStates()
    : base(
        true,
        "userIdChange",
        "isLoggedChange",
        "userPasswordChange", 
        "userNameChange", 
        "saveUserDataEvent",
        "hideSplashChange",
        "newInformationSaved"
        )
    {
        // Make sure we're only initializing the module once
        if (_instance != null) return;

        _instance = this;
        Uno.UX.Resource.SetGlobalKey(_instance, "userStates");
        AddMember(new NativeFunction("userId", (NativeCallback)userId));
        AddMember(new NativeFunction("isLogged", (NativeCallback)isLogged));
        AddMember(new NativeFunction("userPassword", (NativeCallback)userPassword));
        AddMember(new NativeFunction("userName", (NativeCallback)userName));
        AddMember(new NativeFunction("saveUserData", (NativeCallback)saveUserData));
        AddMember(new NativeFunction("hideSplash", (NativeCallback)hideSplash));
        AddMember(new NativeFunction("callNewInformationSaved", (NativeCallback)callNewInformationSaved));
    }

    string _uid = null;
    object userId(Context c, object[] args){
    	if(args.Length > 0){
    		_uid = Marshal.ToType<string>(args[0]);
    		Emit("userIdChange", _uid);
    	}
    	return _uid;
    }

    bool _isLogged = false;
    object isLogged(Context c, object[] args){
    	if(args.Length > 0){
    		_isLogged = Marshal.ToType<bool>(args[0]);
    		Emit("isLoggedChange", _isLogged);
    	}
    	return _isLogged;
    }

    bool _hideSplash = false;
    object hideSplash(Context c, object[] args){
        if(args.Length > 0){
            _hideSplash = Marshal.ToType<bool>(args[0]);
            Emit("hideSplashChange", _hideSplash);
        }
        return _hideSplash;
    }

    string _pass = null;
    object userPassword(Context c, object[] args){
        if(args.Length > 0){
            _pass = Marshal.ToType<string>(args[0]);
            Emit("userPasswordChange", _pass);
        }
        return _pass;
    }

    string _uname = null;
    object userName(Context c, object[] args){
        if(args.Length > 0){
            _uname = Marshal.ToType<string>(args[0]);
            Emit("userNameChange", _uname);
        }
        return _uname;
    }

    object saveUserData(Context c, object[] args){
        Emit("saveUserDataEvent", _isLogged, _uid,_uname,_pass);
        return null;
    }

    object callNewInformationSaved(Context c, object[] args){
        Emit("newInformationSaved");
        return null;
    }
}
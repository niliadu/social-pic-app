using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.UX;
using Uno;

[UXGlobalModule]
public class customAddButton : NativeEventEmitterModule
{
    static readonly customAddButton _instance;

    public customAddButton() 
    : base (true, "onValueChange") {
        // Make sure we're only initializing the module once
        if (_instance != null) return;

        _instance = this;
        Uno.UX.Resource.SetGlobalKey(_instance, "customAddButton");
        AddMember(new NativeFunction("set", (NativeCallback)setAddButton));
        AddMember(new NativeFunction("target", (NativeCallback)getTarget));
    }

    bool _visibility = false;
    string _target = "";
    int _iconID;

    object getTarget(Context c, object[] args){
      return _target;
    }

    object setAddButton(Context c, object[] args){
        if(args.Length > 0){
            _visibility = Marshal.ToType<bool>(args[0]);

            if (_visibility && args.Length > 2) {
                _target = Marshal.ToType<string>(args[1]);
                _iconID = Marshal.ToType<int>(args[2]);
            }
            Emit("onValueChange", _visibility, _iconID);
        }
        return null;
    }
}

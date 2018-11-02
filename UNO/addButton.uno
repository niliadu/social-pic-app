using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.UX;
using Uno;

[UXGlobalModule]
public class addButton : NativeEventEmitterModule
{
    static readonly addButton _instance;

    public addButton() : base (true, "onValueChange") {
        // Make sure we're only initializing the module once
        if (_instance != null) return;

        _instance = this;
        Uno.UX.Resource.SetGlobalKey(_instance, "addButton");
        AddMember(new NativeFunction("set", (NativeCallback)setAddButton));
        AddMember(new NativeFunction("isVisible", (NativeCallback)isVisible));
    }

    bool _visibility = false;
    string _groupId = "";

    object isVisible(Context c, object[] args){
      return _visibility;
  }

  object setAddButton(Context c, object[] args){
    if(args.Length > 0){
        _visibility = Marshal.ToType<bool>(args[0]);
        if(args.Length > 1){
            _groupId = Marshal.ToType<string>(args[1]);  
        }
        Emit("onValueChange", _visibility, _groupId);
    }
    return _visibility;
}
}

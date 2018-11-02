using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.UX;

[UXGlobalModule]
public class routerCalls : NativeEventEmitterModule
{
    static readonly routerCalls _instance;


    public routerCalls()
    : base(
        true,
        "call"
        )
    {
        // Make sure we're only initializing the module once
        if (_instance != null) return;

        _instance = this;
        Uno.UX.Resource.SetGlobalKey(_instance, "routerCalls");
        AddMember(new NativeFunction("send", (NativeCallback)send));
        AddMember(new NativeFunction("setMainRouter", (NativeCallback)setMainRouter));
        AddMember(new NativeFunction("getMainRouter", (NativeCallback)getMainRouter));
    }

    object send(Context c, object[] args){
        var teste = c.NewArray(args);
        Emit("call", teste);
        return null;
    }

    object _mainRouter = null;
    object setMainRouter(Context c, object[] args){
        _mainRouter  = args[0];
        return null;
    }
    object getMainRouter(Context c, object[] args){
        return _mainRouter;
    }
}
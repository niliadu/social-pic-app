using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;
using Uno.UX;
using Uno;

[UXGlobalModule]
public class alertPopup : NativeEventEmitterModule
{
    static readonly alertPopup _instance;


    public alertPopup()
    : base(true, "alertPopupChange")
    {
        // Make sure we're only initializing the module once
        if (_instance != null) return;

        _instance = this;
        Uno.UX.Resource.SetGlobalKey(_instance, "alertPopup");
        AddMember(new NativeFunction("show", (NativeCallback)show));
    }

    string _text = "";
    bool _visibility = false;

    object show(Context c, object[] args){
    	if(args.Length > 0){
    		_text = Marshal.ToType<string>(args[0]);
            _visibility =  true;
            
    		Emit("alertPopupChange", _text, _visibility);

            //set a timer too hide the alert
            double time = args.Length > 1 ? Marshal.ToType<double>(args[1]) : (double)4;
            Timer.Wait(time,hide);
    	}
    	return null;
    }

    void hide(){
        _text = "";
        _visibility = false;
        Emit("alertPopupChange", _text, _visibility);
    }
}
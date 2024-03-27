// ==UserScript==
// @name         Coinflip Spoofer
// @namespace    https://github.com/xNasuni
// @version      2024-02-01
// @description  spoofs coinflip probabilities
// @author       Mia
// @match        https://www.google.com/search*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @version      1.1
// @downloadURL  https://github.com/xNasuni/google-coin-flip-spoofer/raw/main/script.user.js
// @grant        none
// ==/UserScript==

// this runs on any google search page but it shouldnt mess with anything. PLEASE REPORT A ISSUE IF SOMETHING DOES OCCUR

(async () => {
	// incase anyone editing the array uses [t, h] etc.. 😢
  	var t = 't'; // idiot-proof
    var h = 'h'; // idiot-proof
    var tails = 't'; // idiot-proof
    var heads = 'h'; // idiot-proof
  
  	// EDIT ONLY THIS PART BELOW
  	var Sequence = [tails, heads, heads, heads, tails, tails, tails, heads]; // the SEQUENCE in which the 'randomness' will play out, after it's DONE going through all of them, it'll be back to NORMAL 'randomness'. (you are free to change this ARRAY)
  	// EDIT ONLY THIS PART ABOVE
  
  
    var SequenceIndex = 0 // do not change THIS or ANYTHING below this line unless yk what ur doing
    var InSequenceIndex = 0 // 0 - 5 since internal random coin flip selector thing calls Math.random 5 times 😭
    var ByteMap = {'h':0,'t':1,'heads':0,'tails':0,'0':'h','1':'t'} // utility
  
    const nothing = { IsReturning: false, ReturnData: null }
    
    function MatchesSignature(CallerFunction) {
      var FuncStr = CallerFunction.toString().toLowerCase()
      //'function(){var a=this;if(!this.Aa){this.Cl(this.Qa);pHl(this.Ja);pHl(this.Ya);pHl(this.Ba);pHl(this.Ha);this.Aa=!0;var b=.5>Math.random()?"HEADS":"TAILS";this.Ua=((b===this.oa?2:1)+(4+2*Math.floor(2*Math.random())))*(.5>Math.random()?-.5:.5);this.Ta=(1+Math.floor(4*Math.random()))*(.5>Math.random()?-1:1);this.Ma=Date.now();this.Sa=this.oa;this.oa=b;(0,_.In)(function(){"HEADS"===a.oa?(a.Cl(a.Ba),pHl(a.Ha)):(a.Cl(a.Ha),pHl(a.Ba));pHl(a.Qa);a.Cl(a.Ja);a.Aa=!1},2500)}}'
      return FuncStr.includes("heads") && FuncStr.includes("tails") && FuncStr.includes(".random")
    }
    
    function HookFunc(FuncParent, FuncName, HookCallback) {
      	const OriginalFunction = FuncParent[FuncName]
        
        function InternalHook() {
          if ((MatchesSignature(InternalHook.caller)) && !(((SequenceIndex) >= Sequence.length))) { // will not hook Math.random if it's not being called from what looks like the heads/tails chooser, and also will not spoof if we are out of the range of the user-set sequence.
          	var CustomReturn = HookCallback(OriginalFunction, InternalHook.caller, arguments)
            //console.log('hook returned', CustomReturn.ReturnData, InternalHook.caller) -->used for debugging purposes during development
            return CustomReturn.ReturnData;
          }
          var ReturnValue = OriginalFunction()	
          return ReturnValue;
        }
      
      	FuncParent[FuncName] = InternalHook;
    }
    
    function HandleRandomHook(HookOriginal, HookCaller, Arguments) {
        // Math.random can be called from other sources, so i added a simple 'integrity' check.
        // the code below was commented out bc i hardcoded it above since for some reason ReturnData.IsReturning isn't reliable
        //if (!MatchesSignature(HookCaller)) {
        //  return nothing;
        //}
        
      	// iterate through fake 'random' sequence UNLESS we are OUT OF RANGE of user-set sequence
      	// the code below was commented out bc i hardcoded it above since for some reason ReturnData.IsReturning isn't reliable
      	//if ((SequenceIndex) >= Sequence.length) {
        //  return nothing // return normal Math.random stuff and doesn't apply hook
        //}
                                         
      	// we are in stage 0-5 on index 0 to length of user-set sequence 
      	// we want to only increase sequence index on the first stage, so we'll increase it every 5
      	// this could be very unstable but i will check it thoroughly and if it's okay then
      	// we'll roll with it :)
      
        var ReturnData = nothing
      
      	var FinalOutcome = Sequence[SequenceIndex]
      	
        //console.log(FinalOutcome, InSequenceIndex, SequenceIndex)-->used for debugging purposes during development
        
      	ReturnData.IsReturning = true
      	ReturnData.ReturnData = ByteMap[FinalOutcome]

        if (InSequenceIndex > 0) { // 'ISI' is 0 rn, if it's greater than that we should just return real random things.
            ReturnData.ReturnData = HookOriginal(); // if we already did the first Math.random call which is the one that's the guess, we should make everything after random like the coin velocity.
        }

      	InSequenceIndex += 1;
      
      	if (InSequenceIndex >= 5) {
          InSequenceIndex = 0
          SequenceIndex += 1
        }
      
        return ReturnData;
    }
    
    HookFunc(Math, 'random', HandleRandomHook)
})()
